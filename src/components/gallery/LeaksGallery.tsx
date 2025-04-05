import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

// Define types for sort options
type SortField = 'date' | 'alphabetical';
type SortDirection = 'asc' | 'desc';

interface SortOption {
  field: SortField;
  direction: SortDirection;
}

interface GalleryItem {
  id: string | number;
  title: string;
  description: string;
  imageUrl: string;
  downloadUrl?: string;
  dateAdded?: string; // ISO date string for sorting by date
}

interface LeaksGalleryProps {
  category: 'Main Leaks' | 'Beta Leaks';
  searchQuery?: string;
  sortOption?: SortOption;
  onTotalItemsChange?: (total: number) => void;
}

const LeaksGallery: React.FC<LeaksGalleryProps> = ({
  category,
  searchQuery = '',
  sortOption = { field: 'date', direction: 'desc' },
  onTotalItemsChange
}) => {
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    // Function to load and filter leak items
    const loadLeakItems = () => {
      try {
        const storedContent = localStorage.getItem('siteContent');
        if (!storedContent) {
          setItems([]);
          onTotalItemsChange?.(0);
          return;
        }

        const parsedContent = JSON.parse(storedContent);

        // Extract all Leaks for the specified category using various matching techniques
        const leakItems = parsedContent
          .filter((item: any) => {
            // Various matching approaches
            const exactMatch = item.category === category && item.section === 'Leaks' && item.imageUrl;
            const relaxedMatch = item.category === category && item.imageUrl;
            const titleMatch = item.title?.toLowerCase().includes(category.toLowerCase()) && item.imageUrl;

            return exactMatch || relaxedMatch || titleMatch;
          })
          .map((item: any) => ({
            id: item.id,
            title: item.title || 'Untitled',
            description: item.description || '',
            imageUrl: item.imageUrl,
            downloadUrl: item.zipUrl || item.imageUrl,
            dateAdded: item.dateAdded || item.date || item.createdAt || new Date().toISOString() // Use any available date field
          }));

        // Filter by search query if provided
        const filteredItems = searchQuery
          ? leakItems.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
          : leakItems;

        // Sort items based on sortOption
        const sortedItems = [...filteredItems].sort((a, b) => {
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

        console.log(`LeaksGallery found ${sortedItems.length} items for ${category}`);

        setItems(sortedItems);
        onTotalItemsChange?.(sortedItems.length);
      } catch (error) {
        console.error('Error loading leak content:', error);
        setItems([]);
        onTotalItemsChange?.(0);
      }
    };

    loadLeakItems();
  }, [category, searchQuery, sortOption, onTotalItemsChange]);

  // Handle storage events
  useEffect(() => {
    const handleStorageChange = () => {
      // Get all leaks for this category
      try {
        const storedContent = localStorage.getItem('siteContent');
        if (!storedContent) {
          setItems([]);
          onTotalItemsChange?.(0);
          return;
        }

        const parsedContent = JSON.parse(storedContent);

        // Extract all Leaks for the specified category
        const leakItems = parsedContent
          .filter((item: any) => {
            // Various matching approaches
            const exactMatch = item.category === category && item.section === 'Leaks' && item.imageUrl;
            const relaxedMatch = item.category === category && item.imageUrl;
            const titleMatch = item.title?.toLowerCase().includes(category.toLowerCase()) && item.imageUrl;

            return exactMatch || relaxedMatch || titleMatch;
          })
          .map((item: any) => ({
            id: item.id,
            title: item.title || 'Untitled',
            description: item.description || '',
            imageUrl: item.imageUrl,
            downloadUrl: item.zipUrl || item.imageUrl,
            dateAdded: item.dateAdded || item.date || item.createdAt || new Date().toISOString() // Use any available date field
          }));

        // Filter by search query if provided
        const filteredItems = searchQuery
          ? leakItems.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
          )
          : leakItems;

        // Sort items based on sortOption
        const sortedItems = [...filteredItems].sort((a, b) => {
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
        onTotalItemsChange?.(sortedItems.length);
      } catch (error) {
        console.error('Error updating leak content:', error);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storageUpdate', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageUpdate', handleStorageChange);
    };
  }, [category, searchQuery, sortOption, onTotalItemsChange]);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 mx-auto">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className="image-section group relative overflow-hidden p-3 rounded-lg flex justify-center items-center border border-primary/30 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300"
              style={{ 
                width: '100%', 
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                height: '220px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="max-w-full object-contain transition-transform duration-500"
                style={{ maxHeight: '180px', maxWidth: '90%', margin: 'auto' }}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                <div className="flex gap-2">
                  <a
                    href={item.downloadUrl || item.imageUrl}
                    onClick={(e) => handleDownload(e, item)}
                    download={item.title}
                    className="p-2 bg-secondary text-secondary-foreground rounded-full"
                    aria-label="Download image"
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
    </>
  );
};

export default LeaksGallery; 