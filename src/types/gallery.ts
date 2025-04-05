export interface GalleryItem {
  id: number | string;
  title: string;
  description: string;
  imageUrl: string;
  downloadUrl?: string;
  videoUrl?: string;
  category: string;
  date?: string;
  dateAdded?: string; // ISO date string for sorting by date
  size?: { width: number; height: number };
  tags?: string[];
  videoMetadata?: {
    originalSize: number;
    originalName: string;
    originalType: string;
  };
}
