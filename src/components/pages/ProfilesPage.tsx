import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, X } from 'lucide-react';
import { BaseCrudService } from '@/integrations';
import { UserProfiles } from '@/entities';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<UserProfiles[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<UserProfiles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'teach' | 'learn'>('all');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [skip, setSkip] = useState(0);
  const LIMIT = 12;
  const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    loadProfiles();
  }, [skip]);

  useEffect(() => {
    filterProfiles();
  }, [profiles, searchTerm, filterType, selectedDays]);

  const loadProfiles = async () => {
    try {
      setIsLoading(true);
      const result = await BaseCrudService.getAll<UserProfiles>('userprofiles', {}, { limit: LIMIT, skip });
      
      if (skip === 0) {
        setProfiles(result.items);
      } else {
        setProfiles(prev => [...prev, ...result.items]);
      }
      
      setHasNext(result.hasNext);
    } catch (error) {
      console.error('Error loading profiles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProfiles = () => {
    let filtered = [...profiles];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(profile => 
        profile.fullName?.toLowerCase().includes(term) ||
        profile.skillsToTeach?.toLowerCase().includes(term) ||
        profile.skillsToLearn?.toLowerCase().includes(term) ||
        profile.bio?.toLowerCase().includes(term)
      );
    }

    if (filterType === 'teach') {
      filtered = filtered.filter(profile => profile.skillsToTeach);
    } else if (filterType === 'learn') {
      filtered = filtered.filter(profile => profile.skillsToLearn);
    }

    // Filter by availability days
    if (selectedDays.length > 0) {
      filtered = filtered.filter(profile => {
        if (!profile.availabilityDays) return false;
        const profileDays = profile.availabilityDays.split(',').map(d => d.trim());
        return selectedDays.some(day => profileDays.includes(day));
      });
    }

    setFilteredProfiles(filtered);
  };

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const loadMore = () => {
    setSkip(prev => prev + LIMIT);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="w-full bg-primary py-20">
        <div className="max-w-[100rem] mx-auto px-8 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-5xl md:text-6xl uppercase text-primary-foreground mb-6">
              Browse Profiles
            </h1>
            <p className="font-paragraph text-lg text-primary-foreground max-w-3xl">
              Discover talented individuals ready to share their knowledge and learn new skills. Find your perfect skill swap match.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="w-full bg-secondary py-8">
        <div className="max-w-[100rem] mx-auto px-8 md:px-16">
          <div className="flex flex-col gap-4 items-start">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-foreground" />
              <Input
                type="text"
                placeholder="Search by name, skills, or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 font-paragraph bg-background border-neutralborder"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 w-full flex-wrap">
              <Button
                onClick={() => setFilterType('all')}
                variant={filterType === 'all' ? 'default' : 'outline'}
                className={`h-12 px-6 font-paragraph ${
                  filterType === 'all' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'border-2 border-foreground text-foreground hover:bg-secondary'
                }`}
              >
                <Filter className="mr-2 h-4 w-4" />
                All
              </Button>
              <Button
                onClick={() => setFilterType('teach')}
                variant={filterType === 'teach' ? 'default' : 'outline'}
                className={`h-12 px-6 font-paragraph ${
                  filterType === 'teach' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'border-2 border-foreground text-foreground hover:bg-secondary'
                }`}
              >
                Teaching
              </Button>
              <Button
                onClick={() => setFilterType('learn')}
                variant={filterType === 'learn' ? 'default' : 'outline'}
                className={`h-12 px-6 font-paragraph ${
                  filterType === 'learn' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'border-2 border-foreground text-foreground hover:bg-secondary'
                }`}
              >
                Learning
              </Button>
            </div>

            {/* Availability Days Filter */}
            <div className="w-full">
              <div className="flex items-center justify-between mb-3">
                <p className="font-heading text-sm uppercase text-foreground">
                  Filter by Availability Days
                </p>
                {selectedDays.length > 0 && (
                  <button
                    onClick={() => setSelectedDays([])}
                    className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-paragraph"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-2 rounded-sm font-paragraph text-xs font-medium transition-colors border-2 ${
                      selectedDays.includes(day)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-neutralborder hover:border-primary'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Profiles Grid */}
      <section className="w-full max-w-[100rem] mx-auto px-8 md:px-16 py-16">
        <div className="min-h-[600px]">
          {isLoading && skip === 0 ? null : (
            <>
              {filteredProfiles.length > 0 ? (
                <>
                  <motion.div 
                    className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    {filteredProfiles.map((profile, index) => (
                      <motion.div
                        key={profile._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.05 }}
                      >
                        <Link to={`/profiles/${profile._id}`}>
                          <div className="bg-secondary rounded-sm overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
                            {/* Profile Image */}
                            <div className="w-full h-64 bg-background overflow-hidden">
                              {profile.profilePicture ? (
                                <Image
                                  src={profile.profilePicture}
                                  alt={profile.fullName || 'User profile'}
                                  className="w-full h-full object-cover"
                                  width={300}
                                />
                              ) : (
                                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                  <span className="font-heading text-6xl text-primary uppercase">
                                    {profile.fullName?.charAt(0) || '?'}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Profile Info */}
                            <div className="p-6 flex-1 flex flex-col">
                              <h3 className="font-heading text-xl uppercase text-foreground mb-3">
                                {profile.fullName || 'Anonymous User'}
                              </h3>
                              
                              {profile.bio && (
                                <p className="font-paragraph text-sm text-secondary-foreground mb-4 line-clamp-2">
                                  {profile.bio}
                                </p>
                              )}

                              {profile.skillsToTeach && (
                                <div className="mb-3">
                                  <p className="font-heading text-xs uppercase text-foreground mb-1">
                                    Can Teach:
                                  </p>
                                  <p className="font-paragraph text-sm text-secondary-foreground line-clamp-1">
                                    {profile.skillsToTeach}
                                  </p>
                                </div>
                              )}

                              {profile.skillsToLearn && (
                                <div className="mb-4">
                                  <p className="font-heading text-xs uppercase text-foreground mb-1">
                                    Wants to Learn:
                                  </p>
                                  <p className="font-paragraph text-sm text-secondary-foreground line-clamp-1">
                                    {profile.skillsToLearn}
                                  </p>
                                </div>
                              )}

                              {profile.availabilityDays && (
                                <div className="mb-4">
                                  <p className="font-heading text-xs uppercase text-foreground mb-2">
                                    Available:
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {profile.availabilityDays.split(',').map(day => (
                                      <span key={day.trim()} className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-sm font-paragraph">
                                        {day.trim().slice(0, 3)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {profile.isAvailable !== undefined && (
                                <div className="mt-auto">
                                  <span className={`inline-block px-3 py-1 rounded-sm text-xs font-paragraph ${
                                    profile.isAvailable 
                                      ? 'bg-primary text-primary-foreground' 
                                      : 'bg-neutralborder text-secondary-foreground'
                                  }`}>
                                    {profile.isAvailable ? 'Available' : 'Unavailable'}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Load More Button */}
                  {hasNext && (
                    <div className="mt-12 text-center">
                      <Button
                        onClick={loadMore}
                        disabled={isLoading}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 font-paragraph"
                      >
                        {isLoading ? 'Loading...' : 'Load More Profiles'}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <p className="font-paragraph text-xl text-secondary-foreground">
                    No profiles found matching your criteria.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterType('all');
                    }}
                    className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 font-paragraph"
                  >
                    Clear Filters
                  </Button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
