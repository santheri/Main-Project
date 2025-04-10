import React from "react";
import { Search } from "lucide-react";
import api from "../api";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/auth";
import { Student } from "@/types/types";
import { convertToDateAndTime } from "@/lib/helpers";
import StudentsData from "@/components/students-data";
interface Exam {
	id: number;
	title: string;
	startDate: string;
	endDate: string;
	numberOfQuestions: number;
	totalStudentsAttended: number;
	averageScore: number;
}

async function App() {
	const session = await getServerSession(authOptions);
	try {
		let studentsRes = await api.get("/api/students", {
			headers: {
				Authorization: `Bearer ${session?.access}`,
			},
		});
		const students: Student[] = studentsRes.data;

		return (
			<StudentsData
				session={session}
				students={students}
			/>
		);
	} catch (error) {}
}

export default App;
