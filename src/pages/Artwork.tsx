import { useState, useEffect } from 'react';
import { Filter, Search, ArrowUpDown, ChevronLeft, ChevronRight, SortAsc, SortDesc, Calendar, AlignLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';
import GalleryFilter from '../components/gallery/GalleryFilter';
import GalleryGrid from '../components/gallery/GalleryGrid';
import CharacterSkillsPanel from '../components/gallery/CharacterSkillsPanel';
import BannerSlider from '../components/gallery/BannerSlider';
import { observeElements, fadeInUp } from '../lib/animations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import SkillsSortDropdown from '../components/SkillsSortDropdown';

// Define types for sort options
type SortField = 'date' | 'alphabetical';
type SortDirection = 'asc' | 'desc';

interface SortOption {
  field: SortField;
  direction: SortDirection;
}

const Artwork = () => {
  const [activeCategory, setActiveCategory] = useState<string>("Characters");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeBannerType, setActiveBannerType] = useState<'Character' | 'Event'>('Character');
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // New sorting state with field and direction - default to date/newest first
  const [sortOptions, setSortOptions] = useState<{[key: string]: SortOption}>({
    'Characters': { field: 'date', direction: 'desc' },
    'Portraits': { field: 'date', direction: 'desc' },
    'Skills': { field: 'date', direction: 'desc' },
    'Emblems': { field: 'date', direction: 'desc' },
    'Cutscenes': { field: 'date', direction: 'desc' },
    'Resources': { field: 'date', direction: 'desc' },
    'Login Screens': { field: 'date', direction: 'desc' },
    'Character Banners': { field: 'date', direction: 'desc' },
    'Event Banners': { field: 'date', direction: 'desc' },
    'Character Titles': { field: 'date', direction: 'desc' },
    'Event Titles': { field: 'date', direction: 'desc' },
    'Character Frames': { field: 'date', direction: 'desc' },
    'Event Frames': { field: 'date', direction: 'desc' }
  });
  
  const [totalItems, setTotalItems] = useState<number>(0);
  const itemsPerPage = 8; // Number of items to show per page
  
  useEffect(() => {
    // Apply animations to elements as they come into view
    const observer = observeElements('.animate-on-scroll', fadeInUp);
    
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  // Auto-advance to next page if current page is full and new items are added
  useEffect(() => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages > currentPage && totalItems % itemsPerPage === 1) {
      setCurrentPage(totalPages);
    }
  }, [totalItems, itemsPerPage, currentPage]);

  // Function to update sort options for the active category
  const updateSortOptions = (field: SortField, direction: SortDirection) => {
    setSortOptions(prev => ({
      ...prev,
      [activeCategory]: { field, direction }
    }));
  };

  // Function to navigate to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Function to navigate to next page
  const goToNextPage = () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Create a reusable filter dropdown component
  const FilterDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="bg-secondary/50 border border-border/30 text-foreground rounded-md p-2.5 hover:bg-secondary transition-all duration-200 ml-2"
          aria-label="Filter options"
        >
          <span className="sr-only">Sort by</span>
          <Filter className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Date Upload Options */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Date Released</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem 
              onClick={() => updateSortOptions('date', 'asc')}
              className={sortOptions[activeCategory].field === 'date' && sortOptions[activeCategory].direction === 'asc' ? 'bg-primary/20 text-primary' : ''}
            >
              <SortAsc className="mr-2 h-4 w-4" />
              <span>Oldest First</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => updateSortOptions('date', 'desc')}
              className={sortOptions[activeCategory].field === 'date' && sortOptions[activeCategory].direction === 'desc' ? 'bg-primary/20 text-primary' : ''}
            >
              <SortDesc className="mr-2 h-4 w-4" />
              <span>Newest First</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        {/* Alphabetical Options */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <AlignLeft className="mr-2 h-4 w-4" />
            <span>Alphabetical</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem 
              onClick={() => updateSortOptions('alphabetical', 'asc')}
              className={sortOptions[activeCategory].field === 'alphabetical' && sortOptions[activeCategory].direction === 'asc' ? 'bg-primary/20 text-primary' : ''}
            >
              <SortAsc className="mr-2 h-4 w-4" />
              <span>A-Z</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => updateSortOptions('alphabetical', 'desc')}
              className={sortOptions[activeCategory].field === 'alphabetical' && sortOptions[activeCategory].direction === 'desc' ? 'bg-primary/20 text-primary' : ''}
            >
              <SortDesc className="mr-2 h-4 w-4" />
              <span>Z-A</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const renderCategoryContent = () => {
    switch (activeCategory) {
      case "Characters":
        return (
          <>
            <div className="mb-6 flex justify-center">
              <div className="flex items-center">
                <div className="relative w-80">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    className="bg-secondary/50 border border-border/30 text-foreground rounded-md block w-full pl-10 p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
                    placeholder="Search Characters"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <FilterDropdown />
              </div>
            </div>
            <GalleryGrid 
              viewMode="grid" 
              category={activeCategory}
              searchQuery={searchQuery}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              sortOption={sortOptions[activeCategory]}
              onTotalItemsChange={setTotalItems}
            />
          </>
        );
      case "Portraits":
        return (
          <>
            <div className="mb-6 flex justify-center">
              <div className="flex items-center">
                <div className="relative w-80">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    className="bg-secondary/50 border border-border/30 text-foreground rounded-md block w-full pl-10 p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
                    placeholder="Search Portraits"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <FilterDropdown />
              </div>
            </div>
            <GalleryGrid 
              viewMode="grid" 
              category={activeCategory}
              searchQuery={searchQuery}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              sortOption={sortOptions[activeCategory]}
              onTotalItemsChange={setTotalItems}
            />
          </>
        );
      case "Emblems":
      case "Cutscenes":
        return (
          <>
            <div className="mb-6 flex justify-center">
              <div className="flex items-center">
                <div className="relative w-80">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    className="bg-secondary/50 border border-border/30 text-foreground rounded-md block w-full pl-10 p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
                    placeholder={`Search ${activeCategory}`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <FilterDropdown />
              </div>
            </div>
            <GalleryGrid 
              viewMode="grid" 
              category={activeCategory}
              searchQuery={searchQuery}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              sortOption={sortOptions[activeCategory]}
              onTotalItemsChange={setTotalItems}
            />
          </>
        );
      case "Resources":
      case "Login Screens":
        return (
          <>
            <GalleryGrid 
              viewMode="grid" 
              category={activeCategory}
              searchQuery=""
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              sortOption={sortOptions[activeCategory]}
              onTotalItemsChange={setTotalItems}
            />
          </>
        );
      case "Character Banners":
        return (
          <>
            <div className="mb-6 flex justify-center">
              <div className="flex items-center">
                <div className="relative w-80">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    className="bg-secondary/50 border border-border/30 text-foreground rounded-md block w-full pl-10 p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
                    placeholder="Search Character Banners"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <FilterDropdown />
              </div>
            </div>
            <GalleryGrid 
              viewMode="grid" 
              category={activeCategory}
              searchQuery={searchQuery}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              sortOption={sortOptions[activeCategory]}
              onTotalItemsChange={setTotalItems}
            />
          </>
        );
      case "Event Banners":
        return (
          <>
            <GalleryGrid 
              viewMode="grid" 
              category={activeCategory}
              searchQuery=""
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              sortOption={sortOptions[activeCategory]}
              onTotalItemsChange={setTotalItems}
            />
          </>
        );
      case "Character Titles":
        return (
          <>
            <div className="mb-6 flex justify-center">
              <div className="flex items-center">
                <div className="relative w-80">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    className="bg-secondary/50 border border-border/30 text-foreground rounded-md block w-full pl-10 p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
                    placeholder="Search Character Titles"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <FilterDropdown />
              </div>
            </div>
            <GalleryGrid 
              viewMode="grid" 
              category={activeCategory}
              searchQuery={searchQuery}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              sortOption={sortOptions[activeCategory]}
              onTotalItemsChange={setTotalItems}
            />
          </>
        );
      case "Event Titles":
        return (
          <>
            <GalleryGrid 
              viewMode="grid" 
              category={activeCategory}
              searchQuery=""
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              sortOption={sortOptions[activeCategory]}
              onTotalItemsChange={setTotalItems}
            />
          </>
        );
      case "Character Frames":
        return (
          <>
            <div className="mb-6 flex justify-center">
              <div className="flex items-center">
                <div className="relative w-80">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    className="bg-secondary/50 border border-border/30 text-foreground rounded-md block w-full pl-10 p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
                    placeholder="Search Character Frames"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <FilterDropdown />
              </div>
            </div>
            <GalleryGrid 
              viewMode="grid" 
              category={activeCategory}
              searchQuery={searchQuery}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              sortOption={sortOptions[activeCategory]}
              onTotalItemsChange={setTotalItems}
            />
          </>
        );
      case "Event Frames":
        return (
          <>
            <GalleryGrid 
              viewMode="grid" 
              category={activeCategory}
              searchQuery=""
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              sortOption={sortOptions[activeCategory]}
              onTotalItemsChange={setTotalItems}
            />
          </>
        );
      case "Skills":
        return (
          <>
            <div className="mb-6 flex justify-center">
              <div className="flex items-center">
                <div className="relative w-80">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    className="bg-secondary/50 border border-border/30 text-foreground rounded-md block w-full pl-10 p-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all duration-200"
                    placeholder="Search Skills"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <FilterDropdown />
              </div>
            </div>
            <CharacterSkillsPanel 
              searchQuery={searchQuery} 
              sortOption={sortOptions[activeCategory]} 
            />
          </>
        );
      default:
        return (
          <GalleryGrid 
            viewMode="grid" 
            category={activeCategory}
            searchQuery={searchQuery}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            sortOption={sortOptions[activeCategory]}
            onTotalItemsChange={setTotalItems}
          />
        );
    }
  };

  return (
    <Layout>
      <section className="relative w-full h-[50vh] overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-background"
        >
          
        </div>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background"></div>
        
        {/* Content */}
        <div className="container relative mx-auto h-full flex flex-col justify-center items-center px-6 md:px-12 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="font-onePiece text-4xl md:text-6xl lg:text-7xl text-foreground mb-4">
              <span className="text-primary">ARTWORK</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Explore stunning artwork, character designs, and promotional materials from One Piece Fighting Path.
            </p>
          </div>
        </div>
      </section>
      
      <section className="container mx-auto px-6 md:px-12 py-12">
        <div className="animate-on-scroll">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">ARTWORK</h2>
            </div>
            
            <GalleryFilter 
              activeCategory={activeCategory} 
              setActiveCategory={(category) => {
                setActiveCategory(category);
                setSearchQuery("");
              }} 
            />
          </div>
          
          {renderCategoryContent()}
          
          {activeCategory !== "Skills" && totalItems > itemsPerPage && (
            <div className="mt-12 flex justify-center">
              <div className="inline-flex items-center bg-secondary/50 border border-border/30 rounded-md">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-l-md ${
                    currentPage === 1 
                      ? 'text-muted-foreground' 
                      : 'text-foreground hover:bg-secondary/80'
                  }`}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-3 py-2 text-foreground font-medium">{currentPage}</span>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
                  className={`p-2 rounded-r-md ${
                    currentPage >= Math.ceil(totalItems / itemsPerPage) 
                      ? 'text-muted-foreground' 
                      : 'text-foreground hover:bg-secondary/80'
                  }`}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Artwork;
