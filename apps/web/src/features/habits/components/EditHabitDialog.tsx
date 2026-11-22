import { lazy, useEffect, useState } from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shared/components/ui/tabs';
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@shared/components/ui/dialog';
import { frequencyLabel } from '@shared/utils/frequencyLabel';
import HabitsIcons from '@/icons/habits';
import HabitDialog from '@/features/habits/components/HabitDialog';
import HabitStats from '@/features/habits/components/HabitStats';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';
import { Habit } from '@/features/habits/types/Habit';
import { triggerHaptic } from '@shared/utils/haptics';
import type { EditHabitTab } from '@/features/habits/context/HabitsStateContextDefinition';

const HabitForm = lazy(() => import('@/features/habits/components/HabitForm'));

const FORM_ID = 'edit-habit-form';

export default function EditHabitDialog() {
  const {
    editingHabit,
    editDialogTab = 'edit',
    showEditHabitDialog,
    toggleShowEditHabitDialog,
  } = useHabitsContext();
  const [activeTab, setActiveTab] = useState<EditHabitTab>(editDialogTab);

  useEffect(() => {
    if (showEditHabitDialog) {
      setActiveTab(editDialogTab);
    }
  }, [showEditHabitDialog, editDialogTab]);

  const HabitIcon = editingHabit ? HabitsIcons[editingHabit.icon] : null;

  const mobileHeader = (
    <div className="flex items-center justify-between border-b border-(--color-border-primary)/50 px-4 pb-3 sm:hidden">
      <button
        type="button"
        onClick={() => {
          triggerHaptic('light');
          toggleShowEditHabitDialog();
        }}
        className="flex min-h-9 min-w-16 items-center justify-start text-[16px] font-normal text-(--color-brand-primary) active:opacity-60"
      >
        {activeTab === 'edit' ? 'Cancel' : 'Done'}
      </button>
      <span
        aria-hidden="true"
        className="flex min-w-0 items-center gap-1.5 px-2 text-[17px] font-semibold tracking-tight text-(--color-foreground)"
      >
        {HabitIcon ? (
          <HabitIcon className="size-4 shrink-0 text-(--color-brand-primary)" />
        ) : null}
        <span className="truncate">{editingHabit?.name ?? 'Edit Habit'}</span>
      </span>
      <div className="flex min-w-16 items-center justify-end">
        {activeTab === 'edit' ? (
          <button
            type="submit"
            form={FORM_ID}
            aria-label="Save Changes"
            className="flex min-h-9 items-center justify-end text-[16px] font-semibold text-(--color-brand-primary) active:opacity-60"
          >
            Save
          </button>
        ) : null}
      </div>
    </div>
  );

  return (
    <HabitDialog
      isOpen={showEditHabitDialog}
      toggleIsOpen={toggleShowEditHabitDialog}
      mobileHeader={mobileHeader}
    >
      <DialogHeader className="max-sm:sr-only">
        <DialogTitle className="text-2xl font-bold text-(--color-brand-tertiary) dark:text-(--color-brand-text-light)">
          {HabitIcon && <HabitIcon className="mr-2 inline-block h-8 w-8" />}
          {editingHabit?.name}
        </DialogTitle>
        <DialogDescription>
          {editingHabit ? frequencyLabel(editingHabit.frequency) : null}
        </DialogDescription>
      </DialogHeader>
      <EditHabitTabs
        habit={editingHabit}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        toggleDialog={toggleShowEditHabitDialog}
      />
    </HabitDialog>
  );
}

interface EditHabitTabsProps {
  habit: Habit | null;
  activeTab: EditHabitTab;
  onTabChange: (tab: EditHabitTab) => void;
  toggleDialog: () => void;
}

function EditHabitTabs({
  habit,
  activeTab,
  onTabChange,
  toggleDialog,
}: EditHabitTabsProps) {
  const [statsOpened, setStatsOpened] = useState(activeTab === 'stats');

  useEffect(() => {
    if (activeTab === 'stats') setStatsOpened(true);
  }, [activeTab]);

  return (
    <Tabs
      value={activeTab}
      className="flex min-h-0 w-full flex-1 flex-col max-sm:pt-3"
      onValueChange={(value) => {
        triggerHaptic('selection');
        const next = value as EditHabitTab;
        onTabChange(next);
        if (next === 'stats') setStatsOpened(true);
      }}
    >
      <div className="shrink-0 max-sm:px-4">
        <TabsList className="mb-2 grid w-full shrink-0 grid-cols-2 bg-(--color-muted) sm:mb-4">
          <TabsTrigger
            value="edit"
            className="max-sm:data-[state=active]:bg-(--color-surface) max-sm:data-[state=active]:text-(--color-foreground) sm:data-[state=active]:bg-(--color-brand-primary) sm:data-[state=active]:text-(--color-text-inverse) dark:max-sm:data-[state=active]:bg-(--color-surface-tertiary)"
          >
            Edit
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="max-sm:data-[state=active]:bg-(--color-surface) max-sm:data-[state=active]:text-(--color-foreground) sm:data-[state=active]:bg-(--color-brand-primary) sm:data-[state=active]:text-(--color-text-inverse) dark:max-sm:data-[state=active]:bg-(--color-surface-tertiary)"
          >
            Stats
          </TabsTrigger>
        </TabsList>
      </div>
      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)]">
        <TabsContent
          value="edit"
          forceMount
          className="col-start-1 row-start-1 flex min-h-0 flex-col pt-1 data-[state=inactive]:invisible sm:pt-2"
        >
          <HabitForm
            formId={FORM_ID}
            habit={habit}
            toggleDialog={toggleDialog}
          />
        </TabsContent>
        <TabsContent
          value="stats"
          forceMount
          className="col-start-1 row-start-1 min-h-0 overflow-y-auto overscroll-contain pt-1 [scrollbar-color:var(--color-border-brand)_transparent] [scrollbar-width:thin] data-[state=inactive]:invisible max-sm:px-4 max-sm:pb-[max(env(safe-area-inset-bottom),1.5rem)] sm:pt-2"
        >
          {statsOpened ? <HabitStats habit={habit} /> : null}
        </TabsContent>
      </div>
    </Tabs>
  );
}
