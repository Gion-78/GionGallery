import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project URL and anon key once created
const supabaseUrl = 'https://qgchmybzgccewmpkjxff.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnY2hteWJ6Z2NjZXdtcGtqeGZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5MTE0MTEsImV4cCI6MjA1OTQ4NzQxMX0.mskZdIT7ZadWqh3Ag7kcTloXAQSA_BY_W7IVhkU3zjw';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Content metadata interfaces
export interface ContentItem {
  id: string;
  title: string;
  description: string;
  section: string;
  category: string;
  subcategory?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  zipUrl?: string;
  videoUrl?: string;
  fileId?: string;
  zipFileId?: string;
  videoFileId?: string;
  videoMetadata?: {
    originalSize: number;
    originalName: string;
    originalType: string;
  };
  createdAt: string;
  folder: string;
}

// Content operations
export const saveContent = async (content: ContentItem): Promise<{success: boolean, error?: any}> => {
  try {
    const { error } = await supabase
      .from('content')
      .insert(content);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error saving content to Supabase:', error);
    return { success: false, error };
  }
};

export const getAllContent = async (): Promise<{success: boolean, data?: ContentItem[], error?: any}> => {
  try {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) throw error;
    
    return { success: true, data: data as ContentItem[] };
  } catch (error) {
    console.error('Error fetching content from Supabase:', error);
    return { success: false, error };
  }
};

export const updateContent = async (id: string, updates: Partial<ContentItem>): Promise<{success: boolean, error?: any}> => {
  try {
    const { error } = await supabase
      .from('content')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error updating content in Supabase:', error);
    return { success: false, error };
  }
};

export const deleteContent = async (id: string): Promise<{success: boolean, error?: any}> => {
  try {
    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting content from Supabase:', error);
    return { success: false, error };
  }
}; 