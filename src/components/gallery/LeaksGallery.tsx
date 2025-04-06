import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { getAllContent } from '../../lib/supabase';

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
  currentPage?: number;
  itemsPerPage?: number;
  onTotalItemsChange?: (total: number) => void;
}

const LeaksGallery: React.FC<LeaksGalleryProps> = ({
  category,
  searchQuery = '',
  sortOption = { field: 'date', direction: 'desc' },
  currentPage = 1,
  itemsPerPage = 8,
  onTotalItemsChange
}) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [allItems, setAllItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Function to load and filter leak items
    const loadLeakItems = async () => {
      setLoading(true);
      try {
        // Try to fetch from Supabase first
        const supabaseResult = await getAllContent();
        
        if (supabaseResult.success && supabaseResult.data) {
          console.log(`LeaksGallery: Fetched data from Supabase for ${category}`);
          const parsedContent = supabaseResult.data;
          
          // Extract all Leaks for the specified category using various matching techniques
          const leakItems = parsedContent
            .filter((item: any) => {
              // Various matching approaches
              const exactMatch = item.category === category && item.section === 'Leaks' && item.imageUrl;
              const relaxedMatch = item.category === category && item.imageUrl;
              const titleMatch = item.title?.toLowerCase().includes(category.toLowerCase()) && item.imageUrl;
              
              // For debugging
              if (exactMatch || relaxedMatch || titleMatch) {
                console.log(`LeaksGallery: Found match for ${item.title} in ${category}`, {
                  exactMatch,
                  relaxedMatch,
                  titleMatch,
                  category: item.category,
                  section: item.section
                });
              }

              return exactMatch || relaxedMatch || titleMatch;
            })
            .map((item: any) => ({
              id: item.id,
              title: item.title || 'Untitled',
              description: item.description || '',
              imageUrl: item.imageUrl,
              downloadUrl: item.zipUrl || item.imageUrl,
              dateAdded: item.dateAdded || item.date || item.createdAt || new Date().toISOString()
            }));

          processAndSetItems(leakItems);
          return;
        } else {
          console.log('LeaksGallery: Failed to get data from Supabase, falling back to localStorage');
        }
        
        // Fallback to localStorage if Supabase fails
        const storedContent = localStorage.getItem('siteContent');
        if (!storedContent) {
          setAllItems([]);
          setItems([]);
          onTotalItemsChange?.(0);
          setLoading(false);
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
            dateAdded: item.dateAdded || item.date || item.createdAt || new Date().toISOString() 
          }));

        processAndSetItems(leakItems);
      } catch (error) {
        console.error('Error loading leak content:', error);
        setAllItems([]);
        setItems([]);
        onTotalItemsChange?.(0);
        setLoading(false);
      }
    };
    
    // Helper function to process and set items (used by both Supabase and localStorage paths)
    const processAndSetItems = (leakItems: GalleryItem[]) => {
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

      // Store all sorted items
      setAllItems(sortedItems);
      
      // Calculate pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedItems = sortedItems.slice(startIndex, endIndex);
      
      // Set the paginated items to display
      setItems(paginatedItems);
      
      // Report total items for pagination
      onTotalItemsChange?.(sortedItems.length);
      setLoading(false);
    };

    loadLeakItems();
  }, [category, searchQuery, sortOption, currentPage, itemsPerPage, onTotalItemsChange]);

  // Handle storage events
  useEffect(() => {
    const handleStorageChange = async () => {
      // First try to get from Supabase on storage change
      try {
        const supabaseResult = await getAllContent();
        if (supabaseResult.success && supabaseResult.data) {
          const parsedContent = supabaseResult.data;
          
          // Extract all Leaks for the specified category
          const leakItems = parsedContent
            .filter((item: any) => {
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
              dateAdded: item.dateAdded || item.date || item.createdAt || new Date().toISOString()
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

              if (dateATime === 0 && dateBTime === 0) {
                return sortOption.direction === 'asc'
                  ? a.title.localeCompare(b.title)
                  : b.title.localeCompare(a.title);
              }

              return sortOption.direction === 'asc'
                ? dateATime - dateBTime
                : dateBTime - dateATime;
            } else {
              return sortOption.direction === 'asc'
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title);
            }
          });

          // Store all sorted items
          setAllItems(sortedItems);
          
          // Calculate pagination
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const paginatedItems = sortedItems.slice(startIndex, endIndex);
          
          // Set the paginated items to display
          setItems(paginatedItems);
          
          // Report total items for pagination
          onTotalItemsChange?.(sortedItems.length);
          setLoading(false);
          return; // Exit if Supabase was successful
        }
      } catch (error) {
        console.error('Error with Supabase in storage event handler:', error);
      }

      // Fall back to localStorage if Supabase failed
      try {
        const storedContent = localStorage.getItem('siteContent');
        if (!storedContent) {
          setAllItems([]);
          setItems([]);
          onTotalItemsChange?.(0);
          setLoading(false);
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
            dateAdded: item.dateAdded || item.date || item.createdAt || new Date().toISOString() 
          }));

        // Process the items using the same function as initial load
        const processItems = (leakItems: GalleryItem[]) => {
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

          // Store all sorted items
          setAllItems(sortedItems);
          
          // Calculate pagination
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const paginatedItems = sortedItems.slice(startIndex, endIndex);
          
          // Set the paginated items to display
          setItems(paginatedItems);
          
          // Report total items for pagination
          onTotalItemsChange?.(sortedItems.length);
          setLoading(false);
        };

        processItems(leakItems);
      } catch (error) {
        console.error('Error handling storage event:', error);
        setAllItems([]);
        setItems([]);
        onTotalItemsChange?.(0);
        setLoading(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storageUpdate', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageUpdate', handleStorageChange);
    };
  }, [category, searchQuery, sortOption, currentPage, itemsPerPage, onTotalItemsChange]);

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
      {loading ? (
        <div className="col-span-full text-center py-10">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading leak content...</p>
        </div>
      ) : (
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
                {/* Permanent download button */}
                <div className="absolute top-2 left-2 z-30">
                  <a
                    href={item.downloadUrl || item.imageUrl}
                    onClick={(e) => handleDownload(e, item)}
                    download={item.title}
                    className="p-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground hover:text-primary rounded-full flex items-center justify-center transition-all duration-300"
                    aria-label="Download image"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="max-w-full object-contain transition-transform duration-500"
                  style={{ maxHeight: '180px', maxWidth: '90%', margin: 'auto' }}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-muted-foreground">No items found matching your criteria.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default LeaksGallery; 