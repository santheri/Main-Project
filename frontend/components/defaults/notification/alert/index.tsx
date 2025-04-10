import { Dispatch, SetStateAction } from "react";

interface alertProps {
	type: string;
	heading: String;
	description: String;
	alertHandler: Dispatch<SetStateAction<boolean>>;
}

export default function AlertWithType(props: alertProps) {
	return (
		<div className="w-full">
			{props.type === "error" ? (
				<ErrorAlert
					type={props.type}
					heading={props.heading}
					description={props.description}
					alertHandler={props.alertHandler}
				/>
			) : (
				<SuccessAlert
					type={props.type}
					heading={props.heading}
					description={props.description}
					alertHandler={props.alertHandler}
				/>
			)}
		</div>
	);
}

export function SuccessAlert(props: alertProps) {
	return (
		<div className="mt-12 mx-4 px-4 rounded-md border-l-4 border-green-500 bg-green-50 md:max-w-2xl md:mx-auto md:px-8">
			<div className="flex justify-between py-3">
				<div className="flex">
					<div>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6 rounded-full text-green-500"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
					<div className="self-center ml-3">
						<span className="text-green-600 font-semibold">
							{props.heading}
						</span>
						<p className="text-green-600 mt-1">{props.description}</p>
					</div>
				</div>
				<button
					onClick={() => {
						props.alertHandler(false);
					}}
					className="self-start text-green-500"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fillRule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clipRule="evenodd"
						/>
					</svg>
				</button>
			</div>
		</div>
	);
}

export function ErrorAlert(props: alertProps) {
	return (
		<div className="mt-12 mx-4 px-4 rounded-md border-l-4 border-red-500 bg-red-50 md:max-w-2xl md:mx-auto md:px-8">
			<div className="flex justify-between py-3">
				<div className="flex">
					<div>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-6 w-6 text-red-500"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<path
								fillRule="evenodd"
								d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
								clipRule="evenodd"
							/>
						</svg>
					</div>
					<div className="self-center ml-3">
						<span className="text-red-600 font-semibold">{props.heading}</span>
						<p className="text-red-600 mt-1">{props.description}</p>
					</div>
				</div>
				<button
					onClick={() => {
						props.alertHandler(false);
					}}
					className="self-start text-red-500"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-5 w-5"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fillRule="evenodd"
							d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
							clipRule="evenodd"
						/>
					</svg>
				</button>
			</div>
		</div>
	);
}

export function MailSentAlert({
	heading,
	text,
}: {
	heading: string;
	text: string;
}) {
	return (
		<div
			role="alert"
			className="rounded-xl border border-gray-100 bg-white p-4"
		>
			<div className="flex items-start gap-4">
				<span className="text-green-600">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth="1.5"
						stroke="currentColor"
						className="h-6 w-6"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
				</span>

				<div className="flex-1">
					<strong className="block font-medium text-gray-900">{heading}</strong>

					<p className="mt-1 text-sm text-gray-700">{text}</p>
				</div>
			</div>
		</div>
	);
}
