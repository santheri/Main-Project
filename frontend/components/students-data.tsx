"use client";
import api from "@/app/api";
import { convertToDateAndTime } from "@/lib/helpers";
import { Student } from "@/types/types";
import { Search } from "lucide-react";
import { Session } from "next-auth";
import React, { useState } from "react";
import { MdDelete } from "react-icons/md";

export default function StudentsData({
	session,
	students,
}: {
	session: Session | null;
	students: Student[];
}) {
	const [studentsData, setStudentsData] = useState(students);
	const [filteredStudents, setFilteredStudents] = useState(students);
	const [searchTerm, setSearchTerm] = useState("");
	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const text = e.target.value;
		setSearchTerm(text);

		const filtered = studentsData.filter((item) =>
			item.S_name.toLowerCase().startsWith(text.toLowerCase())
		);

		setFilteredStudents(filtered);
	};
	const deleteUser = async (id: number) => {
		try {
			await api.delete("/api/students/delete/" + id.toString(), {
				headers: {
					Authorization: `Bearer ${session?.access}`,
				},
			});
			alert("Success");
		} catch (e) {
			console.log(e);
			alert("Something happened!");
		}
	};
	return (
		<div className="min-h-screen  bg-gradient-to-br from-blue-50 to-indigo-50">
			<div className="">
				<header className="bg-white shadow-sm border-b border-gray-200">
					<div className="px-8 py-6">
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-2xl pl-20 font-bold text-gray-900">
									Students Management
								</h2>
								<p className="mt-1 text-sm pl-20 text-gray-500">
									Manage and monitor student records
								</p>
							</div>
							<div className="relative w-96 pr-20">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Search className="h-5 w-5 text-gray-400" />
								</div>
								<input
									type="text"
									className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow duration-200"
									placeholder={`Search for students...`}
									value={searchTerm}
									onChange={handleSearch}
								/>
							</div>
						</div>
					</div>
				</header>
				<div className="px-8 pt-8 pb-8">
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead>
									<tr className="bg-gray-50">
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Name
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Email
										</th>
										<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Join Date
										</th>
										<th className="flex justify-center items-center px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
											Action
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{filteredStudents
										.filter((item) => item.S_email !== session?.user?.email)
										.map((student) => (
											<tr
												key={student.S_id}
												className="hover:bg-gray-50 transition-colors duration-150"
											>
												<td className="px-6 py-4 whitespace-nowrap">
													<div className="font-medium text-gray-900">
														{student.S_name}
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-gray-600">
													{student.S_email}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-gray-600">
													{convertToDateAndTime(student.created_at).date}
												</td>
												<td
													onClick={() => {
														deleteUser(student.S_id);
													}}
													className="flex pt-5 hover:cursor-pointer justify-center items-center"
												>
													<MdDelete />
												</td>
											</tr>
										))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
