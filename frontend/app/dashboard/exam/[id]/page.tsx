"use client";
import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import useSWR from "swr";
import api from "@/app/api";
import { getFetcherApi } from "@/lib/helpers";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { Exam, Question } from "@/types/types";
import FullscreenModel from "@/components/ui/fullscreen-model";
import DifficultyBadge from "@/components/diff";
import { set } from "date-fns";

const ExamPage = ({ params }: { params: any }) => {
	const { data: session } = useSession();
	const [time, setTime] = useState(60);
	const [customTestCases, setCustomTestCases] = useState(false);
	const [errorPresent, setErrorPresent] = useState(false);
	const [input, setInput] = useState<string[]>([]);
	const router = useRouter();
	const [output, setOutput] = useState<string[]>([]);
	const [fontSize, setFontSize] = useState(20);
	const [code, setCode] = useState<string[]>([]);
	const [numberOfTestCasesPassed, setNumberOfTestCasesPassed] = useState<
		number[]
	>([]);
	const [givenTestCasesOutput, setGivenTestCasesOutput] = useState<
		{
			output: string;
			passed: boolean;
		}[]
	>([]);
	const handleEditorChange = (value: any, event: any) => {
		if (getCurrentIndex() !== -1) {
			setCode((prevCode) => {
				const updatedCode = [...prevCode];
				updatedCode[getCurrentIndex()] = value;
				return updatedCode;
			});
		}
	};
	const {
		data: questionData,
		isLoading,
		error,
	} = useSWR<Question[], AxiosError>(
		[`/api/questions?exam_id=${params.id}`, session?.access],
		([url, token]) => getFetcherApi(url, token)
	);
	const { data: examData } = useSWR<Exam[], AxiosError>(
		[`/api/exams/all`, session?.access],
		([url, token]) => getFetcherApi(url, token)
	);
	const getCurrentIndex = () => {
		return currentQuestion && questionData
			? questionData.indexOf(currentQuestion)
			: 0;
	};
	const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [loading, setLoading] = useState(true);
	const [answerSubmitting, setAnswerSubmitting] = useState(false);
	useEffect(() => {
		if (examData && loading) {
			examData.forEach((exam) => {
				if (exam.id.toString() == params.id) {
					setTime(exam.duration * 60);
				}
			});
			setLoading(false);
		}
		if (!isLoading && questionData) {
			setNumberOfTestCasesPassed(
				Array.from({ length: questionData.length }, () => 0)
			);
			const subarrays: string[] = Array.from(
				{ length: questionData.length },
				() => Array(1).fill("#Write your code here")[0]
			);
			const outputSubarrays: string[] = Array.from(
				{ length: questionData.length },
				() => Array(1).fill("")[0]
			);

			const inputSubarrays = Array.from(
				{ length: questionData.length },
				() => Array(1).fill("")[0]
			);
			setCode(subarrays);
			setOutput(outputSubarrays);
			setInput(inputSubarrays);
			setCurrentQuestion(questionData[0]);
		}
	}, [questionData, isLoading, examData]);
	useEffect(() => {
		setTimeout(async () => {
			try {
				const res = await api.get(`/api/status/exam?exam_id=${params.id}`, {
					headers: {
						Authorization: `Bearer ${session?.access}`,
					},
				});
				if (!res.data.is_open) {
					return router.push("/dashboard/examEnded");
				}
			} catch (error) {
				if (error instanceof AxiosError) {
					if (error.status === 404) {
						return router.push("/dashboard/examEnded");
					}
				}
			}
		}, 1000);
	}, [session, params.id, router]);
	// const submitAnswer = async () => {
	// 	// if (document.fullscreenElement) {
	// 	// 	document.exitFullscreen();
	// 	// }
	// 	// else if (document.webkitFullscreenElement) {
	// 	// For Safari
	// 	// document.webkitExitFullscreen();
	// 	// } else if (document.msFullscreenElement) {
	// 	// For IE/Edge
	// 	// document.msExitFullscreen();
	// 	// }
	// 	setAnswerSubmitting(true);
	// 	console.log(numberOfTestCasesPassed);
	// 	questionData?.forEach(async (question: Question, index) => {
	// 		try {
	// 			const data = {
	// 				question: question ? question.id : 1,
	// 				student: session?.user.id,
	// 				answers: code[getCurrentIndex()],
	// 				exam_id: params.id,
	// 				no_of_test_cases_passed: numberOfTestCasesPassed[index],
	// 			};
	// 			console.log(data);
	// 			await api.post("/api/submissions", data, {
	// 				headers: {
	// 					Authorization: `Bearer ${session?.access}`,
	// 				},
	// 			});
	// 		} catch (error) {
	// 			if (error instanceof AxiosError) {
	// 				console.error("Axios error:", error.message);
	// 			} else {
	// 				console.error("Unknown error:", error);
	// 			}
	// 		}
	// 	});
	// 	setAnswerSubmitting(false);
	// 	alert("Submission received");
	// 	router.push("/dashboard");
	// };
	const submitAnswer = async () => {
		setAnswerSubmitting(true);
		console.log(numberOfTestCasesPassed);

		try {
			// Create an array of promises for all API requests
			const submissionPromises = questionData?.map(
				async (question: Question, index) => {
					const data = {
						question: question ? question.id : 1,
						student: session?.user.id,
						answers: code[getCurrentIndex()],
						exam_id: params.id,
						no_of_test_cases_passed: numberOfTestCasesPassed[index],
					};
					console.log(data);

					return api.post("/api/submissions", data, {
						headers: {
							Authorization: `Bearer ${session?.access}`,
						},
					});
				}
			);

			// Wait for all requests to complete
			await Promise.all(submissionPromises || []);

			alert("Submission received");
			router.push("/dashboard");
		} catch (error) {
			if (error instanceof AxiosError) {
				console.error("Axios error:", error.message);
			} else {
				console.error("Unknown error:", error);
			}
		} finally {
			setAnswerSubmitting(false);
		}
	};

	useEffect(() => {

		// Disable right-click
		document.addEventListener("contextmenu", (e) => e.preventDefault());

		// Disable keyboard shortcuts
		const disableCopyPaste = (e) => {
		if (e.ctrlKey && (e.key === "c" || e.key === "v" || e.key === "x")) {
			e.preventDefault();
		}
		};
		document.addEventListener("keydown", disableCopyPaste);
		





		window.addEventListener("beforeunload", function (event) {
			event.preventDefault();
			event.returnValue = "Are you sure you want to reload?";
		});

		document.addEventListener("keydown", function (e) {
			if (e.key === "F11" || e.key === "Escape") {
				e.preventDefault();
			}
		});

		document.addEventListener("contextmenu", function (e) {
			e.preventDefault();
		});
		document.addEventListener("copy", function (e) {
			e.preventDefault();
		});
		document.addEventListener("paste", function (e) {
			e.preventDefault();
		});
		document.addEventListener("cut", function (e) {
			e.preventDefault();
		});
		document.addEventListener(
			"touchstart",
			function (e) {
				if (e.touches.length > 1) {
					e.preventDefault();
					alert("Swipe is disabled!");
				}
			},
			{ passive: false }
		);

		document.addEventListener("keydown", function (e) {
			if (
				e.key === "F12" ||
				(e.ctrlKey && e.shiftKey && e.key === "I") ||
				(e.ctrlKey && e.shiftKey && e.key === "J") ||
				(e.ctrlKey && e.key === "U")
			) {
				e.preventDefault();
			}
			if (e.key === "Escape") {
				e.preventDefault();
			}
		});
		setInterval(function () {
			if (
				window.outerWidth - window.innerWidth > 250 ||
				window.outerHeight - window.innerHeight > 250
			) {
				alert("Devtool detected. Please close devtools!");
			}
		}, 1000);
		const timerInterval = setInterval(() => {
			setTime((prevTime) => {
				if (prevTime <= 0) {
					clearInterval(timerInterval);

					return 0;
				}
				return prevTime - 1;
			});
		}, 1000);
		return () => clearInterval(timerInterval);
	}, []);
	useEffect(() => {
		if (time <= 0) {
			alert("Time's up!" + "Submitting your answer...Don't close the tab!");
			submitAnswer();
		}
	}, [time]);
	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${minutes.toString().padStart(2, "0")}:${secs
			.toString()
			.padStart(2, "0")}`;
	};
	const compileGivenTestCases = async () => {
		setNumberOfTestCasesPassed((prevCode) => {
			const updatedCode = [...prevCode];
			updatedCode[getCurrentIndex()] = 0;
			return updatedCode;
		});
		currentQuestion?.testCases?.forEach(async (testCase, index) => {
			let currentOutput = `Compiled Output:\nYour code:\n${code}\nInput:\n${input}`;

			let data = JSON.stringify({
				code: code[getCurrentIndex()],
				input: testCase.input,
			});
			let t = "";
			try {
				const res = await api.post("/api/execute", data, {
					headers: {
						Authorization: `Bearer ${session?.access}`,
						"Content-Type": "application/json",
					},
				});
				currentOutput = `Compiled Output:\n${res.data.message}`;
				t = res.data.message;
				setErrorPresent(false);
			} catch (error) {
				setErrorPresent(true);

				if (axios.isAxiosError(error)) {
					if (error.status === 401) {
						router.push("/auth/login?redirect=/dashboard");
						return;
					}
					currentOutput = `${error.response?.data?.message || error.message}`;
				} else {
					currentOutput = "An unknown error occurred.";
				}
			}

			// let index =
			// 	questionData && currentQuestion
			// 		? questionData.indexOf(currentQuestion)
			// 		: 0;
			setGivenTestCasesOutput((prevCode) => {
				const updatedCode = [...prevCode];

				updatedCode[index] = {
					output: currentOutput,
					passed:
						t.trim().substring(0, t.length - 1) ==
						testCase.output.toString().trim(),
				};
				return updatedCode;
			});
		});

		// numberOfTestCasesPassed[getCurrentIndex()] = givenTestCasesOutput.filter(
		// 	(item) => item.passed
		// ).length;
	};
	useEffect(() => {
		console.log(givenTestCasesOutput.filter((item) => item.passed).length);
		setNumberOfTestCasesPassed((prevCode) => {
			const updatedCode = [...prevCode];
			updatedCode[getCurrentIndex()] = givenTestCasesOutput.filter(
				(item) => item.passed
			).length;
			return updatedCode;
		});
	}, [givenTestCasesOutput]);
	const compileCustomTestCases = async () => {
		if (!session) {
			router.push("/auth/login?redirect=/dashboard");
			return;
		}
		let currentOutput = `Compiled Output:\nYour code:\n${code}\nInput:\n${input}`;

		const data = JSON.stringify({
			code: code[getCurrentIndex()],
			input: input[getCurrentIndex()],
		});
		try {
			const res = await api.post("/api/execute", data, {
				headers: {
					Authorization: `Bearer ${session?.access}`,
					"Content-Type": "application/json",
				},
			});
			currentOutput = `Compiled Output:\n${res.data.message}`;
			setErrorPresent(false);
		} catch (error) {
			setErrorPresent(true);

			if (axios.isAxiosError(error)) {
				if (error.status === 401) {
					router.push("/auth/login?redirect=/dashboard");
					return;
				}
				currentOutput = `${error.response?.data?.message || error.message}`;
			} else {
				currentOutput = "An unknown error occurred.";
			}
		}

		let index =
			questionData && currentQuestion
				? questionData.indexOf(currentQuestion)
				: 0;
		setOutput((prevCode) => {
			const updatedCode = [...prevCode];
			updatedCode[index] = currentOutput;
			return updatedCode;
		});
	};
	useEffect(() => {
		require("prismjs");
	}, []);
	return (
		<>
			{loading ? (
				<div className="flex justify-center items-center h-screen">
					<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
					Please wait!
				</div>
			) : (
				<>
					{answerSubmitting ? (
						<div className="flex justify-center items-center h-screen bg-black text-white opacity-50 absolute w-full z-[999999]">
							<p>Please wait....</p>
						</div>
					) : (
						<>
							<FullscreenModel />
							<div className="min-h-screen z-[-1] flex flex-col bg-gray-100 font-sans">
								<header className="bg-white shadow p-4 flex justify-between items-center">
									<div className="text-gray-600 text-xl">Coding Challenge</div>
									<div className="text-red-600 font-bold text-lg">
										{formatTime(time)}
									</div>
								</header>
								<main className="flex flex-1">
									<div className="w-1/6 bg-gray-200 p-4">
										{questionData &&
											questionData.map((item, index) => {
												return (
													<button
														key={item.id}
														onClick={() => {
															setCurrentQuestionIndex(index);
															setCurrentQuestion(item);
															setCustomTestCases(false);
															setGivenTestCasesOutput([]);
														}}
														className={`w-full ${
															currentQuestion !== item
																? "bg-gray-300 text-gray-800"
																: "bg-gray-800 text-white"
														} hover:bg-gray-400  py-2 px-4 rounded mb-2`}
													>
														{item.title ? item.title : `Question ${index + 1}`}
													</button>
												);
											})}
										{/* <button className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded mb-2">
							Question 1
						</button>
						<Link href="/exampage2">
							<button className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded mb-2">
								Question 2
							</button>
						</Link>
						<Link href="/exampage3">
							<button className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded mb-2">
								Question 3
							</button>
						</Link> */}
									</div>

									<div className="flex-1 p-6">
										<div className="bg-white shadow rounded-lg p-6 mb-6">
											<h2 className="text-xl font-semibold text-gray-800">
												Problem Statement{" "}
												<DifficultyBadge
													difficulty={currentQuestion?.difficulty}
												/>
											</h2>
											<p className="text-gray-700 mt-4">
												{currentQuestion?.question_text}
											</p>
										</div>

										<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
											<div className="bg-white shadow rounded-lg p-6">
												<h3 className="text-lg font-semibold text-gray-800">
													Input Format
												</h3>
												<p className="text-gray-700 mt-4">
													{currentQuestion?.input_format}
												</p>
											</div>
											<div className="bg-white shadow rounded-lg p-6">
												<h3 className="text-lg font-semibold text-gray-800">
													Constraints
												</h3>
												<ul className="list-disc list-inside text-gray-700 mt-4">
													{/* <li>1 ≤ n ≤ 10^4</li>
									<li>1 ≤ chars.length ≤ 10^6</li>
									<li>Strings contain only lowercase English letters</li> */}
													{currentQuestion?.input_constrains
														.split("\n")
														.map((item, index) => (
															<li key={index}>{item}</li>
														))}
												</ul>
											</div>
											<div className="bg-white shadow rounded-lg p-6">
												<h3 className="text-lg font-semibold text-gray-800">
													Expected Output
												</h3>
												<p className="text-gray-700 mt-4">
													{currentQuestion?.expected_output}
												</p>
											</div>
										</div>

										<div className="bg-white shadow rounded-lg p-6 mb-6">
											<div className="flex mb-5 flex-row justify-between">
												<h3 className="text-lg font-semibold text-gray-800">
													Write Your Code
												</h3>
												<div className="flex flex-row gap-5">
													<p>Font Size:</p>
													<select
														value={fontSize}
														onChange={(e) =>
															setFontSize(parseInt(e.target.value))
														}
													>
														<option>15px</option>
														<option>20px</option>
														<option>25px</option>
													</select>
												</div>
											</div>
											<div>
												<Editor
													height="400px"
													language="python"
													theme="vs-dark"
													value={
														code[
															questionData && currentQuestion
																? questionData.indexOf(currentQuestion)
																: 0
														]
													}
													onChange={handleEditorChange}
													options={{
														selectOnLineNumbers: true,
														fontSize: fontSize,
														automaticLayout: true,
													}}
												/>
											</div>
											<div className="pt-5 pb-5">
												<input
													type="checkbox"
													id="customTestCases"
													name="customTestCases"
													value="customTestCases"
													onChange={() => setCustomTestCases(!customTestCases)}
												/>
												<label
													htmlFor="customTestCases"
													className="pl-5"
												>
													Custom Test Case
												</label>
											</div>
											{customTestCases && (
												<textarea
													className="w-full h-20 bg-gray-100 border border-gray-300 rounded p-4 mt-4"
													placeholder="Enter input here..."
													value={input[getCurrentIndex()]}
													onChange={(e) =>
														setInput((prevCode) => {
															const updatedCode = [...prevCode];
															updatedCode[getCurrentIndex()] = e.target.value;
															return updatedCode;
														})
													}
												/>
											)}

											<div className="mt-4 space-x-2">
												<button
													onClick={() => {
														if (customTestCases) {
															compileCustomTestCases();
														} else {
															compileGivenTestCases();
														}
													}}
													className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
												>
													Compile & Test
												</button>
												{currentQuestion &&
												questionData &&
												currentQuestion?.id.toString() ===
													questionData[
														questionData.length - 1
													].id.toString() ? (
													<button
														onClick={() => {
															submitAnswer();
														}}
														className="bg-blue-600 text-white px-4 py-2 rounded"
													>
														Submit
													</button>
												) : (
													<button
														onClick={() => {
															setCurrentQuestion(
																questionData
																	? questionData[currentQuestionIndex + 1]
																	: null
															);
															setCustomTestCases(false);
															setGivenTestCasesOutput([]);
															setCurrentQuestionIndex((prev) => prev + 1);
														}}
														className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
													>
														Save & Next
													</button>
												)}
											</div>
										</div>
										{currentQuestion?.testCases && (
											<h3 className="text-xl font-semibold mb-5">
												Test cases (
												{givenTestCasesOutput.length > 0 &&
													givenTestCasesOutput.filter((item) => item.passed)
														.length}
												{givenTestCasesOutput.length > 0 && "/"}
												{currentQuestion?.testCases.length})
											</h3>
										)}
										{
											// input test case div
											!customTestCases &&
												currentQuestion?.testCases &&
												currentQuestion.testCases.map((testCase, index) => (
													<div key={index}>
														{testCase.input && (
															<div
																key={index}
																className="bg-gray-100 mt-5 border border-gray-300 rounded p-6"
															>
																{" "}
																{!testCase.isPublic && "(Hidden)"}
																<div className="flex flex-row justify-between">
																	<h1 className="text-xl pb-5 font-bold">
																		Test Case {index}
																	</h1>
																	{givenTestCasesOutput &&
																		givenTestCasesOutput[index] && (
																			<div>
																				{givenTestCasesOutput[index].passed ? (
																					<div
																						className={
																							givenTestCasesOutput[index].passed
																								? "bg-green-100 p-4 rounded"
																								: "bg-red-100 p-4 rounded"
																						}
																					>
																						<p className="text-green-500 text-md font-bold">
																							Passed
																						</p>
																					</div>
																				) : (
																					<div
																						className={
																							givenTestCasesOutput[index].passed
																								? "bg-green-100 p-4 rounded"
																								: "bg-red-100 p-4 rounded"
																						}
																					>
																						<p className="text-red-500 text-md font-bold">
																							Failed
																						</p>
																					</div>
																				)}
																			</div>
																		)}
																</div>
																{testCase.isPublic && (
																	<>
																		<h3 className="text-lg  font-semibold">
																			Input:
																		</h3>
																		<pre className="mt-4 text-gray-700">
																			{testCase.input}
																		</pre>
																		<h3 className="text-lg mt-4 font-semibold">
																			Expected Output:
																		</h3>
																		<pre className="mt-4 text-gray-700">
																			{testCase.output}
																		</pre>
																		{givenTestCasesOutput[index] && (
																			<>
																				<h3 className="text-lg mt-4 font-semibold">
																					Your Output:
																				</h3>
																				<pre className="mt-4 text-gray-700">
																					{givenTestCasesOutput[index].output}
																				</pre>
																			</>
																		)}
																	</>
																)}
															</div>
														)}
													</div>
												))
										}
										{output && customTestCases && (
											<div className="bg-gray-100 mt-10 border border-gray-300 rounded p-6">
												<h3 className="text-lg font-semibold">Output:</h3>
												<pre
													className={`mt-4 ${
														!errorPresent ? "text-gray-700" : "text-red-500"
													}`}
												>
													{output[getCurrentIndex()]}
												</pre>
											</div>
										)}
									</div>
								</main>

								<footer className="bg-gray-50 p-4 text-center border-t border-gray-200">
									<p className="text-gray-600">Coding Challenge Platform</p>
								</footer>
							</div>
						</>
					)}
				</>
			)}
		</>
	);
};

export default ExamPage;
