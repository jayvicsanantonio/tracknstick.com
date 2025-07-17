import { type ReactNode } from 'react';

export default function HabitDialogBody({ children }: { children: ReactNode }) {
  return (
    <div className="grid h-[608px] gap-4 py-4 sm:h-[508px]">{children}</div>
  );
}
