'use client';

import React, { useState, useMemo } from 'react';
import { useEventContext } from '@/lib/context';
import { ChecklistItem, ChecklistCategory, ScheduleItem } from '@/types/event';
import { detectScheduleOverlaps } from '@/lib/calculators';
import {
  CheckSquare,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  User,
  Package,
} from 'lucide-react';

const CHECKLIST_CATEGORIES: ChecklistCategory[] = [
  'Planning',
  'Vendors',
  'Venue',
  'Food',
  'Guests',
  'Decor',
  'Day-of',
];

export function TimelineChecklistView() {
  const {
    checklistItems,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
    scheduleItems,
    addScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
    activeEvent,
  } = useEventContext();

  const [activeTab, setActiveTab] = useState<'checklist' | 'schedule'>('schedule');

  // Task filter & add state
  const [taskCategoryFilter, setTaskCategoryFilter] = useState<string>('all');
  const [showAddTask, setShowAddTask] = useState<boolean>(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState<ChecklistCategory>('Planning');
  const [taskDeadline, setTaskDeadline] = useState(activeEvent?.date || '2026-11-14');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('high');

  // Schedule add state
  const [showAddSchedule, setShowAddSchedule] = useState<boolean>(false);
  const [activity, setActivity] = useState('');
  const [startTime, setStartTime] = useState('17:30');
  const [endTime, setEndTime] = useState('18:15');
  const [responsible, setResponsible] = useState('');
  const [materials, setMaterials] = useState('');
  const [scheduleNotes, setScheduleNotes] = useState('');

  // Overlap detection
  const conflicts = useMemo(() => {
    return detectScheduleOverlaps(scheduleItems);
  }, [scheduleItems]);

  const taskStats = useMemo(() => {
    const total = checklistItems.length;
    const completed = checklistItems.filter((c) => c.isCompleted).length;
    const overdue = checklistItems.filter((c) => {
      if (c.isCompleted) return false;
      return new Date(c.deadlineDate) < new Date();
    }).length;

    return { total, completed, overdue, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [checklistItems]);

  const filteredTasks = useMemo(() => {
    if (taskCategoryFilter === 'all') return checklistItems;
    return checklistItems.filter((c) => c.category === taskCategoryFilter);
  }, [checklistItems, taskCategoryFilter]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addChecklistItem({
      title: taskTitle.trim(),
      category: taskCategory,
      deadlineDate: taskDeadline,
      priority: taskPriority,
      isCompleted: false,
    });

    setTaskTitle('');
    setShowAddTask(false);
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim()) return;

    addScheduleItem({
      activity: activity.trim(),
      startTime,
      endTime,
      responsiblePerson: responsible.trim() || undefined,
      requiredMaterials: materials.trim() || undefined,
      notes: scheduleNotes.trim() || undefined,
    });

    setActivity('');
    setResponsible('');
    setMaterials('');
    setScheduleNotes('');
    setShowAddSchedule(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
            Checklist & Event-Day Run Sheet
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Preparation milestones, deadline tracking, and minute-by-minute schedule with collision detection.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-stone-100 p-1">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'schedule'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="h-4 w-4 text-[#3B1E48]" />
            <span>Event-Day Run Sheet ({scheduleItems.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === 'checklist'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <CheckSquare className="h-4 w-4 text-emerald-600" />
            <span>Preparation Tasks ({taskStats.completed}/{taskStats.total})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: RUN SHEET */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          {/* Overlap Warning if any */}
          {conflicts.length > 0 && (
            <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-950 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <span>Schedule Conflict / Overlap Detected ({conflicts.length}):</span>
              </div>
              <ul className="mt-2 list-disc list-inside space-y-1 text-xs text-rose-900">
                {conflicts.map((conf, idx) => (
                  <li key={idx}>{conf.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Schedule Controls */}
          <div className="flex items-center justify-between">
            <div className="text-xs text-stone-500">
              Event window: <strong className="font-mono text-stone-900">{activeEvent?.startTime} – {activeEvent?.endTime}</strong>
            </div>

            <button
              onClick={() => setShowAddSchedule(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#3B1E48] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#2D123A]"
            >
              <Plus className="h-4 w-4" />
              <span>Add Run-Sheet Activity</span>
            </button>
          </div>

          {/* Timeline Cards */}
          <div className="space-y-3">
            {scheduleItems.map((item, idx) => (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center"
              >
                <div className="flex items-start gap-4">
                  {/* Time Badge */}
                  <div className="flex h-12 w-24 shrink-0 flex-col items-center justify-center rounded-lg bg-[#3B1E48]/5 text-center">
                    <span className="font-mono text-xs font-bold text-[#3B1E48]">
                      {item.startTime}
                    </span>
                    <span className="text-[10px] text-stone-400">to {item.endTime}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-stone-900">{item.activity}</h3>
                    <div className="mt-1 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-stone-500">
                      {item.responsiblePerson && (
                        <span className="flex items-center gap-1 text-stone-700">
                          <User className="h-3 w-3 text-stone-400" />
                          <span>{item.responsiblePerson}</span>
                        </span>
                      )}
                      {item.requiredMaterials && (
                        <span className="flex items-center gap-1 text-stone-600">
                          <Package className="h-3 w-3 text-stone-400" />
                          <span>{item.requiredMaterials}</span>
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <p className="mt-1 text-[11px] text-stone-500 italic">{item.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => deleteScheduleItem(item.id)}
                    className="rounded p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                    title="Remove activity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {scheduleItems.length === 0 && (
              <div className="rounded-xl border border-dashed border-stone-200 bg-white p-12 text-center text-xs text-stone-400">
                No timeline activities added yet. Click &quot;Add Run-Sheet Activity&quot; to begin.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
              <div className="text-xs font-semibold text-stone-500">Progress Completion</div>
              <div className="mt-2 text-2xl font-bold text-stone-900 tabular-nums">
                {taskStats.percentage}%
              </div>
              <div className="mt-1 text-[11px] text-stone-500">
                {taskStats.completed} of {taskStats.total} milestones achieved
              </div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
              <div className="text-xs font-semibold text-stone-500">Pending Tasks</div>
              <div className="mt-2 text-2xl font-bold text-amber-700 tabular-nums">
                {taskStats.total - taskStats.completed}
              </div>
              <div className="mt-1 text-[11px] text-stone-500">Awaiting execution</div>
            </div>

            <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
              <div className="text-xs font-semibold text-stone-500">Overdue Tasks</div>
              <div
                className={`mt-2 text-2xl font-bold tabular-nums ${
                  taskStats.overdue > 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {taskStats.overdue}
              </div>
              <div className="mt-1 text-[11px] text-stone-500">Passed deadline date</div>
            </div>
          </div>

          {/* Filter & Add Bar */}
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => setTaskCategoryFilter('all')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  taskCategoryFilter === 'all'
                    ? 'bg-[#3B1E48] text-white shadow-xs'
                    : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                All Tasks
              </button>
              {CHECKLIST_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTaskCategoryFilter(cat)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                    taskCategoryFilter === cat
                      ? 'bg-[#3B1E48] text-white shadow-xs'
                      : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowAddTask(true)}
              className="flex items-center gap-1.5 rounded-lg bg-[#3B1E48] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#2D123A]"
            >
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </button>
          </div>

          {/* Tasks List */}
          <div className="space-y-2.5">
            {filteredTasks.map((task) => {
              const isOverdue = !task.isCompleted && new Date(task.deadlineDate) < new Date();

              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between rounded-xl border p-3.5 transition-colors ${
                    task.isCompleted
                      ? 'border-stone-200 bg-stone-50/50 opacity-70'
                      : isOverdue
                      ? 'border-rose-300 bg-rose-50/30'
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.isCompleted}
                      onChange={() => toggleChecklistItem(task.id)}
                      className="h-4 w-4 rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span
                        className={`text-xs font-semibold ${
                          task.isCompleted ? 'line-through text-stone-500' : 'text-stone-900'
                        }`}
                      >
                        {task.title}
                      </span>
                      <div className="mt-0.5 flex items-center gap-2 text-[11px] text-stone-500">
                        <span>{task.category}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={`font-semibold uppercase text-[10px] ${
                            task.priority === 'high'
                              ? 'text-rose-600'
                              : task.priority === 'medium'
                              ? 'text-amber-600'
                              : 'text-stone-400'
                          }`}
                        >
                          {task.priority} Priority
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className={isOverdue ? 'font-bold text-rose-600' : ''}>
                          Due: {task.deadlineDate} {isOverdue && '(OVERDUE)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteChecklistItem(task.id)}
                    className="rounded p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                    title="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <div className="rounded-xl border border-dashed border-stone-200 bg-white p-10 text-center text-xs text-stone-400">
                No tasks found in this category.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
      {showAddSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
            onClick={() => setShowAddSchedule(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl">
            <h3 className="text-base font-bold text-stone-900">Add Run-Sheet Activity</h3>
            <p className="mt-0.5 text-xs text-stone-500">
              Schedule activities with designated responsibilities.
            </p>

            <form onSubmit={handleAddSchedule} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700">Activity Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cake Cutting, Welcome Drink Service, Dinner Buffet"
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Responsible Person</label>
                <input
                  type="text"
                  placeholder="e.g. Host Family, Game Anchor, Caterer Supervisor"
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Required Materials</label>
                <input
                  type="text"
                  placeholder="e.g. Cake knife, sparkler candle, music playlist"
                  value={materials}
                  onChange={(e) => setMaterials(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSchedule(false)}
                  className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#3B1E48] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#2D123A]"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
            onClick={() => setShowAddTask(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl">
            <h3 className="text-base font-bold text-stone-900">Add Preparation Milestone</h3>

            <form onSubmit={handleAddTask} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Confirm guest count with caterer 48 hours prior"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Category</label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as ChecklistCategory)}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-900"
                  >
                    {CHECKLIST_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-900"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Deadline Date</label>
                <input
                  type="date"
                  value={taskDeadline}
                  onChange={(e) => setTaskDeadline(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#3B1E48] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#2D123A]"
                >
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
