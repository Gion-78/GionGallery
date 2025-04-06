import { useState, useEffect, useRef } from 'react';
import { Trash2, X, Image, FileArchive, Video, ExternalLink, Edit, Check, Upload, FileUp } from 'lucide-react';
import { deleteFile, uploadImage, uploadZip, uploadVideo } from '../../lib/imagekit';
import { deleteContent, triggerStorageUpdate } from '../../lib/utils';
import { getAllContent, updateContent, deleteContent as deleteContentFromSupabase, ContentItem } from '../../lib/supabase';

// Categories and subcategories structure (import structure from UploadContent)
const categoryStructure = {
  'Artwork': {
    'Characters': { type: 'single-image' },
    'Banners': {
      'Character Banners': { type: 'image-zip' },
      'Event Banners': { type: 'single-image' }
    },
    'Skills': { type: 'image-zip' },
    'Portraits': { type: 'single-image' },
    'Titles': {
      'Character Titles': { type: 'single-image' },
      'Event Titles': { type: 'single-image' }
    },
    'Frames': {
      'Character Frames': { type: 'single-image' },
      'Event Frames': { type: 'single-image' }
    },
    'Miscellaneous': {
      'Emblems': { type: 'single-image' },
      'Resources': { type: 'single-image' },
      'Login Screens': { type: 'video' },
      'Cutscenes': { type: 'single-image' }
    }
  },
  'Leaks': {
    'Main Leaks': { type: 'single-image' },
    'Beta Leaks': { type: 'single-image' }
  },
  'Banner Slider': { type: 'single-image' }
};

