"use client";
import React from "react";
import { ShieldX, ArrowLeft } from "lucide-react";

function App() {
	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
			<div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
				<div className="flex justify-center mb-6">
					<div className="bg-red-50 p-3 rounded-full">
						<ShieldX className="w-12 h-12 text-red-500" />
					</div>
				</div>

				<h1 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h1>
				<p className="text-gray-600 mb-8">
					Sorry, you don&apos;t have permission to access this page. Please
					contact your administrator if you think this is a mistake.
				</p>

				<div className="space-y-4">
					<button
						onClick={() => window.history.back()}
						className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
					>
						<ArrowLeft className="w-4 h-4 mr-2" />
						Go Back
					</button>

					<a
						href="/"
						className="inline-block w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
					>
						Return to Home
					</a>
				</div>
			</div>
		</div>
	);
}

export default App;
