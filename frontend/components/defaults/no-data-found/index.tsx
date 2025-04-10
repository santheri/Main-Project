export function NoDataFound({ mutate }: { mutate: () => void }) {
	return (
		<div className="flex min-h-[50vh] flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-md text-center">
				<div className="mx-auto h-12 w-12 text-primary" />
				<h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
					Oops, something went wrong!
				</h1>
				<p className="mt-4 text-muted-foreground">
					We&apos;re sorry, but there was an error loading the data. Please try
					again later or contact support if the issue persists.
				</p>
				<div className="mt-6">
					<button
						onClick={() => mutate()}
						className="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
					>
						Retry
					</button>
				</div>
			</div>
		</div>
	);
}
