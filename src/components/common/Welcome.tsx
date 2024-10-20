import { useState } from "react";
import {
  Plus,
  Book,
  Dumbbell,
  Brain,
  Coffee,
  Bike,
  Utensils,
  Code,
  Palette,
  Music,
  Zap,
  Heart,
  Sun,
  Moon,
  Droplet,
  Pencil,
  Leaf,
  Camera,
  Smile,
  Laptop,
  Briefcase,
  Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const icons = {
  Book,
  Dumbbell,
  Brain,
  Coffee,
  Bike,
  Utensils,
  Code,
  Palette,
  Music,
  Zap,
  Heart,
  Sun,
  Moon,
  Droplet,
  Pencil,
  Leaf,
  Camera,
  Smile,
  Laptop,
  Briefcase,
  Headphones,
};

export default function Welcome({ isDarkMode }: { isDarkMode: boolean }) {
  const [isAddingHabit, setIsAddingHabit] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-2xl mx-auto"
      >
        <h2
          className={`text-4xl font-bold ${
            isDarkMode ? "text-purple-200" : "text-purple-800"
          } mb-6`}
        >
          Welcome to HabitHub
        </h2>
        <p
          className={`text-xl ${
            isDarkMode ? "text-purple-300" : "text-purple-600"
          } mb-12 leading-relaxed`}
        >
          Embark on your journey to better habits and personal growth. Start by
          adding your first habit and watch your progress unfold.
        </p>
        <Dialog open={isAddingHabit} onOpenChange={setIsAddingHabit}>
          <DialogTrigger asChild>
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
          </DialogTrigger>
          <DialogContent
            className={`sm:max-w-[425px] ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-purple-50 border-purple-200"
            }`}
          >
            <DialogHeader>
              <DialogTitle
                className={isDarkMode ? "text-purple-200" : "text-purple-800"}
              >
                Add New Habit
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
                <RadioGroup className="col-span-3 grid grid-cols-5 gap-2">
                  {Object.entries(icons).map(([name, Icon]) => (
                    <Label
                      key={name}
                      className={`flex items-center justify-center rounded-md border-2 ${
                        isDarkMode
                          ? "border-gray-600 bg-gray-700 hover:bg-gray-600 hover:text-purple-200    [&:has([data-state=checked])]:border-purple-400"
                          : "border-purple-200 bg-white hover:bg-purple-100 hover:text-purple-800 [&:has([data-state=checked])]:border-purple-500"
                      } p-2`}
                    >
                      <RadioGroupItem
                        value={name}
                        id={name}
                        className="sr-only"
                      />
                      <Icon className="h-6 w-6" />
                    </Label>
                  ))}
                </RadioGroup>
              </div>
              <div className="grid grid-cols-4 items-center  gap-4">
                <Label
                  htmlFor="frequency"
                  className={`text-right ${
                    isDarkMode ? "text-purple-300" : "text-purple-700"
                  }`}
                >
                  Frequency
                </Label>
                <Select>
                  <SelectTrigger
                    className={`col-span-3 ${
                      isDarkMode
                        ? "border-gray-600 focus:border-purple-400"
                        : "border-purple-300 focus:border-purple-500"
                    }`}
                  >
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="3x a week">3x a week</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
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
      </motion.div>
    </div>
  );
}
