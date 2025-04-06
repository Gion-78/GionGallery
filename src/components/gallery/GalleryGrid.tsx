import { useState, useEffect, useRef, useCallback } from 'react';
import { Download } from 'lucide-react';
import { GalleryItem } from '../../types/gallery';
import galleryData from '../../data/galleryData';
import { Play, Pause } from 'lucide-react'; // تأكد من استيراد الأيقونات بشكل صحيح
import { getAllContent } from '../../lib/supabase';



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

// Get content from Supabase or fallback to localStorage
const getContentData = async (category: string): Promise<GalleryItem[]> => {
  try {
    // Try to fetch from Supabase first
    const supabaseResult = await getAllContent();
    
    if (supabaseResult.success && supabaseResult.data) {
      const parsedContent = supabaseResult.data;
      console.log('Content from Supabase:', parsedContent);
      
      // Filter and map the data based on category
      const filteredItems = parsedContent.filter(item => {
        // For leaks section
        if (category === 'Main Leaks' || category === 'Beta Leaks') {
          const matchesCategory = 
            item.category === category || 
            item.category?.toLowerCase() === category.toLowerCase();
          
          console.log(`Leak check for ${item.title}:`, {
            category: item.category,
            expectedCategory: category,
            section: item.section,
            hasImage: !!item.imageUrl,
            matchesCategory,
            result: matchesCategory && !!item.imageUrl
          });
          
          return matchesCategory && !!item.imageUrl;
        }
        
        // For Login Screens subcategory (videos)
        if (category === 'Login Screens') {
          const isLoginScreen = 
            item.subcategory === 'Login Screens' || 
            item.category === 'Login Screens';
          
          console.log(`Login Screens check for ${item.title}:`, {
            category: item.category,
            subcategory: item.subcategory,
            hasVideo: !!item.videoUrl,
            isLoginScreen,
            result: isLoginScreen && (!!item.videoUrl || !!item.imageUrl)
          });
          
          // Include both videos and images for this category
          return isLoginScreen && (!!item.videoUrl || !!item.imageUrl);
        }
        
        // For other sections (artwork, etc.)
        const matchesCategory = 
          item.category === category || 
          item.subcategory === category;
        
        const hasContent = !!item.imageUrl || !!item.videoUrl;
        
        console.log(`Regular category check for ${item.title} (${category}):`, {
          category: item.category,
          subcategory: item.subcategory,
          section: item.section,
          hasContent,
          matchesCategory,
          result: matchesCategory && hasContent
        });
        
        return matchesCategory && hasContent;
      });
      
      // Convert to GalleryItem format with special handling for videos
      return filteredItems.map(item => {
        console.log(`Processing item for gallery:`, {
          id: item.id,
          title: item.title,
          hasVideo: !!item.videoUrl,
          videoUrl: item.videoUrl,
          videoMetadata: item.videoMetadata
        });
        
        return {
          id: item.id,
          title: item.title,
          description: item.description || '',
          category: item.subcategory || item.category,
          imageUrl: item.imageUrl || (item.thumbnailUrl ? item.thumbnailUrl : ''),
          videoUrl: item.videoUrl || '',
          downloadUrl: item.zipUrl || item.imageUrl || item.videoUrl || '',
          videoMetadata: item.videoMetadata || null,
          dateAdded: item.createdAt,
          tags: []
        };
      });
    }
    
    // Fallback to localStorage if Supabase fails
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
    console.error('Error loading content data:', error);
  }
  
  // Return empty array or mock data if all fails
  return [];
};

