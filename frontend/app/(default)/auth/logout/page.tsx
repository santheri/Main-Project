"use client";
import Spinner from "@/components/defaults/loaders";
import { signOut } from "next-auth/react";
import { useEffect } from "react";
export default function SignoutPage() {
	useEffect(() => {
		const signout = async () => {
			await signOut({ callbackUrl: "/" });
		};
		signout();
	});
	return (
		<>
			<div className="w-full h-[100vh] grid place-content-center relative z-[400]">
				<div className="flex flex-row justify-center pl-10 items-center text-black text-3xl">
					<h1>Signing out... Please wait</h1>
					<Spinner />
				</div>
			</div>
		</>
	);
}
