import React, { useState } from "react";
import {
	ArrowLeft,
	Plus,
	Trash2,
	Users,
	Clock,
	AlertCircle,
	CheckSquare,
	Square,
	Eye,
	EyeOff,
	Code,
} from "lucide-react";
import { AxiosError } from "axios";
import useSWR from "swr";
import { getFetcherApi } from "@/lib/helpers";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { addQuestion, Question, Student, TestCase } from "@/types/types";
import { Session } from "next-auth";

interface PostExamProps {
	session: Session | null;
	onBack: () => void;
	onSubmit: (examData: {
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
		questions: addQuestion[];
	}) => void;
}

const DEFAULT_RULES = `Login and start the exam on schedule. Late submissions are not allowed.
Ensure reliable internet to avoid disruptions.
Work individually; malpractice leads to disqualification.
Submit answers before the timer ends. Save coding answers properly.
Only use tools provided within the exam. External help is not allowed.
Use "Next" and "Previous" buttons to move between questions.
Double-check answers before final submission.
Contact support immediately if needed.`;

export function PostExam({ onBack, onSubmit }: PostExamProps) {
	const { data: session } = useSession();
	const [loading, setLoading] = useState(false);
	const [name, setName] = useState("");
	const router = useRouter();
	const [description, setDescription] = useState("");
	const [startTime, setStartTime] = useState("");
	const [duration, setDuration] = useState(300); // 5 hours in minutes
	const [rules, setRules] = useState(DEFAULT_RULES);
	const [status, setStatus] = useState("open");
	const [questions, setQuestions] = useState<addQuestion[]>([
		{
			title: "Question",
			question_text: "",
			input_constrains: "",
			input_format: "",
			expected_output: "",
			marks: 10,
			difficulty: "Easy",
			testCases: [],
		},
	]);
	const [assignedStudents, setAssignedStudents] = useState<number[]>([]);
	const [showStudentSelector, setShowStudentSelector] = useState(false);

	const {
		data: resultsData,
		error: apiError,
	}: {
		data: Student[] | undefined;
		error: AxiosError<unknown, any> | undefined;
	} = useSWR<Student[], AxiosError<unknown, any> | undefined>(
		[`/api/students`, session?.access],
		([url, token]) => getFetcherApi(url, token)
	);
	if (apiError) {
		if (apiError.status === 401 && session != null) {
			router.push(`/auth/login?redirect=/admin-dashboard/exams`);
		}
	}
	const availableStudents = resultsData;

	const addQuestion = () => {
		setQuestions([
			...questions,
			{
				title: "Question",
				question_text: "",
				input_constrains: "",
				input_format: "",
				expected_output: "",
				marks: 10,
				testCases: [],
				difficulty: "Easy",
			},
		]);
	};
	const addTestCase = (questionIndex: number) => {
		const newQuestions = [...questions];
		newQuestions[questionIndex].testCases = [
			...newQuestions[questionIndex].testCases,
			{ input: "", output: "", isPublic: true },
		];
		setQuestions(newQuestions);
	};

	const removeTestCase = (questionIndex: number, testCaseIndex: number) => {
		const newQuestions = [...questions];
		newQuestions[questionIndex].testCases = newQuestions[
			questionIndex
		].testCases.filter((_, i) => i !== testCaseIndex);
		setQuestions(newQuestions);
	};

	const updateTestCase = (
		questionIndex: number,
		testCaseIndex: number,
		field: keyof TestCase,
		value: string | boolean
	) => {
		const newQuestions = [...questions];
		newQuestions[questionIndex].testCases[testCaseIndex] = {
			...newQuestions[questionIndex].testCases[testCaseIndex],
			[field]: value,
		};
		setQuestions(newQuestions);
	};

	const removeQuestion = (index: number) => {
		setQuestions(questions.filter((_, i) => i !== index));
	};

	const updateQuestion = (
		index: number,
		field: keyof Question,
		value: string | number
	) => {
		const newQuestions = [...questions];
		newQuestions[index] = { ...newQuestions[index], [field]: value };
		setQuestions(newQuestions);
	};

	const toggleStudent = (studentId: number) => {
		setAssignedStudents((prev) =>
			prev.includes(studentId)
				? prev.filter((id) => id !== studentId)
				: [...prev, studentId]
		);
	};

	const toggleAllStudents = () => {
		if (availableStudents)
			if (assignedStudents.length === availableStudents?.length) {
				setAssignedStudents([]);
			} else {
				setAssignedStudents(
					availableStudents
						.filter((item) => item.S_email !== session?.user?.email)
						.map((student) => student.S_id)
				);
			}
	};

	const calculateEndTime = () => {
		if (!startTime) return "";
		let start = new Date(startTime);
		start.setMinutes(start.getMinutes() + duration);

		return (
			start.getFullYear() +
			"-" +
			String(start.getMonth() + 1).padStart(2, "0") +
			"-" +
			String(start.getDate()).padStart(2, "0") +
			"T" +
			String(start.getHours()).padStart(2, "0") +
			":" +
			String(start.getMinutes()).padStart(2, "0")
		);
	};
	const calculateTotalMarks = () => {
		return questions.reduce((sum, q) => sum + q.marks, 0);
	};

	const handleSubmit = async (e: any) => {
		setLoading(true);
		e.preventDefault();
		// alert(calculateEndTime());
		onSubmit({
			name,
			description,
			start_time: startTime,
			end_time: calculateEndTime(),
			students: assignedStudents,
			num_of_questions: questions.length,
			total_marks: calculateTotalMarks(),
			duration,
			rules,
			status,
			questions,
		});
		setLoading(false);
	};

	const areAllStudentsSelected =
		assignedStudents.length === availableStudents?.length;

	return (
		<div className="space-y-8 w-full px-20 py-10">
			<button
				onClick={onBack}
				className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
			>
				<ArrowLeft className="w-5 h-5 mr-2" />
				Back to Exams
			</button>

			<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
				<h2 className="text-2xl font-bold text-gray-900 mb-6">
					Create New Exam
				</h2>

				<div className="space-y-6">
					<div className="grid grid-cols-1 gap-6">
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Exam Name
							</label>
							<input
								type="text"
								id="name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								placeholder="Enter exam name"
								required
							/>
						</div>

						<div>
							<label
								htmlFor="description"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Description
							</label>
							<textarea
								id="description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								rows={3}
								placeholder="Enter exam description"
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="startTime"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Start Time
								</label>
								<input
									type="datetime-local"
									id="startTime"
									value={startTime}
									onChange={(e) => setStartTime(e.target.value)}
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									required
								/>
							</div>
							<div>
								<label
									htmlFor="duration"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Duration (minutes)
								</label>
								<div className="flex items-center">
									<input
										type="number"
										id="duration"
										value={duration}
										onChange={(e) => setDuration(parseInt(e.target.value))}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										min="1"
										required
									/>
									<Clock className="w-5 h-5 ml-2 text-gray-400" />
								</div>
							</div>
						</div>

						<div>
							<label
								htmlFor="rules"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Exam Rules
							</label>
							<textarea
								id="rules"
								value={rules}
								onChange={(e) => setRules(e.target.value)}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								rows={8}
							/>
						</div>

						<div>
							<label
								htmlFor="status"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Status
							</label>
							<select
								id="status"
								value={status}
								onChange={(e) => setStatus(e.target.value)}
								className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							>
								<option value="open">Open</option>
								<option value="closed">Closed</option>
							</select>
						</div>
					</div>

					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-lg font-semibold text-gray-900">
								Assign Students
							</h3>
							<button
								type="button"
								onClick={() => setShowStudentSelector(!showStudentSelector)}
								className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							>
								<Users className="w-4 h-4 mr-2" />
								{showStudentSelector ? "Hide Students" : "Show Students"}
							</button>
						</div>

						{showStudentSelector && (
							<div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
								<div className="mb-4">
									<button
										type="button"
										onClick={toggleAllStudents}
										className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
									>
										{areAllStudentsSelected ? (
											<CheckSquare className="w-4 h-4 mr-2" />
										) : (
											<Square className="w-4 h-4 mr-2" />
										)}
										{areAllStudentsSelected ? "Deselect All" : "Select All"}
									</button>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
									{availableStudents &&
										availableStudents
											.filter((item) => item.S_email !== session?.user?.email)
											.map((student: Student) => (
												<div
													key={student.S_id}
													className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
														assignedStudents.includes(student.S_id)
															? "bg-blue-50 border-blue-200"
															: "bg-white border-gray-200 hover:border-blue-200"
													}`}
													onClick={() => toggleStudent(student.S_id)}
												>
													<div className="flex items-center space-x-3">
														<input
															type="checkbox"
															checked={assignedStudents.includes(student.S_id)}
															onChange={() => toggleStudent(student.S_id)}
															className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
														/>
														<div>
															<p className="font-medium text-gray-900">
																{student.S_name}
															</p>
															<p className="text-sm text-gray-500">
																{student.S_email}
															</p>
														</div>
													</div>
												</div>
											))}
								</div>
								<div className="mt-4 text-sm text-gray-600">
									{assignedStudents.length} students selected
								</div>
							</div>
						)}
					</div>

					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-lg font-semibold text-gray-900">
									Questions
								</h3>
								<p className="text-sm text-gray-500">
									Total Marks: {calculateTotalMarks()}
								</p>
							</div>
							<button
								type="button"
								onClick={addQuestion}
								className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
							>
								<Plus className="w-4 h-4 mr-2" />
								Add Question
							</button>
						</div>

						<div className="space-y-4">
							{questions.map((question, index) => (
								<div
									key={index}
									className="p-4 bg-gray-50 rounded-lg border border-gray-200 relative"
								>
									<div className="grid grid-cols-1 gap-4">
										<div className="flex justify-between items-start">
											<label className="block text-sm font-medium text-gray-700">
												Question {index + 1}
											</label>
											{questions.length > 1 && (
												<button
													type="button"
													onClick={() => removeQuestion(index)}
													className="p-2 text-red-600 hover:text-red-700 focus:outline-none"
												>
													<Trash2 className="w-5 h-5" />
												</button>
											)}
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Title
											</label>
											<input
												type="text"
												value={question.title}
												onChange={(e) =>
													updateQuestion(index, "title", e.target.value)
												}
												className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												placeholder="Question title"
												required
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Question Text
											</label>
											<textarea
												value={question.question_text}
												onChange={(e) =>
													updateQuestion(index, "question_text", e.target.value)
												}
												className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												rows={3}
												placeholder="Enter question text"
												required
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Input Constraints
											</label>
											<textarea
												value={question.input_constrains}
												onChange={(e) =>
													updateQuestion(
														index,
														"input_constrains",
														e.target.value
													)
												}
												className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												rows={2}
												placeholder="Enter input constraints"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Input Format
											</label>
											<textarea
												value={question.input_format}
												onChange={(e) =>
													updateQuestion(index, "input_format", e.target.value)
												}
												className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												rows={2}
												placeholder="Enter input format"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Expected Output
											</label>
											<textarea
												value={question.expected_output}
												onChange={(e) =>
													updateQuestion(
														index,
														"expected_output",
														e.target.value
													)
												}
												className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												rows={2}
												placeholder="Enter expected output"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium text-gray-700 mb-1">
												Marks
											</label>
											<input
												type="number"
												value={question.marks}
												onChange={(e) =>
													updateQuestion(
														index,
														"marks",
														parseInt(e.target.value)
													)
												}
												className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
												min="1"
												required
											/>
										</div>
										<div className="space-y-4">
											<div className="flex items-center justify-between">
												<h4 className="text-sm font-medium text-gray-700">
													Test Cases
												</h4>
												<button
													type="button"
													onClick={() => addTestCase(index)}
													className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
												>
													<Code className="w-4 h-4 mr-2" />
													Add Test Case
												</button>
											</div>

											<div className="space-y-3">
												{question.testCases.map((testCase, testIndex) => (
													<div
														key={testIndex}
														className="p-4 bg-white rounded-lg border border-gray-200"
													>
														<div className="flex justify-between items-start mb-3">
															<h5 className="text-sm font-medium text-gray-900">
																Test Case {testIndex + 1}
															</h5>
															<div className="flex items-center space-x-2">
																<button
																	type="button"
																	onClick={() =>
																		updateTestCase(
																			index,
																			testIndex,
																			"isPublic",
																			!testCase.isPublic
																		)
																	}
																	className={`p-1.5 rounded-lg transition-colors ${
																		testCase.isPublic
																			? "bg-green-50 text-green-600 hover:bg-green-100"
																			: "bg-gray-50 text-gray-600 hover:bg-gray-100"
																	}`}
																	title={
																		testCase.isPublic
																			? "Public Test Case"
																			: "Private Test Case"
																	}
																>
																	{testCase.isPublic ? (
																		<Eye className="w-4 h-4" />
																	) : (
																		<EyeOff className="w-4 h-4" />
																	)}
																</button>
																<button
																	type="button"
																	onClick={() =>
																		removeTestCase(index, testIndex)
																	}
																	className="p-1.5 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50"
																>
																	<Trash2 className="w-4 h-4" />
																</button>
															</div>
														</div>

														<div className="grid grid-cols-1 gap-3">
															<div>
																<label className="block text-sm font-medium text-gray-700 mb-1">
																	Input
																</label>
																<textarea
																	value={testCase.input}
																	onChange={(e) =>
																		updateTestCase(
																			index,
																			testIndex,
																			"input",
																			e.target.value
																		)
																	}
																	className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
																	rows={2}
																	placeholder="Enter test case input"
																/>
															</div>
															<div>
																<label className="block text-sm font-medium text-gray-700 mb-1">
																	Expected Output
																</label>
																<textarea
																	value={testCase.output}
																	onChange={(e) =>
																		updateTestCase(
																			index,
																			testIndex,
																			"output",
																			e.target.value
																		)
																	}
																	className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
																	rows={2}
																	placeholder="Enter expected output"
																/>
															</div>
														</div>
													</div>
												))}
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
					{loading && (
						<div className="flex items-center justify-center">
							<div className="w-16 h-16 border-4 border-blue-500 rounded-full loader"></div>
						</div>
					)}
					<div className="flex justify-end">
						<button
							type="submit"
							disabled={loading}
							onClick={(e) => {
								handleSubmit(e);
							}}
							className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
						>
							{loading ? "Creating Exam..." : "Create Exam"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
