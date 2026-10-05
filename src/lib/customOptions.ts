import { supabase } from './supabase';

export type CustomOptionKind = 'service_type' | 'professional_title';

export async function fetchCustomOptions(kind: CustomOptionKind): Promise<string[]> {
  const { data, error } = await supabase
    .from('custom_option_values')
    .select('value')
    .eq('kind', kind)
    .order('value');

  if (error) {
    console.error('Failed to load custom options:', error);
    return [];
  }

  return (data || []).map((row) => row.value);
}

export async function saveCustomOption(kind: CustomOptionKind, value: string): Promise<void> {
  const trimmed = value.trim();
  if (!trimmed) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase
    .from('custom_option_values')
    .upsert(
      { kind, value: trimmed, created_by: user?.id ?? null },
      { onConflict: 'kind,value', ignoreDuplicates: true }
    );
}
