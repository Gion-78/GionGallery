import { useState, useEffect, useRef } from 'react';
import { X, Upload, Loader2, Plus, Minus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { uploadImage, uploadZip, uploadVideo } from '../../lib/imagekit';
import { triggerStorageUpdate } from '../../lib/utils';
import { saveContent } from '../../lib/supabase';

// Categories and subcategories structure
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

// Storage folders mapping
const folderMapping: Record<string, string> = {
  'Characters': 'CharacterArts',
  'Character Banners': 'CharacterBannerArts',
  'Event Banners': 'EventBannerArts',
  'Skills': 'SkillArts',
  'Portraits': 'PortraitArts',
  'Character Titles': 'CharacterTitleArts',
  'Event Titles': 'EventTitleArts',
  'Character Frames': 'CharacterFrameArts',
  'Event Frames': 'EventFrameArts',
  'Emblems': 'EmblemArts',
  'Resources': 'ResourceArts',
  'Login Screens': 'LoginScreens',
  'Cutscenes': 'CutsceneArts',
  'Main Leaks': 'MainLeaks',
  'Beta Leaks': 'BetaLeaks',
  'Banner Slider': 'BannerSlider'
};

interface ContentItem {
  title: string;
  description: string;
  imageFile: File | null;
  zipFile: File | null;
  videoFile: File | null;
  previewUrl: string;
}

interface UploadContentProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadContent: React.FC<UploadContentProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const modalRef = useRef<HTMLDivElement>(null);
  
  // State for form fields
  const [activeSection, setActiveSection] = useState<'Artwork' | 'Leaks' | 'Banner Slider'>('Artwork');
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [activeSubcategory, setActiveSubcategory] = useState<string>('');
  const [uploadInProgress, setUploadInProgress] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  
  // Multiple content items support
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    { title: '', description: '', imageFile: null, zipFile: null, videoFile: null, previewUrl: '' }
  ]);
  
  // Check if user is admin
  const isAdmin = currentUser?.email === 'gionbusiness78@gmail.com';
  
  // Reset form when activeSection changes
  useEffect(() => {
    resetForm();
    
    if (activeSection === 'Banner Slider') {
      setActiveCategory('Banner Slider');
    } else {
      setActiveCategory('');
    }
    setActiveSubcategory('');
  }, [activeSection]);
  
  // Reset form when component mounts
  useEffect(() => {
    resetForm();
  }, [isOpen]);
  
  // Reset the form
  const resetForm = () => {
    setContentItems([
      { title: '', description: '', imageFile: null, zipFile: null, videoFile: null, previewUrl: '' }
    ]);
    setUploadSuccess(false);
    setUploadError('');
  };
  
  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setContentItems(items => {
        const newItems = [...items];
        newItems[index] = {
          ...newItems[index],
          imageFile: file,
          previewUrl: URL.createObjectURL(file)
        };
        return newItems;
      });
    }
  };
  
  // Handle zip file selection
  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setContentItems(items => {
        const newItems = [...items];
        newItems[index] = {
          ...newItems[index],
          zipFile: file
        };
        return newItems;
      });
    }
  };
  
  // Handle video file selection
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setContentItems(items => {
        const newItems = [...items];
        newItems[index] = {
          ...newItems[index],
          videoFile: file,
          previewUrl: URL.createObjectURL(file)
        };
        return newItems;
      });
    }
  };
  
  // Clear image selection
  const clearImageSelection = (index: number) => {
    setContentItems(items => {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        imageFile: null,
        previewUrl: newItems[index].videoFile ? newItems[index].previewUrl : ''
      };
      return newItems;
    });
  };
  
  // Clear zip selection
  const clearZipSelection = (index: number) => {
    setContentItems(items => {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        zipFile: null
      };
      return newItems;
    });
  };
  
  // Clear video selection
  const clearVideoSelection = (index: number) => {
    setContentItems(items => {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        videoFile: null,
        previewUrl: newItems[index].imageFile ? newItems[index].previewUrl : ''
      };
      return newItems;
    });
  };
  
  // Add content item (unlimited)
  const addContentItem = () => {
    setContentItems([
      ...contentItems,
      { title: '', description: '', imageFile: null, zipFile: null, videoFile: null, previewUrl: '' }
    ]);
  };
  
  // Remove content item
  const removeContentItem = (index: number) => {
    if (contentItems.length > 1) {
      setContentItems(items => items.filter((_, i) => i !== index));
    }
  };
  
  // Update content item title
  const updateContentItemTitle = (index: number, title: string) => {
    setContentItems(items => {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        title
      };
      return newItems;
    });
  };
  
  // Update content item description
  const updateContentItemDescription = (index: number, description: string) => {
    setContentItems(items => {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        description
      };
      return newItems;
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty content items
    const filledContentItems = contentItems.filter(item => 
      (item.imageFile || item.zipFile || item.videoFile) && 
      (activeSection === 'Banner Slider' || item.title.trim() !== '')
    );
    
    if (filledContentItems.length === 0) {
      setUploadError('Please add at least one content item with required fields');
      return;
    }
    
    // Determine the upload type
    const currentCategory = activeSubcategory || activeCategory;
    let uploadType = 'single-image';
    let categoryType: any = categoryStructure;
    
    if (activeSection === 'Artwork') {
      categoryType = categoryStructure.Artwork;
      if (activeSubcategory) {
        // For nested categories
        categoryType = Object.entries(categoryType).find(([category]) => category === activeCategory)?.[1];
        uploadType = (categoryType as any)[activeSubcategory]?.type || 'single-image';
      } else {
        uploadType = categoryType[activeCategory]?.type || 'single-image';
      }
    } else if (activeSection === 'Leaks') {
      uploadType = categoryStructure.Leaks[activeCategory as keyof typeof categoryStructure.Leaks]?.type || 'single-image';
    } else if (activeSection === 'Banner Slider') {
      uploadType = categoryStructure['Banner Slider'].type;
    }
    
    // Start upload
    setUploadInProgress(true);
    setUploadError('');
    
    try {
      // Process each content item
      for (const item of filledContentItems) {
        // Validate files for current item
        if (uploadType === 'single-image' && !item.imageFile) {
          throw new Error('Please select an image to upload for all content items');
        } else if (uploadType === 'image-zip' && (!item.imageFile || !item.zipFile)) {
          throw new Error('Please select both image and zip file to upload for all content items');
        } else if (uploadType === 'video' && !item.videoFile) {
          throw new Error('Please select a video to upload for all content items');
        }
        
        const folder = folderMapping[currentCategory] || 'Misc';
        const fileName = `${Date.now()}_${item.title.replace(/\s+/g, '_')}`;
        
        // Results to store
        let imageResult: any = null;
        let zipResult: any = null;
        let videoResult: any = null;
        
        // Upload image
        if (item.imageFile && (uploadType === 'single-image' || uploadType === 'image-zip')) {
          imageResult = await uploadImage(item.imageFile, folder, `${fileName}_image.${item.imageFile.name.split('.').pop()}`);
          if (!imageResult.success) {
            throw new Error('Failed to upload image');
          }
        }
        
        // Upload zip if required
        if (item.zipFile && uploadType === 'image-zip') {
          zipResult = await uploadZip(item.zipFile, folder, `${fileName}_zip.${item.zipFile.name.split('.').pop()}`);
          if (!zipResult.success) {
            throw new Error('Failed to upload zip file');
          }
        }
        
        // Upload video if required
        if (item.videoFile && uploadType === 'video') {
          // Save original file details before upload for reference
          const originalVideoSize = item.videoFile.size;
          const originalVideoName = item.videoFile.name;
          const originalVideoType = item.videoFile.type;
          
          videoResult = await uploadVideo(item.videoFile, folder, `${fileName}_video.${item.videoFile.name.split('.').pop()}`);
          if (!videoResult.success) {
            throw new Error('Failed to upload video');
          }
          
          // Add original video metadata to the video result
          videoResult.originalSize = originalVideoSize;
          videoResult.originalName = originalVideoName;
          videoResult.originalType = originalVideoType;
        }
        
        // Create metadata for the upload
        const metadata = {
          id: Date.now().toString(),
          title: item.title,
          description: item.description,
          section: activeSection,
          category: activeCategory,
          subcategory: activeSubcategory,
          imageUrl: imageResult?.url || null,
          thumbnailUrl: imageResult?.thumbnailUrl || null,
          zipUrl: zipResult?.url || null,
          videoUrl: videoResult?.url || null,
          fileId: imageResult?.fileId || null,
          zipFileId: zipResult?.fileId || null,
          videoFileId: videoResult?.fileId || null,
          // Add the original video details if available
          videoMetadata: videoResult ? {
            originalSize: videoResult.originalSize,
            originalName: videoResult.originalName,
            originalType: videoResult.originalType
          } : null,
          createdAt: new Date().toISOString(),
          folder
        };
        
        console.log('Saving metadata to Supabase:', metadata);
        
        // Get existing content or initialize empty array
        const existingContentJSON = localStorage.getItem('siteContent') || '[]';
        const existingContent = JSON.parse(existingContentJSON);
        
        // Add new content
        existingContent.push(metadata);
        
        // Save to Supabase
        try {
          console.log('Saving metadata to Supabase:', metadata);
          // Pass the current user's email for authentication
          const result = await saveContent(metadata, currentUser?.email);
          if (!result.success) {
            console.error('Failed to save to Supabase:', result.error);
          } else {
            console.log('Successfully saved to Supabase');
          }
        } catch (error) {
          console.error('Exception when saving to Supabase:', error);
        }
        
        // Keep localStorage for backward compatibility temporarily
        localStorage.setItem('siteContent', JSON.stringify(existingContent));
        
        // If this is a banner slider item, also update the banners
        if (metadata.section === 'Banner Slider' && metadata.imageUrl) {
          const existingBannersJSON = localStorage.getItem('banners') || '[]';
          const existingBanners = JSON.parse(existingBannersJSON);
          
          existingBanners.push({
            id: metadata.id,
            title: metadata.title,
            description: metadata.description || '',
            imageUrl: metadata.imageUrl
          });
          
          localStorage.setItem('banners', JSON.stringify(existingBanners));
        }
      }
      
      // Trigger updates across components
      triggerStorageUpdate();
      
      // Upload was successful
      setUploadSuccess(true);
      resetForm();
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
    } catch (error: any) {
      setUploadError(error.message || 'Failed to upload content');
    } finally {
      setUploadInProgress(false);
    }
  };
  
  // If not admin, don't render anything
  if (!isAdmin) {
    return null;
  }
  
  // Determine what files can be uploaded for current selection
  const getCurrentUploadType = () => {
    if (!activeCategory) return null;
    
    if (activeSection === 'Artwork') {
      if (activeSubcategory) {
        const subcategoryType = (categoryStructure.Artwork as any)[activeCategory]?.[activeSubcategory]?.type;
        return subcategoryType;
      }
      return (categoryStructure.Artwork as any)[activeCategory]?.type;
    } else if (activeSection === 'Leaks') {
      return categoryStructure.Leaks[activeCategory as keyof typeof categoryStructure.Leaks]?.type;
    } else if (activeSection === 'Banner Slider') {
      return categoryStructure['Banner Slider'].type;
    }
    
    return null;
  };
  
  const currentUploadType = getCurrentUploadType();
  
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto py-10">
          <div 
            ref={modalRef}
            className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"
          >
            {/* Fixed header area */}
            <div className="p-6 border-b border-border sticky top-0 bg-card z-10">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Upload Content</h2>
                <button 
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Section Tabs */}
              <div className="border-b border-border">
                <div className="flex space-x-2">
                  {(['Artwork', 'Leaks', 'Banner Slider'] as const).map((section) => (
                    <button
                      key={section}
                      onClick={() => setActiveSection(section)}
                      className={`px-4 py-2 ${
                        activeSection === section 
                          ? 'border-b-2 border-primary text-primary' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {section}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Scrollable content area */}
            <div className="p-6 flex-1 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Selection */}
                {activeSection !== 'Banner Slider' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <select
                      value={activeCategory}
                      onChange={(e) => {
                        setActiveCategory(e.target.value);
                        setActiveSubcategory('');
                      }}
                      className="w-full p-2 bg-background border border-border rounded-md"
                      required
                    >
                      <option value="">Select Category</option>
                      {Object.keys(categoryStructure[activeSection]).map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* Subcategory Selection (if applicable) */}
                {activeSection === 'Artwork' && activeCategory && typeof (categoryStructure.Artwork as any)[activeCategory] === 'object' && 
                  !('type' in (categoryStructure.Artwork as any)[activeCategory]) && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Subcategory</label>
                    <select
                      value={activeSubcategory}
                      onChange={(e) => setActiveSubcategory(e.target.value)}
                      className="w-full p-2 bg-background border border-border rounded-md"
                      required
                    >
                      <option value="">Select Subcategory</option>
                      {Object.keys((categoryStructure.Artwork as any)[activeCategory]).map((subcat) => (
                        <option key={subcat} value={subcat}>{subcat}</option>
                      ))}
                    </select>
                  </div>
                )}
                
                {/* Content Items */}
                {currentUploadType && (activeCategory || activeSection === 'Banner Slider') && (
                  <>
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Content Items ({contentItems.length})</h3>
                      <button
                        type="button"
                        onClick={addContentItem}
                        className="text-primary hover:text-primary/90 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" /> Add Item
                      </button>
                    </div>
                    
                    <div className="space-y-6">
                      {contentItems.map((item, index) => (
                        <div key={index} className="border border-border rounded-lg p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-medium">Item {index + 1}</h4>
                            {contentItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeContentItem(index)}
                                className="text-destructive hover:text-destructive/90 transition-colors flex items-center gap-1"
                              >
                                <Minus className="w-4 h-4" /> Remove
                              </button>
                            )}
                          </div>
                          
                          {/* Title Field */}
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Title {activeSection !== 'Banner Slider' && <span className="text-red-500">*</span>}
                            </label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => updateContentItemTitle(index, e.target.value)}
                              className="w-full p-2 bg-background border border-border rounded-md"
                              required={activeSection !== 'Banner Slider'}
                            />
                          </div>
                          
                          {/* Description Field */}
                          <div>
                            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                            <textarea
                              value={item.description}
                              onChange={(e) => updateContentItemDescription(index, e.target.value)}
                              className="w-full p-2 bg-background border border-border rounded-md h-24"
                            ></textarea>
                          </div>
                          
                          {/* Upload Files */}
                          <div className="space-y-4">
                            <h5 className="font-medium text-sm">Upload Files</h5>
                            
                            {/* Image Upload Button */}
                            {(currentUploadType === 'single-image' || currentUploadType === 'image-zip') && (
                              <div className="flex items-center space-x-3">
                                <label className="relative cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Upload Image</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageChange(e, index)}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                  />
                                </label>
                                {item.imageFile && (
                                  <button
                                    type="button"
                                    onClick={() => clearImageSelection(index)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label="Remove image"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                )}
                                {item.imageFile && (
                                  <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                                    {item.imageFile.name}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {/* Zip Upload Button */}
                            {currentUploadType === 'image-zip' && (
                              <div className="flex items-center space-x-3">
                                <label className="relative cursor-pointer bg-secondary hover:bg-secondary/90 text-secondary-foreground px-4 py-2 rounded-md flex items-center gap-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Upload Zip File</span>
                                  <input
                                    type="file"
                                    accept=".zip"
                                    onChange={(e) => handleZipChange(e, index)}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                  />
                                </label>
                                {item.zipFile && (
                                  <button
                                    type="button"
                                    onClick={() => clearZipSelection(index)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label="Remove zip file"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                )}
                                {item.zipFile && (
                                  <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                                    {item.zipFile.name}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {/* Video Upload Button */}
                            {currentUploadType === 'video' && (
                              <div className="flex items-center space-x-3">
                                <label className="relative cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2">
                                  <Upload className="w-4 h-4" />
                                  <span>Upload Video</span>
                                  <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => handleVideoChange(e, index)}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                  />
                                </label>
                                {item.videoFile && (
                                  <button
                                    type="button"
                                    onClick={() => clearVideoSelection(index)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label="Remove video"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                )}
                                {item.videoFile && (
                                  <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                                    {item.videoFile.name}
                                  </span>
                                )}
                              </div>
                            )}
                            
                            {/* Preview */}
                            {item.previewUrl && (
                              <div className="mt-4">
                                <h5 className="text-sm font-medium mb-2">Preview</h5>
                                <div className="border border-border rounded-md overflow-hidden w-full max-w-[300px] h-auto">
                                  {currentUploadType === 'video' && item.videoFile ? (
                                    <video src={item.previewUrl} controls className="w-full h-auto" />
                                  ) : (
                                    <img src={item.previewUrl} alt="Preview" className="w-full h-auto" />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                
                {/* Error message */}
                {uploadError && (
                  <div className="text-red-500 text-sm">{uploadError}</div>
                )}
                
                {/* Success message */}
                {uploadSuccess && (
                  <div className="text-green-500 text-sm">Content uploaded successfully!</div>
                )}
                
                {/* Submit button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={uploadInProgress || !activeCategory && activeSection !== 'Banner Slider'}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploadInProgress ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UploadContent; 