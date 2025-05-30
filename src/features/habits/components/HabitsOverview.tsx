import { useState, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHabits } from "@/features/habits/hooks/useHabits";
import { useHabitsContext } from "@/features/habits/context/HabitsStateContext";
import { ThemeContext } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Habit } from "@/features/habits/types/Habit";
import HabitsIcons from "@/icons/habits";

export default function HabitsOverview() {
  const { habits, isLoading, error, deleteHabit } = useHabits();
  const { isDarkMode } = useContext(ThemeContext);
  const { toggleisHabitsOverviewMode, openEditDialog } = useHabitsContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  // Filter habits based on search term and selected tab
  const filteredHabits = habits.filter((habit) => {
    const matchesSearch = habit.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (selectedTab === "all") return matchesSearch;
    if (selectedTab === "active") return matchesSearch && !habit.endDate;
    if (selectedTab === "completed") return matchesSearch && !!habit.endDate;
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          className={`rounded-full h-12 w-12 border-4 ${isDarkMode ? "border-purple-400" : "border-purple-600"} border-t-transparent`}
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`p-8 text-center rounded-lg border ${isDarkMode ? "bg-red-900/30 border-red-700 text-red-100" : "bg-red-50 border-red-200 text-red-600"}`}
      >
        Error loading habits. Please try again.
      </div>
    );
  }

  const handleDeleteHabit = (habit: Habit) => {
    setHabitToDelete(habit);
  };

  const confirmDelete = () => {
    if (habitToDelete?.id) {
      void deleteHabit(habitToDelete.id, habitToDelete.name);
      setHabitToDelete(null);
    }
  };

  return (
    <motion.div
      className="flex-1 flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        className={`w-full flex-1 flex flex-col overflow-hidden shadow-xl ${
          isDarkMode
            ? "border-purple-950 bg-[#121228] shadow-purple-900/20"
            : "border-purple-100 bg-white shadow-purple-200/50"
        }`}
      >
        <CardHeader className="px-3 sm:px-6 pt-4 sm:pt-6">
          <div>
            <CardTitle
              className={`text-xl sm:text-2xl font-bold mb-2 flex items-center gap-2 ${
                isDarkMode ? "text-white" : ""
              }`}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleisHabitsOverviewMode}
                className={`mr-2 ${isDarkMode ? "text-white hover:bg-purple-950/70 hover:text-purple-100" : ""}`}
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 12H5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 19L5 12L12 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
              Habits Overview
            </CardTitle>
            <p
              className={`text-sm ${isDarkMode ? "text-purple-100" : "text-gray-600"}`}
            >
              Manage all your habits in one place
            </p>
          </div>
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-6 sm:pb-8 flex-1 overflow-auto">
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
            <Input
              className={`w-full sm:max-w-[300px] ${isDarkMode ? "bg-gray-800 border-gray-700 text-white placeholder:text-gray-400" : ""}`}
              placeholder="Search habits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Tabs
              value={selectedTab}
              onValueChange={setSelectedTab}
              className="w-full sm:max-w-[300px]"
            >
              <TabsList
                className={`grid w-full grid-cols-3 ${isDarkMode ? "bg-gray-800" : ""}`}
              >
                <TabsTrigger
                  className={
                    isDarkMode
                      ? "data-[state=active]:bg-purple-700 data-[state=active]:text-white text-gray-200"
                      : ""
                  }
                  value="all"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  className={
                    isDarkMode
                      ? "data-[state=active]:bg-purple-700 data-[state=active]:text-white text-gray-200"
                      : ""
                  }
                  value="active"
                >
                  Active
                </TabsTrigger>
                <TabsTrigger
                  className={
                    isDarkMode
                      ? "data-[state=active]:bg-purple-700 data-[state=active]:text-white text-gray-200"
                      : ""
                  }
                  value="completed"
                >
                  Archived
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <AnimatePresence>
            {filteredHabits.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 sm:py-12"
              >
                <p
                  className={`${isDarkMode ? "text-white" : "text-gray-600"} mb-2`}
                >
                  {searchTerm
                    ? "No habits match your search"
                    : "No habits found"}
                </p>
              </motion.div>
            ) : (
              <div
                className={`rounded-lg border ${isDarkMode ? "border-purple-900" : "border-gray-200"} overflow-hidden`}
              >
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead
                      className={`text-left ${isDarkMode ? "bg-purple-950" : "bg-gray-50"}`}
                    >
                      <tr>
                        <th
                          className={`px-3 sm:px-4 py-3 font-medium text-xs sm:text-sm ${isDarkMode ? "text-purple-100" : ""}`}
                        >
                          Habit
                        </th>
                        <th
                          className={`px-3 sm:px-4 py-3 font-medium text-xs sm:text-sm hidden sm:table-cell ${isDarkMode ? "text-purple-100" : ""}`}
                        >
                          Frequency
                        </th>
                        <th
                          className={`px-3 sm:px-4 py-3 font-medium text-xs sm:text-sm hidden md:table-cell ${isDarkMode ? "text-purple-100" : ""}`}
                        >
                          Start Date
                        </th>
                        <th
                          className={`px-3 sm:px-4 py-3 font-medium text-xs sm:text-sm ${isDarkMode ? "text-purple-100" : ""}`}
                        >
                          Status
                        </th>
                        <th
                          className={`px-3 sm:px-4 py-3 font-medium text-xs sm:text-sm text-right ${isDarkMode ? "text-purple-100" : ""}`}
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody
                      className={`divide-y ${isDarkMode ? "divide-purple-900/70 text-white" : "divide-gray-200"}`}
                    >
                      {filteredHabits.map((habit) => {
                        const Icon = HabitsIcons[habit.icon];
                        return (
                          <motion.tr
                            key={habit.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`${isDarkMode ? "hover:bg-purple-950/60" : "hover:bg-gray-50"}`}
                          >
                            <td className="px-3 sm:px-4 py-3 sm:py-4">
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div
                                  className={`p-1.5 sm:p-2 rounded-full flex items-center justify-center ${isDarkMode ? "bg-purple-800/70" : "bg-purple-100"}`}
                                >
                                  <Icon
                                    className={`h-4 w-4 sm:h-5 sm:w-5 ${isDarkMode ? "text-purple-100" : "text-purple-600"}`}
                                  />
                                </div>
                                <span
                                  className={`font-medium text-sm sm:text-base line-clamp-1 ${isDarkMode ? "text-white" : ""}`}
                                >
                                  {habit.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
                              <div className="flex flex-wrap gap-1">
                                {habit.frequency.map((day) => (
                                  <span
                                    key={day}
                                    className={`text-xs px-2 py-0.5 rounded-full ${
                                      isDarkMode
                                        ? "bg-purple-800 text-white"
                                        : "bg-purple-100 text-purple-700"
                                    }`}
                                  >
                                    {day.substring(0, 3)}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td
                              className={`px-3 sm:px-4 py-3 sm:py-4 text-xs sm:text-sm hidden md:table-cell ${isDarkMode ? "text-purple-100" : ""}`}
                            >
                              {new Date(habit.startDate).toLocaleDateString()}
                            </td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4">
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  habit.endDate
                                    ? isDarkMode
                                      ? "bg-gray-700 text-white"
                                      : "bg-gray-200 text-gray-700"
                                    : isDarkMode
                                      ? "bg-green-700 text-white"
                                      : "bg-green-100 text-green-700"
                                }`}
                              >
                                {habit.endDate ? "Archived" : "Active"}
                              </span>
                            </td>
                            <td className="px-3 sm:px-4 py-3 sm:py-4 text-right">
                              <div className="flex items-center justify-end gap-1 sm:gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(habit)}
                                  className={`h-7 w-7 sm:h-8 sm:w-8 ${isDarkMode ? "bg-purple-900/70 hover:bg-purple-800 text-white" : "hover:bg-gray-100 text-purple-600"}`}
                                >
                                  <svg
                                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteHabit(habit)}
                                  className={`h-7 w-7 sm:h-8 sm:w-8 ${isDarkMode ? "bg-red-900/70 hover:bg-red-800 text-white" : "hover:bg-red-100 text-red-600"}`}
                                >
                                  <svg
                                    className="h-3.5 w-3.5 sm:h-4 sm:w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path
                                      d="M3 6H5H21"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M10 11V17"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                    <path
                                      d="M14 11V17"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!habitToDelete}
        onOpenChange={(open) => !open && setHabitToDelete(null)}
      >
        <AlertDialogContent
          className={
            isDarkMode ? "bg-gray-800 border-purple-900 text-white" : ""
          }
        >
          <AlertDialogHeader>
            <AlertDialogTitle className={isDarkMode ? "text-white" : ""}>
              Delete Habit
            </AlertDialogTitle>
            <AlertDialogDescription
              className={isDarkMode ? "text-purple-100" : ""}
            >
              Are you sure you want to delete &quot;
              {habitToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className={
                isDarkMode
                  ? "bg-gray-700 text-white hover:bg-gray-600 hover:text-gray-100"
                  : ""
              }
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className={`bg-red-600 hover:bg-red-700 text-white ${isDarkMode ? "focus:ring-purple-800" : ""}`}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
