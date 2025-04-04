import React from 'react';
import { AlignLeft, Star } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../components/ui/dropdown-menu";
import { Filter } from 'lucide-react';

interface SortProps {
  sortField: string;
  handleSortChange: (field: string) => void;
}

const SkillsSortDropdown: React.FC<SortProps> = ({ sortField, handleSortChange }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="bg-secondary/50 border border-border/30 text-foreground rounded-md p-2.5 hover:bg-secondary transition-all duration-200 ml-2"
          aria-label="Sort options"
        >
          <span className="sr-only">Sort by</span>
          <Filter className="w-5 h-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem
          onClick={() => handleSortChange('name')}
          className={sortField === 'name' ? 'bg-primary/20 text-primary' : ''}
        >
          <AlignLeft className="mr-2 h-4 w-4" />
          <span>Alphabetical</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleSortChange('rarity')}
          className={sortField === 'rarity' ? 'bg-primary/20 text-primary' : ''}
        >
          <Star className="mr-2 h-4 w-4" />
          <span>Rarity</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SkillsSortDropdown; 