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
    <div className="min-h-screen bg-background-primary flex flex-col relative overflow-hidden">
       <div className="absolute top-0 left-0 w-full h-[600px] bg-accent-orange/10 blur-[150px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 pt-32 sm:pt-40 pb-24 relative z-10">
        {/* Header Section */}
        <section className="py-12 sm:py-16">
          <div className="container-responsive text-center max-w-3xl mx-auto">
            <span className="text-xs font-black text-white uppercase tracking-[0.4em] mb-6 block opacity-80 animate-fade-in">Our Services</span>
            <h1 className="text-4xl sm:text-7xl font-sora font-black text-white mb-8 leading-tight tracking-tighter">
               Find help for <br className="hidden sm:block" />
               <span className="orange-gradient-text">every task</span>
            </h1>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-12 px-4 font-bold opacity-90 uppercase tracking-wide">
              Explore our wide range of home and office services. From repairs to cleaning, Worklyn connects you with verified local workers.
            </p>

            {/* In-page Search */}
            <div className="max-w-xl mx-auto relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-text-muted group-focus-within:text-accent-bright transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What service do you need? (e.g. Plumber...)"
                className="w-full bg-background-dark/80 border-2 border-border-primary/30 rounded-3xl py-5 pl-16 pr-6 text-sm font-bold text-white focus:outline-none focus:border-accent-main transition-all shadow-2xl uppercase tracking-widest"
              />
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-12">
          <div className="container-responsive">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="h-56 rounded-[2.5rem] bg-white/5 animate-pulse" />
                ))}
              </div>
            ) : filteredCategories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-10">
                {filteredCategories.map((cat) => {
                  const Icon = iconMap[cat.icon] || Wrench;
                  return (
                    <Link
                      key={cat._id}
                      to={`/search?category=${cat.slug}`}
                      className="group"
                    >
                      <GlassCard goldBorder className="p-8 h-full flex flex-col items-center text-center transition-all duration-500 group-hover:-translate-y-2 !bg-background-card border-border-primary/40 shadow-2xl">
                        <div className="w-16 h-16 rounded-2xl bg-background-widget text-accent-bright flex items-center justify-center mb-6 group-hover:bg-accent-orange group-hover:text-white transition-all shadow-xl">
                           <Icon className="w-8 h-8" />
                        </div>
                        <h3 className="font-sora font-black text-base sm:text-lg text-white mb-3 uppercase tracking-tight truncate w-full group-hover:text-accent-bright">{cat.name}</h3>
                        <p className="text-[10px] text-text-muted mb-6 line-clamp-2 leading-relaxed font-bold uppercase tracking-widest opacity-80">
                          {cat.description || 'Verified local professionals ready to help.'}
                        </p>
                        <span className="text-[9px] font-black text-accent-light bg-accent-orange/10 px-4 py-2 rounded-full border border-accent-orange/20 flex items-center gap-2 uppercase tracking-widest mt-auto group-hover:bg-accent-orange group-hover:text-white transition-all">
                           {cat.workerCount || 0} Workers <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </GlassCard>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-background-cardSecondary/40 rounded-[3rem] border-2 border-dashed border-border-primary/20">
                <Sparkles className="w-12 h-12 text-accent-bright mx-auto mb-4 opacity-30" />
                <h3 className="font-sora font-bold text-white uppercase tracking-tighter">No categories found</h3>
                <p className="text-xs text-text-muted mt-2 uppercase tracking-widest">Try searching for something else.</p>
                <PremiumButton variant="outline" size="sm" className="mt-8" onClick={() => setSearchQuery('')}>Clear Search</PremiumButton>
              </div>
            )}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-24 overflow-hidden relative">
          <div className="container-responsive grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-5xl font-black font-sora text-white mb-8 uppercase tracking-tighter">
                 Why book through <span className="orange-gradient-text">Worklyn?</span>
              </h2>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-10 font-bold uppercase tracking-wide opacity-90">
                We make it easy to find good workers while keeping you safe and your data private.
              </p>

              <div className="space-y-5">
                 {[
                   { icon: ShieldCheck, title: 'Safe & Verified', desc: 'Every worker on our app has their identity checked before they can join.' },
                   { icon: Clock, title: 'Fast Booking', desc: 'Find the right person for your job in under 30 seconds.' },
                   { icon: Star, title: 'Good Ratings', desc: 'We only keep workers who do a great job and have high ratings.' },
                   { icon: MessageSquare, title: 'Direct Chat', desc: 'Talk to your worker inside the app to coordinate and get updates.' }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-5 p-6 rounded-[2rem] bg-background-card border border-border-primary/40 hover:border-accent-orange/40 transition-all shadow-xl group">
                      <div className="w-12 h-12 rounded-xl bg-background-widget text-accent-bright flex items-center justify-center shrink-0 group-hover:bg-accent-orange group-hover:text-white transition-all">
                         <item.icon className="w-6 h-6" />
                      </div>
                      <div>
                         <h4 className="font-black text-base text-white uppercase tracking-tight group-hover:text-accent-bright transition-colors">{item.title}</h4>
                         <p className="text-[11px] text-text-muted font-bold leading-relaxed uppercase tracking-wider mt-1 opacity-80">{item.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
            </div>

            <div className="relative">
               <div className="aspect-square max-w-md mx-auto relative rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white/5">
                  <img src="https://images.unsplash.com/photo-1581578731522-a2049a4571ff?w=800" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-dark/60 to-transparent" />
                  <div className="absolute bottom-8 left-8 right-8 p-6 glass-card rounded-2xl border border-white/20 text-white shadow-2xl animate-float">
                     <p className="text-xs font-black mb-2 flex items-center gap-2 uppercase tracking-widest text-accent-bright"><CheckCircle2 className="w-4 h-4" /> Thousands Happy</p>
                     <p className="text-[10px] font-bold leading-relaxed uppercase tracking-wider opacity-90">Over 50,000 jobs successfully finished this year on Worklyn.</p>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12">
          <div className="container-responsive">
            <GlassCard goldBorder className="p-10 sm:p-20 !bg-background-card border-border-primary/40 rounded-[4rem] text-center text-white relative overflow-hidden group shadow-2xl">
               <div className="absolute top-0 right-0 w-80 h-80 bg-accent-orange/10 blur-[120px] pointer-events-none" />
               <div className="relative z-10">
                 <h2 className="text-3xl sm:text-6xl font-sora font-black mb-6 uppercase tracking-tighter">Ready to start?</h2>
                 <p className="text-sm sm:text-xl font-bold opacity-80 mb-12 max-w-2xl mx-auto uppercase tracking-wide">
                   Join thousands of people who use Worklyn for all their house work.
                 </p>
                 <div className="flex flex-col sm:flex-row justify-center gap-6">
                    <PremiumButton
                      variant="gold"
                      size="lg"
                      className="px-16 py-6 shadow-orange font-black"
                      onClick={() => navigate('/register/customer')}
                    >
                      BOOK A WORKER
                    </PremiumButton>
                    <PremiumButton
                      variant="outline"
                      size="lg"
                      className="px-16 py-6 font-black"
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
