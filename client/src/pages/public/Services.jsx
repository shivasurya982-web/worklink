import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import GlassCard from '../../components/common/GlassCard';
import PremiumButton from '../../components/common/PremiumButton';
import {
  Zap, Droplets, Hammer, Paintbrush, Snowflake, Wrench,
  Car, GraduationCap, Sparkles, Camera, Flower2, Flame,
  Smartphone, Monitor, Bug, Shield, Search, ArrowRight,
  ShieldCheck, Clock, CheckCircle2, Star, MessageSquare
} from 'lucide-react';
import API from '../../services/api';

const iconMap = {
  Zap, Droplets, Hammer, Paintbrush, Snowflake, Wrench,
  Car, GraduationCap, Sparkles, Camera, Flower2, Flame,
  Smartphone, Monitor, Bug, Shield,
};

const Services = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories');
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden">
      <Navbar />

      <main className="flex-1 pt-32 sm:pt-40 pb-24 relative z-10">
        {/* Header Section */}
        <section className="py-10 sm:py-14">
          <div className="container-responsive text-center max-w-3xl mx-auto">
            <span className="text-xs font-black text-accent-main uppercase tracking-[0.3em] mb-4 block animate-fade-in">Our Services</span>
            <h1 className="text-4xl sm:text-6xl font-sora font-black text-text-primary mb-6 leading-tight tracking-tight">
               Find help for <br className="hidden sm:block" />
               <span className="text-accent-main">every task</span>
            </h1>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-10 px-4 font-bold uppercase tracking-wider">
              Explore our wide range of home and office services. From repairs to cleaning, Worklyn connects you with verified local workers.
            </p>

            {/* In-page Search */}
            <div className="max-w-xl mx-auto relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent-main transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What service do you need? (e.g. Plumber...)"
                className="w-full bg-white/90 border border-gray-200 rounded-3xl py-4 pl-14 pr-6 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-main shadow-xs uppercase tracking-wider"
              />
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-10">
          <div className="container-responsive">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="h-56 rounded-[2rem] bg-white/40 animate-pulse" />
                ))}
              </div>
            ) : filteredCategories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                {filteredCategories.map((cat) => {
                  const Icon = iconMap[cat.icon] || Wrench;
                  return (
                    <Link
                      key={cat._id}
                      to={`/search?category=${cat.slug}`}
                      className="group"
                    >
                      <GlassCard goldBorder className="p-6 sm:p-8 h-full flex flex-col items-center text-center transition-all duration-300 group-hover:-translate-y-1 !bg-white/70 border border-white/60 shadow-sm hover:!bg-white">
                        <div className="w-14 h-14 rounded-2xl bg-blue-50 text-accent-main flex items-center justify-center mb-5 group-hover:bg-accent-main group-hover:text-white transition-all shadow-xs">
                           <Icon className="w-7 h-7" />
                        </div>
                        <h3 className="font-sora font-black text-base sm:text-lg text-text-primary mb-2 uppercase tracking-tight truncate w-full group-hover:text-accent-main">{cat.name}</h3>
                        <p className="text-[10px] text-text-muted mb-5 line-clamp-2 leading-relaxed font-semibold uppercase tracking-wider">
                          {cat.description || 'Verified local professionals ready to help.'}
                        </p>
                        <span className="text-[9px] font-black text-accent-main bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100 flex items-center gap-1.5 uppercase tracking-wider mt-auto group-hover:bg-accent-main group-hover:text-white transition-all">
                           {cat.workerCount || 0} Workers <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </GlassCard>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white/60 rounded-[3rem] border-2 border-dashed border-gray-200">
                <Sparkles className="w-10 h-10 text-accent-main mx-auto mb-3 opacity-40" />
                <h3 className="font-sora font-bold text-text-primary uppercase tracking-tight">No categories found</h3>
                <p className="text-xs text-text-muted mt-1 uppercase tracking-wider">Try searching for something else.</p>
                <PremiumButton variant="outline" size="sm" className="mt-6" onClick={() => setSearchQuery('')}>Clear Search</PremiumButton>
              </div>
            )}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 overflow-hidden relative">
          <div className="container-responsive grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-5xl font-black font-sora text-text-primary mb-6 uppercase tracking-tight">
                 Why book through <span className="text-accent-main">Worklyn?</span>
              </h2>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-8 font-bold uppercase tracking-wider">
                We make it easy to find good workers while keeping you safe and your data private.
              </p>

              <div className="space-y-4">
                 {[
                   { icon: ShieldCheck, title: 'Safe & Verified', desc: 'Every worker on our app has their identity checked before they can join.' },
                   { icon: Clock, title: 'Fast Booking', desc: 'Find the right person for your job in under 30 seconds.' },
                   { icon: Star, title: 'Good Ratings', desc: 'We only keep workers who do a great job and have high ratings.' },
                   { icon: MessageSquare, title: 'Direct Chat', desc: 'Talk to your worker inside the app to coordinate and get updates.' }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-4 p-5 rounded-[2rem] bg-white/70 border border-white/60 hover:border-accent-main/40 transition-all shadow-sm group">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 text-accent-main flex items-center justify-center shrink-0 group-hover:bg-accent-main group-hover:text-white transition-all">
                         <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                         <h4 className="font-black text-base text-text-primary uppercase tracking-tight group-hover:text-accent-main transition-colors">{item.title}</h4>
                         <p className="text-[11px] text-text-muted font-semibold leading-relaxed uppercase tracking-wider mt-0.5">{item.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
            </div>

            <div className="relative">
               <div className="aspect-square max-w-md mx-auto relative rounded-[3rem] overflow-hidden shadow-md border-4 border-white">
                  <img src="https://images.unsplash.com/photo-1581578731522-a2049a4571ff?w=800" className="w-full h-full object-cover" />
                  <div className="absolute bottom-6 left-6 right-6 p-5 glass-card rounded-2xl border border-white/60 text-text-primary shadow-lg bg-white/90">
                     <p className="text-xs font-black mb-1 flex items-center gap-2 uppercase tracking-wider text-accent-main"><CheckCircle2 className="w-4 h-4" /> Thousands Happy</p>
                     <p className="text-[10px] font-bold leading-relaxed uppercase tracking-wider text-text-secondary">Over 50,000 jobs successfully finished this year on Worklyn.</p>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-10">
          <div className="container-responsive">
            <GlassCard goldBorder className="p-10 sm:p-16 !bg-white/80 border border-white/60 rounded-[3rem] text-center text-text-primary relative overflow-hidden group shadow-sm">
               <div className="relative z-10">
                 <h2 className="text-3xl sm:text-5xl font-sora font-black mb-4 uppercase tracking-tight">Ready to start?</h2>
                 <p className="text-sm sm:text-base font-bold text-text-secondary mb-10 max-w-xl mx-auto uppercase tracking-wider">
                   Join thousands of people who use Worklyn for all their house work.
                 </p>
                 <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <PremiumButton
                      variant="gold"
                      size="lg"
                      className="px-12 py-4 font-black"
                      onClick={() => navigate('/register/customer')}
                    >
                      BOOK A WORKER
                    </PremiumButton>
                    <PremiumButton
                      variant="outline"
                      size="lg"
                      className="px-12 py-4 font-black"
                      onClick={() => navigate('/register/worker')}
                    >
                      JOIN AS WORKER
                    </PremiumButton>
                 </div>
               </div>
            </GlassCard>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Services;
