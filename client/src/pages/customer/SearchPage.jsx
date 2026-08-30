import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Filter, LayoutGrid, List, Map,
  Sparkles, ShieldCheck, X, ChevronDown, ChevronUp, ArrowRight
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
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
const FilterPanel = ({ area, handleAreaChange, availableAreas, verifiedOnly, setVerified, minRating, setMinRating, category, setCategory, onApply }) => (
  <div className="space-y-5 text-xs">
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

      {availableAreas.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          <FilterChip
            label="All Areas"
            active={area === ''}
            onClick={() => { handleAreaChange(''); onApply?.(); }}
          />
          {availableAreas.slice(0, 6).map((a) => (
            <FilterChip
              key={a}
              label={a}
              active={area.toLowerCase() === a.toLowerCase()}
              onClick={() => { handleAreaChange(area.toLowerCase() === a.toLowerCase() ? '' : a); onApply?.(); }}
            />
          ))}
        </div>
      )}
    </div>

    {/* Verified */}
    <div>
      <label className="flex items-center justify-between cursor-pointer gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
        <span className="flex items-center gap-2 font-semibold text-text-primary">
          <ShieldCheck className="w-4 h-4 text-accent-gold" />
          Verified Only
        </span>
        <input
          type="checkbox"
          checked={verifiedOnly}
          onChange={(e) => { setVerified(e.target.checked); onApply?.(); }}
          className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
        />
      </label>
    </div>

    {/* Rating */}
    <div>
      <p className="font-semibold text-text-primary mb-2 px-1">Minimum Rating</p>
      <div className="flex flex-wrap gap-2">
        {[
          { val: 0,   label: 'All' },
          { val: 4,   label: '4★+' },
          { val: 4.5, label: '4.5★+' },
          { val: 4.8, label: '4.8★+' },
        ].map(({ val, label }) => (
          <FilterChip
            key={val}
            label={label}
            active={minRating === val}
            onClick={() => { setMinRating(val); onApply?.(); }}
          />
        ))}
      </div>
    </div>

    {/* Category */}
    <div>
      <p className="font-semibold text-text-primary mb-2 px-1">Category</p>
      <div className="flex flex-wrap gap-2">
        {['', 'electrician', 'plumber', 'carpenter', 'ac-technician', 'cleaner', 'mechanic'].map((c) => (
          <FilterChip
            key={c}
            label={c === '' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}
            active={category === c}
            onClick={() => { setCategory(c); onApply?.(); }}
          />
        ))}
      </div>
    </div>
  </div>
);

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [query, setQuery]           = useState(searchParams.get('q') || '');
  const [category, setCategory]     = useState(searchParams.get('category') || '');
  const [area, setArea]             = useState(searchParams.get('area') || '');
  const [viewMode, setViewMode]     = useState('grid');
  const [verifiedOnly, setVerified] = useState(false);
  const [minRating, setMinRating]   = useState(0);
  const [workers, setWorkers]       = useState([]);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  // Live Search State
  const [suggestions, setSuggestions] = useState({ categories: [], workers: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);

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
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    try {
      const res = await API.get('/search/areas');
      if (res.success && Array.isArray(res.data)) {
        setAvailableAreas(res.data);
      }
    } catch {
      // Fallback
    }
  };

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
        setWorkers(Array.isArray(res.data) ? res.data : []);
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
    if (e) e.preventDefault();
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
    <div className="min-h-screen bg-background-primary flex flex-col">
      <Navbar />

      <main className="flex-1 pt-20 sm:pt-28 pb-24 lg:pb-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-6">

          {/* Search Bar */}
          <div className="relative mb-5 sm:mb-7 z-20">
            <form
              onSubmit={(e) => {
                handleSearch(e);
                setShowSuggestions(false);
              }}
              className="glass-card bg-white/95 rounded-2xl p-1.5 sm:p-2 border border-accent-gold/25 shadow-xl flex items-center gap-2"
            >
              <div className="pl-3 text-accent-gold shrink-0">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim() && setShowSuggestions(true)}
                placeholder="Search workers, services..."
                className="flex-1 min-w-0 bg-transparent text-sm text-text-primary placeholder-text-muted focus:outline-none py-2 px-1"
                autoComplete="off"
              />
              <button
                type="submit"
                className="btn-primary px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl sm:rounded-full text-xs sm:text-sm font-bold shrink-0"
              >
                Search
              </button>
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
                  onClick={() => {
                    handleSearch();
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

          {/* Header Row */}
          <div className="flex items-center justify-between gap-3 mb-5 sm:mb-7 flex-wrap">
            <div>
              <h1 className="text-lg sm:text-2xl font-sora font-bold text-text-primary flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent-gold" />
                AI Service Search
              </h1>
              <p className="text-xs text-text-secondary mt-0.5">
                {workers.length} verified workers found
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-text-secondary hover:border-accent-gold hover:text-accent-gold transition-colors min-h-[40px]"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>

              <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-sm p-1">
                {[
                  { mode: 'grid', icon: LayoutGrid },
                  { mode: 'list', icon: List },
                  { mode: 'map',  icon: Map },
                ].map(({ mode, icon: Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`p-2 rounded-lg transition-all min-h-[36px] min-w-[36px] ${
                      viewMode === mode
                        ? 'bg-accent-gold/20 text-accent-gold'
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
            <div className="lg:hidden mb-5">
              <GlassCard goldBorder className="bg-white/98 p-5 rounded-2xl relative">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-sora font-semibold text-sm text-text-primary flex items-center gap-2">
                    <Filter className="w-4 h-4 text-accent-gold" /> Filter Workers
                  </h3>
                  <button
                    onClick={() => setFilterOpen(false)}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-text-muted"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <FilterPanel
                  area={area}
                  handleAreaChange={handleAreaChange}
                  availableAreas={availableAreas}
                  verifiedOnly={verifiedOnly}
                  setVerified={setVerified}
                  minRating={minRating}
                  setMinRating={setMinRating}
                  category={category}
                  setCategory={setCategory}
                  onApply={() => setFilterOpen(false)}
                />
              </GlassCard>
            </div>
          )}

          {/* Layout Grid */}
          <div className="flex gap-5 lg:gap-7 items-start">
            <aside className="hidden lg:block w-56 xl:w-64 shrink-0 sticky top-28">
              <GlassCard goldBorder className="bg-white/95 p-5 rounded-3xl">
                <h3 className="font-sora font-semibold text-sm text-text-primary flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
                  <Filter className="w-4 h-4 text-accent-gold" /> Filters
                </h3>
                <FilterPanel
                  area={area}
                  handleAreaChange={handleAreaChange}
                  availableAreas={availableAreas}
                  verifiedOnly={verifiedOnly}
                  setVerified={setVerified}
                  minRating={minRating}
                  setMinRating={setMinRating}
                  category={category}
                  setCategory={setCategory}
                />
              </GlassCard>
            </aside>

            <div className="flex-1 min-w-0">

              {/* Map View */}
              {viewMode === 'map' && (
                <GlassCard className="h-64 sm:h-96 flex flex-col items-center justify-center bg-blue-50/50 border border-accent-blue/30 text-center p-6 rounded-3xl mb-5">
                  <MapPin className="w-10 h-10 sm:w-12 sm:h-12 text-accent-blue animate-bounce mb-3" />
                  <h3 className="font-sora font-semibold text-base sm:text-lg text-text-primary">
                    Interactive Google Maps View
                  </h3>
                  <p className="text-xs text-text-muted mt-1 mb-4 max-w-xs">
                    {workers.length} verified workers within your location radius with live markers.
                  </p>
                  <PremiumButton variant="ai" size="sm">Enable GPS Location</PremiumButton>
                </GlassCard>
              )}

              {/* Loading */}
              {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
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
                <div className="space-y-3 sm:space-y-4">
                  {workers.map((w) => (
                    <GlassCard
                      key={w._id}
                      goldBorder
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <img
                          src={w.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(w.name)}&background=D4AF37&color=fff`}
                          alt={w.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-accent-gold/40 shrink-0"
                          loading="lazy"
                        />
                        <div className="min-w-0">
                          <h3 className="font-sora font-semibold text-sm sm:text-base text-text-primary truncate">
                            {w.name}
                          </h3>
                          <p className="text-xs text-text-muted truncate">{w.profession}</p>
                          <div className="flex items-center gap-2 sm:gap-3 text-xs mt-1 flex-wrap">
                            <span className="text-accent-gold font-bold">★ {w.rating}</span>
                            <span className="text-text-muted">{w.experience} yrs exp</span>
                            {w.distance !== undefined && (
                              <span className="text-text-muted">📍 {w.distance} km</span>
                            )}
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
                          View Profile
                        </PremiumButton>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && workers.length === 0 && (
                <div className="text-center py-20">
                  <Sparkles className="w-12 h-12 text-accent-gold mx-auto mb-4 opacity-50" />
                  <h3 className="font-sora font-semibold text-text-primary mb-2">No Workers Found</h3>
                  <p className="text-sm text-text-muted mb-5">
                    No active workers match this query. Deleted workers have been removed.
                  </p>
                  <PremiumButton variant="gold" onClick={() => { setCategory(''); setVerified(false); setMinRating(0); setQuery(''); setArea(''); setSearchParams(new URLSearchParams()); }}>
                    Reset Filters
                  </PremiumButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;
