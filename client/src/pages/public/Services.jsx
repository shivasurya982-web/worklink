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
    <div className="min-h-screen bg-background-primary flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        {/* Header Section */}
        <section className="py-12 sm:py-16">
          <div className="container-responsive text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold text-accent-gold uppercase tracking-[0.2em] mb-4 block animate-fade-in">Service Directory</span>
            <h1 className="text-3xl sm:text-5xl font-sora font-extrabold text-text-primary mb-6 leading-tight">
               Every Local Service <br className="hidden sm:block" />
               <span className="text-accent-gold">At Your Fingertips</span>
            </h1>
            <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-10 px-4">
              Explore our wide range of professional home and commercial services. From urgent repairs to personal tutors, WorkLink connects you with verified experts in seconds.
            </p>

            {/* In-page Search */}
            <div className="max-w-xl mx-auto relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-accent-gold transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories (e.g. Electrician, Plumber...)"
                className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-sm shadow-xl shadow-amber-900/5 focus:outline-none focus:border-accent-gold transition-all"
              />
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="py-12 bg-background-secondary/30">
          <div className="container-responsive">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="h-48 rounded-3xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : filteredCategories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {filteredCategories.map((cat) => {
                  const Icon = iconMap[cat.icon] || Wrench;
                  return (
                    <Link
                      key={cat._id}
                      to={`/search?category=${cat.slug}`}
                      className="group"
                    >
                      <GlassCard goldBorder className="p-6 h-full flex flex-col items-center text-center transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-glow">
                        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-accent-gold flex items-center justify-center mb-4 group-hover:bg-accent-gold group-hover:text-white transition-all shadow-sm">
                           <Icon className="w-7 h-7" />
                        </div>
                        <h3 className="font-sora font-bold text-sm sm:text-base text-text-primary mb-2 truncate w-full">{cat.name}</h3>
                        <p className="text-[10px] text-text-muted mb-4 line-clamp-2 leading-relaxed">
                          {cat.description || 'Quality professional services near you.'}
                        </p>
                        <span className="text-[10px] font-bold text-accent-gold bg-amber-50 px-3 py-1 rounded-full border border-accent-gold/10 flex items-center gap-1">
                           {cat.workerCount || 0} Professionals <ArrowRight className="w-3 h-3" />
                        </span>
                      </GlassCard>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <Sparkles className="w-12 h-12 text-accent-gold mx-auto mb-4 opacity-30" />
                <h3 className="font-sora font-bold text-text-primary">No categories found</h3>
                <p className="text-xs text-text-muted mt-1">Try a different search term or browse all services.</p>
                <PremiumButton variant="outline" size="sm" className="mt-6" onClick={() => setSearchQuery('')}>Clear Search</PremiumButton>
              </div>
            )}
          </div>
        </section>

        {/* ─── Why WorkLink ─── */}
        <section className="py-24 overflow-hidden relative">
          <div className="container-responsive grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-4xl font-bold font-sora text-text-primary mb-6 leading-tight">
                 Why Choose <span className="text-accent-gold text-hero">WorkLink?</span>
              </h2>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-8">
                We've built a platform that puts trust, speed, and quality at the heart of every interaction. Experience the modern way of booking local services.
              </p>

              <div className="space-y-4">
                 {[
                   { icon: ShieldCheck, title: 'Identity Verified', desc: 'Every professional undergoes a multi-step background and document check.' },
                   { icon: Clock, title: 'Under 30s Matching', desc: 'Our matching system finds you the best available workers in real-time.' },
                   { icon: Star, title: 'Quality Guaranteed', desc: 'We only maintain partnerships with high-rated, skilled local professionals.' },
                   { icon: MessageSquare, title: 'Direct Communication', desc: 'Secure in-app chat for seamless updates and coordination.' }
                 ].map((item, i) => (
                   <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white border border-gray-100 hover:border-accent-gold/20 hover:shadow-sm transition-all">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-accent-blue flex items-center justify-center shrink-0">
                         <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                         <h4 className="font-bold text-sm text-text-primary">{item.title}</h4>
                         <p className="text-[11px] text-text-muted leading-tight mt-0.5">{item.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
            </div>

            <div className="relative">
               <div className="aspect-square max-w-md mx-auto relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                  <img src="https://images.unsplash.com/photo-1581578731522-a2049a4571ff?w=800" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 p-4 glass-card rounded-2xl border border-white/30 text-white animate-float">
                     <p className="text-xs font-bold mb-1 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-accent-gold" /> Verified Success</p>
                     <p className="text-[10px] font-medium opacity-90 leading-tight">Over 50,000 service requests successfully completed this year through our platform.</p>
                  </div>
               </div>
               {/* Decorative elements */}
               <div className="absolute -top-6 -right-6 w-24 h-24 bg-accent-gold/10 rounded-full blur-2xl" />
               <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent-blue/10 rounded-full blur-2xl" />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12">
          <div className="container-responsive">
            <GlassCard goldBorder className="p-8 sm:p-12 bg-gradient-to-r from-accent-gold to-amber-500 rounded-[40px] text-center text-white relative overflow-hidden group">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
               <div className="relative z-10">
                 <h2 className="text-2xl sm:text-4xl font-sora font-extrabold mb-4">Ready to Get Started?</h2>
                 <p className="text-sm sm:text-lg font-medium opacity-90 mb-8 max-w-xl mx-auto">
                   Join thousands of happy customers who trust WorkLink for all their home service needs.
                 </p>
                 <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <PremiumButton
                      variant="white"
                      size="lg"
                      className="px-10 py-4 rounded-full text-accent-gold font-bold shadow-xl hover:scale-105 transition-transform"
                      onClick={() => navigate('/register/customer')}
                    >
                      Book a Service
                    </PremiumButton>
                    <PremiumButton
                      variant="outline"
                      size="lg"
                      className="px-10 py-4 rounded-full border-2 border-white text-white font-bold hover:bg-white hover:text-accent-gold transition-all"
                      onClick={() => navigate('/register/worker')}
                    >
                      Join as Professional
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
