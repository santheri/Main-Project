"use server";

import { backendUrl, register } from "@/constants/urls";
import { newUser, newUserSchema } from "@/types/types";

interface registerProps {
	username: string;
	password: string;
	confirmPassword: string;
	email: string;
	phone: number;
	name: string;
}

interface RegisterActionResultProps {
	status: string;
	message: string | null;
}

export const registerUser = async (props: registerProps) => {
	const result = newUserSchema.safeParse(props);

	if (!result.success) {
		let errorMessage = "";
		// result.error.issues.forEach((issue) => {
		// 	errorMessage =
		// 		errorMessage + issue.path[0] + " : " + issue.message + ".\n";
		// });
		errorMessage =
			errorMessage +
			result.error.issues[0].path[0] +
			" : " +
			result.error.issues[0].message +
			".\n";
		return {
			status: "error",
			message: errorMessage,
		} as RegisterActionResultProps;
	}
	try {
		const res = await fetch(`${backendUrl}${register}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email: props.email,
				password: props.password,
				username: props.username,
				name: props.name,
				phone: props.phone,
			}),
		});
		const signUpResponse: {
			details: string;
		} = await res.json();
		if (signUpResponse?.details.toLowerCase() === "success") {
			return {
				status: "success",
				message:
					"Account has been created , you will be redirected please wait...",
			} as RegisterActionResultProps;
		}
		if (signUpResponse?.details === "User already exists") {
			return {
				status: "error",
				message: "User with the given crentials already exists",
			} as RegisterActionResultProps;
		} else if (
			signUpResponse?.details?.includes("network") ||
			signUpResponse?.details?.includes("fetch_message") ||
			signUpResponse?.details?.includes("Server.requestListener") ||
			signUpResponse?.details?.includes("could not")
		) {
			return {
				status: "error",
				message: "Network Error",
			} as RegisterActionResultProps;
		} else {
			return {
				status: "error",
				message: signUpResponse.details,
			} as RegisterActionResultProps;
		}
	} catch (e) {
		return {
			status: "error",
			message: e,
		} as RegisterActionResultProps;
	}
};
