import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Filter, LayoutGrid, List, Map,
  Sparkles, ShieldCheck, X, ArrowRight, Star, Briefcase
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import GlassCard from '../../components/common/GlassCard';
import WorkerCard from '../../components/common/WorkerCard';
import PremiumButton from '../../components/common/PremiumButton';
import API from '../../services/api';
import { getImageUrl, handleImageError, DEFAULT_AVATAR } from '../../utils/imageUtils';

/* ── Filter Chip ── */
const FilterChip = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
      active
        ? 'bg-accent-main text-white border-accent-main shadow-xs'
        : 'bg-white border-gray-200 text-text-muted hover:border-accent-main hover:text-accent-main'
    }`}
  >
    {label}
  </button>
);

/* ── Filter Panel ── */
const FilterPanel = ({ area, handleAreaChange, availableAreas, verifiedOnly, setVerified, minRating, setMinRating, category, setCategory, onApply }) => (
  <div className="space-y-6 text-xs">
    {/* Area / Location */}
    <div>
      <p className="font-black text-text-primary mb-3 px-1 flex items-center justify-between uppercase tracking-widest text-[10px]">
        <span className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-accent-main" /> AREA
        </span>
        {area && (
          <button
            type="button"
            onClick={() => { handleAreaChange(''); onApply?.(); }}
            className="text-accent-main hover:underline font-black"
          >
            RESET
          </button>
        )}
      </p>

      <div className="relative mb-3 group">
        <input
          type="text"
          value={area}
          onChange={(e) => handleAreaChange(e.target.value)}
          placeholder="Type city or area name..."
          className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-main shadow-xs uppercase tracking-wider"
        />
        {area && (
          <button
            type="button"
            onClick={() => { handleAreaChange(''); onApply?.(); }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {availableAreas.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
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
      <label className="flex items-center justify-between cursor-pointer gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:border-accent-main transition-all shadow-xs group">
        <span className="flex items-center gap-2 font-black text-text-primary uppercase tracking-wider text-[10px]">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          VERIFIED ONLY
        </span>
        <input
          type="checkbox"
          checked={verifiedOnly}
          onChange={(e) => { setVerified(e.target.checked); onApply?.(); }}
          className="w-5 h-5 rounded cursor-pointer accent-accent-main"
        />
      </label>
    </div>

    {/* Rating */}
    <div>
      <p className="font-black text-text-primary mb-3 px-1 uppercase tracking-widest text-[10px]">MIN RATING</p>
      <div className="flex flex-wrap gap-2">
        {[
          { val: 0,   label: 'ANY' },
          { val: 4,   label: '4.0+' },
          { val: 4.5, label: '4.5+' },
          { val: 4.8, label: '4.8+' },
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
      <p className="font-black text-text-primary mb-3 px-1 uppercase tracking-widest text-[10px]">SKILL CATEGORY</p>
      <div className="flex flex-wrap gap-2">
        {['', 'electrician', 'plumber', 'carpenter', 'ac-technician', 'cleaner', 'mechanic'].map((c) => (
          <FilterChip
            key={c}
            label={c === '' ? 'ALL' : c.replace('-', ' ')}
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
    <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden">
      <Navbar />

      <main className="flex-1 pt-32 sm:pt-40 pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Search Header Bar */}
          <div className="relative mb-10 z-30">
            <form
              onSubmit={(e) => {
                handleSearch(e);
                setShowSuggestions(false);
              }}
              className="glass-card !bg-white/90 rounded-[2.5rem] p-2 border border-white/60 shadow-sm flex items-center gap-3"
            >
              <div className="pl-4 text-accent-main shrink-0">
                <Search className="w-6 h-6" />
              </div>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim() && setShowSuggestions(true)}
                placeholder="What service or worker are you looking for?"
                className="flex-1 min-w-0 bg-transparent text-sm font-bold text-text-primary placeholder:text-text-muted focus:outline-none py-3.5 px-2 uppercase tracking-wider"
                autoComplete="off"
              />
              <button
                type="submit"
                className="bg-accent-main hover:bg-orange-600 text-white px-8 sm:px-12 py-3.5 sm:py-4 rounded-[1.8rem] text-xs font-black uppercase tracking-wider shrink-0 shadow-xs cursor-pointer transition-all"
              >
                Search
              </button>
            </form>

            {/* Suggestions */}
            {showSuggestions && (suggestions.categories.length > 0 || suggestions.workers.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 rounded-3xl shadow-xl border border-white/60 overflow-hidden z-30 max-h-[450px] overflow-y-auto backdrop-blur-2xl">
                {suggestions.categories.length > 0 && (
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-[10px] font-black text-accent-main uppercase tracking-widest px-4 mb-3">Categories</p>
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
                        className="w-full text-left px-4 py-3 rounded-2xl hover:bg-orange-50/60 flex items-center gap-4 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-orange-50/80 flex items-center justify-center border border-orange-100/80 shadow-xs">
                          <Sparkles className="w-5 h-5 text-accent-main" />
                        </div>
                        <p className="text-sm font-black text-text-primary uppercase tracking-wider">{cat.name}</p>
                      </button>
                    ))}
                  </div>
                )}

                {suggestions.workers.length > 0 && (
                  <div className="p-3">
                    <p className="text-[10px] font-black text-accent-main uppercase tracking-widest px-4 mb-3">Workers</p>
                    {suggestions.workers.map((worker) => (
                      <button
                        key={worker._id}
                        onClick={() => {
                          navigate(`/workers/${worker._id}`);
                          setShowSuggestions(false);
                          setQuery('');
                        }}
                        className="w-full text-left px-4 py-3 rounded-2xl hover:bg-orange-50/60 flex items-center gap-4 transition-all group"
                      >
                        <img
                          src={getImageUrl(worker.avatar, DEFAULT_AVATAR(worker.name))}
                          alt={worker.name}
                          onError={(e) => handleImageError(e, DEFAULT_AVATAR(worker.name))}
                          className="w-12 h-12 rounded-full object-cover border border-accent-main"
                        />
                        <div>
                          <p className="text-sm font-black text-text-primary uppercase tracking-wider">{worker.name}</p>
                          <p className="text-[11px] text-text-muted font-semibold italic">{worker.profession}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => { handleSearch(); setShowSuggestions(false); }}
                  className="w-full p-4 bg-gray-50 text-center text-xs font-black text-accent-main hover:bg-orange-50/80 transition-all border-t border-gray-100 flex items-center justify-center gap-2 uppercase tracking-widest cursor-pointer"
                >
                  See All Results <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Title Row */}
          <div className="flex items-center justify-between gap-4 mb-10 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-4xl font-sora font-black text-text-primary flex items-center gap-3 tracking-tight uppercase">
                Find Workers
              </h1>
              <p className="text-[11px] font-bold text-accent-main uppercase tracking-wider mt-1">
                {workers.length} verified workers found near you
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="lg:hidden flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white text-[11px] font-black text-text-primary hover:border-accent-main transition-all shadow-xs uppercase tracking-wider"
              >
                <Filter className="w-4 h-4 text-accent-main" />
                FILTERS
              </button>

              <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-xs p-1">
                {[
                  { mode: 'grid', icon: LayoutGrid },
                  { mode: 'list', icon: List },
                  { mode: 'map',  icon: Map },
                ].map(({ mode, icon: Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`p-2.5 rounded-lg transition-all cursor-pointer ${
                      viewMode === mode
                        ? 'bg-accent-main text-white shadow-xs'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                    aria-label={`${mode} view`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Layout Grid */}
          <div className="flex gap-8 items-start">
            <aside className="hidden lg:block w-72 xl:w-80 shrink-0 sticky top-36">
              <GlassCard goldBorder className="!bg-white/80 p-6 rounded-[2rem] border border-white/60 shadow-xs">
                <h3 className="font-sora font-black text-base text-text-primary flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 uppercase tracking-wider">
                  <Filter className="w-5 h-5 text-accent-main" /> Filters
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
                <GlassCard className="h-[450px] sm:h-[550px] flex flex-col items-center justify-center !bg-white/80 border-dashed border-2 border-accent-main/30 text-center p-8 rounded-[3rem] mb-8 shadow-xs relative overflow-hidden">
                  <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 shadow-xs border border-orange-100">
                    <MapPin className="w-10 h-10 text-accent-main animate-bounce" />
                  </div>
                  <h3 className="font-sora font-black text-2xl text-text-primary tracking-tight mb-3">
                    WORKER MAP
                  </h3>
                  <p className="text-xs text-text-muted mb-8 max-w-xs mx-auto leading-relaxed font-semibold uppercase tracking-wider">
                    See where verified workers are located in your neighborhood.
                  </p>
                  <PremiumButton variant="ai" size="lg" className="px-12 py-4">Show Workers on Map</PremiumButton>
                </GlassCard>
              )}

              {/* Grid View */}
              {!loading && viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {workers.map((w) => (
                    <WorkerCard
                      key={w._id}
                      worker={w}
                      onBook={(worker) => navigate(`/workers/${worker._id}?book=true`)}
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
                      className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 !bg-white/80 border border-white/60 shadow-xs hover:border-accent-main/40 transition-all"
                    >
                      <div className="flex items-start sm:items-center gap-3 sm:gap-6 min-w-0">
                        <div className="relative shrink-0">
                           <img
                            src={getImageUrl(w.avatar, DEFAULT_AVATAR(w.name))}
                            alt={w.name}
                            onError={(e) => handleImageError(e, DEFAULT_AVATAR(w.name))}
                            className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-accent-main shadow-xs"
                            loading="lazy"
                           />
                           {w.isAvailable && <span className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-emerald-500 rounded-full border-2 border-white" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-sora font-black text-base sm:text-xl text-text-primary truncate tracking-tight uppercase">
                            {w.name}
                          </h3>
                          <p className="text-[11px] sm:text-xs font-bold text-accent-main uppercase tracking-wider mt-0.5">{w.profession}</p>
                          <div className="flex items-center gap-2 sm:gap-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mt-2.5 flex-wrap">
                            <span className="text-accent-main flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
                              <Star className="w-3 h-3 fill-accent-main" /> {w.rating} Rating
                            </span>
                            <span className="text-text-secondary flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                               <Briefcase className="w-3 h-3 text-slate-500" /> {w.experience} Yrs Exp
                            </span>
                            <span className="text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                               <ShieldCheck className="w-3 h-3" /> Verified
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 w-full sm:w-auto">
                        <div className="text-right hidden sm:block">
                          <div className="text-sm font-black text-text-primary tracking-tight uppercase">
                            Price Varies by Work
                          </div>
                          <div className="text-[9px] font-bold text-accent-main uppercase tracking-wider mt-0.5">
                             Contact for Quote
                          </div>
                        </div>
                        <PremiumButton
                          variant="gold"
                          size="md"
                          onClick={() => navigate(`/workers/${w._id}`)}
                          className="w-full sm:w-auto px-6 py-3 font-black uppercase tracking-wider text-xs"
                        >
                          VIEW PROFILE
                        </PremiumButton>
                      </div>
                          className="px-8 py-3.5 font-black uppercase tracking-wider"
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
                <div className="text-center py-28 bg-white/60 rounded-[3rem] border-2 border-dashed border-gray-200 shadow-xs">
                  <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-orange-100">
                    <Sparkles className="w-10 h-10 text-accent-main" />
                  </div>
                  <h3 className="font-sora font-black text-2xl text-text-primary mb-2 tracking-tight">NO WORKERS FOUND</h3>
                  <p className="text-xs text-text-muted mb-8 max-w-xs mx-auto font-semibold uppercase tracking-wider leading-relaxed">
                    We could not find any workers matching your search. Try changing your filters.
                  </p>
                  <PremiumButton variant="gold" size="lg" className="px-12" onClick={() => { setCategory(''); setVerified(false); setMinRating(0); setQuery(''); setArea(''); setSearchParams(new URLSearchParams()); }}>
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
