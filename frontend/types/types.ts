import { z } from "zod";

export const existingUserSchema = z.object({
	username: z
		.string()
		.min(3, {
			message: "Username is too short",
		})
		.max(255, {
			message: "Username should be at most 255 characters",
		}),
	password: z
		.string()
		.min(3, {
			message: "Password is too short",
		})
		.max(255, {
			message: "Password should be at most 255 characters",
		}),
});
export type existingUser = z.infer<typeof existingUserSchema>;

export const newUserSchema = z
	.object({
		username: z
			.string()
			.min(3, {
				message: "Username is too short",
			})
			.max(255, {
				message: "Username should be at most 255 characters",
			}),
		email: z
			.string()
			.min(10, {
				message: "Email is too short",
			})
			.max(100, {
				message: "Email should be at most 255 characters",
			})
			.email("Invalid email address"),
		password: z
			.string()
			.min(3, {
				message: "Password is too short",
			})
			.max(255, {
				message: "Password should be at most 255 characters",
			})
			.regex(/[a-z]/, "Password must contain at least one lowercase letter")
			.regex(/[A-Z]/, "Password must contain at least one uppercase letter")
			.regex(/[0-9]/, "Password must contain at least one number")
			.regex(
				/[^a-zA-Z0-9]/,
				"Password must contain at least one special character"
			),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password == data.confirmPassword, {
		message: "Passwords must match",
		path: ["confirmPassword"],
	});
export type newUser = z.infer<typeof newUserSchema>;

export interface Exam {
	id: number;
	name: string;
	description: string;
	start_time: string;
	end_time: string;
	duration: number;
	students: Student[];
	total_marks: number;
	num_of_questions: number;
	randomize_questions: boolean;
	status: string;
	rules: string;
	plagiarism_checked: boolean;
	no_of_students_attended: number;
}
export interface Submission {
	id: number;
	question: number;
	student: Student;
	submitted_at: string;
	answers: string;
	status: string;
	no_of_test_cases_passed: number;
}
export interface TestCase {
	input: string;
	output: string;
	isPublic: boolean;
}

export interface Question {
	id: number;
	title: string;
	question_text: string;
	input_constrains: string;
	difficulty: string;
	input_format: string;
	expected_output: string;
	marks: number;
	exam: number;
	testCases: TestCase[];
}

export interface addQuestion {
	title: string;
	question_text: string;
	input_constrains: string;
	difficulty: string;
	input_format: string;
	expected_output: string;
	marks: number;
	testCases: TestCase[];
}
export interface Student {
	S_id: number;
	S_name: string;
	S_email: string;
	S_phone: string;
	created_at: string;
}

export interface ExamRecord {
	id: number;
	student: Student;
	exam: Exam;
	question: Question;
	marks_obtained: number;
	published_at: string;
	plagiarism_percentage: number;
}
export interface ExamSummary {
	question: Question;
	exam: Exam;
	marks_obtained: number;
	published_at: string;
	plagiarism_percentage: number;
}
export interface CompletedExam {
	submitted_time: string;
	id: number;
	exam: Exam;
	student: Student;
	submission: Submission;
}