interface ContentManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContentManagement: React.FC<ContentManagementProps> = ({ isOpen, onClose }) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<{ [key: string]: boolean }>({});
  const [deletionResults, setDeletionResults] = useState<{ [key: string]: 'success' | 'error' }>({});
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<{title: string, description: string}>({
    title: '',
    description: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedZipFile, setSelectedZipFile] = useState<File | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDeleteSelectedInProgress, setIsDeleteSelectedInProgress] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Load content from Supabase and localStorage (for backward compatibility)
  const loadContent = async () => {
    try {
      // Load from Supabase (primary source)
      const supabaseResult = await getAllContent();
      
      if (supabaseResult.success && supabaseResult.data) {
        setContentItems(supabaseResult.data.reverse()); // Show newest first
        return;
      }
      
      // Fallback to localStorage if Supabase fails
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

  // Filter content based on section, category, and subcategory
  const filteredContent = contentItems.filter(item => {
    // Filter by section if not 'all'
    if (filter !== 'all' && item.section !== filter) {
      return false;
    }
    
    // Filter by category if selected
    if (categoryFilter && item.category !== categoryFilter) {
      return false;
    }
    
    // Filter by subcategory if selected
    if (subcategoryFilter && item.subcategory !== subcategoryFilter) {
      return false;
    }
    
    return true;
  });

  // Clear selections when filters change
  useEffect(() => {
    setSelectedItems([]);
  }, [filter, categoryFilter, subcategoryFilter]);

  // Get unique categories and subcategories for the filtered section
  const availableCategories = Array.from(
    new Set(
      contentItems
        .filter(item => filter === 'all' || item.section === filter)
        .map(item => item.category)
    )
  ).sort();
  
  const availableSubcategories = Array.from(
    new Set(
      contentItems
        .filter(item => 
          (filter === 'all' || item.section === filter) && 
          (!categoryFilter || item.category === categoryFilter)
        )
        .filter(item => item.subcategory)
        .map(item => item.subcategory)
    )
  ).sort();

  // Handle editing content
  const startEditing = (item: ContentItem) => {
    setEditingItem(item.id);
    setEditFormData({
      title: item.title,
      description: item.description
    });
    // Reset file selections
    setSelectedImageFile(null);
    setSelectedZipFile(null);
    setSelectedVideoFile(null);
    setUploadError(null);
  };
  
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'zip' | 'video') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (type === 'image') {
        setSelectedImageFile(file);
      } else if (type === 'zip') {
        setSelectedZipFile(file);
      } else if (type === 'video') {
        setSelectedVideoFile(file);
      }
      
      setUploadError(null);
    }
  };
  
  const saveEdit = async (item: ContentItem) => {
    // Validate if we have basic data
    if (!editFormData.title.trim()) {
      setUploadError('Title is required');
      return;
    }
    
    // Check if we're uploading any new files
    const isUploadingFiles = selectedImageFile || selectedZipFile || selectedVideoFile;
    
    if (isUploadingFiles) {
      setIsUploading(true);
      setUploadProgress(0);
      
      try {
        let newImageUrl = item.imageUrl;
        let newImageFileId = item.fileId;
        let newThumbnailUrl = item.thumbnailUrl;
        let newZipUrl = item.zipUrl;
        let newZipFileId = item.zipFileId;
        let newVideoUrl = item.videoUrl;
        let newVideoFileId = item.videoFileId;
        
        // Upload new image if selected
        if (selectedImageFile) {
          // Delete old image if exists
          if (item.fileId) {
            await deleteFile(item.fileId);
          }
          
          // Set progress for image upload (33%)
          setUploadProgress(10);
          
          const imageFileName = `${item.title.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;
          const imageUploadResult = await uploadImage(
            selectedImageFile,
            item.folder,
            imageFileName
          );
          
          setUploadProgress(33);
          
          if (imageUploadResult.success) {
            newImageUrl = imageUploadResult.url;
            newImageFileId = imageUploadResult.fileId;
            newThumbnailUrl = imageUploadResult.thumbnailUrl;
          } else {
            throw new Error('Failed to upload image');
          }
        }
        
        // Upload new zip if selected
        if (selectedZipFile) {
          // Delete old zip if exists
          if (item.zipFileId) {
            await deleteFile(item.zipFileId);
          }
          
          // Set progress for zip upload (33-66%)
          setUploadProgress(40);
          
          const zipFileName = `${item.title.replace(/\s+/g, '-').toLowerCase()}-zip-${Date.now()}`;
          const zipUploadResult = await uploadZip(
            selectedZipFile,
            item.folder,
            zipFileName
          );
          
          setUploadProgress(66);
          
          if (zipUploadResult.success) {
            newZipUrl = zipUploadResult.url;
            newZipFileId = zipUploadResult.fileId;
          } else {
            throw new Error('Failed to upload zip');
          }
        }
        
        // Upload new video if selected
        if (selectedVideoFile) {
          // Delete old video if exists
          if (item.videoFileId) {
            await deleteFile(item.videoFileId);
          }
          
          // Set progress for video upload (66-100%)
          setUploadProgress(75);
          
          const videoFileName = `${item.title.replace(/\s+/g, '-').toLowerCase()}-video-${Date.now()}`;
          const videoUploadResult = await uploadVideo(
            selectedVideoFile,
            item.folder,
            videoFileName
          );
          
          setUploadProgress(100);
          
          if (videoUploadResult.success) {
            newVideoUrl = videoUploadResult.url;
            newVideoFileId = videoUploadResult.fileId;
          } else {
            throw new Error('Failed to upload video');
          }
        }
        
        // Update content in Supabase
        await updateContent(item.id, {
          title: editFormData.title,
          description: editFormData.description,
          imageUrl: newImageUrl,
          fileId: newImageFileId,
          thumbnailUrl: newThumbnailUrl,
          zipUrl: newZipUrl,
          zipFileId: newZipFileId,
          videoUrl: newVideoUrl,
          videoFileId: newVideoFileId
        });
        
        // Keep localStorage updated for backward compatibility
        const siteContentJSON = localStorage.getItem('siteContent');
        if (siteContentJSON) {
          const parsedContent = JSON.parse(siteContentJSON);
          
          // Find and update the item
          const updatedContent = parsedContent.map((contentItem: ContentItem) => {
            if (contentItem.id === item.id) {
              return {
                ...contentItem,
                title: editFormData.title,
                description: editFormData.description,
                imageUrl: newImageUrl,
                fileId: newImageFileId,
                thumbnailUrl: newThumbnailUrl,
                zipUrl: newZipUrl,
                zipFileId: newZipFileId,
                videoUrl: newVideoUrl,
                videoFileId: newVideoFileId
              };
            }
            return contentItem;
          });
          
          // Save back to localStorage
          localStorage.setItem('siteContent', JSON.stringify(updatedContent));
          
          // Trigger update for any listeners
          triggerStorageUpdate();
        }
      } catch (error) {
        console.error('Error updating files:', error);
        setUploadError('Error updating files. Please try again.');
        setIsUploading(false);
        return;
      }
      
      setIsUploading(false);
      setUploadProgress(0);
    } else {
      // Only update text fields
      try {
        // Get current content from localStorage
        const siteContentJSON = localStorage.getItem('siteContent');
        if (siteContentJSON) {
          const parsedContent = JSON.parse(siteContentJSON);
          
          // Find and update the item
          const updatedContent = parsedContent.map((contentItem: ContentItem) => {
            if (contentItem.id === item.id) {
              return {
                ...contentItem,
                title: editFormData.title,
                description: editFormData.description
              };
            }
            return contentItem;
          });
          
          // Save back to localStorage
          localStorage.setItem('siteContent', JSON.stringify(updatedContent));
          
          // Trigger update for any listeners
          triggerStorageUpdate();
        }
      } catch (error) {
        console.error('Error saving edit:', error);
        setUploadError('Error saving changes. Please try again.');
        return;
      }
    }
    
    // Reload the content
    loadContent();
    
    // Exit edit mode
    setEditingItem(null);
  };
  
  const cancelEdit = () => {
    setEditingItem(null);
    setSelectedImageFile(null);
    setSelectedZipFile(null);
    setSelectedVideoFile(null);
    setUploadError(null);
  };

  // Delete a content item
  const deleteItem = async (id: string) => {
    setIsDeleting({ ...isDeleting, [id]: true });
    
    try {
      // Find the item to get file IDs
      const itemToDelete = contentItems.find(item => item.id === id);
      
      if (itemToDelete) {
        // Delete files from storage if they exist
        if (itemToDelete.fileId) {
          await deleteFile(itemToDelete.fileId);
        }
        if (itemToDelete.zipFileId) {
          await deleteFile(itemToDelete.zipFileId);
        }
        if (itemToDelete.videoFileId) {
          await deleteFile(itemToDelete.videoFileId);
        }
        
        // Delete from Supabase
        await deleteContentFromSupabase(id);
        
        // Also delete from localStorage for backward compatibility
        deleteContent(id);
        
        setDeletionResults({ ...deletionResults, [id]: 'success' });
        
        // Reload content after deletion
        loadContent();
        
        // Clear result after a delay
        setTimeout(() => {
          setDeletionResults(prev => {
            const newResults = { ...prev };
            delete newResults[id];
            return newResults;
          });
        }, 3000);
      }
    } catch (error) {
      console.error('Error deleting content:', error);
      setDeletionResults({ ...deletionResults, [id]: 'error' });
    } finally {
      setIsDeleting(prev => {
        const newDeleting = { ...prev };
        delete newDeleting[id];
        return newDeleting;
      });
    }
  };

  // Delete selected items
  const deleteSelectedItems = async () => {
    if (selectedItems.length === 0) return;
    
    setIsDeleteSelectedInProgress(true);
    
    try {
      for (const id of selectedItems) {
        // Find the item to get file IDs
        const itemToDelete = contentItems.find(item => item.id === id);
        
        if (itemToDelete) {
          // Delete files from storage if they exist
          if (itemToDelete.fileId) {
            await deleteFile(itemToDelete.fileId);
          }
          if (itemToDelete.zipFileId) {
            await deleteFile(itemToDelete.zipFileId);
          }
          if (itemToDelete.videoFileId) {
            await deleteFile(itemToDelete.videoFileId);
          }
          
          // Delete from Supabase
          await deleteContentFromSupabase(id);
          
          // Also delete from localStorage for backward compatibility
          deleteContent(id);
        }
      }
      
      // Clear selected items
      setSelectedItems([]);
      
      // Reload content
      loadContent();
    } catch (error) {
      console.error('Error deleting selected items:', error);
    } finally {
      setIsDeleteSelectedInProgress(false);
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

  // Handle selection of item
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  // Select or deselect all visible items
  const toggleSelectAll = () => {
    if (selectedItems.length === filteredContent.length) {
      // If all are selected, deselect all
      setSelectedItems([]);
    } else {
      // Otherwise, select all visible items
      setSelectedItems(filteredContent.map(item => item.id));
    }
  };

  // Only show if modal is open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto py-10">
      <div ref={modalRef} className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Fixed header area */}
        <div className="p-6 border-b border-border sticky top-0 bg-card z-10">
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
          <div className="border-b border-border">
            <div className="flex space-x-2 items-center justify-between">
              <div className="flex space-x-2">
                {['all', 'Artwork', 'Leaks', 'Banner Slider'].map((section) => (
                  <button
                    key={section}
                    onClick={() => {
                      setFilter(section);
                      setCategoryFilter('');
                      setSubcategoryFilter('');
                    }}
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
              
              {/* Delete Selected button in header */}
              {selectedItems.length > 0 && (
                <button
                  onClick={deleteSelectedItems}
                  disabled={isDeleteSelectedInProgress}
                  className={`px-4 py-1.5 mr-2 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors flex items-center gap-1.5 ${
                    isDeleteSelectedInProgress ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title="Delete Selected Items"
                >
                  {isDeleteSelectedInProgress ? (
                    <span className="inline-block w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span className="font-medium">Delete {selectedItems.length}</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Scrollable content area */}
        <div className="p-6 pb-24 flex-1 overflow-y-auto">
          {/* Category and Subcategory filters - only show for Artwork and Leaks */}
          {(filter === 'Artwork' || filter === 'Leaks') && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category filter */}
              <div>
                <label className="block text-sm font-medium mb-2">Filter by Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setSubcategoryFilter('');
                  }}
                  className="w-full p-2 bg-background border border-border rounded-md"
                >
                  <option value="">All Categories</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              {/* Subcategory filter */}
              {availableSubcategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Filter by Subcategory</label>
                  <select
                    value={subcategoryFilter}
                    onChange={(e) => setSubcategoryFilter(e.target.value)}
                    className="w-full p-2 bg-background border border-border rounded-md"
                  >
                    <option value="">All Subcategories</option>
                    {availableSubcategories.map((subcategory) => (
                      <option key={subcategory} value={subcategory}>{subcategory}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Mass delete control */}
          {filteredContent.length > 0 && (
            <div className="mb-4 flex items-center">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectedItems.length === filteredContent.length && filteredContent.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="select-all" className="text-sm font-medium">
                  {selectedItems.length === 0 
                    ? 'Select All' 
                    : `Selected ${selectedItems.length} of ${filteredContent.length}`}
                </label>
              </div>
            </div>
          )}

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
                  className={`border border-border rounded-lg overflow-hidden shadow-sm ${
                    selectedItems.includes(item.id) ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="relative aspect-video bg-muted">
                    {/* Checkbox for selecting item */}
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        id={`select-${item.id}`}
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="w-4 h-4 accent-primary"
                      />
                    </div>
                    
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
                    {editingItem === item.id ? (
                      <div className="space-y-3">
                        {/* Basic info fields */}
                        <div>
                          <label className="block text-sm font-medium mb-1">Title</label>
                          <input
                            type="text"
                            name="title"
                            value={editFormData.title}
                            onChange={handleEditChange}
                            className="w-full p-2 text-sm bg-background border border-border rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Description</label>
                          <textarea
                            name="description"
                            value={editFormData.description}
                            onChange={handleEditChange}
                            rows={2}
                            className="w-full p-2 text-sm bg-background border border-border rounded-md"
                          />
                        </div>
                        
                        {/* File upload fields */}
                        <div className="space-y-3 border-t border-border pt-3 mt-3">
                          <h4 className="text-sm font-medium">Replace Content Files</h4>
                          
                          {/* Image upload */}
                          {(item.imageUrl || !item.videoUrl) && (
                            <div>
                              <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                                <button
                                  type="button"
                                  onClick={() => imageInputRef.current?.click()}
                                  className="px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center gap-1"
                                >
                                  <Image className="w-3.5 h-3.5" />
                                  {item.imageUrl ? 'Replace Image' : 'Add Image'}
                                </button>
                                {selectedImageFile && (
                                  <span className="text-xs text-primary">{selectedImageFile.name}</span>
                                )}
                              </label>
                              <input 
                                type="file"
                                ref={imageInputRef}
                                onChange={(e) => handleFileChange(e, 'image')}
                                accept="image/*"
                                className="hidden"
                              />
                            </div>
                          )}
                          
                          {/* Zip upload */}
                          {(item.zipUrl || (!item.videoUrl && !item.zipUrl)) && (
                            <div>
                              <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                                <button
                                  type="button"
                                  onClick={() => zipInputRef.current?.click()}
                                  className="px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center gap-1"
                                >
                                  <FileArchive className="w-3.5 h-3.5" />
                                  {item.zipUrl ? 'Replace Zip' : 'Add Zip'}
                                </button>
                                {selectedZipFile && (
                                  <span className="text-xs text-primary">{selectedZipFile.name}</span>
                                )}
                              </label>
                              <input 
                                type="file"
                                ref={zipInputRef}
                                onChange={(e) => handleFileChange(e, 'zip')}
                                accept=".zip"
                                className="hidden"
                              />
                            </div>
                          )}
                          
                          {/* Video upload */}
                          {(item.videoUrl || (!item.imageUrl && !item.zipUrl)) && (
                            <div>
                              <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                                <button
                                  type="button"
                                  onClick={() => videoInputRef.current?.click()}
                                  className="px-3 py-1.5 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 flex items-center gap-1"
                                >
                                  <Video className="w-3.5 h-3.5" />
                                  {item.videoUrl ? 'Replace Video' : 'Add Video'}
                                </button>
                                {selectedVideoFile && (
                                  <span className="text-xs text-primary">{selectedVideoFile.name}</span>
                                )}
                              </label>
                              <input 
                                type="file"
                                ref={videoInputRef}
                                onChange={(e) => handleFileChange(e, 'video')}
                                accept="video/*"
                                className="hidden"
                              />
                            </div>
                          )}
                        </div>
                        
                        {/* Upload progress */}
                        {isUploading && (
                          <div className="mt-2">
                            <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all duration-300" 
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                            <p className="text-xs text-center mt-1 text-muted-foreground">
                              Uploading... {uploadProgress}%
                            </p>
                          </div>
                        )}
                        
                        {/* Error message */}
                        {uploadError && (
                          <div className="text-xs text-red-500 mt-1">
                            {uploadError}
                          </div>
                        )}
                        
                        {/* Action buttons */}
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={cancelEdit}
                            className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => saveEdit(item)}
                            disabled={isUploading}
                            className={`px-2 py-1 text-xs bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-1 ${
                              isUploading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <Check className="w-3 h-3" /> Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
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
                      </>
                    )}
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
                        {/* Edit button */}
                        {!editingItem && (
                          <button
                            onClick={() => startEditing(item)}
                            className="text-blue-500 hover:text-blue-700 transition-colors"
                            aria-label="Edit content"
                            title="Edit content"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteItem(item.id)}
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