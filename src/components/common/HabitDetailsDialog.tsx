import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Habit } from "@/types/habit";
import { daysOfWeek } from "@/constants";
import HabitsIcons from "@/icons/habits";
import MiscellaneousIcons from "@/icons/miscellaneous";

const { Trophy } = MiscellaneousIcons;

export default function HabitDetailsDialog({
  habit,
  setHabit,
  isDarkMode,
  isEditingHabit,
  toggleIsEditingHabit,
}: {
  habit: Habit | null;
  setHabit: (habit: Habit) => void;
  isDarkMode: boolean;
  isEditingHabit: boolean;
  toggleIsEditingHabit: () => void;
}) {
  const { toast } = useToast();
  const HabitIcon = habit && HabitsIcons[habit.icon];

  const removeHabit = () => {
    if (habit) {
      toggleIsEditingHabit();
      toast({
        title: "Habit removed",
        description: "The habit has been successfully removed.",
      });
    }
  };

  return (
    <Dialog open={isEditingHabit} onOpenChange={toggleIsEditingHabit}>
      <DialogContent
        className={`sm:max-w-[525px] ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-purple-50 border-purple-200"
        }`}
      >
        <DialogHeader>
          <DialogTitle
            className={`text-2xl font-bold ${
              isDarkMode ? "text-purple-200" : "text-purple-800"
            }`}
          >
            {habit && HabitIcon && (
              <HabitIcon className="inline-block mr-2 h-8 w-8" />
            )}
            {habit?.name}
          </DialogTitle>
        </DialogHeader>
        {habit && (
          <Tabs defaultValue="edit" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger
                value="edit"
                className={`text-sm ${
                  isDarkMode
                    ? "data-[state=active]:bg-purple-700"
                    : "data-[state=active]:bg-purple-200"
                }`}
              >
                Edit
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className={`text-sm ${
                  isDarkMode
                    ? "data-[state=active]:bg-purple-700"
                    : "data-[state=active]:bg-purple-200"
                }`}
              >
                Stats
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-name"
                    className={`${
                      isDarkMode ? "text-purple-300" : "text-purple-700"
                    }`}
                  >
                    Name
                  </Label>
                  <Input
                    id="edit-name"
                    value={habit.name}
                    onChange={(e) =>
                      setHabit({ ...habit, name: e.target.value })
                    }
                    className={`w-full ${
                      isDarkMode
                        ? "bg-gray-700 border-gray-600 focus:border-purple-400"
                        : "bg-white border-purple-300 focus:border-purple-500"
                    }`}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    className={`${
                      isDarkMode ? "text-purple-300" : "text-purple-700"
                    }`}
                  >
                    Icon
                  </Label>
                  <RadioGroup
                    // value={habit.icon}
                    // onValueChange={(value: keyof typeof HabitsIcons) =>
                    //   setHabit({ ...habit, icon: value })
                    // }
                    className="grid grid-cols-5 sm:grid-cols-9 gap-2"
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
                <div className="space-y-2">
                  <Label
                    className={`${
                      isDarkMode ? "text-purple-300" : "text-purple-700"
                    }`}
                  >
                    Frequency
                  </Label>
                  <ToggleGroup
                    type="multiple"
                    className="flex flex-wrap gap-2 justify-start"
                  >
                    {daysOfWeek.map((day) => (
                      <ToggleGroupItem
                        key={day}
                        value={day}
                        aria-label={`Toggle ${day}`}
                        className={`w-10 h-10 rounded-full data-[state=off]:hover:bg-purple-400 data-[state=off]:hover:text-white ${
                          isDarkMode
                            ? "data-[state=on]:bg-purple-600 data-[state=on]:text-white data-[state=off]:bg-gray-700 data-[state=off]:text-gray-300"
                            : "data-[state=on]:bg-purple-500 data-[state=on]:text-white data-[state=off]:bg-gray-100 data-[state=off]:text-gray-600"
                        }`}
                      >
                        {day[0]}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="stats">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span
                    className={
                      isDarkMode ? "text-purple-300" : "text-purple-700"
                    }
                  >
                    Current Streak
                  </span>
                  <div className="flex items-center">
                    <Trophy
                      className={`w-6 h-6 mr-2 ${
                        isDarkMode ? "text-yellow-500" : "text-yellow-600"
                      }`}
                    />
                    <span
                      className={`text-3xl font-bold ${
                        isDarkMode ? "text-purple-200" : "text-purple-800"
                      }`}
                    >
                      {habit.stats.streak}
                    </span>
                    <span
                      className={`ml-1 text-sm ${
                        isDarkMode ? "text-purple-400" : "text-purple-600"
                      }`}
                    >
                      days
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span
                      className={
                        isDarkMode ? "text-purple-300" : "text-purple-700"
                      }
                    >
                      Total Completions
                    </span>
                    <span
                      className={`text-2xl font-semibold ${
                        isDarkMode ? "text-purple-200" : "text-purple-800"
                      }`}
                    >
                      {habit.stats.totalCompletions}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={
                      isDarkMode ? "text-purple-300" : "text-purple-700"
                    }
                  >
                    Last Completed
                  </span>
                  <span
                    className={`font-semibold ${
                      isDarkMode ? "text-purple-200" : "text-purple-800"
                    }`}
                  >
                    {habit.stats.lastCompleted
                      ? new Date(habit.stats.lastCompleted).toLocaleDateString()
                      : "Never"}
                  </span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
        <Separator
          className={`my-1 ${isDarkMode ? "bg-gray-600" : "bg-purple-200"}`}
        />
        <DialogFooter className="flex justify-between sm:justify-between items-center flex-row gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className={`${
                  isDarkMode
                    ? "border-red-700 text-red-500 hover:bg-red-900/10"
                    : "border-red-500 text-red-600 hover:bg-red-100"
                }`}
              >
                Remove Habit
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent
              className={
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white"
              }
            >
              <AlertDialogHeader>
                <AlertDialogTitle
                  className={isDarkMode ? "text-purple-200" : "text-purple-800"}
                >
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription
                  className={isDarkMode ? "text-gray-400" : "text-gray-600"}
                >
                  This action cannot be undone. This will permanently delete
                  your habit and remove all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  className={
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-100 hover:bg-gray-200"
                  }
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={removeHabit}
                  className={`${
                    isDarkMode
                      ? "bg-red-700 hover:bg-red-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  Delete Habit
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="flex flex-row gap-2">
            <Button
              onClick={toggleIsEditingHabit}
              variant="outline"
              className={
                isDarkMode
                  ? "border-gray-600 hover:bg-gray-700"
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
