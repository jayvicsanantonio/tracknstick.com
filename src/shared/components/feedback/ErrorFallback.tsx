// Shared fallback UI for both error surfaces
// Rendered by the class boundary and by the router's error element

interface ErrorFallbackProps {
  title?: string;
  description?: string;
}

export function ErrorFallback({
  title = 'Something went wrong',
  description = 'Please try refreshing the page.',
}: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h1 className="text-2xl font-bold text-(--color-destructive)">{title}</h1>
      <p className="mt-4 text-(--color-text-secondary)">{description}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 rounded-md bg-(--color-destructive) px-4 py-2 text-(--color-destructive-foreground) hover:opacity-90"
      >
        Refresh Page
      </button>
    </div>
  );
}

export default ErrorFallback;
