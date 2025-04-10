import React from "react";
import { Clock } from "lucide-react";

export default function ExamEnded() {
	return (
		<div className="min-h-[60vh] flex items-center justify-center p-4">
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center max-w-md w-full">
				<div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
					<Clock className="w-8 h-8 text-red-500" />
				</div>
				<h2 className="text-2xl font-bold text-gray-900 mb-2">
					Exam Has Ended
				</h2>
				<div className="space-y-4">
					<p className="text-gray-600">The exam ended</p>

					<p className="text-sm text-gray-500 mt-4">
						Please contact your administrator if you believe this is an error.
					</p>
				</div>
			</div>
		</div>
	);
}
