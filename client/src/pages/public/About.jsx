import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import GlassCard from '../../components/common/GlassCard';
import { ShieldCheck, Zap, Heart, Users, Globe, Award, Sparkles, Target, Activity } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background-primary flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-[600px] bg-accent-orange/10 blur-[150px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 pt-32 sm:pt-40 pb-24 relative z-10">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="container-responsive relative z-10 text-center">
            <span className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-6 block opacity-80 animate-fade-in">Our Story</span>
            <h1 className="text-4xl sm:text-7xl font-sora font-black text-white mb-8 uppercase tracking-tighter">
               We connect <br className="hidden sm:block" /> workers with <span className="orange-gradient-text">customers</span>
            </h1>
            <p className="text-sm sm:text-lg text-text-secondary max-w-3xl mx-auto leading-relaxed font-bold uppercase tracking-wide opacity-90">
              Worklyn is an easy-to-use website built to help people find trusted, verified, and high-quality local workers for any home or office task.
            </p>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-16">
          <div className="container-responsive grid grid-cols-1 md:grid-cols-2 gap-10">
            <GlassCard goldBorder className="p-10 !bg-background-card border-border-primary/40 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent-orange/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <h2 className="font-sora font-black text-2xl text-white flex items-center gap-4 mb-6 uppercase tracking-tighter">
                 <Target className="w-8 h-8 text-accent-bright" /> Our Vision
               </h2>
               <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-bold italic opacity-90">
                 "To be the most trusted place for local services, where everyone can find professional help quickly and safely."
               </p>
            </GlassCard>
            <GlassCard goldBorder className="p-10 !bg-background-card border-border-primary/40 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-accent-orange/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
               <h2 className="font-sora font-black text-2xl text-white flex items-center gap-4 mb-6 uppercase tracking-tighter">
                 <Activity className="w-8 h-8 text-accent-bright" /> Our Mission
               </h2>
               <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-bold italic opacity-90">
                 "To give local workers better digital tools and provide customers with a simple and reliable way to book services."
               </p>
            </GlassCard>
          </div>
        </section>

        {/* Key Values */}
        <section className="py-24">
          <div className="container-responsive">
             <div className="text-center mb-20">
                <h2 className="text-3xl sm:text-5xl font-sora font-black text-white mb-6 uppercase tracking-tighter">Our Core Values</h2>
                <div className="w-24 h-1.5 bg-accent-orange mx-auto rounded-full shadow-orange" />
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {[
                  { icon: ShieldCheck, title: 'Safety First', desc: 'Every worker is checked to make sure they are who they say they are.' },
                  { icon: Zap, title: 'Fast Matching', desc: 'Find the right person for your job in just a few seconds.' },
                  { icon: Heart, title: 'Local Support', desc: 'We help local businesses and skilled workers in your neighborhood grow.' },
                  { icon: Award, title: 'High Quality', desc: 'We only keep the best workers on our platform to ensure great service.' },
                  { icon: Users, title: 'Real Help', desc: 'Our team is here to help you if anything goes wrong during a job.' },
                  { icon: Globe, title: 'Easy Access', desc: 'Book and manage your services from anywhere using your phone.' }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center text-center space-y-6 group p-8 bg-background-card/40 rounded-[3rem] border border-white/5 hover:border-accent-orange/30 transition-all shadow-xl">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-background-widget text-accent-bright flex items-center justify-center group-hover:bg-accent-orange group-hover:text-white transition-all shadow-2xl border border-white/5">
                        <item.icon className="w-8 h-8" />
                     </div>
                     <h3 className="font-sora font-black text-xl text-white uppercase tracking-tight">{item.title}</h3>
                     <p className="text-xs text-text-muted leading-relaxed font-bold uppercase tracking-widest opacity-80">{item.desc}</p>
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
