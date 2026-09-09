import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Filter, LayoutGrid, List, Map,
  Sparkles, ShieldCheck, X, ChevronDown, ChevronUp, ArrowRight, Star, Briefcase
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
    className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all min-h-[42px] ${
      active
        ? 'bg-accent-orange text-white border-accent-bright shadow-[0_10px_20px_rgba(244,81,11,0.3)]'
        : 'bg-background-cardSecondary border-border-primary/40 text-text-muted hover:border-accent-bright hover:text-white'
    }`}
  >
    {label}
  </button>
);

/* ── Filter Panel ── */
const FilterPanel = ({ area, handleAreaChange, availableAreas, verifiedOnly, setVerified, minRating, setMinRating, category, setCategory, onApply }) => (
  <div className="space-y-8 text-xs">
    {/* Area / Location */}
    <div>
      <p className="font-black text-white mb-4 px-1 flex items-center justify-between uppercase tracking-[0.3em] text-[10px]">
        <span className="flex items-center gap-2.5">
          <MapPin className="w-4 h-4 text-accent-bright" /> GEO ZONE
        </span>
        {area && (
          <button
            type="button"
            onClick={() => { handleAreaChange(''); onApply?.(); }}
            className="text-accent-bright hover:underline font-black"
          >
            RESET
          </button>
        )}
      </p>

      <div className="relative mb-4 group">
        <input
          type="text"
          value={area}
          onChange={(e) => handleAreaChange(e.target.value)}
          placeholder="ENTER CITY OR DISTRICT..."
          className="w-full bg-background-card border-2 border-border-primary/30 rounded-2xl px-5 py-4 text-xs font-bold text-white placeholder:text-text-muted focus:outline-none focus:border-accent-main shadow-2xl uppercase tracking-widest"
        />
        {area && (
          <button
            type="button"
            onClick={() => { handleAreaChange(''); onApply?.(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {availableAreas.length > 0 && (
        <div className="flex flex-wrap gap-2.5 mt-4">
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
      <label className="flex items-center justify-between cursor-pointer gap-4 p-5 rounded-[1.5rem] bg-background-card border-2 border-border-primary/20 hover:border-accent-orange transition-all shadow-xl group">
        <span className="flex items-center gap-3 font-black text-white uppercase tracking-[0.2em] text-[10px]">
          <ShieldCheck className="w-5 h-5 text-accent-green group-hover:scale-110 transition-transform" />
          VERIFIED ONLY
        </span>
        <input
          type="checkbox"
          checked={verifiedOnly}
          onChange={(e) => { setVerified(e.target.checked); onApply?.(); }}
          className="w-6 h-6 rounded-lg accent-accent-orange cursor-pointer border-2 border-white/10"
        />
      </label>
    </div>

    {/* Rating */}
    <div>
      <p className="font-black text-white mb-4 px-1 uppercase tracking-[0.3em] text-[10px]">RELIABILITY INDEX</p>
      <div className="flex flex-wrap gap-2.5">
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
      <p className="font-black text-white mb-4 px-1 uppercase tracking-[0.3em] text-[10px]">SERVICE DOMAIN</p>
      <div className="flex flex-wrap gap-2.5">
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
    <div className="min-h-screen bg-background-primary flex flex-col relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-full h-[500px] bg-accent-orange/10 blur-[150px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 pt-32 sm:pt-40 pb-24 lg:pb-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* Search Header Bar */}
          <div className="relative mb-12 z-30">
            <form
              onSubmit={(e) => {
                handleSearch(e);
                setShowSuggestions(false);
              }}
              className="glass-card !bg-background-dark/90 rounded-[2.5rem] p-2.5 border-2 border-accent-main/40 shadow-[0_30px_80px_rgba(0,0,0,0.7)] flex items-center gap-4"
            >
              <div className="pl-5 text-accent-bright shrink-0">
                <Sparkles className="w-7 h-7" />
              </div>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim() && setShowSuggestions(true)}
                placeholder="ENTER SERVICE NEED OR EXPERT NAME..."
                className="flex-1 min-w-0 bg-transparent text-base font-black text-white placeholder:text-text-muted focus:outline-none py-4 px-2 uppercase tracking-widest"
                autoComplete="off"
              />
              <button
                type="submit"
                className="btn-primary px-10 sm:px-14 py-4 sm:py-5 rounded-[1.8rem] text-sm font-black uppercase tracking-[0.2em] shrink-0 shadow-[0_10px_30px_rgba(244,81,11,0.4)]"
              >
                Execute Scan
              </button>
            </form>

            {/* Suggestions */}
            {showSuggestions && (suggestions.categories.length > 0 || suggestions.workers.length > 0) && (
              <div className="absolute top-full left-0 right-0 mt-4 bg-background-cardSecondary rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.9)] border border-border-primary/40 overflow-hidden animate-fade-in z-30 max-h-[500px] overflow-y-auto backdrop-blur-2xl">
                {/* Categories */}
                {suggestions.categories.length > 0 && (
                  <div className="p-4 border-b border-white/5">
                    <p className="text-[11px] font-black text-accent-bright uppercase tracking-[0.4em] px-6 mb-4">Domain Nodes</p>
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
                        className="w-full text-left px-6 py-4 rounded-2xl hover:bg-background-widget/60 flex items-center gap-5 transition-all group"
                      >
                        <div className="w-12 h-12 rounded-2xl bg-background-dark flex items-center justify-center group-hover:bg-accent-orange border border-border-primary/30 transition-colors shadow-xl">
                          <Sparkles className="w-6 h-6 text-accent-light group-hover:text-white" />
                        </div>
                        <p className="text-base font-black text-white uppercase tracking-widest">{cat.name}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* Professionals */}
                {suggestions.workers.length > 0 && (
                  <div className="p-4">
                    <p className="text-[11px] font-black text-accent-peach uppercase tracking-[0.4em] px-6 mb-4">Active Modules</p>
                    {suggestions.workers.map((worker) => (
                      <button
                        key={worker._id}
                        onClick={() => {
                          navigate(`/workers/${worker._id}`);
                          setShowSuggestions(false);
                          setQuery('');
                        }}
                        className="w-full text-left px-6 py-4 rounded-2xl hover:bg-background-widget/60 flex items-center gap-5 transition-all group"
                      >
                        <img
                          src={worker.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=F4510B&color=fff`}
                          alt={worker.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-accent-main group-hover:border-accent-bright transition-all"
                        />
                        <div>
                          <p className="text-base font-black text-white uppercase tracking-wider">{worker.name}</p>
                          <p className="text-[11px] text-text-muted font-bold tracking-tight italic">{worker.profession}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => { handleSearch(); setShowSuggestions(false); }}
                  className="w-full p-7 bg-background-dark/80 text-center text-xs font-black text-text-secondary hover:text-accent-bright transition-all border-t border-white/5 flex items-center justify-center gap-5 uppercase tracking-[0.4em]"
                >
                  LOAD FULL DATASET <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>

          {/* Title Row */}
          <div className="flex items-center justify-between gap-6 mb-12 flex-wrap">
            <div>
              <h1 className="text-3xl sm:text-5xl font-sora font-black text-white flex items-center gap-5 tracking-tighter">
                <div className="w-14 h-14 rounded-3xl bg-background-dark flex items-center justify-center border-2 border-accent-bright/30 shadow-2xl">
                   <Search className="w-7 h-7 text-accent-bright" />
                </div>
                MARKET SCAN
              </h1>
              <p className="text-[11px] font-black text-accent-light uppercase tracking-[0.3em] mt-3 opacity-90">
                {workers.length} VERIFIED NODES DETECTED IN RADIUS
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="lg:hidden flex items-center gap-3 px-8 py-4 rounded-2xl border-2 border-border-primary/40 bg-background-card text-[11px] font-black text-white hover:border-accent-orange transition-all shadow-2xl uppercase tracking-widest"
              >
                <Filter className="w-5 h-5 text-accent-bright" />
                FILTERS
              </button>

              <div className="flex items-center bg-background-cardSecondary rounded-2xl border-2 border-border-primary/30 shadow-2xl p-1.5 backdrop-blur-xl">
                {[
                  { mode: 'grid', icon: LayoutGrid },
                  { mode: 'list', icon: List },
                  { mode: 'map',  icon: Map },
                ].map(({ mode, icon: Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`p-3.5 rounded-xl transition-all min-h-[48px] min-w-[48px] ${
                      viewMode === mode
                        ? 'bg-accent-orange text-white shadow-2xl scale-105'
                        : 'text-text-muted hover:text-white'
                    }`}
                    aria-label={`${mode} view`}
                  >
                    <Icon className="w-6 h-6" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Layout Grid */}
          <div className="flex gap-10 lg:gap-12 items-start">
            <aside className={`hidden lg:block w-72 xl:w-80 shrink-0 sticky top-36 transition-all duration-500`}>
              <GlassCard goldBorder className="!bg-background-cardSecondary p-8 rounded-[3rem] border border-border-primary/60 shadow-[0_30px_70px_rgba(0,0,0,0.6)]">
                <h3 className="font-sora font-black text-lg text-white flex items-center gap-4 mb-10 pb-5 border-b border-white/5 uppercase tracking-widest">
                  <Filter className="w-6 h-6 text-accent-bright" /> DATA FILTERS
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
                <GlassCard className="h-[500px] sm:h-[600px] flex flex-col items-center justify-center !bg-background-dark/60 border-dashed border-2 border-accent-bright/30 text-center p-12 rounded-[4rem] mb-12 shadow-inner relative overflow-hidden group">
                   <div className="absolute inset-0 bg-accent-orange/5 opacity-50 blur-[100px]" />
                  <div className="w-24 h-24 bg-background-cardSecondary rounded-[2rem] flex items-center justify-center mb-10 shadow-3xl border border-white/5 group-hover:scale-110 transition-transform duration-700 relative z-10">
                    <MapPin className="w-12 h-12 text-accent-bright animate-bounce" />
                  </div>
                  <h3 className="font-sora font-black text-3xl text-white tracking-tighter mb-5 relative z-10">
                    SATELLITE POSITIONING
                  </h3>
                  <p className="text-sm text-text-muted mt-2 mb-10 max-w-sm mx-auto leading-relaxed font-bold uppercase tracking-wider opacity-80 relative z-10">
                    VISUALIZING {workers.length} NODES ON SECURE GRID. INITIALIZE GPS HANDSHAKE TO PROCEED.
                  </p>
                  <PremiumButton variant="ai" size="lg" className="px-16 py-5 relative z-10 shadow-[0_15px_40px_rgba(249,115,22,0.4)]">INITIALIZE GEO-SCAN</PremiumButton>
                </GlassCard>
              )}

              {/* Grid View */}
              {!loading && viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
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
                <div className="space-y-6 sm:space-y-8">
                  {workers.map((w) => (
                    <GlassCard
                      key={w._id}
                      goldBorder
                      className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-8 !bg-background-card border-border-primary/60 shadow-2xl hover:border-accent-bright duration-500"
                    >
                      <div className="flex items-center gap-6 sm:gap-10 min-w-0">
                        <div className="relative shrink-0">
                           <img
                            src={w.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(w.name)}&background=F4510B&color=fff`}
                            alt={w.name}
                            className="w-20 h-20 sm:w-28 sm:h-20 rounded-[2rem] object-cover border-4 border-accent-main shadow-2xl"
                            loading="lazy"
                           />
                           {w.isAvailable && <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-accent-green rounded-2xl border-4 border-background-card" />}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-sora font-black text-xl sm:text-2xl text-white truncate tracking-tight">
                            {w.name}
                          </h3>
                          <p className="text-[11px] sm:text-xs text-accent-light font-black uppercase tracking-[0.2em] mt-1.5">{w.profession}</p>
                          <div className="flex items-center gap-6 sm:gap-10 text-[10px] sm:text-[11px] font-black uppercase tracking-widest mt-5 flex-wrap">
                            <span className="text-accent-bright flex items-center gap-2 bg-background-dark/50 px-3 py-1.5 rounded-xl border border-white/5 shadow-xl">
                              <Star className="w-4 h-4 fill-current" /> {w.rating} INDEX
                            </span>
                            <span className="text-text-secondary flex items-center gap-2 opacity-90">
                               <Briefcase className="w-4 h-4" /> {w.experience} CYCLES
                            </span>
                            {w.distance !== undefined && (
                              <span className="text-text-secondary flex items-center gap-2 opacity-90">
                                 <MapPin className="w-4 h-4" /> {w.distance} ZONE
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-8 shrink-0 ml-auto sm:ml-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-2xl font-black text-white tracking-tighter">
                            ₹{w.pricing?.hourly || 350}<span className="text-[11px] font-bold text-text-muted tracking-widest ml-1">/HR</span>
                          </div>
                          <div className={`text-[10px] font-black uppercase tracking-[0.3em] mt-2 ${w.isAvailable ? 'text-accent-green' : 'text-text-muted opacity-60'}`}>
                            {w.isAvailable ? 'AVAILABLE NOW' : 'MODULE BUSY'}
                          </div>
                        </div>
                        <PremiumButton
                          variant="gold"
                          size="lg"
                          onClick={() => navigate(`/workers/${w._id}`)}
                          className="px-12 py-5 font-black uppercase tracking-widest shadow-[0_15px_30px_rgba(244,81,11,0.4)]"
                        >
                          ACCESS
                        </PremiumButton>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && workers.length === 0 && (
                <div className="text-center py-40 bg-background-cardSecondary/60 rounded-[4rem] border-2 border-dashed border-border-primary/40 shadow-inner">
                  <div className="w-24 h-24 bg-background-dark rounded-[1.5rem] flex items-center justify-center mx-auto mb-10 shadow-3xl border border-white/5">
                    <Sparkles className="w-12 h-12 text-accent-bright opacity-20" />
                  </div>
                  <h3 className="font-sora font-black text-3xl text-white mb-4 tracking-tighter">NULL DATA RETURNED</h3>
                  <p className="text-sm text-text-muted mb-12 max-w-sm mx-auto font-bold uppercase tracking-widest leading-relaxed opacity-80">
                    THE CURRENT SCAN PARAMETERS PRODUCED NO MATCHING NODES. ADJUST FILTERS TO CONTINUE.
                  </p>
                  <PremiumButton variant="gold" size="lg" className="px-16" onClick={() => { setCategory(''); setVerified(false); setMinRating(0); setQuery(''); setArea(''); setSearchParams(new URLSearchParams()); }}>
                    PURGE SCAN SETTINGS
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
