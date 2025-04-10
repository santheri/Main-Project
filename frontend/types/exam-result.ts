export interface QuestionResult {
	questionId: string;
	marksObtained: number;
	totalMarks: number;
	plagiarismPercentage: number;
}

export interface ExamResult {
	id: string;
	examId: string;
	marksObtained: number;
	submissionDate: string;
	status: "passed" | "failed";
	feedback?: string;
	sectionWiseMarks: {
		section: string;
		marksObtained: number;
		totalMarks: number;
		questions: QuestionResult[];
	}[];
	averageClassMarks: number;
	highestMarks: number;
}
