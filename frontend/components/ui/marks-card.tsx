"use client";

import {
	Calendar,
	CheckCircle2,
	XCircle,
	AlertTriangle,
	Trophy,
	Users,
} from "lucide-react";
import { format } from "date-fns";
import { Exam, ExamSummary, Question } from "@/types/types";

interface MarksCardProps {
	exam: Exam;
	fullData: ExamSummary[];
	questions: Question[];
	marks_obtained: number;
	submission_date: string;
	plagiarism_percentage: number;
}

export function MarksCard({
	fullData,
	exam,
	questions,
	marks_obtained,
	submission_date,
	plagiarism_percentage,
}: MarksCardProps) {
	const submissionDate = new Date(submission_date);
	const percentage = (marks_obtained / exam.total_marks) * 100;
	console.log(fullData);
	console.log(questions);
	return (
		<div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
			<div className="flex flex-col md:flex-row">
				{/* <div
					className={`p-6 md:w-64 flex flex-col justify-center ${
						result.status === "passed"
							? "bg-gradient-to-r from-blue-600 to-blue-700"
							: "bg-gradient-to-r from-blue-800 to-blue-900"
					}`}
				>
					<h3 className="text-xl font-bold text-white">{exam.title}</h3>
					<p className="text-blue-100 mt-1">{exam.course}</p>
				</div> */}

				<div className="flex-1 p-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
						<div className="flex items-center text-gray-600">
							<Calendar className="w-5 h-5 mr-2 flex-shrink-0" />
							<span>Submitted on {format(submissionDate, "PPP p")}</span>
						</div>
						<div className="flex items-center text-gray-600">
							{/* {result.status === "passed" ? (
								<CheckCircle2 className="w-5 h-5 mr-2 flex-shrink-0 text-blue-500" />
							) : (
								<XCircle className="w-5 h-5 mr-2 flex-shrink-0 text-blue-800" />
							)} */}
							<span>
								{/* {result.marksObtained} out of {exam.totalMarks} (
								{percentage.toFixed(1)}%) */}
							</span>
						</div>
					</div>

					<div className="space-y-6">
						<div className="space-y-4">
							<div className="bg-gray-50 rounded-lg p-4">
								<div className="space-y-4">
									{fullData.map((data: ExamSummary, qIndex) => {
										const questionPercentage =
											(data.marks_obtained / data.question.marks) * 100;
										return (
											<div
												key={qIndex}
												className="space-y-2"
											>
												<div className="flex justify-between items-center text-sm">
													<div className="flex items-center">
														<span className="text-gray-600">
															Question {qIndex + 1}
														</span>
														{data.plagiarism_percentage > 20 && (
															<AlertTriangle className="w-4 h-4 ml-2 text-blue-600" />
														)}
													</div>
													<div className="flex items-center space-x-4">
														<span className="text-gray-600">
															{data.marks_obtained}/{exam.total_marks}
														</span>
														<span
															className={`text-xs px-2 py-1 rounded ${
																data.plagiarism_percentage > 20
																	? "bg-blue-100 text-blue-700"
																	: data.plagiarism_percentage > 10
																	? "bg-blue-50 text-blue-600"
																	: "bg-gray-100 text-gray-700"
															}`}
														>
															{data.plagiarism_percentage}% similar
														</span>
													</div>
												</div>
												<div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
													<div
														className={`h-full rounded-full ${
															questionPercentage >= 70
																? "bg-blue-500"
																: questionPercentage >= 40
																? "bg-blue-400"
																: "bg-blue-300"
														}`}
														style={{ width: `${questionPercentage}%` }}
													/>
												</div>
											</div>
										);
									})}
								</div>
							</div>
						</div>
					</div>

					{/* {result.feedback && (
						<div className="mt-6 p-4 bg-gray-50 rounded-lg">
							<h4 className="text-sm font-medium text-gray-700 mb-2">
								Feedback
							</h4>
							<p className="text-sm text-gray-600">{result.feedback}</p>
						</div>
					)} */}
				</div>
			</div>
		</div>
	);
}
