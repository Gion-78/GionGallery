import { useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import UploadContent from './UploadContent';
import ContentManagement from './ContentManagement';

const UploadButton = () => {
  const { currentUser } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  
  // Check if user is admin
  const isAdmin = currentUser?.email === 'gionbusiness78@gmail.com';
  
  // Only render for admin
  if (!isAdmin) {
    return null;
  }
  
  return (
    <>
      <div className="fixed bottom-8 right-8 flex flex-col gap-3 items-end z-10">
        {/* Upload Button */}
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="bg-primary text-primary-foreground p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Upload Content"
        >
          <Upload className="w-5 h-5" />
        </button>
        
        {/* Manage Content Button */}
        <button
          onClick={() => setIsManageModalOpen(true)}
          className="bg-destructive text-destructive-foreground p-4 rounded-full shadow-lg hover:bg-destructive/90 transition-colors"
          aria-label="Manage Content"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      
      <UploadContent 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
      
      <ContentManagement
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
      />
    </>
  );
};

export default UploadButton; 