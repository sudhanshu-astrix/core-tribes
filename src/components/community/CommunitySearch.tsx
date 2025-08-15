import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardContent } from '../ui/Card';
import { CommunityCard } from './CommunityCard';

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  logo: string;
  tags: string[];
  isPrivate: boolean;
}

interface CommunitySearchProps {
  communities: Community[];
  onCommunitySelect: (community: Community) => void;
}

const CATEGORIES = [
  'All',
  'Technology',
  'Art',
  'Gaming',
  'Finance',
  'Music',
  'Sports',
  'Education',
  'Other'
];

export function CommunitySearch({ communities, onCommunitySelect }: CommunitySearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredCommunities, setFilteredCommunities] = useState(communities);

  // Get unique tags from all communities
  const allTags = Array.from(new Set(communities.flatMap(c => c.tags)));

  useEffect(() => {
    let filtered = communities;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(c => 
        selectedTags.every(tag => c.tags.includes(tag))
      );
    }

    setFilteredCommunities(filtered);
  }, [searchQuery, selectedCategory, selectedTags, communities]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-600 dark:text-gray-400" />
          <Input
            type="text"
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="ghost"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-5 w-5" />
          Filters
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedTags([]);
                }}
              >
                Clear All
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  options={CATEGORIES.map(cat => ({ value: cat, label: cat }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-[#BBF10A] text-black'
                          : 'bg-lightCard dark:bg-darkCard text-black dark:text-white hover:bg-lightCard/80 dark:hover:bg-darkCard/80'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Filters */}
      {(selectedCategory !== 'All' || selectedTags.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-lightCard dark:bg-darkCard rounded-full text-sm">
              Category: {selectedCategory}
              <button
                onClick={() => setSelectedCategory('All')}
                className="text-gray-600 dark:text-gray-400 hover:text-error"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          )}
          {selectedTags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-lightCard dark:bg-darkCard rounded-full text-sm"
            >
              {tag}
              <button
                onClick={() => handleTagToggle(tag)}
                className="text-gray-600 dark:text-gray-400 hover:text-error"
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCommunities.map(community => (
          <CommunityCard
            key={community.id}
            community={community}
            onClick={() => onCommunitySelect(community)}
          />
        ))}
      </div>

      {filteredCommunities.length === 0 && (
        <div className="text-center py-12 text-gray-600 dark:text-gray-400">
          No communities found matching your criteria
        </div>
      )}
    </div>
  );
} 