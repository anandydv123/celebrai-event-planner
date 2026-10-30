'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { EventProvider, useEventContext } from '@/lib/context';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/Sidebar';
import { OverviewView } from '@/components/OverviewView';
import { MyEventsView } from '@/components/MyEventsView';
import { BirthdayPlannerView } from '@/components/BirthdayPlannerView';
import { GuestManagementView } from '@/components/GuestManagementView';
import { FoodCateringView } from '@/components/FoodCateringView';
import { BudgetPlannerView } from '@/components/BudgetPlannerView';
import { ShoppingListView } from '@/components/ShoppingListView';
import { VenueDecorView } from '@/components/VenueDecorView';
import { VendorsView } from '@/components/VendorsView';
import { TimelineChecklistView } from '@/components/TimelineChecklistView';
import { AIRecommendationsView } from '@/components/AIRecommendationsView';
import { InvitationsView } from '@/components/InvitationsView';
import { SettingsDocumentationView } from '@/components/SettingsDocumentationView';
import { CreateEventModal } from '@/components/CreateEventModal';
import { CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';

function AppContent() {
  const { activeModule, toast } = useEventContext();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF9F6]">
      {/* Top Navbar */}
      <Navbar
        onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
      />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
        />

        {/* Main View Area */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8 lg:px-10">
          <div className="mx-auto max-w-6xl">
            {activeModule === 'overview' && <OverviewView />}
            {activeModule === 'my-events' && (
              <MyEventsView onOpenCreateModal={() => setIsCreateModalOpen(true)} />
            )}
            {activeModule === 'birthday-planner' && <BirthdayPlannerView />}
            {activeModule === 'guests' && <GuestManagementView />}
            {activeModule === 'catering' && <FoodCateringView />}
            {activeModule === 'budget' && <BudgetPlannerView />}
            {activeModule === 'shopping' && <ShoppingListView />}
            {activeModule === 'venue-decor' && <VenueDecorView />}
            {activeModule === 'vendors' && <VendorsView />}
            {activeModule === 'timeline' && <TimelineChecklistView />}
            {activeModule === 'ai-recommendations' && <AIRecommendationsView />}
            {activeModule === 'invitations' && <InvitationsView />}
            {activeModule === 'settings' && <SettingsDocumentationView />}
          </div>
        </main>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Floating Notification Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-stone-200 bg-white p-3.5 shadow-xl transition-all">
          {toast.type === 'success' && (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          {toast.type === 'info' && (
            <Info className="h-4 w-4 shrink-0 text-[#3B1E48]" />
          )}
          <span className="text-xs font-semibold text-stone-900">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

const emptySubscribe = () => () => {};

export default function HomePage() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col bg-[#FAF9F6]">
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-stone-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#3B1E48] text-amber-400 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#3B1E48]">
              Celebr<span className="text-amber-600">AI</span>
            </span>
            <span className="hidden text-[10px] uppercase tracking-wider text-stone-400 sm:inline-block sm:ml-2">
              Event Planner
            </span>
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3 text-stone-400">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-[#3B1E48]" />
            <span className="text-xs font-medium text-stone-500">Loading CelebrAI planner...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <EventProvider>
      <AppContent />
    </EventProvider>
  );
}