const GalleryGrid: React.FC<GalleryGridProps> = ({
  viewMode,
  category,
  searchQuery = "",
  currentPage = 1,
  itemsPerPage = 8,
  sortOption = { field: 'date', direction: 'desc' },
  onTotalItemsChange
}) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [paginatedItems, setPaginatedItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<{[key: string]: boolean}>({});
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const [playingVideos, setPlayingVideos] = useState<{ [key: string]: boolean }>({});
  const [videoUrls, setVideoUrls] = useState<{ [key: string]: string }>({});
  
  // Force Resources category to always use 15 items per page
  const effectiveItemsPerPage = category === 'Resources' ? 15 : itemsPerPage;

  // Function to ensure video URLs are valid and working - BUT DON'T SET STATE INSIDE
  const checkAndFixVideoUrl = useCallback((url: string, itemId: string): string => {
    if (!url) return '';
    
    // Use cached URL if available
    if (videoUrls[itemId]) {
      return videoUrls[itemId];
    }
    
    // For initial render just return the original URL
    return url;
  }, [videoUrls]);

  // Process and store video URLs in a useEffect to avoid render loops
  useEffect(() => {
    if (category === 'Login Screens') {
      // Find all items with videos
      const itemsWithVideos = items.filter(item => item.videoUrl);
      
      // Process each video URL only if not already processed
      const newVideoUrls: {[key: string]: string} = {};
      let hasNewUrls = false;
      
      itemsWithVideos.forEach(item => {
        const itemId = String(item.id);
        if (!videoUrls[itemId] && item.videoUrl) {
          hasNewUrls = true;
          // Fix for 403 Forbidden errors from ImageKit
          if (item.videoUrl.includes('ik.imagekit.io')) {
            // If the URL contains 'imagekit.io', add timestamp and auth parameters
            const separator = item.videoUrl.includes('?') ? '&' : '?';
            newVideoUrls[itemId] = `${item.videoUrl}${separator}v=${Date.now()}&auth=true`;
            console.log(`Fixed ImageKit URL for ${itemId}:`, newVideoUrls[itemId]);
          } else {
            newVideoUrls[itemId] = item.videoUrl;
          }
        }
      });

      // Only update state if we have new URLs to add
      if (hasNewUrls) {
        setVideoUrls(prev => ({...prev, ...newVideoUrls}));
      }
    }
  }, [items, category, videoUrls]);

  // Load content when component mounts or category changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const contentData = await getContentData(category);
      setItems(contentData);
      setLoading(false);
    };

    fetchData();
  }, [category]);

  // Automatically play the first video when in Login Screens category
  useEffect(() => {
    if (category === 'Login Screens' && paginatedItems.length > 0) {
      // Add a short delay to allow video elements to be created
      const timeoutId = setTimeout(() => {
        // Get the first video item's ID
        const firstItemWithVideo = paginatedItems.find(item => item.videoUrl);
        if (firstItemWithVideo) {
          // REMOVING AUTO-PLAY
          // handlePlayPauseClick(String(firstItemWithVideo.id));
          
          // Just log that videos are ready
          console.log('Videos ready to play. Auto-play disabled.');
        }
      }, 1500); // Increased timeout to ensure video elements are properly loaded
      
      return () => clearTimeout(timeoutId);
    }
  }, [category, paginatedItems]);

  // Filter and sort items when relevant state changes
  useEffect(() => {
    const applyFilterAndSort = () => {
      // Apply search filter
      let filtered = items;
      if (searchQuery.trim() !== '') {
        filtered = items.filter(item => 
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Apply sorting
      let sorted = [...filtered];
      if (sortBy === 'newest') {
        sorted.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
      } else if (sortBy === 'oldest') {
        sorted.sort((a, b) => new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime());
      } else if (sortBy === 'title') {
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        }
      
      setPaginatedItems(sorted);
    };
    
    applyFilterAndSort();
  }, [items, searchQuery, sortBy]);

  useEffect(() => {
    // Calculate paginated items
    const startIndex = (currentPage - 1) * effectiveItemsPerPage;
    const endIndex = startIndex + effectiveItemsPerPage;
    const paginatedResult = items.slice(startIndex, endIndex);
    setPaginatedItems(paginatedResult);
    
    // If no items are shown but we have items and we're not on the first page
    // this likely means we need to adjust the current page
    if (paginatedResult.length === 0 && items.length > 0 && currentPage > 1) {
      const totalPages = Math.ceil(items.length / effectiveItemsPerPage);
      const validPage = Math.min(currentPage, totalPages);
      
      if (validPage !== currentPage && onTotalItemsChange) {
        // We're reusing the callback to trigger a redraw
        setTimeout(() => onTotalItemsChange(items.length), 0);
      }
    }
  }, [items, currentPage, effectiveItemsPerPage, onTotalItemsChange]);

  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement> | React.MouseEvent<HTMLButtonElement>, item: GalleryItem) => {
    e.preventDefault();

    try {
      // Determine if this is a video item
      const isVideoItem = !!item.videoUrl;
      
      // For video items
      if (isVideoItem) {
        console.log('Starting video download process for:', item.title);
        
        // Create a filename with .mp4 extension
        let filename = item.title;
        if (!filename.toLowerCase().endsWith('.mp4')) {
          filename = filename.replace(/\.(webm|mp4|mov|avi)$/i, '');
          filename += '.mp4';
        }
        
        // Create a hidden anchor element for direct download
        const a = document.createElement('a');
          
        // Force download attribute with filename
        a.download = filename;
        
        // For ImageKit videos, use direct URL with parameters
        if (item.videoUrl.includes('imagekit.io')) {
          try {
            // We need to use a blob approach to control the filename
            console.log('Using blob download approach for ImageKit video to preserve filename');
            
            // Create a clean filename
            const cleanFilename = filename.replace(/[^\w\s.-]/g, '').trim();
            
            // Create ImageKit URL with original quality parameter but without download parameters
            const downloadUrl = `${item.videoUrl}?tr=orig-true&v=${Date.now()}`;
            console.log('Fetching from URL:', downloadUrl);
            
            // Fetch the file as a blob
            const response = await fetch(downloadUrl, {
              cache: 'no-store',
              mode: 'cors',
              credentials: 'omit' // Don't send credentials to avoid CORS issues
            });
            
            if (!response.ok) {
              throw new Error(`Failed to fetch video: ${response.status}`);
            }
            
            // Get the blob data
            const blob = await response.blob();
            console.log('Downloaded blob size:', blob.size);
            
            // Create a blob URL and force the filename
            a.href = URL.createObjectURL(blob);
            a.download = cleanFilename; // Don't add .mp4 again since filename already has it
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(a.href);
            
            console.log('Download completed with filename:', cleanFilename);
            return;
          } catch (error) {
            console.error('Error with blob download approach:', error);
            // Fall back to direct link if blob approach fails
            alert('Failed to download with custom filename. Trying direct download...');
            
            const directUrl = `${item.videoUrl}?tr=orig-true&ik-attachment=true`;
            window.location.href = directUrl;
            return;
          }
        }
        
        // For non-ImageKit videos, use original fetch method
        console.log('Using standard download method for non-ImageKit video');
        const response = await fetch(item.videoUrl, { 
          cache: 'no-store',
          mode: 'cors',
          credentials: 'omit' // Don't send credentials to avoid CORS issues
        });
        
          if (!response.ok) {
            throw new Error(`Failed to fetch video: ${response.status}`);
          }
          
          const blob = await response.blob();
          console.log('Downloaded blob size:', blob.size);
          
        // Create object URL and trigger download
          a.href = URL.createObjectURL(blob);
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(a.href);
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
      
      // Last resort fallback if all methods fail
      try {
        alert('Normal download failed. Attempting alternative download method...');
        // Try a direct download with download attribute
        const a = document.createElement('a');
        a.href = item.videoUrl || item.downloadUrl || item.imageUrl;
        a.download = item.title;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (fallbackError) {
        console.error('All download methods failed:', fallbackError);
        alert('Unable to download. Try right-clicking on the content and selecting "Save As".');
      }
    }
  };

  const handlePlayPauseClick = (id: string) => {
    console.log('Attempting to play/pause video:', id);
    const videoElement = videoRefs.current[id];
    
    if (videoElement) {
      console.log('Video element state:', {
        id,
        paused: videoElement.paused,
        readyState: videoElement.readyState,
        networkState: videoElement.networkState,
        src: videoElement.src,
        currentTime: videoElement.currentTime,
        duration: videoElement.duration
      });
      
      if (videoElement.paused) {
        // If this video is paused and we want to play it:
        // First pause any currently playing videos
        if (category === 'Login Screens') {
          // Find all currently playing videos and pause them
          Object.entries(videoRefs.current).forEach(([videoId, element]) => {
            if (videoId !== id && element && !element.paused) {
              console.log('Pausing other video:', videoId);
              element.pause();
              setPlayingVideos((prev) => ({ ...prev, [videoId]: false }));
            }
          });
        }
        
        // Force preload the video if needed
        if (videoElement.readyState < 3) {
          console.log('Video not fully loaded, forcing preload...');
          videoElement.load();
        }
        
        // Now play the selected video
        console.log('Attempting to play video:', id);
        videoElement.play()
          .then(() => {
            console.log('Video started playing successfully:', id);
            setPlayingVideos((prev) => ({ ...prev, [id]: true }));
          })
          .catch(error => {
            console.error('Error playing video:', error);
            
            // Try fallback approach - sometimes muted videos are allowed to autoplay
            console.log('Trying fallback approach with muted video');
            videoElement.muted = true;
            videoElement.play()
              .then(() => {
                console.log('Video started playing in muted mode:', id);
        setPlayingVideos((prev) => ({ ...prev, [id]: true }));
              })
              .catch(secondError => {
                console.error('Failed to play video even when muted:', secondError);
              });
          });
      } else {
        // If this video is already playing, pause it
        console.log('Pausing video:', id);
        videoElement.pause();
        setPlayingVideos((prev) => ({ ...prev, [id]: false }));
      }
    } else {
      console.warn('Video element not found:', id);
    }
  };

  return (
    <>
      <div className={`w-full ${
        viewMode === 'grid'
          ? category === 'Characters' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center'
            : category === 'Portraits'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center p-0'
            : category === 'Character Titles'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center'
            : category === 'Event Titles'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center'
            : category === 'Character Frames'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center p-0'
            : category === 'Event Frames'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center p-0'
            : category === 'Emblems'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center p-0'
            : category === 'Resources'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5 gap-4 justify-items-center p-0 grid-rows-3'
            : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6'
      }`}>
        {paginatedItems.length > 0 ? (
          paginatedItems.map((item) => (
            <div
              key={item.id}
              className={`group relative overflow-hidden rounded-lg ${
                category === 'Portraits' ? 'mb-0' : 
                category === 'Character Titles' ? 'mb-6' : 
                category === 'Event Titles' ? 'mb-6' :
                category === 'Character Frames' ? 'mb-0' : 
                category === 'Event Frames' ? 'mb-0' : 
                category === 'Emblems' ? 'mb-0' : 
                category === 'Resources' ? 'mb-6' : 'mb-6'
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
                        : category === 'Cutscenes'
                          ? { maxWidth: '1024px', margin: '0 auto', aspectRatio: '2/1' }
                        : category === 'Portraits'
                          ? { width: '100%', margin: '0', padding: '0' }
                        : category === 'Character Titles'
                          ? { width: '100%', margin: '0', padding: '0' }
                        : category === 'Event Titles'
                          ? { width: '100%', margin: '0', padding: '0' }
                        : category === 'Character Frames'
                          ? { width: '100%', margin: '0', padding: '0' }
                        : category === 'Event Frames'
                          ? { width: '100%', margin: '0', padding: '0' }
                        : category === 'Emblems'
                          ? { width: '100%', margin: '0', padding: '0' }
                        : category === 'Resources'
                          ? { width: '100%', margin: '0', padding: '0' }
                        : { aspectRatio: '3/4' })
                : {}}
            >
              {item.videoUrl ? (
                <div className="relative w-full overflow-hidden rounded-lg bg-black" style={{ 
                  aspectRatio: '1560/960', 
                  width: '100%'
                }}>
                  {/* Video loading indicator */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                  
                  {/* Video element */}
                  <video
                    ref={(el) => {
                      // Store the ref
                      videoRefs.current[String(item.id)] = el;
                      
                      // Special handling for persistent loading issues
                      if (el && category === 'Login Screens') {
                        // Try to manually set src and load
                        setTimeout(() => {
                          if (el && el.readyState < 2) {
                            console.log('Manually loading video:', item.id);
                            
                            // Try with source elements instead of src attribute
                            while (el.firstChild) {
                              el.removeChild(el.firstChild);
                            }
                            
                            // Create source elements with different approaches
                            const videoUrl = item.videoUrl;
                            const cachedUrl = videoUrls[String(item.id)];
                            
                            // Source 1: Use cached URL if available or create one with auth params
                            const source1 = document.createElement('source');
                            if (cachedUrl) {
                              source1.src = cachedUrl;
                            } else {
                              const separator = videoUrl.includes('?') ? '&' : '?';
                              source1.src = `${videoUrl}${separator}v=${Date.now()}&auth=true`;
                            }
                            source1.type = 'video/mp4';
                            el.appendChild(source1);
                            
                            // Source 2: Original quality param
                            const source2 = document.createElement('source');
                            source2.src = `${videoUrl}?tr=orig-true&v=${Date.now()}&auth=true`;
                            source2.type = 'video/mp4';
                            el.appendChild(source2);
                            
                            // Load the video with the new sources
                            el.load();
                          }
                        }, 500);
                      }
                    }}
                    className="w-full h-full z-20"
                    controls={false}
                    crossOrigin="anonymous"
                    muted
                    playsInline
                    loop
                    preload="auto"
                    poster={item.imageUrl}
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center top',
                      backgroundColor: 'black'
                    }}
                    onLoadedData={(e) => {
                      console.log('Video loaded:', item.id, item.videoUrl);
                      // Hide the loading indicator when video is ready
                      if (e.currentTarget.parentElement) {
                        const loadingEl = e.currentTarget.parentElement.querySelector('div.bg-black\\/50');
                        if (loadingEl) loadingEl.classList.add('hidden');
                      }
                    }}
                    onError={(e) => {
                      console.error('Video error:', e, item.videoUrl);
                      // Try a different approach for ImageKit videos
                      if (item.videoUrl && item.videoUrl.includes('ik.imagekit.io') && e.currentTarget) {
                        // Create a new source element
                        const source = document.createElement('source');
                        const newUrl = `${item.videoUrl}?v=${Date.now()}&auth=true&tr=orig-true`;
                        source.src = newUrl;
                        source.type = 'video/mp4';
                        console.log('Trying alternative URL:', newUrl);
                        
                        // Clear existing sources
                        while (e.currentTarget.firstChild) {
                          e.currentTarget.removeChild(e.currentTarget.firstChild);
                        }
                        
                        // Add the new source
                        e.currentTarget.appendChild(source);
                        e.currentTarget.load();
                      }
                    }}
                  >
                    {/* Add source elements for better browser compatibility */}
                    <source src={videoUrls[String(item.id)] || item.videoUrl} type="video/mp4" />
                    <source src={`${item.videoUrl}?tr=orig-true&v=${Date.now()}&auth=true`} type="video/mp4" />
                  </video>
                  
                  {/* Custom play/pause button */}
                  <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                    <button 
                      className={`p-5 ${
                        playingVideos[String(item.id)] 
                          ? 'opacity-0 hover:opacity-100 bg-secondary/40' 
                          : 'opacity-100 bg-secondary/70'
                      } hover:bg-secondary rounded-full transition-all duration-300 shadow-lg pointer-events-auto`}
                      onClick={() => handlePlayPauseClick(String(item.id))}
                      aria-label="Play/Pause"
                    >
                      {playingVideos[String(item.id)] ? (
                        <Pause className="w-7 h-7 text-white" />
                      ) : (
                        <Play className="w-7 h-7 text-white" />
                      )}
                    </button>
                  </div>
                  
                  {/* Content overlay - ensure pointer events work correctly */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 z-40 pointer-events-none">
                    {/* Fix title truncation with min-height and padding */}
                    <div className="min-h-[60px] pt-2 pb-2">
                      <h3 className="text-lg font-semibold text-foreground line-clamp-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-3">{item.description}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className={category === 'Characters' ? 'h-[320px] flex items-center justify-center' : 
                               category === 'Character Banners' || category === 'Event Banners' ? 
                               'h-auto flex items-center justify-center' : 
                               category === 'Cutscenes' ?
                               'h-auto flex items-center justify-center' :
                               category === 'Portraits' ?
                               'h-[128px] flex items-center justify-center' : 
                               category === 'Character Titles' ?
                               'h-[140px] flex items-center justify-center' : 
                               category === 'Event Titles' ?
                               'h-[140px] flex items-center justify-center' :
                               category === 'Character Frames' ?
                               'h-[128px] flex items-center justify-center' :
                               category === 'Event Frames' ?
                               'h-[128px] flex items-center justify-center' :
                               category === 'Emblems'
                               ? 'h-[150px] flex items-center justify-center bg-background/30 rounded-md'
                               : category === 'Resources'
                               ? 'h-[160px] flex items-center justify-center bg-background/20 rounded-md'
                               : 'h-full'}>
                    <div>
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className={`transition-transform duration-500 ${
                          category === 'Characters' 
                            ? 'max-h-full max-w-full object-contain' 
                            : category === 'Character Banners' || category === 'Event Banners'
                              ? 'w-full h-auto object-contain' 
                              : category === 'Cutscenes'
                                ? 'w-full h-auto object-contain'
                              : category === 'Portraits'
                                ? 'max-h-full max-w-full object-contain' 
                              : category === 'Character Titles'
                                ? 'max-h-full max-w-full object-contain' 
                              : category === 'Event Titles'
                                ? 'max-h-[160px] max-w-[330px] w-auto h-auto object-contain'
                              : category === 'Character Frames'
                                ? 'max-h-[128px] max-w-[128px] w-auto h-auto object-contain'
                              : category === 'Event Frames'
                                ? 'max-h-[128px] max-w-[128px] w-auto h-auto object-contain'
                              : category === 'Emblems'
                                ? 'max-h-[120px] max-w-[120px] w-auto h-auto object-contain scale-150 hover:scale-[1.8] transition-transform'
                              : category === 'Resources'
                                ? 'max-h-[160px] max-w-[300px] w-auto h-auto object-contain'
                              : 'w-full h-full object-cover'
                        }`}
                        onLoad={(e) => {
                          // Apply automatic scaling for Resources category only
                          if (category === 'Resources') {
                            const img = e.target as HTMLImageElement;
                            // Remove transition to eliminate any zooming effect
                            img.style.transition = 'none';
                            
                            // Scale for very small images (less than 50x50)
                            if (img.naturalWidth < 50 || img.naturalHeight < 50) {
                              img.style.transform = 'scale(3)';
                            }
                            // Scale for small images
                            else if (img.naturalWidth < 100 || img.naturalHeight < 85) {
                              img.style.transform = 'scale(2.5)';
                            } 
                            // Scale for medium-sized images
                            else if (img.naturalWidth < 200 || img.naturalHeight < 120) {
                              img.style.transform = 'scale(1.2)';
                            }
                          }
                        }}
                        loading="lazy"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      {/* Fix title truncation with min-height and padding */}
                      <div className="min-h-[60px] pt-2">
                        <h3 className="text-lg font-semibold text-foreground line-clamp-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">{item.description}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
  
              {/* Download button */}
              <div className="absolute top-2 left-2 z-50">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Download button clicked for:', item.title);
                    handleDownload(e as unknown as React.MouseEvent<HTMLAnchorElement>, item);
                  }}
                  className="p-2 bg-secondary/90 hover:bg-secondary text-secondary-foreground hover:text-primary rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md"
                  aria-label="Download content"
                  type="button"
                >
                  <Download className="w-4 h-4" />
                </button>
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
