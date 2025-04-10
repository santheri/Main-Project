import React from "react";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";

export default function Pagination({
	lastPage,
	currentPage,
	setCurrentPage,
	setLastPage,
}: {
	lastPage: number;
	currentPage: number;
	setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
	setLastPage: React.Dispatch<React.SetStateAction<number>>;
}) {
	let start = currentPage;
	let end = currentPage + 1;
	if (end > lastPage || start + 1 >= lastPage) {
		end = lastPage;
	}
	return (
		<div className="flex flex-row gap-5 p-5">
			{currentPage != 1 && (
				<button
					onClick={() => {
						setCurrentPage(1);
					}}
				>
					<div className="flex items-center space-x-[-10px]">
						<MdKeyboardArrowLeft />
						<MdKeyboardArrowLeft />
					</div>
				</button>
			)}

			<button
				onClick={() => {
					if (currentPage > 1) {
						setCurrentPage(currentPage - 1);
					}
				}}
			>
				<MdKeyboardArrowLeft />
			</button>
			{Array.from({ length: end - start + 1 }).map((_, index) => (
				<button
					onClick={() => {
						setCurrentPage(start + index);
					}}
					key={index}
				>
					{start + index}
				</button>
			))}

			<>
				{currentPage + 2 < lastPage && (
					<button
						onClick={() => {
							if (currentPage + 2 < lastPage) {
								setCurrentPage(currentPage + 2);
							}
						}}
					>
						...
					</button>
				)}
				{currentPage + 1 < lastPage && (
					<button
						onClick={() => {
							setCurrentPage(lastPage);
						}}
					>
						{lastPage}
					</button>
				)}{" "}
			</>
			<button
				onClick={() => {
					if (currentPage < lastPage) {
						setCurrentPage(currentPage + 1);
					}
				}}
			>
				<MdKeyboardArrowRight />
			</button>
			{currentPage != lastPage && (
				<button
					onClick={() => {
						setCurrentPage(lastPage);
					}}
				>
					<div className="flex items-center space-x-[-10px]">
						<MdKeyboardArrowRight />
						<MdKeyboardArrowRight />
					</div>
				</button>
			)}
		</div>
	);
}
