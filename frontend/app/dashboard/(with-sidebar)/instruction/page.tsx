import { LogOut } from "lucide-react";
import Link from "next/link";
import { CompletedExam, Exam, Student, Submission } from "@/types/types";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import { getServerSession } from "next-auth";
import api from "@/app/api";
import { ExamCard } from "@/components/ui/exam-card";
import { checkDateStatus } from "@/lib/helpers";

export default async function ExaminationPage() {
	const session = await getServerSession(authOptions);
	let exam = await api.get("/api/exams/all", {
		headers: {
			Authorization: `Bearer ${session?.access}`,
		},
	});
	let completedExams = await api.get("/api/completed-exams", {
		headers: {
			Authorization: `Bearer ${session?.access}`,
		},
	});
	let completedExamsData: {
		exam: Exam;
		submitted_time: string;
		submission: Submission;
	}[] = [];

	let seenExams = new Set();

	completedExams.data.forEach((item: CompletedExam) => {
		if (!seenExams.has(item.exam.id)) {
			seenExams.add(item.exam.id);
			completedExamsData.push({
				exam: item.exam,
				submitted_time: item.submitted_time,
				submission: item.submission,
			});
		}
	});
	console.log(completedExamsData);
	const exams: Exam[] = await exam.data;
	const upcomingExams = exams.filter(
		(exam) => checkDateStatus(exam.start_time, exam.end_time) === 1
	);
	const activeExams = exams.filter(
		(exam) => checkDateStatus(exam.start_time, exam.end_time) === 0
	);

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-3xl font-bold text-gray-900">
							Examination Portal
						</h1>
						<p className="mt-2 text-gray-600">
							View and manage your upcoming examinations
						</p>
					</div>

					<Link
						href="/auth/logout"
						className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
					>
						<LogOut className="w-4 h-4 mr-2" />
						Logout
					</Link>
				</div>

				{activeExams.length > 0 && (
					<section className="mb-8">
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">
							Active Exams
						</h2>
						<div className="space-y-4">
							{activeExams.map((exam) => (
								<ExamCard
									key={exam.id}
									exam={exam}
									status="current"
								/>
							))}
						</div>
					</section>
				)}

				<section className="mb-8">
					<h2 className="text-2xl font-semibold text-gray-900 mb-4">
						Upcoming Exams
					</h2>
					<div className="space-y-4">
						{upcomingExams.map((exam) => (
							<ExamCard
								key={exam.id}
								exam={exam}
								status="pending"
							/>
						))}
					</div>
				</section>

				{completedExamsData.length > 0 && (
					<section>
						<h2 className="text-2xl font-semibold text-gray-900 mb-4">
							Completed Exams
						</h2>
						<div className="space-y-4">
							{completedExamsData.map((exam) => (
								<ExamCard
									key={exam.exam.id}
									exam={exam.exam}
									status="completed"
									submitted_date={exam.submitted_time}
									submission={completedExamsData.map((item) => item.submission)}
								/>
							))}
						</div>
					</section>
				)}
			</div>
		</div>
	);
}
