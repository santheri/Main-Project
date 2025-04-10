import React from "react";

const Review: React.FC = () => {
	return (
		<div className="min-h-screen flex flex-col bg-gray-100 font-sans">
			{/* Header Section */}
			<header className="bg-blue-600 text-white p-4">
				<h1 className="text-center text-2xl font-bold">Review</h1>
			</header>

			{/* Main Content */}
			<main className="flex-1 p-6">
				{/* Student Information */}
				<div className="bg-white shadow rounded-lg p-6 mb-6">
					<h2 className="text-xl font-semibold text-gray-800">
						Student Information
					</h2>
					<p className="text-gray-700 mt-2">
						<strong>Name:</strong> John Doe
					</p>
					<p className="text-gray-700 mt-1">
						<strong>Email:</strong> john.doe@example.com
					</p>
				</div>

				{/* Questions Section */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* Question 1 */}
					<div className="bg-white shadow rounded-lg p-6">
						<h3 className="text-lg font-semibold text-gray-800">Question 1</h3>
						<p className="text-gray-700 mt-2">
							Plagiarism Found:{" "}
							<span className="font-bold text-red-600">25%</span>
						</p>
					</div>

					{/* Question 2 */}
					<div className="bg-white shadow rounded-lg p-6">
						<h3 className="text-lg font-semibold text-gray-800">Question 2</h3>
						<p className="text-gray-700 mt-2">
							Plagiarism Found:{" "}
							<span className="font-bold text-red-600">45%</span>
						</p>
					</div>

					{/* Question 3 */}
					<div className="bg-white shadow rounded-lg p-6">
						<h3 className="text-lg font-semibold text-gray-800">Question 3</h3>
						<p className="text-gray-700 mt-2">
							Plagiarism Found:{" "}
							<span className="font-bold text-red-600">10%</span>
						</p>
					</div>
				</div>

				{/* Go to Dashboard Button */}
				<div className="mt-6 flex justify-center">
					<a
						href="/dashboard"
						className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
					>
						Go to Dashboard
					</a>
				</div>
			</main>

			<footer className="bg-gray-50 p-4 text-center border-t border-gray-200">
				<p className="text-gray-600">Review System</p>
			</footer>
		</div>
	);
};

export default Review;
