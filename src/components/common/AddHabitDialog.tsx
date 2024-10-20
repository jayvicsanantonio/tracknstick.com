import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MiscellaneousIcons from "@/icons/miscellaneous";
import HabitsIcons from "@/icons/habits";

const { Plus } = MiscellaneousIcons;
const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function AddHabitDialog({
  isDarkMode,
  isNewUser,
}: {
  isDarkMode: boolean;
  isNewUser: boolean;
}) {
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  return (
    <Dialog open={isAddingHabit} onOpenChange={setIsAddingHabit}>
      <DialogTrigger asChild>
        {isNewUser ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`${
              isDarkMode
                ? "bg-purple-700 hover:bg-purple-600"
                : "bg-purple-600 hover:bg-purple-700"
            } text-white px-8 py-4 rounded-full text-lg font-semibold transition-colors duration-300 shadow-lg`}
          >
            <Plus className="h-5 w-5 mr-2 inline-block" />
            Add Your First Habit
          </motion.button>
        ) : (
          <Button
            className={`rounded-full w-10 h-10 p-0 ${
              isDarkMode
                ? "bg-purple-700 hover:bg-purple-600"
                : "bg-purple-600 hover:bg-purple-700"
            }`}
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent
        className={`sm:max-w-[525px] ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-purple-50 border-purple-200"
        }`}
      >
        <DialogHeader>
          <DialogTitle
            className={isDarkMode ? "text-purple-200" : "text-purple-800"}
          >
            <DialogDescription>Add New Habit</DialogDescription>
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="name"
              className={`text-right ${
                isDarkMode ? "text-purple-300" : "text-purple-700"
              }`}
            >
              Name
            </Label>
            <Input
              id="name"
              className={`col-span-3 ${
                isDarkMode
                  ? "border-gray-600 focus:border-purple-400"
                  : "border-purple-300 focus:border-purple-500"
              }`}
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label
              className={`text-right pt-2 ${
                isDarkMode ? "text-purple-300" : "text-purple-700"
              }`}
            >
              Icon
            </Label>
            <RadioGroup className="col-span-3 grid grid-cols-7 gap-2">
              {Object.entries(HabitsIcons).map(([name, Icon]) => (
                <Label
                  key={name}
                  className={`flex items-center justify-center rounded-md border-2 ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 hover:bg-gray-600 hover:text-purple-200    [&:has([data-state=checked])]:border-purple-400"
                      : "border-purple-200 bg-white hover:bg-purple-100 hover:text-purple-800 [&:has([data-state=checked])]:border-purple-500"
                  } p-2 cursor-pointer`}
                >
                  <RadioGroupItem value={name} id={name} className="sr-only" />
                  <Icon className="h-6 w-6" />
                </Label>
              ))}
            </RadioGroup>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              className={`text-right ${
                isDarkMode ? "text-purple-300" : "text-purple-700"
              }`}
            >
              Frequency
            </Label>
            <ToggleGroup
              type="multiple"
              className="col-span-3 flex justify-between"
            >
              {daysOfWeek.map((day) => (
                <ToggleGroupItem
                  key={day}
                  value={day}
                  aria-label={`Toggle ${day}`}
                  className={`w-10 h-10 rounded-full ${
                    isDarkMode
                      ? "data-[state=on]:bg-purple-600 data-[state=on]:text-white"
                      : "data-[state=on]:bg-purple-600 data-[state=on]:text-white"
                  }`}
                >
                  {day}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>
        <Button
          className={`w-full ${
            isDarkMode
              ? "bg-purple-700  hover:bg-purple-600"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          Add Habit
        </Button>
      </DialogContent>
    </Dialog>
  );
}
