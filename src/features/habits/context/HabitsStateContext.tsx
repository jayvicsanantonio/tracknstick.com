import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useMemo, // Add useMemo import
} from "react";
import { useToggle } from "@/hooks/use-toggle"; // Assuming shared hook
import { Habit } from "@/features/habits/types";

// Define the shape of the context state
interface HabitsStateContextValue {
  isEditMode: boolean;
  toggleIsEditMode: () => void;
  editingHabit: Habit | null;
  setEditingHabit: (habit: Habit | null) => void;
  showAddHabitDialog: boolean;
  toggleShowAddHabitDialog: () => void;
  showEditHabitDialog: boolean;
  toggleShowEditHabitDialog: () => void;
  isOverviewMode: boolean;
  toggleIsOverviewMode: () => void;
  // Add convenience functions to open specific dialogs
  openEditDialog: (habit: Habit) => void;
}

// Create the context with a default value (null or throw error)
const HabitsStateContext = createContext<HabitsStateContextValue | null>(null);

// Create the provider component
export function HabitsStateProvider({ children }: { children: ReactNode }) {
  const [isEditMode, toggleIsEditMode] = useToggle(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showAddHabitDialog, toggleShowAddHabitDialog] = useToggle(false);
  const [showEditHabitDialog, toggleShowEditHabitDialog] = useToggle(false);
  const [isOverviewMode, toggleIsOverviewMode] = useToggle(false);

  // Convenience function to open the edit dialog and set the habit
  const openEditDialog = useCallback(
    (habit: Habit) => {
      setEditingHabit(habit);
      // Ensure dialog is shown - use the 'true' state setter from useToggle if available,
      // otherwise just call the toggle (might need adjustment based on useToggle implementation)
      // Assuming toggleShowEditHabitDialog() toggles, we might need a setShowEditHabitDialog(true)
      // For now, just toggle, assuming it opens if closed. Refine if useToggle provides explicit setters.
      if (!showEditHabitDialog) {
        toggleShowEditHabitDialog();
      }
    },
    [showEditHabitDialog, toggleShowEditHabitDialog], // Add dependencies
  );

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      isEditMode,
      toggleIsEditMode,
      editingHabit,
      setEditingHabit,
      showAddHabitDialog,
      toggleShowAddHabitDialog,
      showEditHabitDialog,
      toggleShowEditHabitDialog,
      isOverviewMode,
      toggleIsOverviewMode,
      openEditDialog,
    }),
    [
      isEditMode,
      toggleIsEditMode,
      editingHabit,
      setEditingHabit, // Include setter if needed by consumers, otherwise omit
      showAddHabitDialog,
      toggleShowAddHabitDialog,
      showEditHabitDialog,
      toggleShowEditHabitDialog,
      isOverviewMode,
      toggleIsOverviewMode,
      openEditDialog,
    ],
  );

  return (
    <HabitsStateContext.Provider value={value}>
      {children}
    </HabitsStateContext.Provider>
  );
}

// Create a custom hook for consuming the context
export function useHabitsState() {
  const context = useContext(HabitsStateContext);
  if (context === null) {
    throw new Error("useHabitsState must be used within a HabitsStateProvider");
  }
  return context;
}
