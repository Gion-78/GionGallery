import { useState, useEffect, useRef } from 'react';
import { Download } from 'lucide-react';
import { GalleryItem } from '../../types/gallery';
import galleryData from '../../data/galleryData';
import { Play, Pause } from 'lucide-react'; // تأكد من استيراد الأيقونات بشكل صحيح



// Define types for sort options
type SortField = 'date' | 'alphabetical';
type SortDirection = 'asc' | 'desc';

interface SortOption {
  field: SortField;
  direction: SortDirection;
}

interface GalleryGridProps {
  viewMode: 'grid' | 'masonry';
  category: string;
  searchQuery?: string;
  currentPage?: number;
  itemsPerPage?: number;
  sortOption?: SortOption;
  onTotalItemsChange?: (totalItems: number) => void;
}

// Get content from localStorage or default gallery data
const getContentData = (category: string): GalleryItem[] => {
  try {
    const storedContent = localStorage.getItem('siteContent');
    console.log('Raw localStorage content:', storedContent);

    if (storedContent) {
      const parsedContent = JSON.parse(storedContent);
      console.log('Parsed localStorage content:', parsedContent);

      // Log info about each item in parsedContent if it's a leak
      if (category === 'Main Leaks' || category === 'Beta Leaks') {
        console.log(`Detailed inspection for ${category}:`);
        parsedContent.forEach((item: any, index: number) => {
          if (item.section === 'Leaks' || item.section === 'leaks') {
            console.log(`Item ${index}:`, {
              id: item.id,
              title: item.title,
              section: item.section,
              category: item.category,
              matches: (
                (item.category === category || item.category?.toLowerCase() === category.toLowerCase()) &&
                (item.section === 'Leaks' || item.section === 'leaks') &&
                !!item.imageUrl
              )
            });
          }
        });
      }

      // Convert the stored content format to GalleryItem format
      const contentItems = parsedContent
        .filter((item: any) => {
          // Special handling for Skills category
          if (category === 'Skills') {
            console.log(`Skills item check:`, {
              category: item.category,
              hasImage: !!item.imageUrl,
              matches: item.category === 'Skills' && item.imageUrl
            });
            return item.category === 'Skills' && item.imageUrl;
          }

          // Special handling for Login Screens subcategory
          if (category === 'Login Screens') {
            return item.subcategory === 'Login Screens' && (item.imageUrl || item.videoUrl);
          }

          // Special handling for Leaks sections - more aggressive attempt
          if (category === 'Main Leaks' || category === 'Beta Leaks') {
            // First approach - only match exact criteria
            const exactMatch = (
              (item.category === category) &&
              (item.section === 'Leaks') &&
              !!item.imageUrl
            );

            // Second approach - relax section requirements
            const relaxedMatch = (
              (item.category === category) &&
              !!item.imageUrl
            );

            // Third approach - case insensitive
            const caseInsensitiveMatch = (
              (item.category?.toLowerCase() === category.toLowerCase()) &&
              (item.section?.toLowerCase() === 'leaks') &&
              !!item.imageUrl
            );

            // Fourth approach - most aggressive
            const mostRelaxedMatch = (
              (item.category?.toLowerCase().includes(category.toLowerCase()) ||
                item.title?.toLowerCase().includes(category.toLowerCase())) &&
              !!item.imageUrl
            );

            const matches = exactMatch || caseInsensitiveMatch || relaxedMatch || mostRelaxedMatch;

            console.log(`Leak item check for ${category}:`, {
              itemCategory: item.category,
              expectedCategory: category,
              itemSection: item.section,
              hasImage: !!item.imageUrl,
              exactMatch,
              relaxedMatch,
              caseInsensitiveMatch,
              mostRelaxedMatch,
              matches
            });

            return matches;
          }

          // Default filtering
          return (item.category === category || item.subcategory === category) && item.imageUrl;
        })
        .map((item: any) => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          category: item.subcategory || item.category,
          imageUrl: item.imageUrl || (item.videoUrl ? item.thumbnailUrl : null),
          downloadUrl: item.zipUrl || item.imageUrl || item.videoUrl, // Use zip URL if available, otherwise image URL
          videoUrl: item.videoUrl,
          dateAdded: item.dateAdded || item.date || item.createdAt || new Date().toISOString(), // Use any available date field
          tags: []
        }));

      console.log(`Filtered items for ${category}:`, contentItems);

      // Combine with default data
      return [...contentItems, ...galleryData.filter(item => item.category === category)];
    }
  } catch (error) {
    console.error('Error loading content:', error);
  }
  return galleryData.filter(item => item.category === category);
};

