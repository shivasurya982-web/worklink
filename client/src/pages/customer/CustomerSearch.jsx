import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Filter, LayoutGrid, List,
  Sparkles, ShieldCheck, X, ChevronDown, Star, Grid, Briefcase
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
    className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
      active
        ? 'bg-accent-main text-white border-accent-main shadow-xs'
        : 'bg-white border-gray-200 text-text-muted hover:border-accent-main hover:text-accent-main'
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
        <p className="font-black text-accent-main mb-3 px-1 flex items-center justify-between uppercase tracking-widest text-[10px]">
          <span className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-accent-main" /> SEARCH BY AREA
          </span>
          {area && (
            <button
              type="button"
              onClick={() => { handleAreaChange(''); onApply?.(); }}
              className="text-[9px] text-accent-main hover:underline font-black"
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
      </div>

      {/* Verified Only */}
      <div>
        <label className="flex items-center justify-between cursor-pointer gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:border-accent-main transition-all shadow-xs group">
          <span className="flex items-center gap-2 font-black text-text-primary uppercase tracking-wider text-[10px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            SHOW VERIFIED ONLY
          </span>
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => { setVerified(e.target.checked); onApply?.(); }}
            className="w-5 h-5 rounded cursor-pointer accent-accent-main"
          />
        </label>
      </div>

      {/* Minimum Rating */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <p className="font-black text-accent-main uppercase tracking-widest text-[10px]">MINIMUM RATING</p>
          <span className="px-2.5 py-0.5 bg-blue-50 text-accent-main rounded-lg font-black border border-blue-100 flex items-center gap-1 text-[10px]">
             {minRating > 0 ? minRating : 'ANY'} <Star className={`w-3 h-3 ${minRating > 0 ? 'fill-accent-main text-accent-main' : ''}`} />
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
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-main"
          />
          <div className="flex justify-between mt-2 text-[9px] text-text-muted font-bold uppercase tracking-wider">
             <span>ANY</span>
             <span>3.0</span>
             <span>4.0</span>
             <span>5.0</span>
          </div>
        </div>
      </div>

      {/* Dynamic Categories */}
      <div>
        <p className="font-black text-accent-main mb-3 px-1 uppercase tracking-widest text-[10px]">SERVICE CATEGORY</p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border cursor-pointer ${
              category === '' && !isExpanded
                ? 'bg-accent-main text-white border-accent-main shadow-xs'
                : 'bg-white border-gray-200 text-text-secondary hover:border-accent-main'
            }`}
          >
            <Grid className="w-4 h-4" />
            {category === '' ? 'ALL CATEGORIES' : 'CHANGE CATEGORY'}
            <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>

          {isExpanded && (
            <div className="flex flex-wrap gap-2 pt-2 animate-fade-in max-h-[250px] overflow-y-auto custom-scrollbar pr-1">
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
            <div className="mt-1 px-1">
              <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider">SELECTED:</span>
              <div className="mt-1 inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-accent-main rounded-lg border border-blue-100 text-[10px] font-black uppercase tracking-wider">
                {categories && categories.find(c => c.slug === category)?.name}
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-red-500" onClick={() => { setCategory(''); onApply?.(); }} />
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
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h2 className="text-xl font-sora font-black text-text-primary flex items-center gap-3 uppercase tracking-tight">
            Available Workers ({workers.length})
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFilterOpen(!filterOpen)}
            className="lg:hidden flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white text-[11px] font-black text-text-primary hover:border-accent-main transition-all shadow-xs uppercase tracking-wider cursor-pointer"
          >
            <Filter className="w-4 h-4 text-accent-main" />
            FILTERS
          </button>

          <div className="flex items-center bg-white rounded-xl border border-gray-200 shadow-xs p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-accent-main text-white shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              aria-label="grid view"
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-accent-main text-white shadow-xs'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              aria-label="list view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {filterOpen && (
        <div className="lg:hidden mb-8">
          <GlassCard goldBorder className="!bg-white/80 p-6 rounded-[2rem] relative shadow-xs border border-white/60">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <h3 className="font-sora font-black text-base text-text-primary flex items-center gap-2 uppercase tracking-wider">
                <Filter className="w-5 h-5 text-accent-main" /> FILTERS
              </h3>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="p-2 rounded-xl bg-gray-100 text-text-muted hover:text-text-primary transition-all"
              >
                <X className="w-5 h-5" />
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
      <div className="flex gap-8 items-start">
        <aside className="hidden lg:block w-72 shrink-0 sticky top-28">
          <GlassCard goldBorder className="!bg-white/80 p-6 rounded-[2rem] shadow-xs border border-white/60">
            <h3 className="font-sora font-black text-base text-text-primary flex items-center gap-2 mb-6 pb-4 border-b border-gray-100 uppercase tracking-wider">
              <Filter className="w-5 h-5 text-accent-main" /> FILTERS
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
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="glass-card !bg-white/60 p-6 rounded-[2rem] animate-pulse h-60 border border-white/60 shadow-xs">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-2xl" />
                    <div className="flex-1 space-y-2.5 mt-1">
                      <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
                      <div className="h-3 bg-gray-200 rounded-lg w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

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

          {!loading && viewMode === 'list' && (
            <div className="space-y-4">
              {workers.map((w) => (
                <GlassCard
                  key={w._id}
                  goldBorder
                  className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 !bg-white/80 border border-white/60 shadow-xs hover:border-accent-main/40 transition-all"
                >
                  <div className="flex items-center gap-6 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={getImageUrl(w.avatar, DEFAULT_AVATAR(w.name || 'User'))}
                        alt={w.name || 'Worker'}
                        onError={(e) => handleImageError(e, DEFAULT_AVATAR(w.name || 'User'))}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-accent-main shadow-xs"
                      />
                      {w.isAvailable && <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-sora font-black text-xl text-text-primary truncate tracking-tight uppercase">
                        {w.name}
                      </h3>
                      <p className="text-xs font-bold text-accent-main uppercase tracking-wider mt-1">{w.profession}</p>
                      <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider mt-4 flex-wrap">
                        <span className="text-accent-main flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                          <Star className="w-3.5 h-3.5 fill-accent-main" /> {w.rating} Rating
                        </span>
                        <span className="text-text-secondary flex items-center gap-1.5">
                           <Briefcase className="w-3.5 h-3.5" /> {w.experience} Yrs Exp
                        </span>
                        <span className="text-emerald-600 flex items-center gap-1.5">
                           <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 ml-auto sm:ml-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-black text-text-primary uppercase tracking-tight">
                         Price Varies by Work
                      </div>
                      <div className="text-[9px] font-bold text-accent-main uppercase tracking-wider mt-0.5">
                         Contact for Quote
                      </div>
                    </div>
                    <PremiumButton
                      variant="gold"
                      size="md"
                      onClick={() => navigate(`/workers/${w._id}?book=true`)}
                      className="px-8 py-3.5 font-black uppercase tracking-wider"
                    >
                      VIEW PROFILE
                    </PremiumButton>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {!loading && workers.length === 0 && (
            <div className="text-center py-28 bg-white/60 rounded-[3rem] border-2 border-dashed border-gray-200 shadow-xs">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-100">
                <Sparkles className="w-10 h-10 text-accent-main" />
              </div>
              <h3 className="font-sora font-black text-2xl text-text-primary mb-2 tracking-tight">NO WORKERS FOUND</h3>
              <p className="text-xs text-text-muted mb-8 max-w-xs mx-auto font-semibold uppercase tracking-wider leading-relaxed">
                Try changing your search or filters to find more workers.
              </p>
              <PremiumButton
                variant="gold"
                size="lg"
                className="px-12"
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
