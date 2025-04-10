import React from "react";
import { BookOpen, Users, Clock } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import api from "@/app/api";
import { Exam } from "@/types/types";
import {
	checkDateStatus,
	convertToDateAndTime,
	getExamStatus,
} from "@/lib/helpers";
import Link from "next/link";
function convertToDateAndTimeIST(isoString: string) {
	// Convert the ISO string to a Date object
	let date = new Date(isoString);

	// Convert to IST (Indian Standard Time) explicitly
	let options: Intl.DateTimeFormatOptions = {
		timeZone: "Asia/Kolkata",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: true,
	};

	// Format date and time
	let formattedString = new Intl.DateTimeFormat("en-IN", options).format(date);
	let [datePart, timePart] = formattedString.split(",");

	return { date: datePart.trim(), time: timePart.trim() };
}
async function Dashboard() {
	const session = await getServerSession(authOptions);
	let exam = await api.get("/api/exams/all", {
		headers: {
			Authorization: `Bearer ${session?.access}`,
		},
	});
	const data: Exam[] = await exam.data;

	return (
		<div className="h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900">
						Online Exam Dashboard
					</h1>
					<Link
						href={"/auth/logout"}
						className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
					>
						Logout
					</Link>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-500">Available Exams</p>
								<p className="text-2xl font-bold text-gray-900">
									{data.length}
								</p>
							</div>
							<div className="bg-blue-50 p-3 rounded-lg">
								<BookOpen className="w-6 h-6 text-blue-600" />
							</div>
						</div>
					</div>

					<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-500">Total Questions</p>
								<p className="text-2xl font-bold text-gray-900">
									{data
										.map((item) => item.num_of_questions)
										.reduce((acc, c) => acc + c, 0)}
								</p>
							</div>
							<div className="bg-green-50 p-3 rounded-lg">
								<Users className="w-6 h-6 text-green-600" />
							</div>
						</div>
					</div>

					<div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-500">Average Duration</p>
								<p className="text-2xl font-bold text-gray-900">
									{Number.isNaN(
										data
											.map((item) => item.duration)
											.reduce((acc, c) => acc + c, 0) /
											data.length /
											60
									)
										? 0
										: data
												.map((item) => item.duration)
												.reduce((acc, c) => acc + c, 0) /
										  data.length /
										  60}
									&nbsp; hrs
								</p>
							</div>
							<div className="bg-purple-50 p-3 rounded-lg">
								<Clock className="w-6 h-6 text-purple-600" />
							</div>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-sm border border-gray-100">
					<div className="p-6">
						<h2 className="text-xl font-semibold text-gray-900 mb-4">
							Available Exams
						</h2>
						<div className="overflow-x-auto">
							<table className="w-full">
								<thead>
									<tr className="text-left border-b border-gray-200">
										<th className="pb-3 font-semibold text-gray-600">
											Exam Title
										</th>
										<th className="pb-3 font-semibold text-gray-600">
											Questions
										</th>
										<th className="pb-3 font-semibold text-gray-600">
											Duration
										</th>
										<th className="pb-3 font-semibold text-gray-600">
											Start date
										</th>
										<th className="pb-3 font-semibold text-gray-600">
											Start time
										</th>
										<th className="pb-3 font-semibold text-gray-600">
											End date
										</th>
										<th className="pb-3 font-semibold text-gray-600">
											End time
										</th>
										<th className="pb-3 font-semibold text-gray-600">Status</th>
										<th className="pb-3 font-semibold text-gray-600">Action</th>
									</tr>
								</thead>
								<tbody>
									{data.map((exam) => (
										<tr
											key={exam.id}
											className="border-b border-gray-100 last:border-0"
										>
											<td className="py-4 text-gray-900 font-medium">
												{exam.name}
											</td>
											<td className="py-4 text-gray-600">
												{exam.num_of_questions}
											</td>
											<td className="py-4 text-gray-600">
												{exam.duration / 60} hrs
											</td>
											<td className="py-4 text-gray-600">
												{convertToDateAndTimeIST(exam.start_time).date}
											</td>
											<td className="py-4 text-gray-600">
												{convertToDateAndTimeIST(exam.start_time).time}
											</td>
											<td className="py-4 text-gray-600">
												{convertToDateAndTimeIST(exam.end_time).date}
											</td>
											<td className="py-4 text-gray-600">
												{convertToDateAndTimeIST(exam.end_time).time}
											</td>
											<td className="py-4">
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
														checkDateStatus(exam.start_time, exam.end_time) == 0
															? exam.status === "open"
																? "bg-green-100 text-green-800 "
																: "bg-red-100 text-red-800 "
															: checkDateStatus(
																	exam.start_time,
																	exam.end_time
															  ) == 2
															? "bg-red-100 text-red-800 "
															: "bg-blue-100 text-blue-800"
													}`}
												>
													{checkDateStatus(exam.start_time, exam.end_time) == 0
														? exam.status === "open"
															? "Open"
															: "Closed"
														: checkDateStatus(exam.start_time, exam.end_time) ==
														  2
														? "Closed"
														: "Not open"}
												</span>
											</td>
											<td className="py-4">
												{getExamStatus(exam, exam.start_time, exam.end_time) !==
												"Open" ? (
													<button
														disabled
														className="text-blue-600  hover:text-blue-700 font-medium"
													>
														Start Exam
													</button>
												) : (
													<Link
														href={`/dashboard/exam/${exam.id}`}
														className="text-blue-600 hover:text-blue-700 font-medium"
													>
														Start Exam
													</Link>
												)}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Dashboard;
