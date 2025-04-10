import React, { useState, useEffect } from "react";
import { Maximize2 } from "lucide-react";

function FullscreenModel() {
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [userConfirmed, setUserConfirmed] = useState(false);
	useEffect(() => {
		setIsFullscreen(!!document.fullscreenElement);
		const handleFullscreenChange = () => {
			if (!document.fullscreenElement) {
				enterFullscreen();
			}
			setIsFullscreen(!!document.fullscreenElement);
		};

		const handleKeyDown = (event: any) => {
			if (event.key === "Escape" && document.fullscreenElement) {
				const confirmExit = window.confirm(
					"Are you sure you want to exit fullscreen?"
				);
				if (!confirmExit) {
					event.preventDefault();
					enterFullscreen();
				} else {
					setUserConfirmed(true);
				}
			}
		};

		document.addEventListener("fullscreenchange", handleFullscreenChange);
		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

	const enterFullscreen = async () => {
		try {
			await document.documentElement.requestFullscreen();
		} catch (err) {
			console.error("Error attempting to enable fullscreen:", err);
		}
	};
	if (isFullscreen || userConfirmed) {
		return <></>;
	}
	return (
		<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
			<div
				onClick={enterFullscreen}
				className="bg-white rounded-lg p-8 text-center cursor-pointer transform transition-transform hover:scale-105 shadow-xl max-w-md mx-4"
			>
				<Maximize2 className="w-12 h-12 mx-auto mb-4 text-blue-600" />
				<h2 className="text-2xl font-semibold mb-3">Go Fullscreen</h2>
				<p className="text-gray-600">
					Click anywhere in this box to enter fullscreen mode
				</p>
			</div>
		</div>
	);
}

export default FullscreenModel;
