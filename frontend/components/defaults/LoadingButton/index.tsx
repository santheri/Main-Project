import React from "react";
import { TailSpin } from "react-loader-spinner";

export default function LoadingButton({
	text,
	className,
}: {
	text: string;
	className?: string;
}) {
	return (
		<div className={`relative  ${className}`}>
			<div className="bg-black opacity-40 absolute w-full h-full top-0 left-0 z-[100] rounded-lg"></div>
			<div className="flex flex-row text-white gap-5 justify-center items-center w-full h-full z-[101] opacity-50">
				<p>{text}</p>
				<TailSpin
					visible={true}
					height="20"
					width="20"
					color="#ffffff"
					ariaLabel="tail-spin-loading"
					wrapperStyle={{}}
					wrapperClass=""
				/>
			</div>
		</div>
	);
}
