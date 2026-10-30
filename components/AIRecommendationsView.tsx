'use client';

import React, { useState } from 'react';
import { useEventContext } from '@/lib/context';
import { AIPlan } from '@/types/event';
import {
  Sparkles,
  RefreshCw,
  Check,
  Palette,
  Utensils,
  Cake,
  TrendingDown,
  Clock,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export function AIRecommendationsView() {
  const { activeEvent, aiPlan, setAiPlan, updateEvent, showToast } = useEventContext();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!activeEvent) return;
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/gemini/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: activeEvent.name,
          eventType: activeEvent.type,
          totalGuests: activeEvent.totalGuests,
          budget: activeEvent.budget.total,
          isStrictBudget: activeEvent.budget.isStrict,
          location: activeEvent.location,
          venueType: activeEvent.venueType,
          foodPreference: activeEvent.foodPreference,
          theme: activeEvent.theme,
          cakePreference: activeEvent.cakePreference,
          additionalNotes: activeEvent.notes,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      const newPlan: AIPlan = {
        id: `aip-${Date.now()}`,
        eventId: activeEvent.id,
        source: data.source || 'gemini',
        generatedAt: new Date().toISOString(),
        themes: data.themes || [],
        menuSuggestions: data.menuSuggestions || [],
        cakeRecommendation: data.cakeRecommendation || {
          recommendedWeightKg: 3.5,
          flavors: ['Chocolate Truffle'],
          designNotes: 'Celebration cake',
        },
        invitationDrafts: data.invitationDrafts || [],
        scheduleOutline: data.scheduleOutline || [],
        costSavingTips: data.costSavingTips || [],
      };

      setAiPlan(newPlan);
      showToast(
        newPlan.source === 'gemini'
          ? 'Generated live plan using Gemini 3.8 Flash!'
          : 'High-fidelity plan generated via deterministic rule engine.',
        'success'
      );
    } catch (err: any) {
      console.error('Failed generating AI plan:', err);
      setErrorMsg(
        'Could not complete live AI generation. You can retry or rely on the deterministic planner.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdoptTheme = (themeTitle: string) => {
    if (!activeEvent) return;
    updateEvent(activeEvent.id, { theme: themeTitle });
    showToast(`Adopted "${themeTitle}" as event theme!`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-stone-200 bg-gradient-to-r from-stone-900 to-[#3B1E48] p-6 text-white shadow-xs">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
              <Sparkles className="h-4 w-4" />
              <span>Gemini 3.8 Flash Creative Intelligence</span>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              AI Event Recommendations & Concepts
            </h1>
            <p className="mt-1 text-xs text-stone-300">
              Personalized themes, curated courses, cake specifications, and actionable budget-saving advice.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-stone-950 shadow-md transition-all hover:bg-amber-400 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Architecting Plan...' : 'Generate Contextual Plan'}</span>
          </button>
        </div>
      </div>

      {/* Error / Fallback Banner */}
      {errorMsg && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-900 shadow-xs">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1 text-xs">{errorMsg}</div>
          <button
            onClick={handleGenerate}
            className="rounded-lg bg-rose-200 px-3 py-1 text-xs font-semibold text-rose-950 hover:bg-rose-300"
          >
            Retry
          </button>
        </div>
      )}

      {aiPlan && (
        <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-xs">
          <div className="flex items-center gap-2 text-stone-600">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>
              Plan Source:{' '}
              <strong className="text-stone-900 capitalize">
                {aiPlan.source === 'gemini'
                  ? 'Gemini 3.8 Flash (Server-Side @google/genai)'
                  : 'High-Fidelity Deterministic Engine (Offline Fallback)'}
              </strong>
            </span>
          </div>
          <span className="text-[11px] text-stone-400">
            Generated: {new Date(aiPlan.generatedAt).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Section 1: Themes */}
      {aiPlan?.themes && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4 text-[#3B1E48]" />
            <h2 className="text-sm font-bold text-stone-900">Creative Theme Concepts</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {aiPlan.themes.map((thm, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-5 shadow-xs"
              >
                <div>
                  <div className="text-sm font-bold text-[#3B1E48]">{thm.title}</div>
                  <p className="mt-1.5 text-xs text-stone-600 leading-relaxed">
                    {thm.description}
                  </p>

                  <div className="mt-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block mb-1">
                      Color Palette
                    </span>
                    <div className="flex items-center gap-2">
                      {thm.colorPalette.map((col, cIdx) => (
                        <span
                          key={cIdx}
                          className="h-5 w-5 rounded-full border border-stone-300 shadow-xs"
                          style={{ backgroundColor: col }}
                          title={col}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block mb-1">
                      Tangible Decor Ideas
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-xs text-stone-600">
                      {thm.decorIdeas.map((idea, iIdx) => (
                        <li key={iIdx}>{idea}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => handleAdoptTheme(thm.title)}
                  className="mt-4 w-full rounded-lg border border-stone-200 bg-stone-50 py-1.5 text-xs font-semibold text-stone-800 hover:bg-stone-100"
                >
                  Adopt as Event Theme
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Menu Recommendations & Cake Specs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Menu Ideas */}
        <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Utensils className="h-4 w-4 text-amber-600" />
            <h2 className="text-sm font-bold text-stone-900">Curated Menu Curation</h2>
          </div>

          <div className="mt-4 space-y-3">
            {aiPlan?.menuSuggestions.map((item, idx) => (
              <div key={idx} className="rounded-lg border border-stone-200 bg-stone-50/50 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900">{item.name}</span>
                  <span className="text-[10px] uppercase font-semibold text-[#3B1E48]">
                    {item.course}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-stone-500">
                  <span>Dietary: {item.dietary}</span>
                  <span aria-hidden="true">·</span>
                  <span>Portion: {item.suggestedPortionPerPerson}</span>
                </div>
                {item.notes && <p className="mt-1 text-xs text-stone-600">{item.notes}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Cake Specifications */}
        <div className="space-y-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-amber-200/60 pb-3">
              <Cake className="h-4 w-4 text-amber-700" />
              <h2 className="text-sm font-bold text-amber-950">Cake Recommendation</h2>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <span className="text-[10px] uppercase text-amber-800 font-semibold block">
                  Recommended Weight
                </span>
                <span className="text-2xl font-bold font-mono text-amber-950">
                  {aiPlan?.cakeRecommendation.recommendedWeightKg || 3.5} kg
                </span>
              </div>

              <div>
                <span className="text-[10px] uppercase text-amber-800 font-semibold block">
                  Pairing Flavors
                </span>
                <ul className="list-disc list-inside text-xs text-amber-900 mt-0.5">
                  {aiPlan?.cakeRecommendation.flavors.map((flv, idx) => (
                    <li key={idx}>{flv}</li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-[10px] uppercase text-amber-800 font-semibold block">
                  Design Notes
                </span>
                <p className="text-xs text-amber-900 mt-0.5">
                  {aiPlan?.cakeRecommendation.designNotes}
                </p>
              </div>
            </div>
          </div>

          {/* Cost Saving Advice */}
          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
              <TrendingDown className="h-4 w-4 text-emerald-600" />
              <h2 className="text-sm font-bold text-stone-900">Actionable Cost-Saving Tips</h2>
            </div>

            <ul className="mt-4 space-y-2 text-xs text-stone-700">
              {aiPlan?.costSavingTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
