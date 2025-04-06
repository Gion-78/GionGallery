import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Convert a number to a readable number with correct units (e.g. 1000 -> 1K)
export function formatNumber(num: number): string {
  return Intl.NumberFormat('en-US', { notation: 'compact' }).format(num);
}

// Helper to dispatch storage events
export function triggerStorageUpdate() {
  // Dispatch a custom event that our components can listen for
  const event = new Event('storageUpdate');
  window.dispatchEvent(event);
  
  // Also dispatch a storage event for backwards compatibility
  window.dispatchEvent(new Event('storage'));
}

// Delete content from localStorage by ID
export function deleteContent(contentId: string): boolean {
  try {
    // Get existing content
    const siteContentJSON = localStorage.getItem('siteContent');
    if (!siteContentJSON) return false;
    
    const siteContent = JSON.parse(siteContentJSON);
    const contentIndex = siteContent.findIndex((item: any) => item.id === contentId);
    
    // If content not found, return false
    if (contentIndex === -1) return false;
    
    // Store the deleted item's info
    const deletedItem = siteContent[contentIndex];
    
    // Remove the content item
    siteContent.splice(contentIndex, 1);
    localStorage.setItem('siteContent', JSON.stringify(siteContent));
    
    // If it's a banner, also remove from banners
    if (deletedItem.section === 'Banner Slider') {
      const bannersJSON = localStorage.getItem('banners');
      if (bannersJSON) {
        const banners = JSON.parse(bannersJSON);
        const bannerIndex = banners.findIndex((item: any) => item.id === contentId);
        if (bannerIndex !== -1) {
          banners.splice(bannerIndex, 1);
          localStorage.setItem('banners', JSON.stringify(banners));
        }
      }
    }
    
    // Trigger updates
    triggerStorageUpdate();
    
    return true;
  } catch (error) {
    console.error('Error deleting content:', error);
    return false;
  }
}

// Clear all cached content from localStorage
export function clearLocalStorageCache(): boolean {
  try {
    // Clear siteContent
    localStorage.removeItem('siteContent');
    
    // Clear banners specifically
    localStorage.removeItem('banners');
    
    // Clear other potential content caches
    localStorage.removeItem('content');
    localStorage.removeItem('contentItems');
    localStorage.removeItem('galleryItems');
    
    // Trigger updates
    triggerStorageUpdate();
    
    console.log('Successfully cleared all content cache from localStorage');
    return true;
  } catch (error) {
    console.error('Error clearing localStorage cache:', error);
    return false;
  }
}
