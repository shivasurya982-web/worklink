import React, { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import GlassCard from '../../components/common/GlassCard';
import PremiumButton from '../../components/common/PremiumButton';
import { Mail, Phone, MapPin, MessageSquare, Send, Clock, Globe, ShieldCheck } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      alert('Message sent! Our support team will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background-primary flex flex-col relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-[600px] bg-accent-orange/10 blur-[150px] pointer-events-none" />

      <Navbar />

      <main className="flex-1 pt-32 sm:pt-40 pb-24 relative z-10">
        <div className="container-responsive">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-20">
             <span className="text-[11px] font-black text-white uppercase tracking-[0.4em] mb-6 block opacity-80">Support</span>
             <h1 className="text-4xl sm:text-6xl font-sora font-black text-white mb-6 uppercase tracking-tighter">Contact <span className="orange-gradient-text">Worklyn</span></h1>
             <p className="text-sm sm:text-lg text-text-secondary leading-relaxed font-bold opacity-90 uppercase tracking-wide">
               Need help? Our team is available 24/7 to answer your questions.
             </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
             {/* Contact Cards */}
             <div className="space-y-5">
                {[
                  { icon: Phone, label: 'Call Us', val: '1800-000-0000', color: 'text-accent-bright' },
                  { icon: Mail, label: 'Email Us', val: 'support@worklynai.com', color: 'text-accent-light' },
                  { icon: Clock, label: 'Response Time', val: 'Fast (under 15 mins)', color: 'text-accent-green' },
                  { icon: Globe, label: 'Headquarters', val: 'Tiruchendur, India', color: 'text-white' }
                ].map((item, i) => (
                  <GlassCard key={i} className="p-6 !bg-background-card border-border-primary/40 flex items-center gap-5 group hover:border-accent-orange transition-all shadow-2xl">
                    <div className="w-14 h-14 rounded-2xl bg-background-widget flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-accent-orange group-hover:text-white transition-all shadow-xl">
                        <item.icon className={`w-7 h-7 ${item.color} group-hover:text-white`} />
                    </div>
                    <div>
                        <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">{item.label}</p>
                        <p className="text-sm font-black text-white uppercase tracking-tight">{item.val}</p>
                    </div>
                  </GlassCard>
                ))}
             </div>

             {/* Contact Form */}
             <div className="lg:col-span-2">
                <GlassCard goldBorder className="p-8 sm:p-12 !bg-background-card border-border-primary/40 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-48 h-48 bg-accent-orange/5 blur-3xl pointer-events-none" />

                   <h2 className="text-2xl font-sora font-black text-white mb-10 flex items-center gap-4 uppercase tracking-tighter">
                      <MessageSquare className="w-7 h-7 text-accent-bright" /> Send a Message
                   </h2>

                   <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-accent-light uppercase tracking-widest ml-2">YOUR NAME</label>
                         <input
                           type="text"
                           value={formData.name}
                           onChange={(e) => setFormData({...formData, name: e.target.value})}
                           className="w-full bg-background-dark/50 border-2 border-border-primary/30 rounded-2xl px-5 py-4 text-xs font-black text-white focus:outline-none focus:border-accent-main shadow-inner uppercase"
                           required
                         />
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black text-accent-light uppercase tracking-widest ml-2">YOUR EMAIL</label>
                         <input
                           type="email"
                           value={formData.email}
                           onChange={(e) => setFormData({...formData, email: e.target.value})}
                           className="w-full bg-background-dark/50 border-2 border-border-primary/30 rounded-2xl px-5 py-4 text-xs font-black text-white focus:outline-none focus:border-accent-main shadow-inner uppercase"
                           required
                         />
                      </div>
                      <div className="sm:col-span-2 space-y-3">
                         <label className="text-[10px] font-black text-accent-light uppercase tracking-widest ml-2">SUBJECT</label>
                         <input
                           type="text"
                           value={formData.subject}
                           onChange={(e) => setFormData({...formData, subject: e.target.value})}
                           className="w-full bg-background-dark/50 border-2 border-border-primary/30 rounded-2xl px-5 py-4 text-xs font-black text-white focus:outline-none focus:border-accent-main shadow-inner uppercase"
                           required
                         />
                      </div>
                      <div className="sm:col-span-2 space-y-3">
                         <label className="text-[10px] font-black text-accent-light uppercase tracking-widest ml-2">MESSAGE</label>
                         <textarea
                           rows={5}
                           value={formData.message}
                           onChange={(e) => setFormData({...formData, message: e.target.value})}
                           className="w-full bg-background-dark/50 border-2 border-border-primary/30 rounded-[2rem] px-6 py-5 text-sm font-bold text-white focus:outline-none focus:border-accent-main shadow-inner uppercase tracking-wider"
                           required
                         />
                      </div>
                      <div className="sm:col-span-2 pt-4">
                         <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={sending} icon={Send} className="py-6 shadow-orange font-black">
                            SEND MESSAGE
                         </PremiumButton>
                      </div>
                   </form>
                </GlassCard>
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
