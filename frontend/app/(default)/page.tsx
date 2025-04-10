import React from "react";
import Link from "next/link";

const Home: React.FC = () => {
	return (
		<div className=" min-h-screen">
			{/* Main Content Section */}
			<main className="flex flex-col justify-center items-center h-screen -mt-16">
				<div className="text-center">
					<h2 className="text-4xl font-semibold text-blue-600 mb-4">
						ONLINE EXAMINATION SYSTEM
					</h2>
					<p className="text-xl text-blue-500 mb-8">
						ATTEND YOUR EXAMINATIONS ONLINE!
					</p>
					<p className="text-gray-600 mb-4">
						SIGN UP NOW TO START YOUR FIRST ONLINE EXAMINATION
					</p>
					<p className="text-gray-600 mb-6 flex justify-center items-center">
						<span className="mr-2">📩</span> Start Your Journey Here:
					</p>
					<Link href="/auth/register">
						<button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
							Sign Up as Student
						</button>
					</Link>
				</div>
			</main>
		</div>
	);
};

export default Home;
