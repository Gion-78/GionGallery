import { useState, useEffect, useRef } from 'react';
import { Filter, Search, ArrowUpDown, SortAsc, SortDesc, Calendar, AlignLeft, ChevronLeft, ChevronRight } from 'lucide-react';
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

// Configurable scroll settings - adjust these values to control the exact scroll position
const SCROLL_CONFIG = {
  // The ID of the element to scroll to
  targetElement: 'leaks-category-filters',
  // Vertical offset in pixels (positive = scroll down, negative = scroll up)
  verticalOffset: -150,
  // Scroll behavior (smooth or auto)
  behavior: 'smooth' as ScrollBehavior,
  // Block alignment (start, center, end, nearest)
  block: 'start' as ScrollLogicalPosition
};

const Leaks = () => {
  const [activeCategory, setActiveCategory] = useState<'Main Leaks' | 'Beta Leaks'>("Main Leaks");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [pageInputValue, setPageInputValue] = useState<string>('1');
  
  // New sorting state with field and direction - default to date/newest first
  const [sortOptions, setSortOptions] = useState<{[key: string]: SortOption}>({
    'Main Leaks': { field: 'date', direction: 'desc' },
    'Beta Leaks': { field: 'date', direction: 'desc' }
  });
  
  const itemsPerPage = 12;
  
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

  useEffect(() => {
    setPageInputValue(currentPage.toString());
  }, [currentPage]);

  // Scroll to the configured position
  const scrollToConfiguredPosition = () => {
    setTimeout(() => {
      const targetElement = document.getElementById(SCROLL_CONFIG.targetElement);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: SCROLL_CONFIG.behavior,
          block: SCROLL_CONFIG.block
        });
        
        // Apply additional offset if needed
        if (SCROLL_CONFIG.verticalOffset !== 0) {
          window.scrollBy(0, SCROLL_CONFIG.verticalOffset);
        }
      }
    }, 0);
  };

  // Improved function to navigate to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      scrollToConfiguredPosition();
    }
  };

  // Improved function to navigate to next page
  const goToNextPage = () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      scrollToConfiguredPosition();
    }
  };

  // Function to handle page click
  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= Math.ceil(totalItems / itemsPerPage)) {
      setCurrentPage(page);
      scrollToConfiguredPosition();
    }
  };

  // Change single boolean to position-specific identifier
  const [activeEllipsis, setActiveEllipsis] = useState<string | null>(null);
  const [ellipsisInputValue, setEllipsisInputValue] = useState<string>('');
  const ellipsisInputRef = useRef<HTMLInputElement>(null);

  // Function to handle ellipsis click with position identifier
  const handleEllipsisClick = (position: string) => {
    setActiveEllipsis(position);
    setEllipsisInputValue('');
    // Focus the input after it renders
    setTimeout(() => {
      if (ellipsisInputRef.current) {
        ellipsisInputRef.current.focus();
      }
    }, 10);
  };

  // Function to handle ellipsis input change
  const handleEllipsisInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEllipsisInputValue(e.target.value.replace(/[^0-9]/g, ''));
  };

  // Function to handle ellipsis input submission
  const handleEllipsisInputSubmit = () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pageNum = parseInt(ellipsisInputValue, 10);
    
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      scrollToConfiguredPosition();
    }
    
    setActiveEllipsis(null);
  };

  // Function to handle ellipsis input key down
  const handleEllipsisInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleEllipsisInputSubmit();
    } else if (e.key === 'Escape') {
      setActiveEllipsis(null);
    }
  };

  // Function to handle ellipsis input blur
  const handleEllipsisInputBlur = () => {
    handleEllipsisInputSubmit();
  };

  // Set threshold to show ellipses
  const PAGES_THRESHOLD_FOR_ELLIPSIS = 3;

  // Function to render pagination numbers
  const renderPaginationNumbers = () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // If there are fewer pages than the threshold, just show all page numbers
    if (totalPages <= PAGES_THRESHOLD_FOR_ELLIPSIS) {
      return Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => handlePageClick(page)}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${
            currentPage === page
              ? 'bg-primary text-primary-foreground'
              : 'text-foreground hover:bg-secondary/80 hover:text-primary'
          }`}
          aria-label={`Page ${page}`}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      ));
    }
    
    // For more than 5 pages, implement the ellipsis pattern
    const items = [];
    
    // First page is always shown
    items.push(
      <button
        key={1}
        onClick={() => handlePageClick(1)}
        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300 ${
          currentPage === 1
            ? 'bg-primary text-primary-foreground'
            : 'text-foreground hover:bg-secondary/80 hover:text-primary'
        }`}
        aria-label="Page 1"
        aria-current={currentPage === 1 ? 'page' : undefined}
      >
        1
      </button>
    );
    
    // Handle different pagination scenarios
    if (currentPage === 1) {
      // On first page: show 1, 2, 3, ..., last
      items.push(
        <button
          key={2}
          onClick={() => handlePageClick(2)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-foreground hover:bg-secondary/80 hover:text-primary transition-all duration-300"
          aria-label="Page 2"
        >
          2
        </button>
      );
      
      if (totalPages > 3) {
        items.push(
          <button
            key={3}
            onClick={() => handlePageClick(3)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-foreground hover:bg-secondary/80 hover:text-primary transition-all duration-300"
            aria-label="Page 3"
          >
            3
          </button>
        );
      }
      
      if (totalPages > 4) {
        // Interactive ellipsis - with position identifier
        if (activeEllipsis === 'after-first') {
          items.push(
            <div key="ellipsis-input" className="w-12 h-8 flex items-center justify-center">
              <input
                ref={ellipsisInputRef}
                type="text"
                value={ellipsisInputValue}
                onChange={handleEllipsisInputChange}
                onKeyDown={handleEllipsisInputKeyDown}
                onBlur={handleEllipsisInputBlur}
                className="w-10 h-7 text-center bg-transparent border border-primary/50 rounded-md focus:outline-none focus:border-primary focus:shadow-[0_0_8px_rgba(var(--primary),0.3)]"
                aria-label="Go to page"
              />
            </div>
          );
        } else {
          items.push(
            <button
              key="ellipsis1"
              onClick={() => handleEllipsisClick('after-first')}
              className="w-8 h-8 flex items-center justify-center text-foreground hover:text-primary cursor-pointer"
              aria-label="Go to specific page"
            >
              …
            </button>
          );
        }
      }
    } else if (currentPage === totalPages) {
      // On last page: show 1, ..., last-2, last-1, last
      if (totalPages > 3) {
        // Interactive ellipsis - with position identifier
        if (activeEllipsis === 'before-last') {
          items.push(
            <div key="ellipsis-input" className="w-12 h-8 flex items-center justify-center">
              <input
                ref={ellipsisInputRef}
                type="text"
                value={ellipsisInputValue}
                onChange={handleEllipsisInputChange}
                onKeyDown={handleEllipsisInputKeyDown}
                onBlur={handleEllipsisInputBlur}
                className="w-10 h-7 text-center bg-transparent border border-primary/50 rounded-md focus:outline-none focus:border-primary focus:shadow-[0_0_8px_rgba(var(--primary),0.3)]"
                aria-label="Go to page"
              />
            </div>
          );
        } else {
          items.push(
            <button
              key="ellipsis1"
              onClick={() => handleEllipsisClick('before-last')}
              className="w-8 h-8 flex items-center justify-center text-foreground hover:text-primary cursor-pointer"
              aria-label="Go to specific page"
            >
              …
            </button>
          );
        }
      }
      
      if (totalPages > 2) {
        items.push(
          <button
            key={totalPages - 2}
            onClick={() => handlePageClick(totalPages - 2)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-foreground hover:bg-secondary/80 hover:text-primary transition-all duration-300"
            aria-label={`Page ${totalPages - 2}`}
          >
            {totalPages - 2}
          </button>
        );
      }
      
      items.push(
        <button
          key={totalPages - 1}
          onClick={() => handlePageClick(totalPages - 1)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-foreground hover:bg-secondary/80 hover:text-primary transition-all duration-300"
          aria-label={`Page ${totalPages - 1}`}
        >
          {totalPages - 1}
        </button>
      );
      
      // Add the last page (which is the current page in this case)
      items.push(
        <button
          key={totalPages}
          onClick={() => handlePageClick(totalPages)}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-300"
          aria-label={`Page ${totalPages}`}
          aria-current="page"
        >
          {totalPages}
        </button>
      );
    } else {
      // On middle pages: show 1, ..., current, ..., last
      if (currentPage > 2) {
        // Interactive ellipsis - with position identifier
        if (activeEllipsis === 'before-current') {
          items.push(
            <div key="ellipsis-input" className="w-12 h-8 flex items-center justify-center">
              <input
                ref={ellipsisInputRef}
                type="text"
                value={ellipsisInputValue}
                onChange={handleEllipsisInputChange}
                onKeyDown={handleEllipsisInputKeyDown}
                onBlur={handleEllipsisInputBlur}
                className="w-10 h-7 text-center bg-transparent border border-primary/50 rounded-md focus:outline-none focus:border-primary focus:shadow-[0_0_8px_rgba(var(--primary),0.3)]"
                aria-label="Go to page"
              />
            </div>
          );
        } else {
          items.push(
            <button
              key="ellipsis1"
              onClick={() => handleEllipsisClick('before-current')}
              className="w-8 h-8 flex items-center justify-center text-foreground hover:text-primary cursor-pointer"
              aria-label="Go to specific page"
            >
              …
            </button>
          );
        }
      }
      
      // If we're on page 2, specifically show page 1 (already shown above) and page 3
      if (currentPage === 2 && totalPages >= 3) {
        items.push(
          <button
            key={currentPage}
            onClick={() => handlePageClick(currentPage)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-300"
            aria-label={`Page ${currentPage}`}
            aria-current="page"
          >
            {currentPage}
          </button>
        );
        
        items.push(
          <button
            key={3}
            onClick={() => handlePageClick(3)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-foreground hover:bg-secondary/80 hover:text-primary transition-all duration-300"
            aria-label="Page 3"
          >
            3
          </button>
        );
      } 
      // If we're on the second-to-last page, show the page before it
      else if (currentPage === totalPages - 1 && totalPages > 3) {
        // Show the page before current if we're not on page 2 (which would be page 1, already shown)
        if (currentPage > 2) {
          items.push(
            <button
              key={currentPage - 1}
              onClick={() => handlePageClick(currentPage - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-full text-foreground hover:bg-secondary/80 hover:text-primary transition-all duration-300"
              aria-label={`Page ${currentPage - 1}`}
            >
              {currentPage - 1}
            </button>
          );
        }
        
        items.push(
          <button
            key={currentPage}
            onClick={() => handlePageClick(currentPage)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-300"
            aria-label={`Page ${currentPage}`}
            aria-current="page"
          >
            {currentPage}
          </button>
        );
      }
      // For other middle pages
      else {
        items.push(
          <button
            key={currentPage}
            onClick={() => handlePageClick(currentPage)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-300"
            aria-label={`Page ${currentPage}`}
            aria-current="page"
          >
            {currentPage}
          </button>
        );
      }
      
      if (currentPage < totalPages - 1) {
        // Only show second ellipsis if we're not close to the last page
        // If we're on page 2, we've already added page 3 above, so skip ellipsis if totalPages <= 4
        if (!(currentPage === 2 && totalPages <= 4)) {
          // Interactive ellipsis - with position identifier
          if (activeEllipsis === 'after-current') {
            items.push(
              <div key="ellipsis-input2" className="w-12 h-8 flex items-center justify-center">
                <input
                  ref={ellipsisInputRef}
                  type="text"
                  value={ellipsisInputValue}
                  onChange={handleEllipsisInputChange}
                  onKeyDown={handleEllipsisInputKeyDown}
                  onBlur={handleEllipsisInputBlur}
                  className="w-10 h-7 text-center bg-transparent border border-primary/50 rounded-md focus:outline-none focus:border-primary focus:shadow-[0_0_8px_rgba(var(--primary),0.3)]"
                  aria-label="Go to page"
                />
              </div>
            );
          } else {
            items.push(
              <button
                key="ellipsis2"
                onClick={() => handleEllipsisClick('after-current')}
                className="w-8 h-8 flex items-center justify-center text-foreground hover:text-primary cursor-pointer"
                aria-label="Go to specific page"
              >
                …
              </button>
            );
          }
        }
      }
    }
    
    // Last page (if not already shown and we have more than 1 page)
    // This condition was causing the issue where last page wasn't shown when on last page
    // But we fixed that in the "currentPage === totalPages" condition above
    if (totalPages > 1 && currentPage !== totalPages) {
      items.push(
        <button
          key={totalPages}
          onClick={() => handlePageClick(totalPages)}
          className="w-8 h-8 flex items-center justify-center rounded-full text-foreground hover:bg-secondary/80 hover:text-primary transition-all duration-300"
          aria-label={`Page ${totalPages}`}
        >
          {totalPages}
        </button>
      );
    }
    
    return items;
  };

  // Function to update sort options for the active category
  const updateSortOptions = (field: SortField, direction: SortDirection) => {
    console.log('Updating sort options:', { field, direction, category: activeCategory });
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
            
            {/* Added ID to the category filters section for targeted scrolling */}
            <div id="leaks-category-filters" className="flex flex-col md:flex-row items-center gap-4">
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
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onTotalItemsChange={setTotalItems}
            />
          </div>
          
          {/* Pagination */}
          {totalItems > itemsPerPage && (
            <div className="mt-12 flex justify-center">
              <div className="inline-flex items-center bg-secondary/50 border border-border/30 rounded-md shadow-sm p-1">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`p-2 rounded-md ${
                    currentPage === 1 
                      ? 'text-muted-foreground cursor-not-allowed' 
                      : 'text-foreground hover:bg-secondary/80 hover:text-primary hover:shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all duration-300'
                  }`}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center space-x-1 px-2">
                  {renderPaginationNumbers()}
                </div>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
                  className={`p-2 rounded-md ${
                    currentPage >= Math.ceil(totalItems / itemsPerPage) 
                      ? 'text-muted-foreground cursor-not-allowed' 
                      : 'text-foreground hover:bg-secondary/80 hover:text-primary hover:shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all duration-300'
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

export default Leaks;
