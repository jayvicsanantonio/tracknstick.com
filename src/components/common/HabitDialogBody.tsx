export default function HabitDialogBody({
  isDarkMode,
  children,
}: {
  isDarkMode: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="h-[608px] sm:h-[508px] grid gap-4 py-4">{children}</div>
  );
}
