import { FC, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface GalleryFilterProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

const GalleryFilter: FC<GalleryFilterProps> = ({ activeCategory, setActiveCategory }) => {
  const [showMiscDropdown, setShowMiscDropdown] = useState(false);
  const [showBannersDropdown, setShowBannersDropdown] = useState(false);
  const [showTitlesDropdown, setShowTitlesDropdown] = useState(false);
  const [showFramesDropdown, setShowFramesDropdown] = useState(false);

  const mainCategories = ["Characters", "Skills", "Portraits"];
  const bannerSubcategories = ["Character Banners", "Event Banners"];
  const titlesSubcategories = ["Character Titles", "Event Titles"];
  const framesSubcategories = ["Character Frames", "Event Frames"];
  const miscCategories = ["Emblems", "Resources", "Login Screens", "Cutscenes"];

  const toggleMiscDropdown = () => {
    setShowMiscDropdown(!showMiscDropdown);
    // Close other dropdowns
    if (!showMiscDropdown) {
      setShowBannersDropdown(false);
      setShowTitlesDropdown(false);
      setShowFramesDropdown(false);
    }
  };

  const toggleBannersDropdown = () => {
    setShowBannersDropdown(!showBannersDropdown);
    // Close other dropdowns
    if (!showBannersDropdown) {
      setShowMiscDropdown(false);
      setShowTitlesDropdown(false);
      setShowFramesDropdown(false);
    }
  };

  const toggleTitlesDropdown = () => {
    setShowTitlesDropdown(!showTitlesDropdown);
    // Close other dropdowns
    if (!showTitlesDropdown) {
      setShowMiscDropdown(false);
      setShowBannersDropdown(false);
      setShowFramesDropdown(false);
    }
  };

  const toggleFramesDropdown = () => {
    setShowFramesDropdown(!showFramesDropdown);
    // Close other dropdowns
    if (!showFramesDropdown) {
      setShowMiscDropdown(false);
      setShowBannersDropdown(false);
      setShowTitlesDropdown(false);
    }
  };

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    if (miscCategories.includes(category) || 
        bannerSubcategories.includes(category) || 
        titlesSubcategories.includes(category) || 
        framesSubcategories.includes(category)) {
      setShowMiscDropdown(false);
      setShowBannersDropdown(false);
      setShowTitlesDropdown(false);
      setShowFramesDropdown(false);
    }
  };

  const isBannerCategoryActive = bannerSubcategories.includes(activeCategory);
  const isTitlesCategoryActive = titlesSubcategories.includes(activeCategory);
  const isFramesCategoryActive = framesSubcategories.includes(activeCategory);
  const isMiscCategoryActive = miscCategories.includes(activeCategory);

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {/* Characters button */}
      <button
        key="Characters"
        onClick={() => handleCategoryClick("Characters")}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          activeCategory === "Characters" 
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        Characters
      </button>
      
      {/* Banners Dropdown */}
      <div className="relative">
        <button
          onClick={toggleBannersDropdown}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
            isBannerCategoryActive
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Banners
          {showBannersDropdown ? 
            <ChevronUp className="w-4 h-4" /> : 
            <ChevronDown className="w-4 h-4" />
          }
        </button>
        
        {showBannersDropdown && (
          <div className="absolute mt-2 w-48 bg-card rounded-md shadow-lg z-10 py-1 border border-border">
            {bannerSubcategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  activeCategory === category
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-secondary/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Skills button */}
      <button
        key="Skills"
        onClick={() => handleCategoryClick("Skills")}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          activeCategory === "Skills" 
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        Skills
      </button>
      
      {/* Portraits button */}
      <button
        key="Portraits"
        onClick={() => handleCategoryClick("Portraits")}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
          activeCategory === "Portraits" 
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
        }`}
      >
        Portraits
      </button>
      
      {/* Titles Dropdown */}
      <div className="relative">
        <button
          onClick={toggleTitlesDropdown}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
            isTitlesCategoryActive
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Titles
          {showTitlesDropdown ? 
            <ChevronUp className="w-4 h-4" /> : 
            <ChevronDown className="w-4 h-4" />
          }
        </button>
        
        {showTitlesDropdown && (
          <div className="absolute mt-2 w-48 bg-card rounded-md shadow-lg z-10 py-1 border border-border">
            {titlesSubcategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  activeCategory === category
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-secondary/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Frames Dropdown */}
      <div className="relative">
        <button
          onClick={toggleFramesDropdown}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
            isFramesCategoryActive
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Frames
          {showFramesDropdown ? 
            <ChevronUp className="w-4 h-4" /> : 
            <ChevronDown className="w-4 h-4" />
          }
        </button>
        
        {showFramesDropdown && (
          <div className="absolute mt-2 w-48 bg-card rounded-md shadow-lg z-10 py-1 border border-border">
            {framesSubcategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  activeCategory === category
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-secondary/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Miscellaneous Dropdown */}
      <div className="relative">
        <button
          onClick={toggleMiscDropdown}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
            isMiscCategoryActive
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          }`}
        >
          Miscellaneous
          {showMiscDropdown ? 
            <ChevronUp className="w-4 h-4" /> : 
            <ChevronDown className="w-4 h-4" />
          }
        </button>
        
        {showMiscDropdown && (
          <div className="absolute mt-2 w-48 bg-card rounded-md shadow-lg z-10 py-1 border border-border">
            {miscCategories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`block w-full text-left px-4 py-2 text-sm ${
                  activeCategory === category
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground hover:bg-secondary/50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryFilter;
