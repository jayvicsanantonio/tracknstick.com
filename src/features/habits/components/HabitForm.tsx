import { useContext, useState } from "react";
import { DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { daysOfWeek } from "@/constants";
import HabitsIcons from "@/icons/habits";
import { Habit } from "@/features/habits/types/Habit";
import { Frequency } from "@/features/habits/types/Frequency";
import { ThemeContext } from "@/context/ThemeContext";
import { useHabits } from "@/features/habits/hooks/useHabits";

export default function HabitForm({
  habit,
  toggleDialog,
}: {
  habit?: Habit | null;
  toggleDialog: () => void;
}) {
  const { isDarkMode } = useContext(ThemeContext);
  const { addHabit, updateHabit, deleteHabit } = useHabits();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState<string>(habit?.name ?? "");
  const [frequency, setFrequency] = useState<Frequency[]>(
    habit?.frequency ?? [],
  );
  const [icon, setIcon] = useState<keyof typeof HabitsIcons | undefined>(
    habit?.icon,
  );
  const isValid = name && icon && frequency.length > 0;

  return (
    <form
      onSubmit={
        (async (event) => {
          event.preventDefault();

          if (!isValid) return;

          setIsSubmitting(true);
          try {
            const habitData = { name, icon, frequency };
            if (habit?.id) {
              await updateHabit(habit.id, habitData);
            } else {
              await addHabit(habitData);
            }
          } catch (error) {
            console.error("Failed to save habit:", error);
          } finally {
            setIsSubmitting(false);
            toggleDialog();
          }
        }) as React.FormEventHandler<HTMLFormElement>
      }
      className="min-h-fit sm:h-[508px] grid gap-4 py-4"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="habit-name"
            className={`${isDarkMode ? "text-purple-300" : "text-purple-700"}`}
          >
            Name
          </Label>
          <Input
            id="habit-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            className={`w-full ${
              isDarkMode
                ? "bg-gray-700 border-gray-600 focus:border-purple-400 text-purple-300"
                : "bg-white border-purple-300 focus:border-purple-500"
            }`}
          />
        </div>
        <div className="space-y-2">
          <Label
            className={`${isDarkMode ? "text-purple-300" : "text-purple-700"}`}
          >
            Icon
          </Label>
          <RadioGroup
            className="grid grid-cols-5 sm:grid-cols-9 gap-2"
            value={icon}
            onValueChange={(value) => {
              setIcon(value as keyof typeof HabitsIcons);
            }}
          >
            {Object.entries(HabitsIcons).map(([name, Icon]) => (
              <Label
                key={name}
                className={`flex items-center justify-center rounded-md border-2 ${
                  isDarkMode
                    ? "border-gray-600 bg-gray-700 hover:text-purple-200 hover:border-purple-200 [&:has([data-state=checked])]:border-purple-400 [&:has([data-state=checked])]:text-purple-400"
                    : "border-purple-200 bg-white hover:bg-purple-100 hover:text-purple-800 [&:has([data-state=checked])]:border-purple-600 [&:has([data-state=checked])]:text-purple-600"
                } p-2 transition-all cursor-pointer`}
              >
                <RadioGroupItem value={name} id={name} className="sr-only" />
                <Icon className="h-6 w-6" />
              </Label>
            ))}
          </RadioGroup>
        </div>
        <div className="space-y-2">
          <Label
            className={`${isDarkMode ? "text-purple-300" : "text-purple-700"}`}
          >
            Frequency
          </Label>
          <ToggleGroup
            type="multiple"
            className="flex flex-wrap gap-2 justify-start"
            aria-label="Select days of the week"
            value={frequency}
            onValueChange={(value) => {
              setFrequency(value as Frequency[]);
            }}
          >
            {daysOfWeek.map((day) => (
              <ToggleGroupItem
                key={day}
                value={day}
                aria-label={day}
                title={day}
                className={`w-10 h-10 rounded-full data-[state=off]:hover:text-white ${
                  isDarkMode
                    ? "data-[state=on]:bg-purple-400 data-[state=on]:text-white data-[state=off]:bg-gray-700 data-[state=off]:text-gray-300 data-[state=off]:hover:bg-purple-300"
                    : "data-[state=on]:bg-purple-500 data-[state=on]:text-white data-[state=off]:bg-gray-100 data-[state=off]:text-gray-600 data-[state=off]:hover:bg-purple-400"
                }`}
              >
                {day[0]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>
      <Separator
        className={`my-2 ${isDarkMode ? "bg-gray-600" : "bg-purple-200"}`}
      />
      <div className="flex items-center flex-row gap-2">
        <div className="flex-1">
          {habit && (
            <Button
              type="button"
              variant="outline"
              className={`border-red-500 text-red-500 hover:bg-red-500 hover:text-white ${
                isDarkMode ? "hover:bg-red-600" : "hover:bg-red-400"
              }`}
              onClick={() => {
                void (async () => {
                  if (!habit?.id) return;
                  setIsSubmitting(true);
                  try {
                    await deleteHabit(habit.id, habit.name);
                  } catch (error) {
                    console.error("Failed to delete habit:", error);
                  } finally {
                    toggleDialog();
                  }
                })();
              }}
              disabled={isSubmitting}
            >
              Delete
            </Button>
          )}
        </div>
        <div className="flex flex-row gap-2">
          <DialogClose
            asChild
            className={
              isDarkMode
                ? "border-gray-600 hover:bg-gray-700 hover:text-white"
                : "border-purple-300 hover:bg-purple-100"
            }
          >
            <Button type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            className={`w-32 ${
              isDarkMode
                ? "bg-purple-700 hover:bg-purple-600"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}
