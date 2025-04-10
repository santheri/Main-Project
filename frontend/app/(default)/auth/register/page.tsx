"use client";
import { Dispatch, FormEvent, SetStateAction, useState } from "react";
import { registerUser } from "@/actions/register";
// import logo1 from "@/public/Icons/logo.png";
// import logo2 from "@/public/HomePage/logo2.png";
import Link from "next/link";
import Image from "next/image";
import { loginUser } from "@/actions/login";
import AlertWithType from "@/components/defaults/notification/alert";
import LoadingButton from "@/components/defaults/LoadingButton";
import { getSession } from "next-auth/react";

export default function Register() {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [name, setName] = useState("");
	const [phone, setPhone] = useState(12345678);
	const [confirmPassword, setConfirmPassword] = useState("");
	const [email, setEmail] = useState("");
	const [buttonClicked, setButtonClicked] = useState(false);

	const onSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setButtonClicked(true);
		if (password !== confirmPassword) {
			setShowAlert(true);
			setAlertProps({
				type: "error",
				heading: "Error",
				description: "Passwords do not match",
				alertHandler: setShowAlert,
			});
			setButtonClicked(false);
			return;
		}
		const res = await registerUser({
			username,
			password,
			confirmPassword,
			email,
			name,
			phone,
		});
		if (res.status === "error") {
			setShowAlert(true);
			setAlertProps({
				type: "error",
				heading: "Error occurred",
				description: res.message ? res.message : "Something happened",
				alertHandler: setShowAlert,
			});
		} else {
			const response = await loginUser({ username, password });
			if (response.status === "error") {
				setShowAlert(true);
				setAlertProps({
					type: "error",
					heading: "Error occurred",
					description: response.message,
					alertHandler: setShowAlert,
				});
			} else {
				setShowAlert(true);
				setAlertProps({
					type: "success",
					heading: "Success",
					description: response.message,
					alertHandler: setShowAlert,
				});
				// setTimeout(() => {
				// 	window.location.href = "/apartment";
				// }, 1500);
				const updatedSession = await getSession();
				if (updatedSession) {
					if (updatedSession.user.is_admin) {
						window.location.href = "/admin-dashboard";
					} else {
						window.location.href = "/dashboard";
					}
				}
			}
		}
		setButtonClicked(false);
	};
	const [showAlert, setShowAlert] = useState<boolean>(false);
	const [alertProps, setAlertProps] = useState<{
		type: "success" | "error";
		heading: string;
		description: string;
		alertHandler: Dispatch<SetStateAction<boolean>>;
	}>({
		type: "error",
		heading: "",
		description: "String",
		alertHandler: setShowAlert,
	});
	return (
		<section className="">
			<div className="flex flex-col items-center justify-center px-6 py-8 mx-auto  lg:py-0">
				<Link href="/">
					<div className="w-full object-fit justify-center items-center  h-20 flex flex-row">
						{/* <Image
							className="w-44 h-full object-contain"
							src={logo1}
							alt="logo1"
						/> 
                        put your logo here
                        */}
					</div>
				</Link>
				<div className="w-full bg-white rounded-xl border shadow md:mt-0 sm:max-w-md xl:p-0">
					<div className="p-6 space-y-4 md:space-y-6 sm:p-8">
						<h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
							Create an account
						</h1>
						<form
							className="space-y-4 md:space-y-6"
							onSubmit={onSubmit}
						>
							{showAlert && (
								<AlertWithType
									type={alertProps.type}
									heading={alertProps.heading}
									description={alertProps.description}
									alertHandler={alertProps.alertHandler}
								/>
							)}
							<div>
								<label
									htmlFor="email"
									className="block mb-2 text-sm font-medium text-gray-900"
								>
									Email
								</label>
								<input
									type="email"
									name="email"
									id="email"
									className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
									placeholder="name@edu.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>
							<div>
								<label
									htmlFor="name"
									className="block mb-2 text-sm font-medium text-gray-900"
								>
									Name
								</label>
								<input
									type="text"
									name="name"
									id="name"
									className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
									placeholder="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
							</div>
							<div>
								<label
									htmlFor="phone"
									className="block mb-2 text-sm font-medium text-gray-900"
								>
									Phone
								</label>
								<input
									type="number"
									name="phone"
									id="phone"
									className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
									placeholder="Phone number"
									value={phone}
									onChange={(e) => setPhone(parseInt(e.target.value))}
								/>
							</div>
							<div>
								<label
									htmlFor="username"
									className="block mb-2 text-sm font-medium text-gray-900"
								>
									Username
								</label>
								<input
									type="username"
									name="username"
									id="username"
									className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
									placeholder="Enter your username.."
									value={username}
									onChange={(e) => setUsername(e.target.value)}
								/>
							</div>
							<div>
								<label
									htmlFor="password"
									className="block mb-2 text-sm font-medium text-gray-900"
								>
									Password
								</label>
								<input
									type="password"
									name="password"
									id="password"
									placeholder="••••••••"
									className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
								/>
							</div>
							<div>
								<label
									htmlFor="confirm-password"
									className="block mb-2 text-sm font-medium text-gray-900"
								>
									Confirm password
								</label>
								<input
									type="password"
									name="confirm-password"
									id="confirm-password"
									placeholder="••••••••"
									className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
								/>
							</div>
							<div className="flex items-start">
								<div className="flex items-center h-5">
									<input
										id="terms"
										aria-describedby="terms"
										type="checkbox"
										className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300"
										required
									/>
								</div>
								<div className="ml-3 text-sm">
									<label
										htmlFor="terms"
										className="font-light text-gray-500"
									>
										I accept the
										<Link
											href="/terms-and-conditions"
											className="font-medium text-primary-600 pl-2 hover:underline"
										>
											Terms and Conditions
										</Link>
									</label>
								</div>
							</div>
							{buttonClicked ? (
								<LoadingButton
									text={"Creating..."}
									className="w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150"
								/>
							) : (
								<button
									disabled={buttonClicked}
									type="submit"
									className="w-full px-4 py-2 text-white font-medium bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-600 rounded-lg duration-150"
								>
									Create an account
								</button>
							)}
							<div className="text-sm font-light text-gray-500">
								Already have an account?{" "}
								<a
									href="/auth/login"
									className="font-medium text-primary-600 hover:underline"
								>
									Login here
								</a>
							</div>
						</form>
					</div>
				</div>
			</div>
		</section>
	);
}
