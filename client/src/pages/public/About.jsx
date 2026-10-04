import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import GlassCard from '../../components/common/GlassCard';
import { ShieldCheck, Zap, Heart, Users, Globe, Award, Target, Activity } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden">
      <Navbar />

      <main className="flex-1 pt-32 sm:pt-40 pb-24 relative z-10">
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="container-responsive relative z-10 text-center">
            <span className="text-[11px] font-black text-accent-main uppercase tracking-[0.3em] mb-4 block animate-fade-in">Our Story</span>
            <h1 className="text-4xl sm:text-6xl font-sora font-black text-text-primary mb-6 uppercase tracking-tight">
               We connect <br className="hidden sm:block" /> workers with <span className="text-accent-main">customers</span>
            </h1>
            <p className="text-sm sm:text-base text-text-secondary max-w-3xl mx-auto leading-relaxed font-bold uppercase tracking-wider">
              Worklyn is an easy-to-use website built to help people find trusted, verified, and high-quality local workers for any home or office task.
            </p>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-12">
          <div className="container-responsive grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassCard goldBorder className="p-8 sm:p-10 !bg-white/70 border border-white/60 shadow-sm relative overflow-hidden group">
               <h2 className="font-sora font-black text-2xl text-text-primary flex items-center gap-3 mb-4 uppercase tracking-tight">
                 <Target className="w-7 h-7 text-accent-main" /> Our Vision
               </h2>
               <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-bold italic">
                 "To be the most trusted place for local services, where everyone can find professional help quickly and safely."
               </p>
            </GlassCard>
            <GlassCard goldBorder className="p-8 sm:p-10 !bg-white/70 border border-white/60 shadow-sm relative overflow-hidden group">
               <h2 className="font-sora font-black text-2xl text-text-primary flex items-center gap-3 mb-4 uppercase tracking-tight">
                 <Activity className="w-7 h-7 text-accent-main" /> Our Mission
               </h2>
               <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-bold italic">
                 "To give local workers better digital tools and provide customers with a simple and reliable way to book services."
               </p>
            </GlassCard>
          </div>
        </section>

        {/* Key Values */}
        <section className="py-20">
          <div className="container-responsive">
             <div className="text-center mb-16">
                <h2 className="text-3xl sm:text-4xl font-sora font-black text-text-primary mb-4 uppercase tracking-tight">Our Core Values</h2>
                <div className="w-20 h-1.5 bg-accent-main mx-auto rounded-full" />
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { icon: ShieldCheck, title: 'Safety First', desc: 'Every worker is checked to make sure they are who they say they are.' },
                  { icon: Zap, title: 'Fast Matching', desc: 'Find the right person for your job in just a few seconds.' },
                  { icon: Heart, title: 'Local Support', desc: 'We help local businesses and skilled workers in your neighborhood grow.' },
                  { icon: Award, title: 'High Quality', desc: 'We only keep the best workers on our platform to ensure great service.' },
                  { icon: Users, title: 'Real Help', desc: 'Our team is here to help you if anything goes wrong during a job.' },
                  { icon: Globe, title: 'Easy Access', desc: 'Book and manage your services from anywhere using your phone.' }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center text-center space-y-4 group p-8 bg-white/70 rounded-[2.5rem] border border-white/75 hover:border-accent-main/40 transition-all shadow-sm">
                     <div className="w-14 h-14 rounded-2xl bg-orange-50/80 text-accent-main flex items-center justify-center group-hover:bg-accent-main group-hover:text-white transition-all shadow-xs border border-orange-100/80">
                        <item.icon className="w-7 h-7" />
                     </div>
                     <h3 className="font-sora font-black text-lg text-text-primary uppercase tracking-tight">{item.title}</h3>
                     <p className="text-xs text-text-secondary leading-relaxed font-medium">{item.desc}</p>
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
