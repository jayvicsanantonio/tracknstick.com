import { useContext, useState, FormEvent } from 'react';
import { DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import IconSelector from '@/components/common/IconSelector';
import FrequencySelector from '@/components/common/FrequencySelector';
import HabitsIcons from '@/icons/habits';
import { Habit } from '@/types/habit';
import { AppContext } from '@/context/AppContext';
import { Frequency } from '@/types/frequency';

interface HabitFormProps {
  habit?: Habit | null;
  handleSubmit: (habit: Habit, willDelete: boolean) => Promise<void>;
  toggleDialog: () => void;
}

interface FormData {
  name: string;
  frequency: Frequency[];
  icon: keyof typeof HabitsIcons;
}

export default function HabitForm({
  habit,
  handleSubmit,
  toggleDialog,
}: HabitFormProps) {
  const { isDarkMode } = useContext(AppContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: habit?.name ?? '',
    frequency: habit?.frequency ?? [],
    icon: habit?.icon ?? ('Activity' as keyof typeof HabitsIcons),
  });

  const isValid = formData.name && formData.icon && formData.frequency.length > 0;

  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;

    setIsSubmitting(true);
    handleSubmit({
      ...habit,
      ...formData,
      completed: false,
      stats: habit?.stats ?? {
        streak: 0,
        totalCompletions: 0,
        lastCompleted: null,
      },
    }, false)
      .then(() => toggleDialog())
      .catch((error) => console.error('Error submitting form:', error))
      .finally(() => setIsSubmitting(false));
  };

  const handleDelete = () => {
    if (!habit) return;
    setIsSubmitting(true);
    handleSubmit(habit, true)
      .then(() => toggleDialog())
      .catch((error) => console.error('Error deleting habit:', error))
      .finally(() => setIsSubmitting(false));
  };

  return (
    <form onSubmit={handleFormSubmit} className="min-h-fit sm:h-[508px] grid gap-4 py-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label
            htmlFor="habit-name"
            className={isDarkMode ? 'text-purple-300' : 'text-purple-700'}
          >
            Name
          </Label>
          <Input
            id="habit-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className={`w-full ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 focus:border-purple-400 text-purple-300'
                : 'bg-white border-purple-300 focus:border-purple-500'
            }`}
          />
        </div>

        <IconSelector
          selectedIcon={formData.icon}
          onIconSelect={(icon) => setFormData(prev => ({ ...prev, icon }))}
        />

        <FrequencySelector
          selectedDays={formData.frequency}
          onFrequencyChange={(frequency) => setFormData(prev => ({ ...prev, frequency }))}
        />
      </div>

      <Separator className={isDarkMode ? 'bg-gray-600' : 'bg-purple-200'} />

      <div className="flex items-center flex-row gap-2">
        <div className="flex-1">
          {habit && (
            <Button
              type="button"
              variant="outline"
              className={`border-red-500 text-red-500 hover:bg-red-500 hover:text-white ${
                isDarkMode ? 'hover:bg-red-600' : 'hover:bg-red-400'
              }`}
              onClick={handleDelete}
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
                ? 'border-gray-600 hover:bg-gray-700 hover:text-white'
                : 'border-purple-300 hover:bg-purple-100'
            }
          >
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            className={`w-32 ${
              isDarkMode
                ? 'bg-purple-700 hover:bg-purple-600'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
            disabled={isSubmitting || !isValid}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </form>
  );
}
