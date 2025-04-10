export const dynamic = "force-dynamic";

import api from "@/app/api";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth";
import ExamsData from "@/components/exams-data";
import { Exam } from "@/types/types";
import { AxiosError } from "axios";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function Exams() {
	try {
		const session = await getServerSession(authOptions);
		if (!session) {
			redirect("/auth/login");
		}

		const res = await api.get("/api/exams/all", {
			headers: {
				Authorization: `Bearer ${session.access}`,
			},
		});
		const examData: Exam[] = res.data;
		return <ExamsData exam={examData} />;
	} catch (error) {
		if (error instanceof AxiosError) {
			if (error.response?.status === 401) {
				redirect("/auth/login");
			}
		}
		console.error(error);
		return <p>Failed to load exams.</p>;
	}
}
