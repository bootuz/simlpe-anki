import React, { memo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface SearchAndFiltersProps {
  searchQuery: string;
  filterState: string;
  onSearchChange: (query: string) => void;
  onFilterStateChange: (state: string) => void;
}

const SearchAndFilters = memo(({
  searchQuery,
  filterState,
  onSearchChange,
  onFilterStateChange
}: SearchAndFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 lg:min-w-[500px]">
      {/* Search */}
      <div className="flex-1">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-150 z-10" />
          <Input
            placeholder="Search cards..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10 bg-card border-border/50 focus:border-primary/50 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-200"
          />
        </div>
      </div>

      {/* Filter */}
      <div>
        <Select value={filterState} onValueChange={onFilterStateChange}>
          <SelectTrigger className="w-40 h-10 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-150">
            <div className="flex items-center gap-1">
              <Filter className="h-3 w-3 text-primary" />
              <SelectValue placeholder="State" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-card/95 backdrop-blur-md border-border/50">
            <SelectItem value="all">All States</SelectItem>
            <SelectItem value="new">🌟 New</SelectItem>
            <SelectItem value="learning">📚 Learning</SelectItem>
            <SelectItem value="review">🔄 Review</SelectItem>
            <SelectItem value="relearning">🔁 Relearning</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

SearchAndFilters.displayName = "SearchAndFilters";

export default SearchAndFilters;