'use client';

import { useState, useEffect, useCallback } from 'react';
import { Building2, Save, Loader2, Check } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase/client';

type KnowledgeRow = { id: string; category: string; key: string; value: string };

type SectionConfig = {
  category: string;
  title: string;
  icon: string;
  fields: { key: string; label: string; type: 'input' | 'textarea'; placeholder: string }[];
};

const SECTIONS: SectionConfig[] = [
  {
    category: 'company_info',
    title: 'Company Details',
    icon: '🏢',
    fields: [
      { key: 'name', label: 'Company Name', type: 'input', placeholder: 'e.g., GreenScape Landscaping' },
      { key: 'owner', label: 'Owner', type: 'input', placeholder: 'e.g., John Doe' },
      { key: 'phone', label: 'Phone Number', type: 'input', placeholder: 'e.g., 06-12345678' },
      { key: 'website', label: 'Website', type: 'input', placeholder: 'e.g., www.greenscape.nl' },
    ],
  },
  {
    category: 'services',
    title: 'Services',
    icon: '🌿',
    fields: [
      { key: 'list', label: 'Services Overview', type: 'textarea', placeholder: 'e.g., Garden design, installation, maintenance, paving, fencing, tree care...' },
    ],
  },
  {
    category: 'service_area',
    title: 'Service Area',
    icon: '📍',
    fields: [
      { key: 'regions', label: 'Regions', type: 'textarea', placeholder: 'e.g., Amsterdam, Haarlem, Amstelveen and surrounding areas' },
    ],
  },
  {
    category: 'pricing',
    title: 'Price Indications',
    icon: '💰',
    fields: [
      { key: 'indication', label: 'Price Indications', type: 'textarea', placeholder: 'e.g., Garden renovation from €35/m², maintenance from €45/hour' },
    ],
  },
  {
    category: 'signature',
    title: 'Email Signature',
    icon: '✍️',
    fields: [
      { key: 'default', label: 'Default Signature', type: 'textarea', placeholder: 'Kind regards,\n\n[Name]\n[Company]\nTel: [Number]\nWebsite: [URL]' },
    ],
  },
];

export default function CompanyInfoClient({ initialData }: { initialData: KnowledgeRow[] }) {
  const supabase = getSupabaseClient();
  const [data, setData] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const grouped: Record<string, Record<string, string>> = {};
    for (const row of initialData) {
      if (!grouped[row.category]) grouped[row.category] = {};
      grouped[row.category][row.key] = row.value;
    }
    setData(grouped);
  }, [initialData]);

  const getValue = useCallback((category: string, key: string) => {
    return data[category]?.[key] || '';
  }, [data]);

  const setValue = (category: string, key: string, value: string) => {
    setData((prev) => ({ ...prev, [category]: { ...prev[category], [key]: value } }));
  };

  const saveSection = async (section: SectionConfig) => {
    setSaving(section.category);
    setError(null);
    try {
      for (const field of section.fields) {
        const value = getValue(section.category, field.key);
        const { data: existing, error: selectError } = await supabase
          .from('company_knowledge')
          .select('id')
          .eq('category', section.category)
          .eq('key', field.key)
          .maybeSingle();

        if (selectError) { setError(`Error: ${selectError.message}`); return; }

        if (existing) {
          const { error: e } = await supabase.from('company_knowledge').update({ value }).eq('id', existing.id);
          if (e) { setError(`Save failed: ${e.message}`); return; }
        } else {
          const { error: e } = await supabase.from('company_knowledge').insert({ category: section.category, key: field.key, value });
          if (e) { setError(`Save failed: ${e.message}`); return; }
        }
      }
      setSaved(section.category);
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      setError(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown'}`);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6 fade-in-content">
      {/* Header */}
      <div>
        <h1 className="font-headline font-extrabold text-2xl tracking-tight text-on-background flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          Company Information
        </h1>
        <p className="font-label text-xs text-outline mt-1">
          This information is used by the AI for email drafts and client conversations.
        </p>
      </div>

      <div className="bg-surface-container-low h-[1px] w-full" />

      {error && (
        <div className="bg-error-container/30 border-l-4 border-error p-4 rounded-xl text-sm text-on-error-container">
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {SECTIONS.map((section) => (
        <div
          key={section.category}
          className="bg-surface-container-lowest p-6 rounded-[1.5rem] shadow-ambient"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-headline font-bold text-lg text-on-background flex items-center gap-2">
              <span>{section.icon}</span> {section.title}
            </h2>
            <button
              onClick={() => saveSection(section)}
              disabled={saving === section.category}
              className="bg-primary hover:bg-primary-container text-on-primary text-xs font-bold px-4 py-2 rounded-full transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {saving === section.category ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...</>
              ) : saved === section.category ? (
                <><Check className="h-3.5 w-3.5" /> Saved!</>
              ) : (
                <><Save className="h-3.5 w-3.5" /> Save</>
              )}
            </button>
          </div>

          <div className="space-y-4">
            {section.fields.map((field) => {
              const uniqueId = `${section.category}-${field.key}`;
              return (
                <div key={field.key}>
                  <label htmlFor={uniqueId} className="block font-label text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    {field.label}
                  </label>
                  {field.type === 'input' ? (
                    <input
                      id={uniqueId}
                      type="text"
                      value={getValue(section.category, field.key)}
                      onChange={(e) => setValue(section.category, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm font-medium text-on-background placeholder:text-on-surface-variant/50 border-none outline-none focus:ring-2 focus:ring-primary/20 min-h-[44px]"
                    />
                  ) : (
                    <textarea
                      id={uniqueId}
                      value={getValue(section.category, field.key)}
                      onChange={(e) => setValue(section.category, field.key, e.target.value)}
                      placeholder={field.placeholder}
                      rows={4}
                      className="w-full bg-surface-container-highest rounded-xl px-4 py-3 text-sm font-medium text-on-background placeholder:text-on-surface-variant/50 border-none outline-none focus:ring-2 focus:ring-primary/20 resize-none min-h-[44px]"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
