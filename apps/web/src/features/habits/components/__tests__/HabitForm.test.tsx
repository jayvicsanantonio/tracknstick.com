// Covers HabitForm validation feedback, synchronous submit haptics, and delete warnings.
// Invalid submits highlight missing fields, while valid submits confirm before the API resolves.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DateContext } from '@app/providers/DateContext';
import { Dialog } from '@shared/components/ui/dialog';
import { triggerHaptic } from '@shared/utils/haptics';
import HabitForm from '../HabitForm';
import type { Habit } from '@/features/habits/types/Habit';

const mockAddHabit = vi.fn();
const mockUpdateHabit = vi.fn();
const mockDeleteHabit = vi.fn();

vi.mock('@/features/habits/hooks/useHabits', () => ({
  useHabits: () => ({
    addHabit: mockAddHabit,
    updateHabit: mockUpdateHabit,
    deleteHabit: mockDeleteHabit,
  }),
}));

vi.mock('@shared/utils/haptics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/utils/haptics')>();
  return {
    ...actual,
    triggerHaptic: vi.fn(),
  };
});

const FIXED_DATE = new Date(2026, 10, 24, 12);

function renderForm(
  props: Partial<React.ComponentProps<typeof HabitForm>> = {},
) {
  const toggleDialog = props.toggleDialog ?? vi.fn();
  return {
    toggleDialog,
    ...render(
      <DateContext.Provider
        value={{
          date: FIXED_DATE,
          currentDate: FIXED_DATE,
          setDate: vi.fn(),
          handlePreviousDate: vi.fn(),
          handleNextDate: vi.fn(),
          timeZone: 'America/Los_Angeles',
        }}
      >
        <Dialog open>
          <HabitForm
            formId="test-habit-form"
            toggleDialog={toggleDialog}
            {...props}
          />
        </Dialog>
      </DateContext.Provider>,
    ),
  };
}

describe('HabitForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fires an error haptic and associates an error message when submitted incomplete', async () => {
    renderForm();

    await userEvent.click(screen.getByRole('button', { name: 'Add habit' }));

    expect(triggerHaptic).toHaveBeenCalledWith('error');
    const nameInput = screen.getByLabelText(/^Name/);
    expect(nameInput).toHaveAttribute('aria-invalid', 'true');
    expect(nameInput).toHaveAccessibleDescription('Enter a habit name');
    expect(screen.getByText('Enter a habit name')).toBeInTheDocument();
    expect(mockAddHabit).not.toHaveBeenCalled();

    // Entering a habit name clears both invalidity and the error description.
    await userEvent.type(nameInput, 'Read');
    expect(nameInput).not.toHaveAttribute('aria-invalid', 'true');
    expect(nameInput).not.toHaveAttribute('aria-describedby');
    expect(screen.queryByText('Enter a habit name')).not.toBeInTheDocument();
  });

  it('fires a synchronous success haptic on valid submit before the API resolves', async () => {
    let resolveAdd!: () => void;
    mockAddHabit.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveAdd = resolve;
        }),
    );

    const { toggleDialog } = renderForm({
      draft: {
        name: 'Drink water',
        icon: 'GlassWater',
        frequency: ['Mon', 'Wed', 'Fri'],
      },
    });

    await userEvent.click(screen.getByRole('button', { name: 'Add habit' }));

    // Success haptic fires synchronously inside the submit gesture, before addHabit resolves.
    expect(triggerHaptic).toHaveBeenCalledWith('success');
    expect(mockAddHabit).toHaveBeenCalledTimes(1);
    expect(toggleDialog).not.toHaveBeenCalled();

    resolveAdd();
    await waitFor(() => expect(toggleDialog).toHaveBeenCalledTimes(1));
  });

  it('fires a warning haptic when confirming habit deletion', async () => {
    mockDeleteHabit.mockResolvedValue(undefined);
    const existingHabit: Habit = {
      id: 'habit-1',
      name: 'Stretch',
      icon: 'Activity',
      frequency: ['Mon'],
      startDate: '2026-11-01T00:00:00.000Z',
      completed: false,
    };

    const { toggleDialog } = renderForm({ habit: existingHabit });

    await userEvent.click(screen.getByRole('button', { name: 'Delete Habit' }));
    const confirmDialog = await screen.findByRole('alertdialog', {
      name: 'Delete Habit',
    });
    vi.mocked(triggerHaptic).mockClear();

    await userEvent.click(
      within(confirmDialog).getByRole('button', { name: 'Delete' }),
    );

    expect(triggerHaptic).toHaveBeenCalledWith('warning');
    expect(mockDeleteHabit).toHaveBeenCalledWith('habit-1', 'Stretch');
    await waitFor(() => expect(toggleDialog).toHaveBeenCalledTimes(1));
  });
});
