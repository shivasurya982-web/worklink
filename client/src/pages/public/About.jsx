import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import GlassCard from '../../components/common/GlassCard';
import { ShieldCheck, Zap, Heart, Users, Globe, Award, Sparkles } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background-primary flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl bg-accent-gold/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="container-responsive relative z-10 text-center">
            <span className="text-xs font-bold text-accent-gold uppercase tracking-[0.2em] mb-4 block">Our Journey</span>
            <h1 className="text-hero font-sora font-extrabold text-text-primary mb-6">
               Redefining Local Services <br /> with <span className="text-accent-gold">WorkLink</span>
            </h1>
            <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto leading-relaxed">
              WorkLink is a platform designed to make it easier to find trusted, verified, and high-quality local professionals for everyday needs.
            </p>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-12 bg-white/50">
          <div className="container-responsive grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassCard className="p-8 space-y-4 border border-gray-100">
               <h2 className="font-sora font-bold text-xl text-text-primary flex items-center gap-2">
                 <Globe className="w-6 h-6 text-accent-gold" /> Our Vision
               </h2>
               <p className="text-sm text-text-secondary leading-relaxed">
                 To become the world's most trusted digital ecosystem for local services, where every home and office can find professional help in under 30 seconds with 100% confidence in quality and safety.
               </p>
            </GlassCard>
            <GlassCard className="p-8 space-y-4 border border-gray-100">
               <h2 className="font-sora font-bold text-xl text-text-primary flex items-center gap-2">
                 <Sparkles className="w-6 h-6 text-accent-gold" /> Our Mission
               </h2>
               <p className="text-sm text-text-secondary leading-relaxed">
                 To empower local skilled workers with better digital tools and provide customers with a seamless booking experience that eliminates the uncertainty of traditional service marketplaces.
               </p>
            </GlassCard>
          </div>
        </section>

        {/* Key Values */}
        <section className="py-20">
          <div className="container-responsive">
             <div className="text-center mb-16">
                <h2 className="text-3xl font-sora font-bold text-text-primary mb-4">Why We Built WorkLink</h2>
                <div className="w-20 h-1 bg-accent-gold mx-auto rounded-full" />
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { icon: ShieldCheck, title: 'Verified Safety', desc: 'Every worker undergoes a rigorous multi-step verification of identity and skills.' },
                  { icon: Zap, title: 'Instant Matching', desc: 'Our smart matching system analyzes local data to find your perfect match in seconds.' },
                  { icon: Heart, title: 'Community First', desc: 'We prioritize the growth of local workers and the satisfaction of our neighbors.' },
                  { icon: Award, title: 'Premium Quality', desc: 'Only the highest-rated professionals remain on our platform to ensure excellence.' },
                  { icon: Users, title: 'Transparent Support', desc: 'Direct chat and a dedicated support team ensure you are never left alone with a problem.' },
                  { icon: Globe, title: 'Anywhere Access', desc: 'Manage your home services from your pocket, whether you are at home or on the move.' }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center text-center space-y-3 group">
                     <div className="w-14 h-14 rounded-2xl bg-amber-50 text-accent-gold flex items-center justify-center group-hover:bg-accent-gold group-hover:text-white transition-all duration-300">
                        <item.icon className="w-7 h-7" />
                     </div>
                     <h3 className="font-sora font-bold text-base text-text-primary">{item.title}</h3>
                     <p className="text-xs text-text-muted leading-relaxed">{item.desc}</p>
                  </div>
                ))}
             </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
