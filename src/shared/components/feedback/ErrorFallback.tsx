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
      <h1 className="text-(--color-destructive) text-2xl font-bold">{title}</h1>
      <p className="text-(--color-text-secondary) mt-4">{description}</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-(--color-destructive) text-(--color-destructive-foreground) mt-4 rounded-md px-4 py-2 hover:opacity-90"
      >
        Refresh Page
      </button>
    </div>
  );
}

export default ErrorFallback;
