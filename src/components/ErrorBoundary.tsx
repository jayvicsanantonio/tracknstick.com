export default function ErrorBoundary() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
        Something went wrong
      </h1>
      <p className="mt-4 text-gray-600 dark:text-gray-400">
        Please try refreshing the page.
      </p>
    </div>
  );
}
