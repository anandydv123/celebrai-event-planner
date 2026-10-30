'use client';

import React from 'react';
import { useEventContext } from '@/lib/context';
import {
  LayoutDashboard,
  CalendarDays,
  Cake,
  Users,
  Utensils,
  Wallet,
  ShoppingCart,
  Building2,
  Briefcase,
  CheckSquare,
  Sparkles,
  Mail,
  BookOpen,
  X,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenCreateModal: () => void;
}

export function Sidebar({ isMobileOpen, onCloseMobile, onOpenCreateModal }: SidebarProps) {
  const { activeModule, setActiveModule, activeEvent } = useEventContext();

  const navItems = [
    {
      group: 'Core',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'my-events', label: 'My Events', icon: CalendarDays },
        {
          id: 'birthday-planner',
          label: 'Birthday Planner',
          icon: Cake,
          highlight: activeEvent?.type === 'Birthday Party',
        },
      ],
    },
    {
      group: 'Planning Engines',
      items: [
        { id: 'guests', label: 'Guest & RSVP', icon: Users },
        { id: 'catering', label: 'Food & Catering', icon: Utensils },
        { id: 'budget', label: 'Budget Planner', icon: Wallet },
        { id: 'shopping', label: 'Shopping List', icon: ShoppingCart },
      ],
    },
    {
      group: 'Logistics & Day-Of',
      items: [
        { id: 'venue-decor', label: 'Venue & Decor', icon: Building2 },
        { id: 'vendors', label: 'Vendors', icon: Briefcase },
        { id: 'timeline', label: 'Checklist & Runsheet', icon: CheckSquare },
        { id: 'ai-recommendations', label: 'AI Plan Generator', icon: Sparkles },
        { id: 'invitations', label: 'Invitations', icon: Mail },
        { id: 'settings', label: 'Documentation & Backup', icon: BookOpen },
      ],
    },
  ];

  const handleSelect = (id: string) => {
    setActiveModule(id);
    onCloseMobile();
  };

  const content = (
    <div className="flex h-full flex-col justify-between bg-white px-3 py-4">
      <div className="space-y-6">
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-3 lg:hidden">
          <span className="text-sm font-bold text-[#3B1E48]">CelebrAI Navigation</span>
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-1 text-stone-500 hover:bg-stone-100"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Groups */}
        <nav className="space-y-5" aria-label="Main sidebar">
          {navItems.map((group) => (
            <div key={group.group}>
              <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                {group.group}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeModule === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#3B1E48] text-white shadow-xs'
                          : 'text-stone-700 hover:bg-stone-100 hover:text-stone-900'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 ${
                            isActive
                              ? 'text-amber-300'
                              : item.highlight
                              ? 'text-amber-600'
                              : 'text-stone-500'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.highlight && !isActive && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-semibold text-amber-800">
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer Context Card */}
      {activeEvent && (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
          <div className="text-[10px] uppercase tracking-wider text-stone-400">Current Event</div>
          <div className="mt-1 truncate text-xs font-semibold text-stone-900">{activeEvent.name}</div>
          <div className="mt-0.5 text-[11px] text-stone-500">
            {activeEvent.totalGuests} Guests · {activeEvent.type}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-stone-200 bg-white lg:block">
        <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">{content}</div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative flex w-72 max-w-xs flex-1 flex-col overflow-y-auto bg-white shadow-xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
