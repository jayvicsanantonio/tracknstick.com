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
      <DialogHeader className="max-sm:sr-only sm:pb-3">
        <div className="flex items-center gap-3.5">
          {HabitIcon ? (
            <span className="flex size-11 shrink-0 items-center justify-center rounded-[14px] bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/24 ring-inset">
              <HabitIcon aria-hidden="true" className="size-5" />
            </span>
          ) : null}
          <div className="min-w-0 flex-1 text-left">
            <DialogTitle className="truncate text-xl font-extrabold tracking-[-0.02em] text-(--color-foreground) sm:text-2xl">
              {editingHabit?.name}
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-sm text-(--color-text-secondary)">
              {editingHabit ? frequencyLabel(editingHabit.frequency) : null}
            </DialogDescription>
          </div>
        </div>
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
      <div className="shrink-0 max-sm:px-4 sm:mb-3">
        <div className="ios-tracker-card rounded-2xl p-1">
          <TabsList className="grid h-9 w-full shrink-0 grid-cols-2 bg-transparent p-0 ring-0">
            <TabsTrigger
              value="edit"
              className="rounded-xl text-[13px] font-semibold text-(--color-text-secondary) hover:text-(--color-foreground) data-[state=active]:bg-(--color-brand-primary) data-[state=active]:text-(--color-primary-foreground) data-[state=active]:shadow-[0_2px_10px_color-mix(in_oklab,var(--color-brand-primary)_35%,transparent)] sm:rounded-xl"
            >
              Edit
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="rounded-xl text-[13px] font-semibold text-(--color-text-secondary) hover:text-(--color-foreground) data-[state=active]:bg-(--color-brand-primary) data-[state=active]:text-(--color-primary-foreground) data-[state=active]:shadow-[0_2px_10px_color-mix(in_oklab,var(--color-brand-primary)_35%,transparent)] sm:rounded-xl"
            >
              Stats
            </TabsTrigger>
          </TabsList>
        </div>
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
