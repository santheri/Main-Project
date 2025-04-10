"use client";
import { useState } from "react";
import {
	GraduationCap,
	LayoutDashboard,
	LogOut,
	Users,
	Menu,
	X,
} from "lucide-react";
import Link from "next/link";
import React from "react";

function AdminSidebar() {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button
				className="fixed top-4 left-4 z-50 bg-blue-600 text-white p-2 rounded-md"
				onClick={() => setIsOpen(!isOpen)}
			>
				{isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
			</button>
			<div
				className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transition-transform duration-300 ${
					isOpen ? "translate-x-0" : "-translate-x-64"
				}`}
			>
				<div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600">
					<Link
						href="/"
						className="flex flex-row items-center gap-3"
					>
						<LayoutDashboard className="w-8 h-8 text-white" />
						<h1 className="text-xl font-bold text-white">EduAdmin</h1>
					</Link>
				</div>
				<nav className="p-4 space-y-2">
					<Link
						href="/admin-dashboard"
						className="w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-50"
					>
						<Users className="w-5 h-5 mr-3" />
						<span className="font-medium">Students</span>
					</Link>
					<Link
						href="/admin-dashboard/exams"
						className="w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-50"
					>
						<GraduationCap className="w-5 h-5 mr-3" />
						<span className="font-medium">Exams</span>
					</Link>
					<Link
						href="/auth/logout"
						className="w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 text-gray-600 hover:bg-gray-50"
					>
						<LogOut className="w-5 h-5 mr-3" />
						<span className="font-medium">Log out</span>
					</Link>
				</nav>
			</div>
		</>
	);
}

export default AdminSidebar;
