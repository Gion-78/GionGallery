import { useState, useEffect } from 'react';
import { Trash2, X, Image, FileArchive, Video, ExternalLink } from 'lucide-react';
import { deleteFile } from '../../lib/imagekit';
import { deleteContent, triggerStorageUpdate } from '../../lib/utils';

interface ContentItem {
  id: string;
  title: string;
  description: string;
  section: string;
  category: string;
  subcategory?: string;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  zipUrl: string | null;
  videoUrl: string | null;
  fileId: string | null;
  zipFileId: string | null;
  videoFileId: string | null;
  createdAt: string;
  folder: string;
}

interface ContentManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContentManagement: React.FC<ContentManagementProps> = ({ isOpen, onClose }) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isDeleting, setIsDeleting] = useState<{ [key: string]: boolean }>({});
  const [deletionResults, setDeletionResults] = useState<{ [key: string]: 'success' | 'error' }>({});

  // Load content from localStorage
  useEffect(() => {
    if (isOpen) {
      loadContent();
    }
  }, [isOpen]);

  const loadContent = () => {
    try {
      const siteContentJSON = localStorage.getItem('siteContent');
      if (siteContentJSON) {
        const parsedContent = JSON.parse(siteContentJSON);
        setContentItems(parsedContent.reverse()); // Show newest first
      } else {
        setContentItems([]);
      }
    } catch (error) {
      console.error('Error loading content:', error);
      setContentItems([]);
    }
  };

  // Filter content based on section
  const filteredContent = filter === 'all' 
    ? contentItems 
    : contentItems.filter(item => item.section === filter);

  // Handle deletion of content
  const handleDelete = async (item: ContentItem) => {
    // Set this item as being deleted
    setIsDeleting(prev => ({ ...prev, [item.id]: true }));
    
    try {
      // First try to delete from ImageKit if we have files
      let imagekitDeletionFailed = false;
      
      // Delete image if exists
      if (item.imageUrl && item.fileId) {
        const imageResult = await deleteFile(item.fileId);
        if (!imageResult.success) {
          imagekitDeletionFailed = true;
        }
      }
      
      // Delete zip if exists
      if (item.zipUrl && item.zipFileId) {
        const zipResult = await deleteFile(item.zipFileId);
        if (!zipResult.success) {
          imagekitDeletionFailed = true;
        }
      }
      
      // Delete video if exists
      if (item.videoUrl && item.videoFileId) {
        const videoResult = await deleteFile(item.videoFileId);
        if (!videoResult.success) {
          imagekitDeletionFailed = true;
        }
      }
      
      // Delete from localStorage
      const localStorageResult = deleteContent(item.id);
      
      if (localStorageResult) {
        // Successfully deleted from localStorage
        setDeletionResults(prev => ({ ...prev, [item.id]: 'success' }));
        
        // Reload content
        loadContent();
        
        // Clear the deletion result after a delay
        setTimeout(() => {
          setDeletionResults(prev => {
            const newResults = { ...prev };
            delete newResults[item.id];
            return newResults;
          });
        }, 3000);
      } else {
        // Failed to delete from localStorage
        setDeletionResults(prev => ({ ...prev, [item.id]: 'error' }));
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      setDeletionResults(prev => ({ ...prev, [item.id]: 'error' }));
    } finally {
      // Clear the deleting state
      setIsDeleting(prev => {
        const newState = { ...prev };
        delete newState[item.id];
        return newState;
      });
    }
  };

  const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>, url: string, title: string) => {
    e.preventDefault();
    
    try {
      // Fetch the content as a blob
      const response = await fetch(url);
      const blob = await response.blob();
      
      // Determine if this is an image and set appropriate extension
      let filename = title;
      
      // For image files, ensure they have .jpg extension
      if (blob.type.startsWith('image/') && !url.toLowerCase().endsWith('.zip')) {
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

  // Only show if modal is open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto py-10">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Manage Content</h2>
            <button 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter tabs */}
          <div className="mb-6 border-b border-border">
            <div className="flex space-x-2">
              {['all', 'Artwork', 'Leaks', 'Banner Slider'].map((section) => (
                <button
                  key={section}
                  onClick={() => setFilter(section)}
                  className={`px-4 py-2 ${
                    filter === section 
                      ? 'border-b-2 border-primary text-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {section === 'all' ? 'All Content' : section}
                </button>
              ))}
            </div>
          </div>

          {/* Content list */}
          {filteredContent.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No content found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContent.map(item => (
                <div 
                  key={item.id} 
                  className="border border-border rounded-lg overflow-hidden shadow-sm"
                >
                  <div className="relative aspect-video bg-muted">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                      />
                    ) : item.videoUrl ? (
                      <div className="flex items-center justify-center h-full">
                        <Video className="w-12 h-12 text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FileArchive className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium truncate">{item.title}</h3>
                    <p className="text-sm text-muted-foreground truncate mb-2">{item.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {item.section}
                      </span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                      {item.subcategory && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                          {item.subcategory}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        {item.imageUrl && (
                          <a 
                            href={item.imageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title="View image"
                          >
                            <Image className="w-4 h-4" />
                          </a>
                        )}
                        {item.zipUrl && (
                          <a 
                            href={item.zipUrl} 
                            onClick={(e) => handleDownload(e, item.zipUrl, item.title)}
                            download={item.title}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title="Download zip"
                          >
                            <FileArchive className="w-4 h-4" />
                          </a>
                        )}
                        {item.videoUrl && (
                          <a 
                            href={item.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            title="View video"
                          >
                            <Video className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(item)}
                          disabled={!!isDeleting[item.id]}
                          className={`text-red-500 hover:text-red-700 transition-colors ${
                            isDeleting[item.id] ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          aria-label="Delete content"
                          title="Delete content"
                        >
                          {isDeleting[item.id] ? (
                            <span className="inline-block w-4 h-4 border-2 border-t-transparent border-red-500 rounded-full animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    {deletionResults[item.id] === 'success' && (
                      <div className="mt-2 text-xs text-green-500">
                        Successfully deleted
                      </div>
                    )}
                    {deletionResults[item.id] === 'error' && (
                      <div className="mt-2 text-xs text-red-500">
                        Error deleting content
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentManagement; 