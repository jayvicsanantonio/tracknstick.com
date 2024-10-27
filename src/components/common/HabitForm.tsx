import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { daysOfWeek } from "@/constants";
import HabitsIcons from "@/icons/habits";
import { Habit } from "@/types/habit";

export default function HabitForm({
  isDarkMode,
  habit,
  setHabit,
  toggleShowHabitDialog,
}: {
  isDarkMode: boolean;
  habit?: Habit | null;
  setHabit?: (habit: Habit) => void;
  toggleShowHabitDialog: () => void;
}) {
  return (
    <div className="h-[608px] sm:h-[508px] grid gap-4 py-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="edit-name"
            className={`${isDarkMode ? "text-purple-300" : "text-purple-700"}`}
          >
            Name
          </Label>
          <Input
            id="edit-name"
            value={habit?.name}
            onChange={(e) => {
              if (setHabit) {
                setHabit({ ...habit, name: e.target.value });
              }
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
          <RadioGroup className="grid grid-cols-5 sm:grid-cols-9 gap-2">
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
      <div className="flex justify-end sm:justify-end items-center flex-row gap-2">
        <div className="flex flex-row gap-2">
          <Button
            variant="outline"
            onClick={toggleShowHabitDialog}
            className={
              isDarkMode
                ? "border-gray-600 hover:bg-gray-700 hover:text-white"
                : "border-purple-300 hover:bg-purple-100"
            }
          >
            Cancel
          </Button>
          <Button
            className={`${
              isDarkMode
                ? "bg-purple-700 hover:bg-purple-600"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
