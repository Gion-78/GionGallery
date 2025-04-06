import { FC, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface GalleryFilterProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

const GalleryFilter: FC<GalleryFilterProps> = ({ activeCategory, setActiveCategory }) => {
  const mainCategories = ["Characters", "Skills", "Portraits"];
  const bannerSubcategories = ["Character Banners", "Event Banners"];
  const titlesSubcategories = ["Character Titles", "Event Titles"];
  const framesSubcategories = ["Character Frames", "Event Frames"];
  const miscCategories = ["Emblems", "Resources", "Login Screens", "Cutscenes"];

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
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
      
      {/* Banners Dropdown - Using DropdownMenu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
              isBannerCategoryActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Banners
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-48 bg-card rounded-md shadow-lg z-10 py-1 border border-border min-w-[8rem]"
          align="center"
        >
          {bannerSubcategories.map((category) => (
            <DropdownMenuItem 
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`text-sm cursor-pointer ${
                activeCategory === category
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-secondary/50'
              }`}
            >
              {category}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
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
      
      {/* Titles Dropdown - Using DropdownMenu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
              isTitlesCategoryActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Titles
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-48 bg-card rounded-md shadow-lg z-10 py-1 border border-border min-w-[8rem]"
          align="center"
        >
          {titlesSubcategories.map((category) => (
            <DropdownMenuItem 
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`text-sm cursor-pointer ${
                activeCategory === category
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-secondary/50'
              }`}
            >
              {category}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Frames Dropdown - Using DropdownMenu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
              isFramesCategoryActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Frames
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-48 bg-card rounded-md shadow-lg z-10 py-1 border border-border min-w-[8rem]"
          align="center"
        >
          {framesSubcategories.map((category) => (
            <DropdownMenuItem 
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`text-sm cursor-pointer ${
                activeCategory === category
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-secondary/50'
              }`}
            >
              {category}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Misc Dropdown - Using DropdownMenu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-1 ${
              isMiscCategoryActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Other
            <ChevronDown className="w-4 h-4 ml-1" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="w-48 bg-card rounded-md shadow-lg z-10 py-1 border border-border min-w-[8rem]"
          align="center"
        >
          {miscCategories.map((category) => (
            <DropdownMenuItem 
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`text-sm cursor-pointer ${
                activeCategory === category
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground hover:bg-secondary/50'
              }`}
            >
              {category}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default GalleryFilter;
