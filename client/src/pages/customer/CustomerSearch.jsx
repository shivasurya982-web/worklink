import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Filter, LayoutGrid, List, Map,
  Sparkles, ShieldCheck, X, ChevronDown, ChevronUp, Star, ArrowRight, Grid
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import WorkerCard from '../../components/common/WorkerCard';
import PremiumButton from '../../components/common/PremiumButton';
import API from '../../services/api';

/* ── Filter Chip ── */
const FilterChip = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all min-h-[36px] ${
      active
        ? 'bg-accent-gold text-text-primary border-accent-gold shadow-sm'
        : 'bg-white border-gray-200 text-text-secondary hover:border-accent-gold hover:text-accent-gold'
    }`}
  >
    {label}
  </button>
);

/* ── Filter Panel ── */
const FilterPanel = ({
  area,
  handleAreaChange,
  verifiedOnly,
  setVerified,
  minRating,
  setMinRating,
  category,
  setCategory,
  categories,
  onApply
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-6 text-xs">
      {/* Area / Location */}
      <div>
        <p className="font-semibold text-text-primary mb-2 px-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-accent-gold" /> Filter by Area
          </span>
          {area && (
            <button
              type="button"
              onClick={() => { handleAreaChange(''); onApply?.(); }}
              className="text-[10px] text-accent-gold hover:underline font-normal"
            >
              Clear
            </button>
          )}
        </p>

        <div className="relative mb-2">
          <input
            type="text"
            value={area}
            onChange={(e) => handleAreaChange(e.target.value)}
            placeholder="Type area, city, street..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-gold pr-7"
          />
          {area && (
            <button
              type="button"
              onClick={() => { handleAreaChange(''); onApply?.(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Verified Only */}
      <div>
        <label className="flex items-center justify-between cursor-pointer gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
          <span className="flex items-center gap-2 font-semibold text-text-primary">
            <ShieldCheck className="w-4 h-4 text-accent-gold" />
            Verified Pros Only
          </span>
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => { setVerified(e.target.checked); onApply?.(); }}
            className="w-4 h-4 rounded accent-accent-gold cursor-pointer"
          />
        </label>
      </div>

      {/* Minimum Rating Slider */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="font-semibold text-text-primary">Minimum Rating</p>
          <span className="px-2 py-0.5 bg-amber-50 text-accent-gold rounded-lg font-bold border border-amber-100 flex items-center gap-1">
             {minRating > 0 ? minRating : 'All'} <Star className={`w-3 h-3 ${minRating > 0 ? 'fill-accent-gold' : ''}`} />
          </span>
        </div>
        <div className="px-1">
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={minRating}
            onChange={(e) => { setMinRating(parseFloat(e.target.value)); onApply?.(); }}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-gold"
          />
          <div className="flex justify-between mt-2 text-[10px] text-text-muted font-bold">
             <span>Any</span>
             <span>3.0</span>
             <span>4.0</span>
             <span>5.0</span>
          </div>
        </div>
      </div>

      {/* Dynamic Categories */}
      <div>
        <p className="font-semibold text-text-primary mb-3 px-1">Service Category</p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              if (isExpanded) {
                // If closing, we keep the selection but hide the list
                setIsExpanded(false);
              } else {
                setIsExpanded(true);
              }
            }}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all border ${
              category === '' && !isExpanded
                ? 'bg-accent-gold text-text-primary border-accent-gold shadow-md'
                : 'bg-white border-gray-200 text-text-secondary hover:border-accent-gold'
            }`}
          >
            <Grid className="w-4 h-4" />
            {category === '' ? 'All Services' : 'Change Category'}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>

          {isExpanded && (
            <div className="flex flex-wrap gap-2 pt-2 animate-fade-in max-h-[300px] overflow-y-auto pr-1">
              <FilterChip
                label="Show All"
                active={category === ''}
                onClick={() => { setCategory(''); setIsExpanded(false); onApply?.(); }}
              />
              {categories.map((cat) => (
                <FilterChip
                  key={cat._id}
                  label={cat.name}
                  active={category === cat.slug}
                  onClick={() => {
                    setCategory(cat.slug);
                    setIsExpanded(false);
                    onApply?.();
                  }}
                />
              ))}
            </div>
          )}

          {category !== '' && !isExpanded && (
            <div className="mt-1 px-1">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Active Category:</span>
              <div className="mt-1.5 inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-accent-gold rounded-full border border-amber-200 text-[11px] font-bold">
                {categories.find(c => c.slug === category)?.name}
                <X className="w-3 h-3 cursor-pointer hover:text-accent-red" onClick={() => { setCategory(''); onApply?.(); }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CustomerSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [query, setQuery]           = useState(searchParams.get('q') || '');
  const [category, setCategory]     = useState(searchParams.get('category') || '');
  const [area, setArea]             = useState(searchParams.get('area') || '');
  const [viewMode, setViewMode]     = useState('grid');
  const [verifiedOnly, setVerified] = useState(false);
  const [minRating, setMinRating]   = useState(0);
  const [workers, setWorkers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  // Dynamic Categories from DB
  const [availableCategories, setAvailableCategories] = useState([]);

  // Live Search State for Query input
  const [suggestions, setSuggestions] = useState({ categories: [], workers: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories');
      if (res.success) {
        setAvailableCategories(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  useEffect(() => {
    if (query.trim().length > 0) {
      const timer = setTimeout(async () => {
        try {
          const res = await API.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
          if (res.success) {
            setSuggestions(res.data);
            setShowSuggestions(true);
          }
        } catch (err) {
          console.error('Suggestions error:', err);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSuggestions({ categories: [], workers: [] });
      setShowSuggestions(false);
    }
  }, [query]);

  useEffect(() => {
    fetchWorkers();
  }, [searchParams, category, area, verifiedOnly, minRating]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      let endpoint = `/search/workers?`;
      if (query)        endpoint += `query=${encodeURIComponent(query)}&`;
      if (category)     endpoint += `category=${encodeURIComponent(category)}&`;
      if (area)         endpoint += `area=${encodeURIComponent(area)}&`;
      if (verifiedOnly) endpoint += `verified=true&`;
      if (minRating)    endpoint += `rating=${minRating}&`;

      const res = await API.get(endpoint);
      if (res.success && res.data) {
        setWorkers(Array.isArray(res.data) ? res.data : res.data.workers || []);
      } else {
        setWorkers([]);
      }
    } catch {
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const p = new URLSearchParams(searchParams);
    if (query) p.set('q', query); else p.delete('q');
    if (area) p.set('area', area); else p.delete('area');
    setSearchParams(p);
  };

  const handleAreaChange = (val) => {
    setArea(val);
    const p = new URLSearchParams(searchParams);
    if (query) p.set('q', query);
    if (category) p.set('category', category);
    if (val) p.set('area', val); else p.delete('area');
    setSearchParams(p);
  };

  return (
    <DashboardLayout
      title="Find & Book Local Service Workers 🛠️"
      subtitle="Search verified electricians, plumbers, carpenters & technicians nearby"
    >
      {/* Search Bar */}
      <div className="relative mb-6 z-20">
        <form
          onSubmit={(e) => {
            handleSearch(e);
            setShowSuggestions(false);
          }}
          className="glass-card bg-white/95 rounded-2xl p-2 border border-accent-gold/30 shadow-lg flex items-center gap-2"
        >
          <div className="pl-3 text-accent-gold shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.trim() && setShowSuggestions(true)}
            placeholder="Search workers by name, skill, or location..."
            className="flex-1 min-w-0 bg-transparent text-sm text-text-primary placeholder-text-muted focus:outline-none py-2 px-1"
            autoComplete="off"
          />
          <PremiumButton
            type="submit"
            variant="gold"
            size="md"
            icon={Search}
          >
            Search
          </PremiumButton>
        </form>

        {/* Live Search Suggestions Dropdown */}
        {showSuggestions && (suggestions.categories.length > 0 || suggestions.workers.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in z-30 max-h-[400px] overflow-y-auto">
            {/* Categories Section */}
            {suggestions.categories.length > 0 && (
              <div className="p-2 border-b border-gray-50">
                <p className="text-[10px] font-bold text-accent-gold uppercase tracking-widest px-3 mb-2">Categories</p>
                {suggestions.categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => {
                      setCategory(cat.slug);
                      const p = new URLSearchParams(searchParams);
                      p.set('category', cat.slug);
                      setSearchParams(p);
                      setShowSuggestions(false);
                      setQuery('');
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-amber-50 flex items-center gap-3 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center group-hover:bg-white border border-amber-100/50">
                       <Sparkles className="w-4 h-4 text-accent-gold" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-primary">{cat.name}</p>
                      <p className="text-[9px] text-text-muted">Direct service matching</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Workers Section */}
            {suggestions.workers.length > 0 && (
              <div className="p-2">
                <p className="text-[10px] font-bold text-accent-blue uppercase tracking-widest px-3 mb-2">Professionals</p>
                {suggestions.workers.map((worker) => (
                  <button
                    key={worker._id}
                    onClick={() => {
                      navigate(`/workers/${worker._id}`);
                      setShowSuggestions(false);
                      setQuery('');
                    }}
                    className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-blue-50 flex items-center gap-3 transition-colors group"
                  >
                    <img
                      src={worker.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=random`}
                      alt={worker.name}
                      className="w-8 h-8 rounded-full object-cover border border-blue-100"
                    />
                    <div>
                      <p className="text-xs font-bold text-text-primary">{worker.name}</p>
                      <p className="text-[9px] text-text-muted italic">{worker.profession}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* View all button */}
            <button
              onClick={(e) => {
                handleSearch(e);
                setShowSuggestions(false);
              }}
              className="w-full p-3 bg-gray-50 text-center text-[10px] font-bold text-text-secondary hover:text-accent-gold transition-colors flex items-center justify-center gap-2"
            >
              See all results for "{query}" <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Click outside to close overlay */}
        {showSuggestions && (
          <div
            className="fixed inset-0 z-20"
            onClick={() => setShowSuggestions(false)}
          />
        )}
      </div>

      {/* Header Controls */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h2 className="text-base font-sora font-bold text-text-primary flex items-center gap-2">
            Available Service Workers ({workers.length})
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterOpen(!filterOpen)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-text-secondary hover:border-accent-gold transition-colors min-h-[40px]"
          >
            <Filter className="w-4 h-4 text-accent-gold" />
            Filters
          </button>

          <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm p-1">
            {[
              { mode: 'grid', icon: LayoutGrid },
              { mode: 'list', icon: List },
            ].map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`p-2 rounded-lg transition-all min-h-[36px] min-w-[36px] ${
                  viewMode === mode
                    ? 'bg-accent-gold/20 text-accent-gold font-bold'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                aria-label={`${mode} view`}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {filterOpen && (
        <div className="lg:hidden mb-6">
          <GlassCard goldBorder className="bg-white p-5 rounded-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sora font-semibold text-sm text-text-primary flex items-center gap-2">
                <Filter className="w-4 h-4 text-accent-gold" /> Filter Workers
              </h3>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <FilterPanel
              area={area}
              handleAreaChange={handleAreaChange}
              verifiedOnly={verifiedOnly}
              setVerified={setVerified}
              minRating={minRating}
              setMinRating={setMinRating}
              category={category}
              setCategory={setCategory}
              categories={availableCategories}
              onApply={() => setFilterOpen(false)}
            />
          </GlassCard>
        </div>
      )}

      {/* Main Grid with Sidebar Filter */}
      <div className="flex gap-6 items-start">
        {/* Desktop Sidebar Filter */}
        <aside className="hidden lg:block w-64 shrink-0">
          <GlassCard goldBorder className="bg-white/95 p-5 rounded-3xl sticky top-28">
            <h3 className="font-sora font-semibold text-sm text-text-primary flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
              <Filter className="w-4 h-4 text-accent-gold" /> Filter Workers
            </h3>
            <FilterPanel
              area={area}
              handleAreaChange={handleAreaChange}
              verifiedOnly={verifiedOnly}
              setVerified={setVerified}
              minRating={minRating}
              setMinRating={setMinRating}
              category={category}
              setCategory={setCategory}
              categories={availableCategories}
            />
          </GlassCard>
        </aside>

        {/* Worker Results Container */}
        <div className="flex-1 min-w-0">
          {/* Skeleton Loading */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card p-5 rounded-2xl animate-pulse h-52">
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-2 mt-1">
                      <div className="h-3 bg-gray-200 rounded w-3/4" />
                      <div className="h-2.5 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Grid View */}
          {!loading && viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {workers.map((w) => (
                <WorkerCard
                  key={w._id}
                  worker={w}
                  onBook={(worker) => navigate(`/workers/${worker._id}`)}
                />
              ))}
            </div>
          )}

          {/* List View */}
          {!loading && viewMode === 'list' && (
            <div className="space-y-4">
              {workers.map((w) => (
                <GlassCard
                  key={w._id}
                  goldBorder
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={w.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(w.name)}&background=D4AF37&color=fff`}
                      alt={w.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-accent-gold/40 shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-sora font-semibold text-base text-text-primary truncate">
                        {w.name}
                      </h3>
                      <p className="text-xs text-text-muted truncate">{w.profession}</p>
                      <div className="flex items-center gap-3 text-xs mt-1 flex-wrap">
                        <span className="text-accent-gold font-bold">★ {w.rating || 5.0}</span>
                        <span className="text-text-muted">{w.experience || 0} yrs exp</span>
                        <span className="text-emerald-600 font-semibold">100% Verified</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-bold text-accent-gold">
                        ₹{w.pricing?.hourly || 350}/hr
                      </div>
                      <div className="text-[10px] text-text-muted">
                        {w.isAvailable ? 'Available Now' : 'Busy'}
                      </div>
                    </div>
                    <PremiumButton
                      variant="gold"
                      size="sm"
                      onClick={() => navigate(`/workers/${w._id}`)}
                    >
                      Book Worker
                    </PremiumButton>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && workers.length === 0 && (
            <GlassCard className="text-center py-16">
              <Sparkles className="w-12 h-12 text-accent-gold mx-auto mb-4 opacity-50" />
              <h3 className="font-sora font-semibold text-text-primary mb-2">No Workers Found</h3>
              <p className="text-xs text-text-muted mb-5 max-w-sm mx-auto">
                No active service workers matched your search filters. Try adjusting your query or category filters.
              </p>
              <PremiumButton
                variant="gold"
                size="sm"
                onClick={() => { setCategory(''); setVerified(false); setMinRating(0); setQuery(''); setArea(''); setSearchParams(new URLSearchParams()); }}
              >
                Reset All Filters
              </PremiumButton>
            </GlassCard>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerSearch;
