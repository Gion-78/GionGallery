import { useState, useEffect } from 'react';
import { Filter, Search, ArrowUpDown, SortAsc, SortDesc, Calendar, AlignLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { observeElements, fadeInUp } from '../lib/animations';
import LeaksGallery from '../components/gallery/LeaksGallery';
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

// Define types for sort options
type SortField = 'date' | 'alphabetical';
type SortDirection = 'asc' | 'desc';

interface SortOption {
  field: SortField;
  direction: SortDirection;
}

const Leaks = () => {
  const [activeCategory, setActiveCategory] = useState<'Main Leaks' | 'Beta Leaks'>("Main Leaks");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  // New sorting state with field and direction - default to date/newest first
  const [sortOptions, setSortOptions] = useState<{[key: string]: SortOption}>({
    'Main Leaks': { field: 'date', direction: 'desc' },
    'Beta Leaks': { field: 'date', direction: 'desc' }
  });
  
  const itemsPerPage = 8;
  
  useEffect(() => {
    // Apply animations to elements as they come into view
    const observer = observeElements('.animate-on-scroll', fadeInUp);
    
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // Reset page when category changes
  useEffect(() => {
    setCurrentPage(1);
    
    // Debug info
    console.log(`Active category changed to: ${activeCategory}`);
  }, [activeCategory]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Function to update sort options for the active category
  const updateSortOptions = (field: SortField, direction: SortDirection) => {
    setSortOptions(prev => ({
      ...prev,
      [activeCategory]: { field, direction }
    }));
  };

  // Get display text for current sort option
  const getCurrentSortLabel = () => {
    const { field, direction } = sortOptions[activeCategory];
    
    if (field === 'date') {
      return direction === 'asc' ? 'Date: Oldest First' : 'Date: Newest First';
    } else {
      return direction === 'asc' ? 'A-Z' : 'Z-A';
    }
  };

  return (
    <Layout>
      {/* Hero Section with Background Image */}
      <section className="relative w-full h-[50vh] overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-background"
        ></div>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background"></div>
        
        {/* Content */}
        <div className="container relative mx-auto h-full flex flex-col justify-center items-center px-6 md:px-12 text-center">
          <div className="max-w-4xl mx-auto animate-fade-in">
            <h1 className="font-onePiece text-4xl md:text-6xl lg:text-7xl text-foreground mb-4">
              <span className="text-primary">LEAKS</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Stay ahead of the game with the most recent leaks, rumors, and early information about upcoming content for One Piece Fighting Path.
            </p>
          </div>
        </div>
      </section>
      
      {/* Leaks Content */}
      <section className="container mx-auto px-6 md:px-12 py-12">
        <div className="animate-on-scroll">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold">LEAKS</h2>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* Category filter buttons */}
              <div className="flex flex-wrap justify-center gap-2">
                {["Main Leaks", "Beta Leaks"].map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category as 'Main Leaks' | 'Beta Leaks')}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      activeCategory === category 
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Search Bar with Enhanced Filter Dropdown */}
          <div className="mb-6 flex justify-end">
            <div className="flex items-center">
              {/* New Filter Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="bg-secondary/50 border border-border/30 text-foreground rounded-md p-2.5 hover:bg-secondary transition-all duration-200"
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
            </div>
          </div>
          
          {/* Content area for dynamic content */}
          <div>
            {/* Use our specialized LeaksGallery component */}
            <LeaksGallery 
              category={activeCategory}
              searchQuery=""
              sortOption={sortOptions[activeCategory]}
              onTotalItemsChange={setTotalItems}
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Leaks;
