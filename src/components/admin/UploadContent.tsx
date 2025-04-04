import { useState, useEffect, useRef } from 'react';
import { X, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { uploadImage, uploadZip, uploadVideo } from '../../lib/imagekit';
import { triggerStorageUpdate } from '../../lib/utils';

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
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadInProgress, setUploadInProgress] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
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
    setTitle('');
    setDescription('');
    setImageFile(null);
    setZipFile(null);
    setVideoFile(null);
    setUploadSuccess(false);
    setUploadError('');
    setPreviewUrl('');
  };
  
  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  // Handle zip file selection
  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setZipFile(file);
    }
  };
  
  // Handle video file selection
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setVideoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  // Clear image selection
  const clearImageSelection = () => {
    setImageFile(null);
    setPreviewUrl('');
  };
  
  // Clear zip selection
  const clearZipSelection = () => {
    setZipFile(null);
  };
  
  // Clear video selection
  const clearVideoSelection = () => {
    setVideoFile(null);
    setPreviewUrl('');
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form based on category type
    if (!title && activeSection !== 'Banner Slider') {
      setUploadError('Title is required');
      return;
    }
    
    // Determine the upload type and file
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
    
    // Validate files
    if (uploadType === 'single-image' && !imageFile) {
      setUploadError('Please select an image to upload');
      return;
    } else if (uploadType === 'image-zip' && (!imageFile || !zipFile)) {
      setUploadError('Please select both image and zip file to upload');
      return;
    } else if (uploadType === 'video' && !videoFile) {
      setUploadError('Please select a video to upload');
      return;
    }
    
    // Start upload
    setUploadInProgress(true);
    setUploadError('');
    
    try {
      const folder = folderMapping[currentCategory] || 'Misc';
      const fileName = `${Date.now()}_${title.replace(/\s+/g, '_')}`;
      
      // Results to store
      let imageResult: any = null;
      let zipResult: any = null;
      let videoResult: any = null;
      
      // Upload image
      if (imageFile && (uploadType === 'single-image' || uploadType === 'image-zip')) {
        imageResult = await uploadImage(imageFile, folder, `${fileName}_image.${imageFile.name.split('.').pop()}`);
        if (!imageResult.success) {
          throw new Error('Failed to upload image');
        }
      }
      
      // Upload zip if required
      if (zipFile && uploadType === 'image-zip') {
        zipResult = await uploadZip(zipFile, folder, `${fileName}_zip.${zipFile.name.split('.').pop()}`);
        if (!zipResult.success) {
          throw new Error('Failed to upload zip file');
        }
      }
      
      // Upload video if required
      if (videoFile && uploadType === 'video') {
        videoResult = await uploadVideo(videoFile, folder, `${fileName}_video.${videoFile.name.split('.').pop()}`);
        if (!videoResult.success) {
          throw new Error('Failed to upload video');
        }
      }
      
      // Create metadata for the upload
      const metadata = {
        id: Date.now().toString(),
        title,
        description,
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
        createdAt: new Date().toISOString(),
        folder
      };
      
      console.log('Saving content with metadata:', metadata);
      
      // Get existing content or initialize empty array
      const existingContentJSON = localStorage.getItem('siteContent') || '[]';
      const existingContent = JSON.parse(existingContentJSON);
      
      // Add new content
      existingContent.push(metadata);
      
      // Save back to storage
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
            className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 flex flex-col">
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
              <div className="mb-6 border-b border-border">
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
                      {Object.keys(categoryStructure[activeSection]).map((category) => (
                        <option key={category} value={category}>{category}</option>
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
                
                {/* Title Field - Required for everything except Banner Slider */}
                {(activeCategory || activeSection === 'Banner Slider') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Title {activeSection !== 'Banner Slider' && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2 bg-background border border-border rounded-md"
                      required={activeSection !== 'Banner Slider'}
                    />
                  </div>
                )}
                
                {/* Description Field - Optional for all */}
                {(activeCategory || activeSection === 'Banner Slider') && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full p-2 bg-background border border-border rounded-md h-24"
                    ></textarea>
                  </div>
                )}
                
                {/* Upload UI based on category type */}
                {currentUploadType && (
                  <div className="space-y-4">
                    <h3 className="font-medium">Upload Files</h3>
                    
                    {/* Image Upload Button for single-image and image-zip */}
                    {(currentUploadType === 'single-image' || currentUploadType === 'image-zip') && (
                      <div className="flex items-center space-x-3">
                        <label className="relative cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          <span>Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </label>
                        {imageFile && (
                          <button
                            type="button"
                            onClick={clearImageSelection}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Remove image"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                        {imageFile && (
                          <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                            {imageFile.name}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Zip Upload Button for image-zip */}
                    {currentUploadType === 'image-zip' && (
                      <div className="flex items-center space-x-3">
                        <label className="relative cursor-pointer bg-secondary hover:bg-secondary/90 text-secondary-foreground px-4 py-2 rounded-md flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          <span>Upload Zip File</span>
                          <input
                            type="file"
                            accept=".zip"
                            onChange={handleZipChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </label>
                        {zipFile && (
                          <button
                            type="button"
                            onClick={clearZipSelection}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Remove zip file"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                        {zipFile && (
                          <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                            {zipFile.name}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Video Upload Button for video */}
                    {currentUploadType === 'video' && (
                      <div className="flex items-center space-x-3">
                        <label className="relative cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2">
                          <Upload className="w-4 h-4" />
                          <span>Upload Video</span>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </label>
                        {videoFile && (
                          <button
                            type="button"
                            onClick={clearVideoSelection}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Remove video"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                        {videoFile && (
                          <span className="text-sm text-muted-foreground truncate max-w-[150px]">
                            {videoFile.name}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Preview */}
                    {previewUrl && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">Preview</h4>
                        <div className="border border-border rounded-md overflow-hidden w-full max-w-[300px] h-auto">
                          {currentUploadType === 'video' ? (
                            <video src={previewUrl} controls className="w-full h-auto" />
                          ) : (
                            <img src={previewUrl} alt="Preview" className="w-full h-auto" />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
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

// Function to save metadata to localStorage
// This is a simple solution for development - in production you'd use a database
const saveContentMetadata = async (metadata: {
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
}) => {
  try {
    // Get existing content or initialize empty array
    const existingContentJSON = localStorage.getItem('siteContent') || '[]';
    const existingContent = JSON.parse(existingContentJSON);
    
    // Add new content
    existingContent.push(metadata);
    
    // Save back to storage
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
    
    return true;
  } catch (error) {
    console.error('Error saving content metadata:', error);
    throw error;
  }
}

export default UploadContent; 