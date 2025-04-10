"use client";
import React, { useEffect, useState } from "react";
import {
	ArrowLeft,
	AlertTriangle,
	DeleteIcon,
	EditIcon,
	Save,
	Cross,
	X,
	ChevronUp,
	ChevronDown,
	Play,
} from "lucide-react";
import useSWR from "swr";
import axios, { AxiosError } from "axios";
import { convertToDateAndTime, getFetcherApi } from "@/lib/helpers";
import { useSession } from "next-auth/react";
import { Exam, Question, Student, Submission } from "@/types/types";
import { useRouter } from "next/navigation";
import api from "@/app/api";
import { stat } from "fs";
import DifficultyBadge from "@/components/diff";
import { set } from "date-fns";
import { backendUrl } from "@/constants/urls";

interface Result {
	id: number;
	exam: Exam;
	question: Question;
	student: Student;
	submission: Submission;
	marks_obtained: number;
	published_at: string;
	plagiarism_percentage: number;
}

interface ExamResultsResponse {
	exam_id: number;
	exam_name: string;
	results: Result[];
}
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
function createStudentResultMap(data: ExamResultsResponse | undefined) {
	if (!data) {
		return null;
	}
	let resultsData: Map<
		number,
		{
			submission: Submission;
			marks_obtained: number;
			published_at: string;
			result: Result;

			student: Student;

			plagiarism_percentage: number;
		}[]
	> = new Map<
		number,
		{
			submission: Submission;
			marks_obtained: number;
			result: Result;
			published_at: string;
			student: Student;
			plagiarism_percentage: number;
		}[]
	>();
	data.results.forEach((element) => {
		const id = element.student.S_id;
		if (!resultsData.has(id)) {
			resultsData.set(id, []);
		}
		resultsData.get(id)!.push({
			submission: element.submission,
			marks_obtained: element.marks_obtained,
			published_at: element.published_at,
			student: element.student,
			result: element,
			plagiarism_percentage: element.plagiarism_percentage,
		});
	});
	return resultsData;
}
function createStudentSubmissionMap(data: Submission[] | undefined) {
	if (!data) {
		return null;
	}
	let output: { [Key: string]: Submission[] } = {};
	data.forEach((item) => {
		if (!Object.hasOwnProperty(item.student.S_id.toString())) {
			output[item.student.S_id.toString()] = [item];
		} else {
			output[item.student.S_id.toString()].push(item);
		}
	});
	return output;
}
export default function ExamDetails({ params }: { params: any }) {
	const { data: session } = useSession();
	const [runClicked, setRunClicked] = useState(-1);
	const [outputId, setOutputId] = useState(-1);
	const [showResults, setShowResults] = useState(-1);
	const [editedData, setEditedData] = useState<{
		[submissionId: string]: {
			marks: number;
			result_id: number;
		};
	}>({});
	const [editFieldId, setEditFieldId] = useState(-1);
	const router = useRouter();
	const [output, setOutput] = useState("");
	const [isError, setIsError] = useState(false);
	const {
		data: questionData,
		isLoading,
		error,
	} = useSWR<Question[], AxiosError>(
		[`/api/questions?exam_id=${params.id}`, session?.access],
		([url, token]) => getFetcherApi(url, token)
	);
	if (error) {
		if (error.status === 401 && session != null) {
			router.push(`/auth/login?redirect=/admin-dashboard/exams/${params.id}`);
		}
	}
	const {
		data: examData,
		isLoading: loading,
		error: examError,
	} = useSWR<Exam, AxiosError>(
		[`/api/update/exam/${params.id}`, session?.access],
		([url, token]) => getFetcherApi(url, token)
	);
	const { data: submissionsData } = useSWR<Submission[], AxiosError>(
		[`/api/submissions?exam_id=${params.id}`, session?.access],
		([url, token]) => getFetcherApi(url, token)
	);
	if (examError) {
		if (examError.status === 401 && session != null) {
			router.push(`/auth/login?redirect=/admin-dashboard/exams/${params.id}`);
		}
	}
	const compileCode = async (code: string, id: number) => {
		if (!session) {
			router.push("/auth/login?redirect=/dashboard");
			return;
		}

		let currentOutput = `Compiled Output:\nYour code:\n${code}\nInput:\n${"input"}`;

		const data = JSON.stringify({
			code: code,
			input: "",
		});
		try {
			const res = await api.post("/api/execute", data, {
				headers: {
					Authorization: `Bearer ${session?.access}`,
					"Content-Type": "application/json",
				},
			});
			currentOutput = `Compiled Output:\n${res.data.message}`;
			setOutput(currentOutput);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.status === 401) {
					router.push("/auth/login?redirect=/dashboard");
					return;
				}
				currentOutput = `${error.response?.data?.message || error.message}`;
			} else {
				currentOutput = "An unknown error occurred.";
			}
			setOutput(currentOutput);
			setIsError(true);
		} finally {
			setOutputId(id);
		}
		setRunClicked(-1);
	};
	const updateResults = async () => {
		// Ensure editedData has changes
		if (Object.keys(editedData).length === 0) return;

		try {
			for (const [id, data] of Object.entries(editedData)) {
				const formdata = new FormData();
				formdata.append("marks_obtained", data.marks.toString());

				await api.patch(`/api/update/results/${data.result_id}`, formdata, {
					headers: {
						Authorization: `Bearer ${session?.access}`,
					},
				});
			}

			setEditFieldId(-1);
			setEditedData({});
		} catch (error) {
			if (error instanceof AxiosError && error.response?.status === 401) {
				router.push(`/auth/login?redirect=/admin-dashboard/exams/${params.id}`);
			} else {
				console.error("Error updating results:", error);
			}
		}
	};

	const {
		data: resultsData,
		error: apiError,
	}: {
		data: ExamResultsResponse | undefined;
		error: AxiosError<unknown, any> | undefined;
	} = useSWR<ExamResultsResponse, AxiosError<unknown, any> | undefined>(
		[`/api/results/${params.id}/`, session?.access],
		([url, token]) => getFetcherApi(url, token)
	);
	const examResultsData = createStudentResultMap(resultsData);
	if (apiError) {
		if (apiError.status === 401 && session != null) {
			router.push(`/auth/login?redirect=/admin-dashboard/exams/${params.id}`);
		}
	}
	const updateExamStatus = async (status = "closed") => {
		try {
			const formdata = new FormData();
			formdata.append("status", status);
			if (status === "open") {
				formdata.append(
					"end_time",
					new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
				);
			}
			await api.patch(`/api/update/exam/${examData?.id}`, formdata, {
				headers: {
					Authorization: `Bearer ${session?.access}`,
				},
			});
			if (status === "open") {
				alert("Exam has been re-opened");
			} else alert("Exam has been closed");
		} catch (error) {
			if (error instanceof AxiosError) {
				alert("Something happened!");
			}
		}
	};
	const [showLoader, setShowLoader] = useState(false);
	const generate_results = async () => {
		setShowLoader(true);
		try {
			await api.get(`/api/generate-results?exam_id=${params.id}`, {
				headers: {
					Authorization: `Bearer ${session?.access}`,
				},
			});
			alert("Results generated successfully");
		} catch (error) {
			if (error instanceof AxiosError) {
				alert("Something happened!");
			}
		} finally {
			setShowLoader(false);
		}
	};
	const export_csv = async () => {
		try {
			const response: any = await api.get(`/api/export-csv/`, {
				headers: {
					Authorization: `Bearer ${session?.access}`,
					responseType: "blob",
				},
			});

			const url = window.URL.createObjectURL(new Blob([response.data]));
			const a = document.createElement("a");
			a.href = url;
			a.download = "exported_data.csv";
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
		} catch (error) {
			console.log(error);
			alert("Something happened!");
		}
	};
	const [cData, setCData] = useState(new Date());
	const [cTime, setCTime] = useState(new Date());
	useEffect(() => {
		if (examData) {
			const cData = new Date(examData.end_time);
			const cTime = new Date();
			console.log(cData, cTime, cData > cTime);
			setCData(cData);
			setCTime(cTime);
		}
	}, [examData]);
	return (
		<div className="space-y-8 p-20">
			<button
				onClick={() => {
					router.back();
				}}
				className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
			>
				<ArrowLeft className="w-5 h-5 mr-2" />
				Back to Exams
			</button>

			<div className="w-full flex flex-row justify-between items-center">
				<h2 className="text-2xl font-bold text-gray-900">{examData?.name}</h2>
				<div className="flex flex-row gap-3">
					<button
						onClick={() => {
							let res = confirm(
								"Are you sure ? This will reset all marks generated or assigned up until now!"
							);
							if (res) generate_results();
						}}
						disabled={showLoader}
						className="bg-green-600 px-3 py-2 text-white rounded-xl hover:bg-green-600 transition-all ease-in-out"
					>
						{showLoader ? "Generating..." : "Generate Results"}
					</button>
					<button
						onClick={() => {
							export_csv();
						}}
						className="bg-green-600 px-3 py-2 text-white rounded-xl hover:bg-green-600 transition-all ease-in-out"
					>
						Export as csv
					</button>
					{examData?.status === "open" ||
						(cData < cTime && (
							<button
								onClick={() => {
									updateExamStatus();
								}}
								className="bg-red-600 px-3 py-2 text-white rounded-xl hover:bg-red-400 transition-all ease-in-out"
							>
								Close Exam
							</button>
						))}
					{examData?.status === "closed" ||
						(cData > cTime && (
							<button
								onClick={() => {
									updateExamStatus("open");
								}}
								className="bg-red-600 px-3 py-2 text-white rounded-xl hover:bg-red-400 transition-all ease-in-out"
							>
								Reopen Exam
							</button>
						))}
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">Questions</h3>
				<div className="space-y-6">
					{questionData?.map((question: Question, index) => (
						<div
							key={question.id}
							className="p-4 bg-gray-50 rounded-lg"
						>
							<div className="flex justify-between items-start">
								<div className="flex-1 gap-3">
									<p className="font-medium text-gray-900">
										Question {index + 1} - {question.title}
									</p>
									<DifficultyBadge difficulty={question?.difficulty} />
									<p className="mt-1 text-gray-600">{question.question_text}</p>
									<div className="flex flex-col gap-3 pl-2 pt-5 pb-5">
										<p className="font-medium text-gray-900">
											Input constraints
										</p>
										<p className="mt-1 text-gray-600">
											{question.input_constrains}
										</p>
										<p className="font-medium text-gray-900">Input format</p>
										<p className="mt-1 text-gray-600">
											{question.input_constrains}
										</p>
										<p className="font-medium text-gray-900">Expected Output</p>
										<p className="mt-1 text-gray-600">
											{question.expected_output}
										</p>
									</div>
								</div>
								<div className="ml-4">
									<span className="px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 rounded-full">
										{question.marks} marks
									</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
			{/* Student Performance Table */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				<div className="p-6 border-b border-gray-200">
					<h3 className="text-lg font-semibold text-gray-900">
						Students Submission
					</h3>
				</div>
				{!submissionsData && <p> No submission!</p>}
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead>
							<tr className="bg-gray-50">
								<th></th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									Student ID
								</th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									Name
								</th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									Submitted At
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{submissionsData &&
								Object.entries(submissionsData || {}).map(([id, result]) => (
									<tr
										key={id + id + 1}
										className="hover:bg-gray-50 h-full transition-colors duration-150"
									>
										<td className="px-6 py-4 whitespace-nowrap text-gray-600">
											#{result.id}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-gray-600">
											{result.student.S_id}
										</td>
										<td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
											{result.student.S_name}
										</td>
										<td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
											{convertToDateAndTimeIST(result.submitted_at).date} -{" "}
											{convertToDateAndTimeIST(result.submitted_at).time}
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
			</div>
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				<div className="p-6 border-b border-gray-200">
					<h3 className="text-lg font-semibold text-gray-900">
						Students Results
					</h3>
				</div>
				{!examResultsData && <p>Results not generated yet!</p>}
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead>
							<tr className="bg-gray-50">
								<th></th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									Student ID
								</th>
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									Name
								</th>
								{questionData?.map((_, index) => (
									<th
										key={index}
										className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
									>
										Q{index + 1} Marks | Plagiarism
									</th>
								))}
								<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
									Action
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{examResultsData &&
								Array.from(examResultsData.entries()).map(([id, result]) => (
									<>
										<tr
											key={id}
											className="hover:bg-gray-50 h-full transition-colors duration-150"
										>
											<td
												onClick={() => {
													if (showResults === id) setShowResults(-1);
													else if (showResults === -1) setShowResults(id);
												}}
												className="px-6 py-4 whitespace-nowrap text-gray-600"
											>
												<div className="flex items-center">
													{showResults === id ? (
														<ChevronUp className="w-4 h-4 mr-2" />
													) : (
														<ChevronDown className="w-4 h-4 mr-2" />
													)}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-gray-600">
												#{id}
											</td>
											<td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
												{result[0].student.S_name}
											</td>
											{result.map((answer) => (
												<td
													key={answer.submission.id}
													className="px-6 py-4 whitespace-nowrap"
												>
													{editFieldId != id ? (
														<div className="flex items-center space-x-2">
															<span className="font-medium text-gray-900">
																{answer.marks_obtained} &nbsp;|&nbsp;
																{answer.plagiarism_percentage}
															</span>
															{answer.plagiarism_percentage > 0 && (
																<div
																	className="tooltip"
																	title="Plagiarism detected"
																>
																	<AlertTriangle className="w-5 h-5 text-red-500" />
																</div>
															)}
														</div>
													) : (
														<input
															defaultValue={answer.marks_obtained}
															className="p-2 border w-12"
															type="number"
															onChange={(e) => {
																setEditedData((prevData) => ({
																	...prevData,
																	[answer.submission.id]: {
																		submission_id: answer.submission.id,
																		result_id: answer.result.id,
																		marks: e.target.value,
																	},
																}));
															}}
														/>
													)}
												</td>
											))}
											{editFieldId === id ? (
												<td className="flex gap-5  px-6 py-4 justify-start items-center h-full">
													<Save
														onClick={() => {
															updateResults();
															setEditFieldId(-1);
														}}
														size={20}
														className="hover:text-red-600 hover:cursor-pointer"
													/>
													<X
														onClick={() => {
															setEditedData({});
															setEditFieldId(-1);
														}}
														size={20}
														className="hover:text-red-600 hover:cursor-pointer"
													/>
												</td>
											) : (
												<td className="flex px-6 py-4 justify-start items-center h-full">
													<EditIcon
														onClick={() => {
															setEditFieldId(id);
														}}
														className="hover:text-red-600 hover:cursor-pointer"
													/>
												</td>
											)}
										</tr>
										{showResults === id && (
											<tr className="w-full">
												<td
													colSpan={result?.length! + 4}
													className="px-6 w-full py-4 bg-gray-50"
												>
													<div className="space-y-4">
														<h4 className="font-semibold text-gray-900">
															Submitted Answers
														</h4>
														{result.map((answer, index) => (
															<div
																key={answer.result.id}
																className="bg-white p-4 rounded-lg border border-gray-200"
															>
																<div className="flex justify-between items-start mb-2">
																	<h5 className="font-medium text-gray-900">
																		Question {index + 1}
																	</h5>
																	<div className="flex items-center space-x-2">
																		{runClicked === index ? (
																			<div className="group flex items-center justify-center gap-2 border p-2 hover:text-white hover:cursor-pointer hover:bg-green-600 rounded-xl">
																				<svg
																					className="animate-spin h-5 w-5 group-hover:text-white text-green"
																					xmlns="http://www.w3.org/2000/svg"
																					fill="none"
																					viewBox="0 0 24 24"
																				>
																					<circle
																						className="opacity-25"
																						cx="12"
																						cy="12"
																						r="10"
																						stroke="currentColor"
																						stroke-width="4"
																					></circle>
																					<path
																						className="opacity-75"
																						fill="currentColor"
																						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
																					></path>
																				</svg>
																			</div>
																		) : (
																			<div
																				onClick={() => {
																					setRunClicked(index);
																					compileCode(
																						answer.submission.answers,
																						index
																					);
																				}}
																				className="group flex flex-row items-center gap-2 border p-1.5 hover:text-white hover:cursor-pointer hover:bg-green-600 rounded-xl"
																			>
																				Run
																				<Play
																					size={15}
																					className="text-green-500 group-hover:text-white"
																				/>
																			</div>
																		)}

																		<span className="text-sm text-gray-500">
																			Marks: {answer.marks_obtained}
																		</span>
																		{answer.plagiarism_percentage > 0 && (
																			<AlertTriangle className="w-4 h-4 text-red-500" />
																		)}
																	</div>
																</div>
																<div className="flex flex-col gap-5">
																	<p className="text-gray-600 whitespace-pre-wrap">
																		{answer.submission.answers ||
																			"No answer submitted"}
																	</p>
																	{output && outputId == index && (
																		<div className="bg-gray-100 border border-gray-300 rounded p-6">
																			<h3 className="text-lg font-semibold">
																				Output:
																			</h3>
																			<pre
																				className={`mt-4 ${
																					!isError
																						? "text-gray-700"
																						: "text-red-500"
																				}`}
																			>
																				{output}
																			</pre>
																		</div>
																	)}
																</div>
															</div>
														))}
													</div>
												</td>
											</tr>
										)}
									</>
								))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
