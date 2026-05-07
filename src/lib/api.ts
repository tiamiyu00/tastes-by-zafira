import type { MenuItem, Settings } from '../types';
import supabase from './supabase';

const SETTINGS_ROW_ID = 'site-settings';

const defaultSettings: Settings = {
  whatsapp: '+2348120670667',
  deliveryFee: 1500,
  storeName: 'Tastes by Zafira',
};

export const fetchMenuItems = async (): Promise<MenuItem[]> => {
  const { data, error } = await supabase.from<MenuItem>('menu').select('*');
  if (error) throw error;
  return data ?? [];
};

export const createMenuItem = async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
  const newItem: MenuItem = { id: crypto.randomUUID(), ...item };
  const { data, error } = await supabase.from<MenuItem>('menu').insert([newItem]).single();
  if (error) throw error;
  if (!data) throw new Error('Failed to create menu item');
  return data;
};

export const updateMenuItem = async (id: string, item: Partial<Omit<MenuItem, 'id'>>): Promise<MenuItem> => {
  const { data, error } = await supabase.from<MenuItem>('menu').update(item).eq('id', id).single();
  if (error) throw error;
  if (!data) throw new Error('Failed to update menu item');
  return data;
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  const { error } = await supabase.from('menu').delete().eq('id', id);
  if (error) throw error;
};

export const fetchSettings = async (): Promise<Settings> => {
  const { data, error } = await supabase
    .from<Settings & { id: string }>('settings')
    .select('*')
    .eq('id', SETTINGS_ROW_ID)
    .maybeSingle();
  if (error) throw error;
  return data ?? defaultSettings;
};

export const saveSettings = async (settings: Settings): Promise<Settings> => {
  const { data, error } = await supabase
    .from<Settings & { id: string }>('settings')
    .upsert({ id: SETTINGS_ROW_ID, ...settings })
    .select()
    .single();
  if (error) throw error;
  if (!data) throw new Error('Failed to save settings');
  return data;
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
