import api from "@/app/api";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { MarksCard } from "@/components/ui/marks-card";
import { ExamResult } from "@/types/exam-result";
import { Exam, ExamRecord, ExamSummary, Question } from "@/types/types";
import { LogOut } from "lucide-react";
import { getServerSession } from "next-auth";
import Link from "next/link";

function getMarksDataWithExamKey(data: ExamRecord[]) {
	let output: Map<number, ExamSummary[]> = new Map();

	data.forEach((item) => {
		const examId = item.exam.id;

		if (!output.has(examId)) {
			output.set(examId, []);
		}

		output.get(examId)!.push({
			question: item.question,
			exam: item.exam,
			marks_obtained: item.marks_obtained,
			published_at: item.published_at,
			plagiarism_percentage: item.plagiarism_percentage,
		});
	});

	return output;
}
export default async function MarksPage() {
	const session = await getServerSession(authOptions);

	let marksData = await api.get(
		`/api/results/all?student_id=${session?.user.id}`,
		{
			headers: {
				Authorization: `Bearer ${session?.access}`,
			},
		}
	);
	let examRecords: ExamRecord[] = marksData.data;
	const examWithQuestions = getMarksDataWithExamKey(examRecords);
	return (
		<div className="min-h-screen w-full bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							Examination Results
						</h1>
						<p className="mt-2 text-gray-600">
							View your performance across all examinations
						</p>
					</div>

					<div className="flex gap-4">
						<Link
							href="/dashboard/instruction"
							className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
						>
							View Exams
						</Link>
					</div>
				</div>

				{Array.from(examWithQuestions.entries()).map(([id, data]) => {
					const questions = data.map((item: ExamSummary) => item.question);
					console.log(questions);
					return (
						<section
							key={id}
							className="mb-8"
						>
							<h2 className="text-2xl font-semibold text-gray-900 mb-4">
								{data[0].exam.name}
							</h2>
							<div className="space-y-4">
								{/* {data.map((item) => ( */}
								<MarksCard
									fullData={data}
									key={data[0].question.id}
									exam={data[0].exam}
									marks_obtained={100}
									submission_date={data[0].published_at}
									questions={questions}
									plagiarism_percentage={data[0].plagiarism_percentage}
								/>
							</div>
						</section>
					);
				})}
			</div>
		</div>
	);
}
