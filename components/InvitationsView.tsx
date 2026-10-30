'use client';

import React, { useState, useMemo } from 'react';
import { useEventContext } from '@/lib/context';
import { Mail, Copy, Check, Share2, Sparkles } from 'lucide-react';

export function InvitationsView() {
  const { activeEvent, showToast } = useEventContext();

  const [tone, setTone] = useState<'warm' | 'formal' | 'playful'>('warm');
  const [hostName, setHostName] = useState('Sharma Family');
  const [rsvpPhone, setRsvpPhone] = useState('+91 98350 12345');
  const [userEditedText, setUserEditedText] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generatedText = useMemo(() => {
    const eventName = activeEvent?.name || 'Celebration';
    const eventDate = activeEvent?.date
      ? new Date(activeEvent.date).toLocaleDateString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })
      : 'Upcoming Sunday';
    const eventTime = `${activeEvent?.startTime || '17:30'} onwards`;
    const eventLocation = activeEvent?.location || 'Boring Road Community Hall, Patna';

    if (tone === 'warm') {
      return `✨ You're Cordially Invited to Celebrate! ✨\n\nJoin us as we celebrate ${eventName}!\n\n📅 Date: ${eventDate}\n⏰ Time: ${eventTime}\n📍 Venue: ${eventLocation}\n\nYour presence, blessings, and laughter will make our evening truly unforgettable. Delicious food, sweet cake, and joy await!\n\nWarm regards,\n${hostName}\nRSVP: ${rsvpPhone}`;
    } else if (tone === 'formal') {
      return `The ${hostName} cordially requests the honour of your presence at the auspicious occasion of:\n\n${eventName.toUpperCase()}\n\non ${eventDate} at ${eventTime}.\n\nVenue: ${eventLocation}\n\nPlease grace the occasion and bless our celebration.\n\nRSVP: ${rsvpPhone}`;
    } else {
      return `🎉 It's Celebration Time! 🎉\n\nGet ready for non-stop fun, music, and cake! We're celebrating ${eventName} and we can't do it without you!\n\n🗓️ When: ${eventDate} @ ${eventTime}\n📍 Where: ${eventLocation}\n\nBring your best party spirit! See you there!\n\n- ${hostName}\nRSVP: ${rsvpPhone}`;
    }
  }, [tone, activeEvent, hostName, rsvpPhone]);

  const displayedText = userEditedText !== null ? userEditedText : generatedText;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayedText);
    setCopied(true);
    showToast('Invitation copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(displayedText);
    const url = `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
          Invitations & Copywriter
        </h1>
        <p className="mt-1 text-xs text-stone-500">
          Generate tone-adjusted invitations with verified event coordinates and one-click copy-to-clipboard.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Generator Controls */}
        <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-5 shadow-xs">
          <h2 className="text-xs font-bold text-stone-900">Customize Invitation Tone</h2>

          <div className="space-y-1.5">
            {[
              { id: 'warm', label: 'Warm & Festive', desc: 'Heartfelt, celebratory, welcoming' },
              { id: 'formal', label: 'Formal & Traditional', desc: 'Respectful, refined Indian elegance' },
              { id: 'playful', label: 'Playful & Casual', desc: 'Fun-filled party vibes, exclamation marks' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTone(t.id as any)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  tone === t.id
                    ? 'border-[#3B1E48] bg-[#3B1E48]/5 text-[#3B1E48]'
                    : 'border-stone-200 bg-stone-50/50 text-stone-700 hover:bg-stone-100/60'
                }`}
              >
                <div className="text-xs font-bold">{t.label}</div>
                <div className="text-[10px] text-stone-500">{t.desc}</div>
              </button>
            ))}
          </div>

          <div className="space-y-3 pt-2 border-t border-stone-100">
            <div>
              <label className="block text-[11px] font-semibold text-stone-700">
                Host / Family Signature
              </label>
              <input
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="e.g. Sharma Family, Aarav & Parents"
                className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-700">
                RSVP Contact Phone / WhatsApp
              </label>
              <input
                type="text"
                value={rsvpPhone}
                onChange={(e) => setRsvpPhone(e.target.value)}
                placeholder="+91 98350 12345"
                className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-900 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Editable Preview */}
        <div className="space-y-4 rounded-xl border border-stone-200 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#3B1E48]" />
              <h2 className="text-xs font-bold text-stone-900">Generated Invitation Copy</h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-stone-500" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>

              <button
                onClick={handleWhatsAppShare}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Share via WhatsApp</span>
              </button>
            </div>
          </div>

          <textarea
            rows={12}
            value={displayedText}
            onChange={(e) => setUserEditedText(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-stone-50/50 p-4 font-mono text-xs leading-relaxed text-stone-900 focus:bg-white focus:outline-hidden"
          />

          <div className="rounded-lg bg-stone-50 p-3 text-[11px] text-stone-500">
            📌 Notice: Messages are prepared for sharing via clipboard or direct WhatsApp web links. No automated mass unsolicited messages are sent without host review.
          </div>
        </div>
      </div>
    </div>
  );
}
