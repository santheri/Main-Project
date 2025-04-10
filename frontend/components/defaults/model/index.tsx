import React from "react";

export default function PopupModel({
	showModel,
	setShowModel,
	confirmAction,
	cancelAction,
	title,
	message,
}: {
	showModel: boolean;
	setShowModel: any;
	confirmAction: any;
	cancelAction: any;
	title: string;
	message: string;
}) {
	return (
		<div
			className={`overflow-y-auto  overflow-x-hidden flex justify-center top-0 left-0 items-center fixed ${
				showModel
					? "z-[5000] opacity-1 translate-y-0"
					: "opacity-0 z-[-10] translate-y-1"
			} transform transition-all ease-in-out duration-300    w-full h-screen`}
		>
			<div
				onClick={() => {
					setShowModel(false);
				}}
				className="bg-black absolute z-[10] top-0 left-0 w-full h-screen opacity-[0.8]"
			></div>
			<div className="relative p-4 w-full z-[11] max-w-lg">
				<div className="relative p-4 bg-white rounded-lg shadow  md:p-8">
					<div className="mb-4 text-sm font-light  ">
						<h3 className="mb-3 text-2xl font-bold text-gray-900 ">{title}</h3>
						<p className="text-lg text-black">{message}</p>
					</div>
					<div className="justify-between items-center pt-0 space-y-4 sm:flex sm:space-y-0">
						<div className="items-center space-y-4 sm:space-x-4 sm:flex sm:space-y-0">
							<button
								id="close-modal"
								type="button"
								onClick={() => {
									setShowModel(false);
									cancelAction();
								}}
								className="py-2 px-4 w-full text-sm font-medium text-black bg-white rounded-lg border border-gray-200 sm:w-auto hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 hover:text-gray-900 focus:z-10 "
							>
								Cancel
							</button>
							<button
								id="confirm-button"
								type="button"
								onClick={() => {
									setShowModel(false);
									confirmAction();
								}}
								className="py-2 px-4 w-full text-sm font-medium text-center text-black rounded-lg bg-primary-700 sm:w-auto hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300"
							>
								Confirm
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
