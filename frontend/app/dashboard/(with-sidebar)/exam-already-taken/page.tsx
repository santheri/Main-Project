"use client";
import React from "react";
import { AlertCircle } from "lucide-react";

function App() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
			<div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
				<div className="flex justify-center mb-6">
					<div className="bg-amber-100 p-3 rounded-full">
						<AlertCircle className="w-12 h-12 text-amber-600" />
					</div>
				</div>

				<h1 className="text-2xl font-bold text-gray-900 mb-4">
					Exam Already Completed
				</h1>

				<p className="text-gray-600 mb-6">
					Our records show that you have already taken this examination.
					Multiple attempts are not permitted for this assessment.
				</p>

				<div className="border-t border-gray-200 pt-6">
					<div className="space-y-4">
						<p className="text-sm text-gray-500">
							If you believe this is an error or need assistance, please contact
							your administrator.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
