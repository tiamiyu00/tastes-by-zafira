import type { Session } from '@supabase/supabase-js';
import type { MenuItem, Settings, Order, OrderStatus } from '../types';
import supabase from './supabase';

const SETTINGS_ROW_ID = 'site-settings';

const defaultSettings: Settings = {
  whatsapp: '+2348120670667',
  deliveryFee: 1500,
  storeName: 'Tastes by Zafira',
};

// ——— Auth ———

export const signIn = async (email: string, password: string): Promise<void> => {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
};

export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getSession = async (): Promise<Session | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

export const subscribeAuthChanges = (cb: (session: Session | null) => void) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => cb(s));
  return subscription;
};

// ——— Menu ———

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

// ——— Settings ———

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

// ——— Orders ———

export const createOrder = async (order: Omit<Order, 'id' | 'created_at'>): Promise<Order> => {
  const newOrder = { id: crypto.randomUUID(), ...order };
  const { data, error } = await supabase.from('orders').insert([newOrder]).select().single();
  if (error) throw error;
  return data as Order;
};

export const fetchOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as Order[]) ?? [];
};

export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<void> => {
  const { error } = await supabase.from('orders').update({ status }).eq('id', id);
  if (error) throw error;
};

// ——— Storage ———

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
