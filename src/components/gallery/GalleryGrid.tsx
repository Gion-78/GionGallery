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
          tags: [],
          // Include video metadata if available
          videoMetadata: item.videoMetadata || null
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

    // When items change, ensure current page is valid
    const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      // If current page is beyond total pages, set it to the last valid page
      const validPage = Math.max(1, totalPages);
      // This is a workaround to communicate the page change back to parent
      if (onTotalItemsChange) {
        // We're reusing the callback to trigger a redraw
        setTimeout(() => onTotalItemsChange(filteredItems.length), 0);
      }
    }
  }, [category, searchQuery, sortOption, onTotalItemsChange, currentPage, itemsPerPage]);

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
    const paginatedResult = items.slice(startIndex, endIndex);
    setPaginatedItems(paginatedResult);
    
    // If no items are shown but we have items and we're not on the first page
    // this likely means we need to adjust the current page
    if (paginatedResult.length === 0 && items.length > 0 && currentPage > 1) {
      const totalPages = Math.ceil(items.length / itemsPerPage);
      const validPage = Math.min(currentPage, totalPages);
      
      if (validPage !== currentPage && onTotalItemsChange) {
        // We're reusing the callback to trigger a redraw
        setTimeout(() => onTotalItemsChange(items.length), 0);
      }
    }
  }, [items, currentPage, itemsPerPage, onTotalItemsChange]);

  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>, item: GalleryItem) => {
    e.preventDefault();

    try {
      // Determine if this is a video item
      const isVideoItem = !!item.videoUrl;
      
      // For video items, use a more comprehensive approach
      if (isVideoItem) {
        // Try multiple methods to get the highest quality version
        try {
          // Parse the video URL to extract important parts
          const url = new URL(item.videoUrl);
          const urlPath = url.pathname;
          
          // Calculate size differences if we have original metadata
          let qualityInfo = '';
          if (item.videoMetadata) {
            // Create a fetch request to check current file size
            const headResponse = await fetch(item.videoUrl, { 
              method: 'HEAD',
              cache: 'no-store'
            });
            
            // Get content length if available
            const contentLength = headResponse.headers.get('content-length');
            const currentSize = contentLength ? parseInt(contentLength, 10) : 0;
            
            // Calculate percentage of quality loss
            if (currentSize > 0 && item.videoMetadata.originalSize > 0) {
              const percentOfOriginal = Math.round((currentSize / item.videoMetadata.originalSize) * 100);
              const sizeDiff = item.videoMetadata.originalSize - currentSize;
              const mbDiff = (sizeDiff / (1024 * 1024)).toFixed(2);
              
              qualityInfo = `
                The downloaded file will be approximately ${percentOfOriginal}% of the original quality.
                Original size: ${(item.videoMetadata.originalSize / (1024 * 1024)).toFixed(2)}MB
                Download size: ${(currentSize / (1024 * 1024)).toFixed(2)}MB
                Quality reduction: ${mbDiff}MB (${100 - percentOfOriginal}%)
              `;
              
              // Log quality info for debugging but don't show confirmation dialog
              console.log('Video quality info:', qualityInfo);
            }
          }
          
          // Proceed with download using the best available method
          console.log('Proceeding with video download...');
          console.log('Quality information:', qualityInfo);
          
          // Method 2: Using TR parameter to get original if possible
          const origUrl = `${url.origin}${urlPath}?tr=orig-true&_t=${Date.now()}`;
          
          const response = await fetch(origUrl, { cache: 'no-store' });
          if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.status}`);
          }
          
          const blob = await response.blob();
          console.log('Downloaded blob size:', blob.size);
          
          // Prepare filename with .mp4 extension
          let filename = item.title;
          if (!filename.toLowerCase().endsWith('.mp4')) {
            filename = filename.replace(/\.(webm|mp4|mov|avi)$/i, '');
            filename += '.mp4';
          }
          
          // Create a download link
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(a.href);
          
        } catch (error) {
          console.error('Error downloading original video:', error);
          alert('Failed to download the video. The service might be limiting video quality. Please try again or contact support.');
        }
        
        return;
      }
      
      // Handle non-video items (original logic)
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
        // If this video is paused and we want to play it:
        // First pause any currently playing videos
        if (category === 'Login Screens') {
          // Find all currently playing videos and pause them
          Object.entries(videoRefs.current).forEach(([videoId, element]) => {
            if (videoId !== id && element && !element.paused) {
              element.pause();
              setPlayingVideos((prev) => ({ ...prev, [videoId]: false }));
            }
          });
        }
        
        // Now play the selected video
        videoElement.play();
        setPlayingVideos((prev) => ({ ...prev, [id]: true }));
      } else {
        // If this video is already playing, pause it
        videoElement.pause();
        setPlayingVideos((prev) => ({ ...prev, [id]: false }));
      }
    }
  };

  return (
    <>
      <div className={`w-full ${
        viewMode === 'grid'
          ? category === 'Characters' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center'
            : category === 'Portraits'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6'
      }`}>
        {paginatedItems.length > 0 ? (
          paginatedItems.map((item) => (
            <div
              key={item.id}
              className={`group relative overflow-hidden rounded-lg ${
                category === 'Portraits' ? 'mb-2' : 'mb-6'
              } ${viewMode === 'grid' ? '' : 'break-inside-avoid'} ${
                category === 'Character Banners' 
                  ? 'border border-primary/50 shadow-sm' 
                  : category === 'Event Banners'
                    ? 'border border-primary/50 shadow-sm'
                    : 'border border-primary/30 shadow-sm hover:shadow-md hover:border-primary/50'
              } transition-all duration-300`}
              style={viewMode === 'grid' 
                ? (category === 'Characters' 
                  ? { maxWidth: '320px', margin: '0 auto' } 
                  : category === 'Character Banners' 
                    ? { maxWidth: '640px', margin: '0 auto', aspectRatio: '2/1' }
                    : category === 'Event Banners'
                      ? { maxWidth: '480px', margin: '0 auto', aspectRatio: '2/1' }
                      : category === 'Login Screens'
                        ? { maxWidth: '780px', margin: '0 auto', aspectRatio: '13/8' }
                        : category === 'Portraits'
                          ? { maxWidth: '128px', margin: '0 auto' }
                        : { aspectRatio: '3/4' })
                : {}}
            >
              {item.videoUrl ? (
                <div className="relative w-full h-full">
                  {/* تعطيل عناصر التحكم الأصلية لإخفاء كل شيء */}
                  <video
                    ref={(el) => (videoRefs.current[String(item.id)] = el)}
                    src={item.videoUrl}
                    poster={item.imageUrl}
                    className={`w-full h-full ${category === 'Login Screens' ? 'object-contain' : 'object-cover'} z-10`}
                    controls={false}  // إخفاء عناصر التحكم الأصلية
                    muted
                    playsInline
                    loop
                  />
                  {/* زر التشغيل/الإيقاف المخصص الوحيد */}
                  <div className="absolute inset-0 flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <button 
                      className="p-4 bg-secondary rounded-full pointer-events-auto"
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
                  
                  {/* Content at the bottom of the video, shown on hover - matches the image style */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-20 pointer-events-auto">
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                    <div className="flex gap-2">
                      <a
                        href={item.videoUrl}
                        onClick={(e) => handleDownload(e, item)}
                        download={item.title}
                        className="p-2 bg-secondary text-secondary-foreground rounded-full"
                        aria-label="Download video"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className={category === 'Characters' ? 'h-[320px] flex items-center justify-center' : 
                               category === 'Character Banners' || category === 'Event Banners' ? 
                               'h-auto flex items-center justify-center' : 
                               category === 'Portraits' ?
                               'h-[128px] flex items-center justify-center' : 'h-full'}>
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className={`transition-transform duration-500 ${
                        category === 'Characters' 
                          ? 'max-h-full max-w-full object-contain' 
                          : category === 'Character Banners' || category === 'Event Banners'
                            ? 'w-full h-auto object-contain' 
                            : category === 'Portraits'
                              ? 'max-h-[210px] max-w-[210px] object-contain' 
                            : 'w-full h-full object-cover'
                      }`}
                      loading="lazy"
                    />
                  </div>
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
                </>
              )}
  
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
