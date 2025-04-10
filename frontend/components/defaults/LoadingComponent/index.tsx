import Spinner from "../loaders";

export default function LoadingComponent() {
	return (
		<div
			className="w-full h-full
    flex justify-center items-center"
		>
			<Spinner /> Loading...
		</div>
	);
}