const GalleryGrid = ({
  viewMode,
  category,
  searchQuery = "",
  currentPage = 1,
  itemsPerPage = 8,
  sortOption = { field: 'date', direction: 'desc' },
  onTotalItemsChange
}: GalleryGridProps) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [paginatedItems, setPaginatedItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    // Get items for the selected category
    let filteredItems = getContentData(category);

    if (searchQuery) {
      filteredItems = filteredItems.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort the items based on sortOption
    filteredItems.sort((a, b) => {
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

        const dateATime = getValidDate(a.dateAdded || a.date);
        const dateBTime = getValidDate(b.dateAdded || b.date);

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

    setItems(filteredItems);

    // Notify parent component about the total number of items
    if (onTotalItemsChange) {
      onTotalItemsChange(filteredItems.length);
    }
  }, [category, searchQuery, sortOption, onTotalItemsChange]);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      // Refresh items when localStorage changes
      let refreshedItems = getContentData(category);

      if (searchQuery) {
        refreshedItems = refreshedItems.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Sort the items based on sortOption
      refreshedItems.sort((a, b) => {
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

          const dateATime = getValidDate(a.dateAdded || a.date);
          const dateBTime = getValidDate(b.dateAdded || b.date);

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

      setItems(refreshedItems);

      if (onTotalItemsChange) {
        onTotalItemsChange(refreshedItems.length);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storageUpdate', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageUpdate', handleStorageChange);
    };
  }, [category, searchQuery, sortOption, onTotalItemsChange]);

  useEffect(() => {
    // Calculate paginated items
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedItems(items.slice(startIndex, endIndex));
  }, [items, currentPage, itemsPerPage]);

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

  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const [playingVideos, setPlayingVideos] = useState<{ [key: string]: boolean }>({});

  const handlePlayPauseClick = (id: string) => {
    const videoElement = videoRefs.current[id];
    if (videoElement) {
      if (videoElement.paused) {
        videoElement.play();
        setPlayingVideos((prev) => ({ ...prev, [id]: true }));
      } else {
        videoElement.pause();
        setPlayingVideos((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  return (
    <>
      <div className={`w-full ${viewMode === 'grid'
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
        : 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6'
      }`}>
        {paginatedItems.length > 0 ? (
          paginatedItems.map((item) => (
            <div
              key={item.id}
              className={`group relative overflow-hidden rounded-lg mb-6 ${viewMode === 'grid' ? '' : 'break-inside-avoid'}`}
              style={viewMode === 'grid' ? { aspectRatio: '3/4' } : {}}
            >
              {item.videoUrl ? (
                <div className="relative w-full h-full">
                  {/* تعطيل عناصر التحكم الأصلية لإخفاء كل شيء */}
                  <video
                    ref={(el) => (videoRefs.current[String(item.id)] = el)}
                    src={item.videoUrl}
                    poster={item.imageUrl}
                    className="w-full h-full object-cover z-10"
                    controls={false}  // إخفاء عناصر التحكم الأصلية
                    muted
                    playsInline
                  />
                  {/* زر التشغيل/الإيقاف المخصص الوحيد */}
                  <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      className="p-4 bg-secondary rounded-full"
                      onClick={() => handlePlayPauseClick(String(item.id))}
                      aria-label="Play/Pause"
                    >
                      {playingVideos[String(item.id)] ? (
                        <Pause className="w-6 h-6" />
                      ) : (
                        <Play className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
  
              {/* Content at the top of the video, shown on hover */}
              <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-transparent to-black/50 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex justify-between items-start w-full">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="text-sm text-white mb-4">{item.description}</p>
                  </div>
  
                  {/* Download Button */}
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
  
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">
              {['Characters', 'Character Banners', 'Skills', 'Portraits',
                'Main Leaks', 'Beta Leaks'].includes(category)
                ? `No items in this category, please check back later!`
                : `No results found. Try changing your search term.`}
            </p>
          </div>
        )}
      </div>
    </>
  );
  
  
};

export default GalleryGrid;
