'use client';

import React, { useState, useMemo } from 'react';
import { useEventContext } from '@/lib/context';
import { Vendor, VendorStatus } from '@/types/event';
import { formatCurrencyINR } from '@/lib/calculators';
import {
  Briefcase,
  Plus,
  Trash2,
  Phone,
  Mail,
  User,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

const VENDOR_CATEGORIES = [
  'Catering',
  'Venue',
  'Decoration',
  'Cake & Bakery',
  'Photography',
  'Entertainment',
  'Transportation',
  'Other',
];

export function VendorsView() {
  const { vendors, addVendor, updateVendor, deleteVendor } = useEventContext();

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // New Vendor Form
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Catering');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [quotedAmount, setQuotedAmount] = useState<number>(5000);
  const [status, setStatus] = useState<VendorStatus>('quoted');
  const [notes, setNotes] = useState('');

  const filteredVendors = useMemo(() => {
    if (filterCategory === 'all') return vendors;
    return vendors.filter((v) => v.category === filterCategory);
  }, [vendors, filterCategory]);

  const stats = useMemo(() => {
    const total = vendors.length;
    const booked = vendors.filter((v) => v.status === 'booked').length;
    const quoted = vendors.filter((v) => v.status === 'quoted').length;
    const totalCommitted = vendors
      .filter((v) => v.status === 'booked' || v.status === 'quoted')
      .reduce((sum, v) => sum + v.quotedAmount, 0);

    return { total, booked, quoted, totalCommitted };
  }, [vendors]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addVendor({
      name: name.trim(),
      category,
      contactPerson: contactPerson.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      quotedAmount,
      status,
      notes: notes.trim() || undefined,
    });

    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setNotes('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-stone-900 sm:text-2xl">
            Vendors & Quotations
          </h1>
          <p className="mt-1 text-xs text-stone-500">
            Track user-entered supplier quotes, contact details, and booking confirmations without fabricated rates.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-[#3B1E48] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#2D123A]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Vendor</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-stone-500">Tracked Vendors</div>
          <div className="mt-2 text-2xl font-bold text-stone-900 tabular-nums">
            {stats.total} Partners
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            {stats.booked} booked · {stats.quoted} quoted
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-stone-500">Booked Confirmed Total</div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 font-mono">
            {formatCurrencyINR(
              vendors
                .filter((v) => v.status === 'booked')
                .reduce((s, v) => s + v.quotedAmount, 0)
            )}
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            Firm contractual commitments
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
          <div className="text-xs font-semibold text-stone-500">Total Quoted Volume</div>
          <div className="mt-2 text-2xl font-bold text-stone-900 font-mono">
            {formatCurrencyINR(stats.totalCommitted)}
          </div>
          <div className="mt-1 text-[11px] text-stone-500">
            Across active proposals
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setFilterCategory('all')}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            filterCategory === 'all'
              ? 'bg-[#3B1E48] text-white shadow-xs'
              : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
          }`}
        >
          All ({vendors.length})
        </button>
        {VENDOR_CATEGORIES.map((cat) => {
          const count = vendors.filter((v) => v.category === cat).length;
          if (count === 0 && filterCategory !== cat) return null;
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filterCategory === cat
                  ? 'bg-[#3B1E48] text-white shadow-xs'
                  : 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredVendors.map((vendor) => (
          <div
            key={vendor.id}
            className="flex flex-col justify-between rounded-xl border border-stone-200 bg-white p-4 shadow-xs hover:border-stone-300"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                    {vendor.category}
                  </div>
                  <h3 className="mt-0.5 text-sm font-bold text-stone-900">{vendor.name}</h3>
                </div>

                <select
                  value={vendor.status}
                  onChange={(e) =>
                    updateVendor(vendor.id, { status: e.target.value as VendorStatus })
                  }
                  className={`rounded-md border border-stone-200 px-2 py-0.5 text-[11px] font-semibold ${
                    vendor.status === 'booked'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : vendor.status === 'quoted'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-stone-50 text-stone-700'
                  }`}
                  aria-label="Vendor Status"
                >
                  <option value="booked">Booked</option>
                  <option value="quoted">Quoted</option>
                  <option value="contacted">Contacted</option>
                  <option value="declined">Declined</option>
                </select>
              </div>

              <div className="mt-3 space-y-1 text-xs text-stone-600">
                {vendor.contactPerson && (
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-stone-400" />
                    <span>{vendor.contactPerson}</span>
                  </div>
                )}
                {vendor.phone && (
                  <div className="flex items-center gap-1.5 font-mono">
                    <Phone className="h-3.5 w-3.5 text-stone-400" />
                    <span>{vendor.phone}</span>
                  </div>
                )}
                {vendor.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-stone-400" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                )}
              </div>

              {vendor.notes && (
                <p className="mt-2 text-xs text-stone-500 bg-stone-50 p-2 rounded">
                  {vendor.notes}
                </p>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
              <div>
                <span className="text-[10px] text-stone-400 block">Quoted Amount</span>
                <span className="font-mono font-bold text-stone-900 text-sm">
                  {formatCurrencyINR(vendor.quotedAmount)}
                </span>
              </div>

              <button
                onClick={() => deleteVendor(vendor.id)}
                className="rounded p-1 text-stone-400 hover:bg-rose-50 hover:text-rose-600"
                title="Remove vendor"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredVendors.length === 0 && (
        <div className="rounded-xl border border-dashed border-stone-200 bg-white p-12 text-center text-xs text-stone-400">
          No vendors recorded in this category.
        </div>
      )}

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-md rounded-2xl border border-stone-200 bg-white p-5 shadow-2xl">
            <h3 className="text-base font-bold text-stone-900">Add Vendor Details</h3>
            <p className="mt-0.5 text-xs text-stone-500">
              Record user-supplied quotation and contact information.
            </p>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700">Vendor / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Boring Road Artisanal Bakery, Manoj Decors"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-900"
                  >
                    {VENDOR_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as VendorStatus)}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1.5 text-xs text-stone-900"
                  >
                    <option value="booked">Booked</option>
                    <option value="quoted">Quoted</option>
                    <option value="contacted">Contacted</option>
                    <option value="declined">Declined</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Sunil Kumar (Master Baker)"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98350 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700">Quoted Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={quotedAmount}
                    onChange={(e) => setQuotedAmount(Number(e.target.value))}
                    className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Notes & Delivery Commitments</label>
                <input
                  type="text"
                  placeholder="e.g. Cake delivery promised by 5 PM sharp at hall"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#3B1E48] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#2D123A]"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
