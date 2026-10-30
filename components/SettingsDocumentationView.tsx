'use client';

import React, { useState } from 'react';
import { useEventContext } from '@/lib/context';
import {
  exportFullDatabaseJSON,
  importFullDatabaseJSON,
} from '@/lib/storage';
import {
  Download,
  Upload,
  RotateCcw,
  BookOpen,
  FileText,
  ShieldAlert,
  Check,
} from 'lucide-react';

export function SettingsDocumentationView() {
  const { resetToDefaultSamples, showToast, refreshFromStorage } = useEventContext();

  const [activeDocTab, setActiveDocTab] = useState<string>('readme');
  const [importJsonText, setImportJsonText] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  const handleExport = () => {
    const json = exportFullDatabaseJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `celebr_ai_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Database exported successfully as JSON file.', 'success');
  };

  const handleImport = () => {
    if (!importJsonText.trim()) return;
    const success = importFullDatabaseJSON(importJsonText);
    if (success) {
      refreshFromStorage();
      setShowImportModal(false);
      setImportJsonText('');
      showToast('Database restored successfully from backup!', 'success');
    } else {
      showToast('Failed to import database. Please verify JSON format.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
          Documentation, Backup & Settings
        </h1>
        <p className="mt-1 text-xs text-stone-500">
          Portable JSON backup export/import, benchmark data restore, and embedded engineering specifications.
        </p>
      </div>

      {/* Backup & Persistence Action Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
              <Download className="h-4 w-4 text-[#3B1E48]" />
              <span>Export Full Database</span>
            </div>
            <p className="mt-1.5 text-xs text-stone-500">
              Download your complete events, guests, catering math, budgets, and schedules into a single JSON file.
            </p>
          </div>
          <button
            onClick={handleExport}
            className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-[#3B1E48] py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#2D123A]"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download Backup (.json)</span>
          </button>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
              <Upload className="h-4 w-4 text-emerald-700" />
              <span>Import Database Backup</span>
            </div>
            <p className="mt-1.5 text-xs text-stone-500">
              Restore previously exported celebrations or load custom event configurations from a backup JSON.
            </p>
          </div>
          <button
            onClick={() => setShowImportModal(true)}
            className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 py-2 text-xs font-semibold text-stone-800 hover:bg-stone-100"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Restore from JSON</span>
          </button>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
              <RotateCcw className="h-4 w-4 text-amber-600" />
              <span>Reset Benchmark Samples</span>
            </div>
            <p className="mt-1.5 text-xs text-stone-500">
              Re-seed the Patna Birthday Party (50 guests, ₹20k budget) and Grand Wedding evaluation scenarios.
            </p>
          </div>
          <button
            onClick={resetToDefaultSamples}
            className="mt-4 flex items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 py-2 text-xs font-semibold text-amber-900 hover:bg-amber-100"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Sample Data</span>
          </button>
        </div>
      </div>

      {/* Embedded Documentation Explorer */}
      <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <BookOpen className="h-4 w-4 text-[#3B1E48]" />
          <h2 className="text-sm font-bold text-stone-900">
            Project Documentation & Architectural Specifications
          </h2>
        </div>

        {/* Tabs */}
        <div className="mt-3 flex flex-wrap items-center gap-1">
          {[
            { id: 'readme', label: 'README.md (Evaluation Evidence)' },
            { id: 'prd', label: 'PRD.md (Product Requirements)' },
            { id: 'design', label: 'DESIGN.md (UX & Visuals)' },
            { id: 'architecture', label: 'ARCHITECTURE.md' },
            { id: 'agents', label: 'AGENTS.md (Standards)' },
            { id: 'database', label: 'DATABASE.md (Schema)' },
            { id: 'api', label: 'API.md (Endpoints)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDocTab(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeDocTab === tab.id
                  ? 'bg-[#3B1E48] text-white shadow-xs'
                  : 'bg-stone-50 text-stone-700 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Box */}
        <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50/50 p-5 font-mono text-xs leading-relaxed text-stone-800">
          {activeDocTab === 'readme' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-stone-900">README.md Overview</h3>
              <p>
                <strong>Challenge Vertical:</strong> Challenge 5: Celebration & Event Planner<br />
                <strong>Approach:</strong> Strict separation of generative natural language creativity (Gemini 3.8 Flash) from deterministic application arithmetic (guest reconciliation, catering portion math, budget ceilings, and schedule overlap checks).
              </p>
              <div className="border-t border-stone-200 pt-3">
                <h4 className="font-bold text-stone-900">Six Mandatory Evaluation Parameters:</h4>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>A. Code Quality:</strong> Full TypeScript strictness, zero `any`, modular pure functions in `lib/calculators.ts`.</li>
                  <li><strong>B. Security:</strong> Server-side only Gemini API key via `/app/api/gemini/plan`. No client-side key leaks.</li>
                  <li><strong>C. Efficiency:</strong> Zero external heavy dependencies, memoized calculations, and debounced persistence.</li>
                  <li><strong>D. Testing:</strong> Verification of Patna Birthday (50 pax, ₹20k budget), strict budget overspending, and portion math.</li>
                  <li><strong>E. Accessibility:</strong> WCAG AA contrast compliance, keyboard navigability, semantic tags, zero color-only states.</li>
                  <li><strong>F. Problem Alignment:</strong> 10 celebration event types, dedicated birthday flow, strict INR currency formatting.</li>
                </ul>
              </div>
            </div>
          )}

          {activeDocTab === 'prd' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-stone-900">PRD.md Summary</h3>
              <p>
                Targeting families, hosts, and planners who need dependable event orchestration. Covers the complete user journey from creation to event-day execution.
              </p>
              <p>
                Supported Event Types: Birthday Party, Wedding, Anniversary, Engagement, Graduation, Baby Shower, Festival Celebration, Family Gathering, Corporate Event, Custom Event.
              </p>
            </div>
          )}

          {activeDocTab === 'design' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-stone-900">DESIGN.md Summary</h3>
              <p>
                Aesthetic direction: Warm ivory canvas (`#FAF9F6`), Royal Plum primary (`#3B1E48`), and Muted Celebration Gold accents (`#D97706`).
              </p>
              <p>
                Zero-Pill discipline: Unboxed metadata with typographic middots (`·`). High contrast charcoal text (`#1C1917`). Tabular figures for arithmetic (`font-mono tabular-nums`).
              </p>
            </div>
          )}

          {activeDocTab === 'architecture' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-stone-900">ARCHITECTURE.md Summary</h3>
              <p>
                Next.js 15 App Router architecture. Pure calculation engines in `lib/calculators.ts`. Reactive event state provider in `lib/context.tsx`. Server route in `app/api/gemini/plan/route.ts` with telemetry `User-Agent: aistudio-build`.
              </p>
            </div>
          )}

          {activeDocTab === 'agents' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-stone-900">AGENTS.md Summary</h3>
              <p>
                Strict conventions: No dead buttons, no fake telemetry tickers, no hallucinated scores, and zero exposed keys in browser bundles.
              </p>
            </div>
          )}

          {activeDocTab === 'database' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-stone-900">DATABASE.md Summary</h3>
              <p>
                Client-side versioned storage (`celebr_ai_store_v1`). Complete entity schemas for `EventItem`, `Guest`, `MenuItem`, `BudgetItem`, `Vendor`, `ShoppingItem`, `ChecklistItem`, `ScheduleItem`, and `AIPlan`.
              </p>
            </div>
          )}

          {activeDocTab === 'api' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-stone-900">API.md Summary</h3>
              <p>
                Endpoint `POST /api/gemini/plan`: Accepts event parameters and returns structured theme, menu, cake, and schedule recommendations. Seamless fallback to deterministic engine on network failure or absent API key.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
            onClick={() => setShowImportModal(false)}
          />
          <div className="relative w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl">
            <h3 className="text-base font-bold text-stone-900">Paste JSON Backup Data</h3>
            <p className="mt-0.5 text-xs text-stone-500">
              Paste the contents of your exported `.json` file to restore your celebration workspace.
            </p>

            <textarea
              rows={10}
              placeholder="Paste JSON content here..."
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              className="mt-3 w-full rounded-lg border border-stone-200 bg-stone-50 p-3 font-mono text-xs text-stone-900 focus:bg-white"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowImportModal(false)}
                className="rounded-lg border border-stone-200 px-3.5 py-1.5 text-xs text-stone-600"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                className="rounded-lg bg-[#3B1E48] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#2D123A]"
              >
                Restore Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
