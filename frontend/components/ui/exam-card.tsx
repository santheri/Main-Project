"use client";

import { Calendar, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Exam, Submission } from "@/types/types";
import { start } from "repl";
import {
	checkDateStatus,
	getExamStatus,
	getExamStatusStyle,
} from "@/lib/helpers";

interface ExamCardProps {
	exam: Exam;
	status: string;
	submitted_date?: string;
	submission?: Submission[];
}

export function ExamCard({
	exam,
	status,
	submitted_date,
	submission,
}: ExamCardProps) {
	const startDate = new Date(exam.start_time);
	const endDate = new Date(exam.end_time);
	const submittedDateVar = new Date(
		submitted_date ? submitted_date : new Date()
	);
	console.log(submission);

	return (
		<div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
			<div className="flex flex-col md:flex-row">
				<div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 md:w-64 flex flex-col justify-center">
					<h3 className="text-xl font-bold text-white">{exam.name}</h3>
					<p className="text-blue-100 mt-1">{exam.description}</p>
				</div>

				<div className="flex-1 p-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
						{status !== "completed" ? (
							<>
								<div className="flex flex-row items-center text-gray-600">
									<Calendar className="w-5 h-5 mr-2 flex-shrink-0" />
									<p>{format(startDate, "PPP")}</p>
									<Clock className="w-5 ml-4 h-5 mr-2 " />{" "}
									<p>{format(startDate, "p")}</p>
								</div>
								<div className="flex flex-row items-center text-gray-600">
									<Calendar className="w-5 h-5 mr-2 flex-shrink-0" />
									<p>{format(endDate, "PPP")}</p>
									<Clock className="w-5 ml-4 h-5 mr-2 " />{" "}
									<p>{format(endDate, "p")}</p>
								</div>
							</>
						) : (
							<div className="flex flex-row items-center text-gray-600">
								<Calendar className="w-5 h-5 mr-2 flex-shrink-0" />
								<p>{format(submittedDateVar, "PPP")}</p>
								<Clock className="w-5 ml-4 h-5 mr-2 " />{" "}
								<p>{format(submittedDateVar, "p")}</p>
							</div>
						)}

						<div className="flex items-center text-gray-600">
							<FileText className="w-5 h-5 mr-2 flex-shrink-0" />
							<span>
								{exam.num_of_questions} questions • {exam.total_marks} marks
							</span>
						</div>
					</div>

					<div className="mb-4">
						<details className="group">
							<summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-blue-600">
								View Exam Rules
							</summary>
							<ul className="mt-2 pl-5 list-disc space-y-1 text-sm text-gray-600">
								{exam.rules.split(".").map((rule, index) => {
									rule = rule.trim();
									if (rule != "") {
										return <li key={index}>{rule}</li>;
									}
									return null;
								})}
							</ul>
						</details>
					</div>
					{status === "completed" && (
						<div className="mb-4">
							<details className="group">
								<summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-blue-600">
									View submission
								</summary>

								<div className="space-y-4">
									{submission?.map((sub, index) => (
										<div
											key={`submission-${index}`}
											className="bg-white p-4 rounded-lg border border-gray-200"
										>
											<div className="flex justify-between items-start mb-2">
												<h5 className="font-medium text-gray-900">
													Question {index + 1}
												</h5>
											</div>
											<div className="flex flex-col gap-5">
												<p className="text-gray-600 whitespace-pre-wrap">
													{sub.answers || "No answer submitted"}
												</p>
											</div>
										</div>
									))}
								</div>
							</details>
						</div>
					)}
					{status !== "completed" && (
						<div className="flex justify-between items-center">
							<span
								className={`px-3 py-1 rounded-full text-sm font-medium ${getExamStatusStyle(
									exam,
									exam.start_time,
									exam.end_time
								)}`}
							>
								{getExamStatus(exam, exam.start_time, exam.end_time)}
							</span>
							{checkDateStatus(exam.start_time, exam.end_time) === 0 && (
								<Link
									href={`/dashboard/exam/${exam.id}`}
									className={`px-6 py-2 rounded-md text-white font-medium transition-colors ${
										exam.status === "upcoming"
											? "bg-blue-600 hover:bg-blue-700"
											: exam.status === "open"
											? "bg-green-600 hover:bg-green-700"
											: "bg-gray-400 cursor-not-allowed"
									}`}
								>
									{exam.status === "upcoming"
										? "View Details"
										: exam.status === "open"
										? "Start Exam"
										: "Completed"}
								</Link>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
