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
    console.log('Attempting to save content to Supabase:', content);
    
    // Convert camelCase to lowercase for Postgres compatibility
    const formattedContent = {
      id: content.id,
      title: content.title,
      description: content.description,
      section: content.section,
      category: content.category,
      subcategory: content.subcategory,
      imageurl: content.imageUrl,
      thumbnailurl: content.thumbnailUrl,
      zipurl: content.zipUrl,
      videourl: content.videoUrl,
      fileid: content.fileId,
      zipfileid: content.zipFileId,
      videofileid: content.videoFileId,
      videometadata: content.videoMetadata,
      createdat: content.createdAt,
      folder: content.folder
    };
    
    console.log('Formatted content for Supabase:', formattedContent);
    
    const { error } = await supabase
      .from('content')
      .insert(formattedContent);
    
    if (error) {
      console.error('Supabase error details:', error);
      throw error;
    }
    
    console.log('Content saved to Supabase successfully');
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
      .order('createdat', { ascending: false });
    
    if (error) throw error;
    
    // Convert database fields (lowercase) back to camelCase for our app
    const formattedData = data?.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      section: item.section,
      category: item.category,
      subcategory: item.subcategory,
      imageUrl: item.imageurl,
      thumbnailUrl: item.thumbnailurl,
      zipUrl: item.zipurl,
      videoUrl: item.videourl,
      fileId: item.fileid,
      zipFileId: item.zipfileid,
      videoFileId: item.videofileid,
      videoMetadata: item.videometadata,
      createdAt: item.createdat,
      folder: item.folder
    })) as ContentItem[];
    
    return { success: true, data: formattedData };
  } catch (error) {
    console.error('Error fetching content from Supabase:', error);
    return { success: false, error };
  }
};

export const updateContent = async (id: string, updates: Partial<ContentItem>): Promise<{success: boolean, error?: any}> => {
  try {
    // Convert camelCase fields to lowercase for PostgreSQL
    const formattedUpdates: Record<string, any> = {};
    
    // Map camelCase keys to lowercase keys
    if (updates.title !== undefined) formattedUpdates.title = updates.title;
    if (updates.description !== undefined) formattedUpdates.description = updates.description;
    if (updates.section !== undefined) formattedUpdates.section = updates.section;
    if (updates.category !== undefined) formattedUpdates.category = updates.category;
    if (updates.subcategory !== undefined) formattedUpdates.subcategory = updates.subcategory;
    if (updates.imageUrl !== undefined) formattedUpdates.imageurl = updates.imageUrl;
    if (updates.thumbnailUrl !== undefined) formattedUpdates.thumbnailurl = updates.thumbnailUrl;
    if (updates.zipUrl !== undefined) formattedUpdates.zipurl = updates.zipUrl;
    if (updates.videoUrl !== undefined) formattedUpdates.videourl = updates.videoUrl;
    if (updates.fileId !== undefined) formattedUpdates.fileid = updates.fileId;
    if (updates.zipFileId !== undefined) formattedUpdates.zipfileid = updates.zipFileId;
    if (updates.videoFileId !== undefined) formattedUpdates.videofileid = updates.videoFileId;
    if (updates.videoMetadata !== undefined) formattedUpdates.videometadata = updates.videoMetadata;
    if (updates.createdAt !== undefined) formattedUpdates.createdat = updates.createdAt;
    if (updates.folder !== undefined) formattedUpdates.folder = updates.folder;
    
    const { error } = await supabase
      .from('content')
      .update(formattedUpdates)
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