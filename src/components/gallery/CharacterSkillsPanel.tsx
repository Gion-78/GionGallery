import { useState, useEffect } from 'react';
import { Eye, Download, X } from 'lucide-react';
import { GalleryItem } from '../../types/gallery';

// Define types for sort options
type SortField = 'date' | 'alphabetical';
type SortDirection = 'asc' | 'desc';

interface SortOption {
  field: SortField;
  direction: SortDirection;
}

// Empty array - data will be loaded from API or other source in production
const mockSkillsData: GalleryItem[] = [];

// Get skills content from localStorage
const getSkillsData = (): GalleryItem[] => {
  try {
    const storedContent = localStorage.getItem('siteContent');
    if (storedContent) {
      const parsedContent = JSON.parse(storedContent);
      console.log('Parsed content for Skills panel:', parsedContent);
      
      // Convert the stored content format to GalleryItem format
      const contentItems = parsedContent
        .filter((item: any) => {
          // Try multiple matching strategies
          const exactMatch = item.category === 'Skills' && item.imageUrl;
          const sectionMatch = item.section === 'Artwork' && item.category === 'Skills' && item.imageUrl;
          const titleMatch = (item.title?.toLowerCase()?.includes('skill') || 
                             item.description?.toLowerCase()?.includes('skill')) && 
                             item.imageUrl;
          
          const matches = exactMatch || sectionMatch || titleMatch;
          
          console.log(`Skills check for item: ${item.title}`, {
            exactMatch,
            sectionMatch,
            titleMatch,
            matches
          });
          
          return matches;
        })
        .map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          category: 'Skills',
          imageUrl: item.imageUrl,
          downloadUrl: item.zipUrl || item.imageUrl,
          dateAdded: item.dateAdded || item.date || item.createdAt || new Date().toISOString(), // Use any available date field
          tags: []
        }));

      console.log('Filtered Skills items:', contentItems);
      return [...contentItems, ...mockSkillsData];
    }
  } catch (error) {
    console.error('Error loading skills content:', error);
  }
  return mockSkillsData;
};

interface CharacterSkillsPanelProps {
  searchQuery: string;
  sortOption?: SortOption;
}

const CharacterSkillsPanel = ({ 
  searchQuery, 
  sortOption = { field: 'date', direction: 'desc' } 
}: CharacterSkillsPanelProps) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  
  // Load skills data initially
  useEffect(() => {
    const loadAndFilterItems = () => {
      // Get all skills
      let skillsItems = getSkillsData();
      
      // Filter based on search query
      if (searchQuery) {
        skillsItems = skillsItems.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Sort items based on sortOption
      const sortedItems = [...skillsItems].sort((a, b) => {
        if (sortOption.field === 'date') {
          // Parse dates with error handling
          const getValidDate = (dateStr: string | undefined): number => {
            if (!dateStr) return 0;
            try {
              const timestamp = Date.parse(dateStr);
              return isNaN(timestamp) ? 0 : timestamp;
            } catch {
              return 0;
            }
          };
          
          const dateATime = getValidDate(a.dateAdded);
          const dateBTime = getValidDate(b.dateAdded);
          
          // If we can't get valid dates, fall back to alphabetical
          if (dateATime === 0 && dateBTime === 0) {
            return sortOption.direction === 'asc'
              ? a.title.localeCompare(b.title)
              : b.title.localeCompare(a.title);
          }
          
          return sortOption.direction === 'asc' 
            ? dateATime - dateBTime 
            : dateBTime - dateATime;
        } else {
          // Alphabetical sorting
          return sortOption.direction === 'asc'
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        }
      });
      
      setItems(sortedItems);
    };
    
    loadAndFilterItems();
  }, [searchQuery, sortOption]);
  
  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      // Get all skills
      let skillsItems = getSkillsData();
      
      // Filter based on search query
      if (searchQuery) {
        skillsItems = skillsItems.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Sort items based on sortOption
      const sortedItems = [...skillsItems].sort((a, b) => {
        if (sortOption.field === 'date') {
          // Parse dates with error handling
          const getValidDate = (dateStr: string | undefined): number => {
            if (!dateStr) return 0;
            try {
              const timestamp = Date.parse(dateStr);
              return isNaN(timestamp) ? 0 : timestamp;
            } catch {
              return 0;
            }
          };
          
          const dateATime = getValidDate(a.dateAdded);
          const dateBTime = getValidDate(b.dateAdded);
          
          // If we can't get valid dates, fall back to alphabetical
          if (dateATime === 0 && dateBTime === 0) {
            return sortOption.direction === 'asc'
              ? a.title.localeCompare(b.title)
              : b.title.localeCompare(a.title);
          }
          
          return sortOption.direction === 'asc' 
            ? dateATime - dateBTime 
            : dateBTime - dateATime;
        } else {
          // Alphabetical sorting
          return sortOption.direction === 'asc'
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        }
      });
      
      setItems(sortedItems);
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storageUpdate', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageUpdate', handleStorageChange);
    };
  }, [searchQuery, sortOption]);

  const openLightbox = (item: GalleryItem) => {
    setSelectedItem(item);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedItem(null);
    document.body.style.overflow = 'auto';
  };

  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>, item: GalleryItem) => {
    e.preventDefault();
    
    try {
      // Fetch the content as a blob
      const response = await fetch(item.downloadUrl || item.imageUrl);
      const blob = await response.blob();
      
      // Determine if this is an image and set appropriate extension
      let filename = item.title;
      const url = item.downloadUrl || item.imageUrl;
      
      // For image files, ensure they have .jpg extension
      if (blob.type.startsWith('image/') && !item.downloadUrl?.toLowerCase().endsWith('.zip')) {
        // Remove any existing extension from the title
        filename = filename.replace(/\.(jpe?g|png|gif|webp|jfif|bmp)$/i, '');
        // Add jpg extension
        filename += '.jpg';
      }
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename; // Use the modified filename with extension
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.length > 0 ? (
          items.map((item) => (
            <div 
              key={item.id}
              className="group relative overflow-hidden rounded-lg mb-6"
              style={{ aspectRatio: '3/4' }}
            >
              <img 
                src={item.imageUrl} 
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openLightbox(item)}
                    className="p-2 bg-primary text-primary-foreground rounded-full"
                    aria-label="View skill"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <a 
                    href={item.downloadUrl || item.imageUrl} 
                    onClick={(e) => handleDownload(e, item)}
                    download={item.title}
                    className="p-2 bg-secondary text-secondary-foreground rounded-full"
                    aria-label="Download skill image"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">No items found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 bg-background/90 backdrop-blur-lg flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div 
            className="relative max-w-5xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedItem.imageUrl} 
              alt={selectedItem.title}
              className="w-full h-full object-contain"
            />
            <button 
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-2 bg-background/50 backdrop-blur-sm text-foreground rounded-full"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-background/70 backdrop-blur-sm p-4">
              <h3 className="text-lg font-semibold text-foreground">{selectedItem.title}</h3>
              <p className="text-sm text-muted-foreground">{selectedItem.description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CharacterSkillsPanel;
