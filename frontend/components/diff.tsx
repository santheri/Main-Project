import React from "react";

interface DifficultyBadgeProps {
	difficulty: string | undefined;
}

const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty }) => {
	const getColor = (level: string) => {
		switch (level) {
			case "easy":
				return "bg-green-500 text-white";
			case "medium":
				return "bg-yellow-500 text-black";
			case "hard":
				return "bg-red-500 text-white";
			default:
				return "bg-gray-500 text-white";
		}
	};

	return (
		<span
			className={`px-3 py-1 rounded-full ${getColor(
				difficulty ? difficulty : "easy"
			)}`}
		>
			{difficulty?.toUpperCase()}
		</span>
	);
};

export default DifficultyBadge;
