"use client";
import { useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { Session } from "next-auth";
import Link from "next/link";
import React from "react";

export default function DashboardSidebar({ session }: { session: Session }) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button
				className="fixed top-4 left-4 z-50 bg-blue-800 text-white p-2 rounded-md"
				onClick={() => setIsOpen(!isOpen)}
			>
				{isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
			</button>
			<aside
				className={`bg-blue-800 top-0 left-0 h-screen text-white w-64 fixed transition-transform duration-300 ${
					isOpen ? "translate-x-0" : "-translate-x-64"
				}`}
			>
				<div className="h-full p-6">
					<div className="text-center mb-8">
						<div className="bg-blue-600 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-8 w-8"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M12 14l9-5-9-5-9 5 9 5zm0 0v7m0-7L3 9m9 5l9-5"
								/>
							</svg>
						</div>
						<h2 className="text-xl font-bold mt-4">{session?.user.username}</h2>
						<p className="text-sm">(Student)</p>
					</div>
					<nav>
						<ul className="space-y-4">
							<li>
								<Link
									href="/dashboard"
									className="flex items-center space-x-2"
								>
									<span>Dashboard</span>
								</Link>
							</li>
							<li>
								<Link
									href="/dashboard/instruction"
									className="flex items-center space-x-2"
								>
									<span>Examination</span>
								</Link>
							</li>
							<li>
								<Link
									href="/dashboard/marks"
									className="flex items-center space-x-2"
								>
									<span>My Marks</span>
								</Link>
							</li>
							<li>
								<Link
									href="/auth/logout"
									className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
								>
									<LogOut className="w-4 h-4 mr-2" />
									Logout
								</Link>
							</li>
						</ul>
					</nav>
				</div>
			</aside>
		</>
	);
}
