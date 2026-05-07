import type { MenuItem, Settings } from '../types';
import supabase from './supabase';

const SETTINGS_ROW_ID = 'site-settings';

const defaultSettings: Settings = {
  whatsapp: '+2348120670667',
  deliveryFee: 1500,
  storeName: 'Tastes by Zafira',
};

export const fetchMenuItems = async (): Promise<MenuItem[]> => {
  const { data, error } = await supabase.from('menu').select('*');
  if (error) throw error;
  return (data as MenuItem[]) ?? [];
};

export const createMenuItem = async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
  const newItem: MenuItem = { id: crypto.randomUUID(), ...item };
  const { data, error } = await supabase.from('menu').insert([newItem]).select().single();
  if (error) throw error;
  if (!data) throw new Error('Failed to create menu item');
  return data as MenuItem;
};

export const updateMenuItem = async (id: string, item: Partial<Omit<MenuItem, 'id'>>): Promise<MenuItem> => {
  const { data, error } = await supabase.from('menu').update(item).eq('id', id).select().single();
  if (error) throw error;
  if (!data) throw new Error('Failed to update menu item');
  return data as MenuItem;
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  const { error } = await supabase.from('menu').delete().eq('id', id);
  if (error) throw error;
};

export const fetchSettings = async (): Promise<Settings> => {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', SETTINGS_ROW_ID)
    .maybeSingle();
  if (error) throw error;
  return (data as (Settings & { id: string }) | null) ?? defaultSettings;
};

export const saveSettings = async (settings: Settings): Promise<Settings> => {
  const { data, error } = await supabase
    .from('settings')
    .upsert({ id: SETTINGS_ROW_ID, ...settings })
    .select()
    .single();
  if (error) throw error;
  if (!data) throw new Error('Failed to save settings');
  return data as Settings;
};

export const uploadImage = async (file: File): Promise<string> => {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from('menu-images').upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('menu-images').getPublicUrl(fileName);
  if (!data?.publicUrl) throw new Error('Unable to get image URL');
  return data.publicUrl;
};
