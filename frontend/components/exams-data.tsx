"use client";
import {
	convertToDateAndTime,
	getExamStatus,
	getExamStatusStyle,
} from "@/lib/helpers";
import { Exam, Question } from "@/types/types";
import { DeleteIcon, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { PostExam } from "./post-exam";
import { Axios, AxiosError } from "axios";
import api from "@/app/api";
import { useSession } from "next-auth/react";
import { any } from "zod";

export default function ExamsData({ exam }: { exam: Exam[] }) {
	const { data: session } = useSession();
	const [examData, setExamData] = useState(exam);
	const router = useRouter();
	const [filteredExam, setFilteredExam] = useState(exam);
	const [searchTerm, setSearchTerm] = useState("");
	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const text = e.target.value;
		setSearchTerm(text);

		const filtered = examData.filter((item) =>
			item.name.toLowerCase().startsWith(text.toLowerCase())
		);

		setFilteredExam(filtered);
	};
	const [view, setView] = useState("exams");
	const handleCreateExam = async (examData: {
		name: string;
		description: string;
		start_time: string;
		end_time: string;
		students: number[];
		num_of_questions: number;
		total_marks: number;
		duration: number;
		rules: string;
		status: string;
		questions: {
			title: string;
			question_text: string;
			input_constrains: string;
			input_format: string;
			expected_output: string;
			marks: number;
		}[];
	}) => {
		try {
			const examRes = await api.post(
				"/api/exams/all",
				formatExamData(examData),
				{
					headers: { Authorization: `Bearer ${session?.access}` },
				}
			);
			const questionPromises = examData.questions.map((question) =>
				createQuestion(examRes.data.id, question)
			);

			const results = await Promise.allSettled(questionPromises);
			const hasErrors = results.some((result) => result.status === "rejected");

			if (hasErrors) {
				alert("Some questions failed to create.");
			} else {
				console.log(results);
				setView("exams");
				alert("Exam created successfully.");
			}
		} catch (error) {
			handleAxiosError(error, `/auth/login?redirect=/admin-dashboard/exams/`);
		}
	};

	const formatExamData = (examData: any) => {
		const formdata = new FormData();
		Object.entries(examData).forEach(([key, value]) => {
			formdata.append(
				key,
				Array.isArray(value) ? JSON.stringify(value) : String(value)
			);
		});
		return formdata;
	};

	const createQuestion = async (examId: number, question: any) => {
		const formdata = new FormData();
		formdata.append("exam", examId.toString());
		Object.entries(question).forEach(([key, value]) => {
			formdata.append(
				key,
				Array.isArray(value) ? JSON.stringify(value) : String(value)
			);
		});

		return api.post("/api/questions", formdata, {
			headers: { Authorization: `Bearer ${session?.access}` },
		});
	};

	const handleAxiosError = (error: any, redirectPath?: string) => {
		if (error instanceof AxiosError) {
			if (error.status === 401 && error.response?.status === 401) {
				router.push(redirectPath || "/auth/login");
			} else {
				console.error(error.response?.data);
				const message = Object.keys(error.response?.data || {})
					.map(
						(key) => `${key.replaceAll("_", " ")}: ${error.response?.data[key]}`
					)
					.join("\n");
				alert(message);
			}
		}
	};
	const deleteExamId = (id: number) => {
		try {
			let result = confirm("Are you sure you want to delete this exam?");
			if (result) {
				api.delete(`/api/delete/exam/${id}`, {
					headers: { Authorization: `Bearer ${session?.access}` },
				});
				alert("Exam deleted successfully.");
			}
		} catch (error) {
			handleAxiosError(error);
		}
	};
	return (
		<>
			{view === "exams" && (
				<>
					<header className="bg-white pl-5 shadow-sm border-b border-gray-200">
						<div className="px-8 py-6">
							<div className="flex items-center justify-between">
								<div>
									<h2 className="text-2xl font-bold text-gray-900">
										Exams Overview
									</h2>
								</div>
								<div className="relative   flex flex-row h-12">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Search className="h-5 w-5 text-gray-400" />
									</div>
									<input
										type="text"
										className="block w-full pl-10 mr-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200"
										placeholder={`Search for exam name...`}
										value={searchTerm}
										onChange={handleSearch}
									/>
									<button
										onClick={() => setView("post")}
										className="flex flex-row items-center w-48 px-3 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
									>
										<Plus className="w-5 h-5 mr-2" />
										<p>New Exam</p>
									</button>
								</div>
							</div>
						</div>
					</header>
					<div className="bg-gradient-to-br h-full from-blue-50 to-indigo-50 gap-6 p-12">
						<div className="rounded-xl border overflow-x-auto">
							<table className=" rounded-xl min-w-full divide-y divide-gray-200">
								<thead className="overflow-hidden">
									<tr className="bg-gray-50">
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Title
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Schedule
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Questions
										</th>

										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Total students
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Attended
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Status
										</th>
										<th className="px-6  flex justify-center py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Action
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{filteredExam.map((exam) => (
										<tr
											key={exam.id}
											onClick={() => {
												router.push(`/admin-dashboard/exams/${exam.id}`);
											}}
											className="hover:bg-gray-50 hover:cursor-pointer transition-colors duration-150"
										>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="font-medium text-gray-900">
													{exam.name}
												</div>
											</td>
											<td className="px-6 py-4 flex flex-row whitespace-nowrap">
												<div className="text-gray-900">
													{convertToDateAndTime(exam.start_time).date} (
													{convertToDateAndTime(exam.start_time).time}) &nbsp;
												</div>
												<div className="text-gray-900">
													to - {convertToDateAndTime(exam.end_time).date} (
													{convertToDateAndTime(exam.end_time).time})
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className="px-3 py-1 text-sm font-medium bg-indigo-50 text-indigo-700 rounded-full">
													{exam.num_of_questions} questions
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="font-medium text-gray-900">
													{exam.no_of_students_attended} students
												</div>
											</td>

											<td className="px-6 py-4 whitespace-nowrap">
												<div className="font-medium text-gray-900">
													{Math.max(
														exam.no_of_students_attended - exam.students.length,
														0
													)}{" "}
													students
												</div>
											</td>
											<td className={`px-6 py-4 whitespace-nowrap `}>
												<span
													className={`${getExamStatusStyle(
														exam,
														exam.start_time,
														exam.end_time
													)} px-3 py-1 rounded-xl text-sm`}
												>
													{getExamStatus(exam, exam.start_time, exam.end_time)}
												</span>
											</td>
											<td className="flex hover:text-red-500 justify-center">
												<Trash2
													onClick={(e) => {
														e.stopPropagation();
														deleteExamId(exam.id);
													}}
												/>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</>
			)}
			{view === "post" && (
				<PostExam
					onBack={() => setView("exams")}
					onSubmit={handleCreateExam}
					session={session}
				/>
			)}
		</>
	);
}
