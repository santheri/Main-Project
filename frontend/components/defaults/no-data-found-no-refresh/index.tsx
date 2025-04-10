import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NoDataFoundWithoutMutate() {
	const handleRefresh = () => {
		window.location.reload();
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
			<div className="text-destructive mb-4">
				<AlertCircle className="w-16 h-16" />
			</div>
			<h1 className="text-2xl font-bold mb-2">Oops! Something went wrong</h1>
			<p className="text-muted-foreground mb-4">
				Could not load data. Please try again.
			</p>
		</div>
	);
}
