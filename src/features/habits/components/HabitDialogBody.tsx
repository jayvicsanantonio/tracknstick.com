import { type ReactNode } from "react";

export default function HabitDialogBody({ children }: { children: ReactNode }) {
  return (
    <div className="h-[608px] sm:h-[508px] grid gap-4 py-4">{children}</div>
  );
}
