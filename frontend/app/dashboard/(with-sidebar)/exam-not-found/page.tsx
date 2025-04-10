"use client";
import React from "react";
import { SearchX } from "lucide-react";

export default function NoExamFound() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
			<div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
				<div className="flex justify-center mb-6">
					<div className="bg-indigo-100 p-3 rounded-full">
						<SearchX className="w-12 h-12 text-indigo-600" />
					</div>
				</div>

				<h1 className="text-2xl font-bold text-gray-900 mb-4">
					Exam Not Found
				</h1>

				<p className="text-gray-600 mb-6">
					We couldn&apos;t locate the exam you&apos;re looking for. This could
					be because:
				</p>

				<ul className="text-left text-gray-600 mb-6 space-y-2 list-disc list-inside">
					<li>The exam ID is incorrect</li>
					<li>The exam has been archived</li>
					<li>You don&apos;t have access to this exam</li>
				</ul>

				<div className="border-t border-gray-200 pt-6">
					<div className="space-y-4">
						<p className="text-sm text-gray-500">
							Please verify the exam ID or contact support if you need
							assistance.
						</p>
						<div className="space-x-4"></div>
					</div>
				</div>
			</div>
		</div>
	);
}
