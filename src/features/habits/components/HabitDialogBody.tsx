import { type ReactNode, memo } from 'react';

interface HabitDialogBodyProps {
  children: ReactNode;
}

const HabitDialogBody = memo(function HabitDialogBody({
  children,
}: HabitDialogBodyProps) {
  return (
    <div className="grid h-[608px] gap-4 py-4 sm:h-[508px]">{children}</div>
  );
});

export default HabitDialogBody;
