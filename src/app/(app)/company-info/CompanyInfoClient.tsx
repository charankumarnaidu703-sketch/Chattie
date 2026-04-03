'use client';

import { useState, useEffect, useCallback } from 'react';
import { Building2, Save, Loader2, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getSupabaseClient } from '@/lib/supabase/client';

type KnowledgeRow = {
  id: string;
  category: string;
  key: string;
  value: string;
};

type SectionConfig = {
  category: string;
  title: string;
  icon: string;
  fields: { key: string; label: string; type: 'input' | 'textarea'; placeholder: string }[];
};

const SECTIONS: SectionConfig[] = [
  {
    category: 'company_info',
    title: 'Bedrijfsgegevens',
    icon: '🏢',
    fields: [
      { key: 'name', label: 'Bedrijfsnaam', type: 'input', placeholder: 'Bijv. GreenScape Tuinontwerp' },
      { key: 'owner', label: 'Eigenaar', type: 'input', placeholder: 'Bijv. Jan de Vries' },
      { key: 'phone', label: 'Telefoonnummer', type: 'input', placeholder: 'Bijv. 06-12345678' },
      { key: 'website', label: 'Website', type: 'input', placeholder: 'Bijv. www.greenscape.nl' },
    ],
  },
  {
    category: 'services',
    title: 'Diensten',
    icon: '🌿',
    fields: [
      { key: 'list', label: 'Overzicht diensten', type: 'textarea', placeholder: 'Bijv. Tuinontwerp, aanleg, onderhoud, bestrating, schuttingen, boomverzorging...' },
    ],
  },
  {
    category: 'service_area',
    title: 'Werkgebied',
    icon: '📍',
    fields: [
      { key: 'regions', label: 'Regio\'s', type: 'textarea', placeholder: 'Bijv. Amsterdam, Haarlem, Amstelveen en omgeving' },
    ],
  },
  {
    category: 'pricing',
    title: 'Prijsindicaties',
    icon: '💰',
    fields: [
      { key: 'indication', label: 'Prijsindicaties', type: 'textarea', placeholder: 'Bijv. Tuinrenovatie vanaf €35/m², onderhoud vanaf €45/uur' },
    ],
  },
  {
    category: 'signature',
    title: 'E-mail handtekening',
    icon: '✍️',
    fields: [
      { key: 'default', label: 'Standaard handtekening', type: 'textarea', placeholder: 'Met vriendelijke groet,\n\n[Naam]\n[Bedrijf]\nTel: [Nummer]\nWebsite: [URL]' },
    ],
  },
];

export default function CompanyInfoClient({ initialData }: { initialData: KnowledgeRow[] }) {
  const supabase = getSupabaseClient();
  const [data, setData] = useState<Record<string, Record<string, string>>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initialize form state from database rows
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
    setData((prev) => ({
      ...prev,
      [category]: { ...prev[category], [key]: value },
    }));
  };

  const saveSection = async (section: SectionConfig) => {
    setSaving(section.category);
    setError(null);
    try {
      for (const field of section.fields) {
        const value = getValue(section.category, field.key);
        // Check if row exists
        const { data: existing, error: selectError } = await supabase
          .from('company_knowledge')
          .select('id')
          .eq('category', section.category)
          .eq('key', field.key)
          .maybeSingle();

        if (selectError) {
          setError(`Fout: ${selectError.message}. Heb je de SQL migratie al uitgevoerd?`);
          return;
        }

        if (existing) {
          const { error: updateError } = await supabase
            .from('company_knowledge')
            .update({ value })
            .eq('id', existing.id);
          if (updateError) { setError(`Opslaan mislukt: ${updateError.message}`); return; }
        } else {
          const { error: insertError } = await supabase
            .from('company_knowledge')
            .insert({ category: section.category, key: field.key, value });
          if (insertError) { setError(`Opslaan mislukt: ${insertError.message}`); return; }
        }
      }
      setSaved(section.category);
      setTimeout(() => setSaved(null), 2000);
    } catch (err) {
      setError(`Onverwachte fout: ${err instanceof Error ? err.message : 'Onbekend'}`);
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="h-6 w-6 text-green-500" />
          Bedrijfsinformatie
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Deze informatie wordt gebruikt door de AI voor e-mail concepten en klantgesprekken.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          <strong>⚠️ Fout:</strong> {error}
        </div>
      )}

      {/* Sections */}
      {SECTIONS.map((section) => (
        <Card key={section.category}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <span>{section.icon}</span>
              {section.title}
            </CardTitle>
            <Button
              size="sm"
              onClick={() => saveSection(section)}
              disabled={saving === section.category}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {saving === section.category ? (
                <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Opslaan...</>
              ) : saved === section.category ? (
                <><Check className="h-4 w-4 mr-1" /> Opgeslagen!</>
              ) : (
                <><Save className="h-4 w-4 mr-1" /> Opslaan</>
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {section.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                {field.type === 'input' ? (
                  <Input
                    value={getValue(section.category, field.key)}
                    onChange={(e) => setValue(section.category, field.key, e.target.value)}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <Textarea
                    value={getValue(section.category, field.key)}
                    onChange={(e) => setValue(section.category, field.key, e.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                  />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
