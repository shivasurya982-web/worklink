import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Filter, LayoutGrid, List, Map,
  Sparkles, ShieldCheck, X, ChevronDown, ChevronUp, Star, ArrowRight, Grid, Briefcase
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
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
    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all min-h-[40px] ${
      active
        ? 'bg-accent-orange text-white border-accent-bright shadow-lg'
        : 'bg-background-dark/50 border-white/10 text-text-muted hover:border-accent-orange hover:text-white'
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
    <div className="space-y-8 text-xs">
      {/* Area / Location */}
      <div>
        <p className="font-black text-accent-light mb-4 px-1 flex items-center justify-between uppercase tracking-widest">
          <span className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-accent-bright" /> SEARCH BY AREA
          </span>
          {area && (
            <button
              type="button"
              onClick={() => { handleAreaChange(''); onApply?.(); }}
              className="text-[9px] text-accent-bright hover:underline font-black"
            >
              CLEAR
            </button>
          )}
        </p>

        <div className="relative mb-2 group">
          <input
            type="text"
            value={area}
            onChange={(e) => handleAreaChange(e.target.value)}
            placeholder="Type city or area name..."
            className="w-full !bg-background-dark/90 border-2 border-border-primary/40 rounded-2xl px-5 py-4 text-xs font-black !text-white placeholder:text-text-muted focus:outline-none focus:border-accent-main shadow-2xl uppercase tracking-widest"
          />
          {area && (
            <button
              type="button"
              onClick={() => { handleAreaChange(''); onApply?.(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Verified Only */}
      <div>
        <label className="flex items-center justify-between cursor-pointer gap-4 p-5 rounded-2xl bg-background-dark/50 border-2 border-border-primary/40 hover:border-accent-orange/30 transition-all shadow-inner group">
          <span className="flex items-center gap-3 font-black text-white uppercase tracking-widest text-[10px]">
            <ShieldCheck className="w-5 h-5 text-accent-green group-hover:scale-110 transition-transform" />
            SHOW VERIFIED ONLY
          </span>
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => { setVerified(e.target.checked); onApply?.(); }}
            className="w-6 h-6 rounded-lg accent-accent-orange cursor-pointer border-2 border-white/10"
          />
        </label>
      </div>

      {/* Minimum Rating */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="font-black text-accent-light uppercase tracking-widest">MINIMUM RATING</p>
          <span className="px-3 py-1 bg-accent-orange/20 text-accent-bright rounded-lg font-black border border-accent-orange/30 flex items-center gap-2 text-[10px]">
             {minRating > 0 ? minRating : 'ANY'} <Star className={`w-3.5 h-3.5 ${minRating > 0 ? 'fill-accent-bright' : ''}`} />
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
            className="w-full h-2 bg-background-dark/80 rounded-lg appearance-none cursor-pointer accent-accent-orange"
          />
          <div className="flex justify-between mt-3 text-[9px] text-text-muted font-black uppercase tracking-tighter">
             <span>ANY</span>
             <span>3.0</span>
             <span>4.0</span>
             <span>5.0</span>
          </div>
        </div>
      </div>

      {/* Dynamic Categories */}
      <div>
        <p className="font-black text-accent-light mb-4 px-1 uppercase tracking-widest">SERVICE CATEGORY</p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center justify-center gap-3 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
              category === '' && !isExpanded
                ? 'bg-accent-orange text-white border-accent-bright shadow-lg'
                : 'bg-background-dark/50 border-border-primary/40 text-text-secondary hover:border-accent-orange/30'
            }`}
          >
            <Grid className="w-4.5 h-4.5" />
            {category === '' ? 'ALL CATEGORIES' : 'CHANGE CATEGORY'}
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>

          {isExpanded && (
            <div className="flex flex-wrap gap-2.5 pt-2 animate-fade-in max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
              <FilterChip
                label="ALL SERVICES"
                active={category === ''}
                onClick={() => { setCategory(''); setIsExpanded(false); onApply?.(); }}
              />
              {categories && categories.map((cat) => (
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
            <div className="mt-2 px-1">
              <span className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] opacity-60">SELECTED:</span>
              <div className="mt-2 inline-flex items-center gap-3 px-4 py-2 bg-accent-orange/10 text-accent-bright rounded-xl border border-accent-orange/30 text-[10px] font-black uppercase tracking-widest">
                {categories && categories.find(c => c.slug === category)?.name}
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-white" onClick={() => { setCategory(''); onApply?.(); }} />
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

  const query           = searchParams.get('q') || '';
  const [category, setCategory]     = useState(searchParams.get('category') || '');
  const [area, setArea]             = useState(searchParams.get('area') || '');
  const [viewMode, setViewMode]     = useState('grid');
  const [verifiedOnly, setVerified] = useState(false);
  const [minRating, setMinRating]   = useState(0);
  const [workers, setWorkers]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);

  const [availableCategories, setAvailableCategories] = useState([]);

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

  const handleAreaChange = (val) => {
    setArea(val);
    const p = new URLSearchParams(searchParams);
    if (query) p.set('q', query);
    if (category) p.set('category', category);
    if (val) p.set('area', val); else p.delete('area');
    setSearchParams(p);
  };

  const handleResetFilters = () => {
    setCategory('');
    setVerified(false);
    setMinRating(0);
    setArea('');
    const p = new URLSearchParams();
    setSearchParams(p);
  };

  return (
    <DashboardLayout
      title="Find Workers 🛠️"
      subtitle="Search and book verified professionals near you"
    >

      {/* Header Controls */}
      <div className="flex items-center justify-between gap-6 mb-10 flex-wrap">
        <div>
          <h2 className="text-2xl font-sora font-black text-white flex items-center gap-4 uppercase tracking-tighter">
            Available Workers ({workers.length})
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setFilterOpen(!filterOpen)}
            className="lg:hidden flex items-center gap-3 px-8 py-4 rounded-2xl border-2 border-border-primary/40 bg-background-card text-[11px] font-black text-white hover:border-accent-orange transition-all shadow-2xl uppercase tracking-widest"
          >
            <Filter className="w-5 h-5 text-accent-bright" />
            FILTERS
          </button>

          <div className="flex items-center bg-background-cardSecondary rounded-2xl border-2 border-border-primary/30 shadow-2xl p-1.5 backdrop-blur-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3.5 rounded-xl transition-all min-h-[48px] min-w-[48px] ${
                viewMode === 'grid'
                  ? 'bg-accent-orange text-white shadow-2xl scale-105'
                  : 'text-text-muted hover:text-white'
              }`}
              aria-label="grid view"
            >
              <LayoutGrid className="w-6 h-6" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3.5 rounded-xl transition-all min-h-[48px] min-w-[48px] ${
                viewMode === 'list'
                  ? 'bg-accent-orange text-white shadow-2xl scale-105'
                  : 'text-text-muted hover:text-white'
              }`}
              aria-label="list view"
            >
              <List className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {filterOpen && (
        <div className="lg:hidden mb-10">
          <GlassCard goldBorder className="!bg-background-cardSecondary p-8 rounded-[2.5rem] relative shadow-2xl border border-border-primary/40">
            <div className="flex items-center justify-between mb-8 pb-5 border-b border-white/5">
              <h3 className="font-sora font-black text-lg text-white flex items-center gap-4 uppercase tracking-widest">
                <Filter className="w-6 h-6 text-accent-bright" /> FILTERS
              </h3>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="p-3 rounded-2xl bg-background-widget text-text-muted hover:text-white border border-white/5 transition-all shadow-xl"
              >
                <X className="w-6 h-6" />
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
      <div className="flex gap-10 items-start">
        <aside className="hidden lg:block w-72 shrink-0 sticky top-28">
          <GlassCard goldBorder className="!bg-background-cardSecondary p-8 rounded-[3rem] shadow-2xl border border-border-primary/40">
            <h3 className="font-sora font-black text-lg text-white flex items-center gap-4 mb-10 pb-5 border-b border-white/5 uppercase tracking-widest">
              <Filter className="w-6 h-6 text-accent-bright" /> FILTERS
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

        <div className="flex-1 min-w-0">
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card !bg-background-card p-8 rounded-[2.5rem] animate-pulse h-64 border border-white/5 shadow-2xl">
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl" />
                    <div className="flex-1 space-y-3 mt-1">
                      <div className="h-4 bg-white/5 rounded-lg w-3/4" />
                      <div className="h-3 bg-white/5 rounded-lg w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {workers.map((w) => (
                <WorkerCard
                  key={w._id}
                  worker={w}
                  onBook={(worker) => navigate(`/workers/${worker._id}?book=true`)}
                />
              ))}
            </div>
          )}

          {!loading && viewMode === 'list' && (
            <div className="space-y-8">
              {workers.map((w) => (
                <GlassCard
                  key={w._id}
                  goldBorder
                  className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-10 !bg-background-card border-border-primary/60 shadow-2xl hover:border-accent-bright transition-all"
                >
                  <div className="flex items-center gap-8 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={getImageUrl(w.avatar, DEFAULT_AVATAR(w.name || 'User'))}
                        alt={w.name || 'Worker'}
                        onError={(e) => handleImageError(e, DEFAULT_AVATAR(w.name || 'User'))}
                        className="w-20 h-20 sm:w-28 sm:h-28 rounded-[2rem] object-cover border-4 border-accent-main shadow-2xl"
                      />
                      {w.isAvailable && <span className="absolute -bottom-1 -right-1 w-7 h-7 bg-accent-green rounded-2xl border-4 border-background-card shadow-xl" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-sora font-black text-2xl text-white truncate tracking-tight uppercase">
                        {w.name}
                      </h3>
                      <p className="text-xs font-black text-accent-light uppercase tracking-widest mt-1.5">{w.profession}</p>
                      <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] mt-6 flex-wrap">
                        <span className="text-accent-bright flex items-center gap-2 bg-background-dark/50 px-3 py-1.5 rounded-xl border border-white/5 shadow-xl">
                          <Star className="w-3.5 h-3.5 fill-accent-bright" /> {w.rating} Rating
                        </span>
                        <span className="text-text-secondary flex items-center gap-2 opacity-90">
                           <Briefcase className="w-4 h-4" /> {w.experience} Yrs Exp
                        </span>
                        <span className="text-accent-green flex items-center gap-2">
                           <ShieldCheck className="w-4 h-4" /> VERIFIED
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 shrink-0 ml-auto sm:ml-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-xl font-black text-white tracking-tighter uppercase">
                         Price Varies by Work
                      </div>
                      <div className="text-[9px] font-black text-accent-bright uppercase tracking-widest mt-1">
                         Contact for Quote
                      </div>
                    </div>
                    <PremiumButton
                      variant="gold"
                      size="lg"
                      onClick={() => navigate(`/workers/${w._id}?book=true`)}
                      className="px-12 py-5 font-black uppercase tracking-widest shadow-orange"
                    >
                      VIEW PROFILE
                    </PremiumButton>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {!loading && workers.length === 0 && (
            <div className="text-center py-40 bg-background-cardSecondary/60 rounded-[4rem] border-2 border-dashed border-border-primary/40 shadow-inner">
              <div className="w-24 h-24 bg-background-dark rounded-[1.5rem] flex items-center justify-center mx-auto mb-10 shadow-3xl border border-white/5">
                <Sparkles className="w-12 h-12 text-accent-bright opacity-20" />
              </div>
              <h3 className="font-sora font-black text-3xl text-white mb-4 tracking-tighter">NO WORKERS FOUND</h3>
              <p className="text-sm text-text-muted mb-12 max-w-sm mx-auto font-bold uppercase tracking-widest leading-relaxed opacity-80">
                Try changing your search or filters to find more workers.
              </p>
              <PremiumButton
                variant="gold"
                size="lg"
                className="px-16"
                onClick={handleResetFilters}
              >
                RESET FILTERS
              </PremiumButton>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerSearch;
