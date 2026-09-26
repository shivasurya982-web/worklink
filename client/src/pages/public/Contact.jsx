import React, { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import GlassCard from '../../components/common/GlassCard';
import PremiumButton from '../../components/common/PremiumButton';
import { Mail, Phone, MessageSquare, Send, Clock, Globe } from 'lucide-react';

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
    <div className="min-h-screen bg-transparent flex flex-col relative overflow-hidden">
      <Navbar />

      <main className="flex-1 pt-32 sm:pt-40 pb-24 relative z-10">
        <div className="container-responsive">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
             <span className="text-[11px] font-black text-accent-main uppercase tracking-[0.3em] mb-4 block">Support</span>
             <h1 className="text-4xl sm:text-6xl font-sora font-black text-text-primary mb-4 uppercase tracking-tight">Contact <span className="text-accent-main">Worklyn</span></h1>
             <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-bold uppercase tracking-wider">
               Need help? Our team is available 24/7 to answer your questions.
             </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
             {/* Contact Cards */}
             <div className="space-y-4">
                {[
                  { icon: Phone, label: 'Call Us', val: '1800-000-0000', color: 'text-accent-main' },
                  { icon: Mail, label: 'Email Us', val: 'support@worklynai.com', color: 'text-accent-main' },
                  { icon: Clock, label: 'Response Time', val: 'Fast (under 15 mins)', color: 'text-emerald-600' },
                  { icon: Globe, label: 'Headquarters', val: 'Tiruchendur, India', color: 'text-text-primary' }
                ].map((item, i) => (
                  <GlassCard key={i} className="p-5 !bg-white/70 border border-white/60 flex items-center gap-4 group hover:border-accent-main/40 transition-all shadow-sm">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 border border-blue-100 group-hover:bg-accent-main group-hover:text-white transition-all shadow-xs">
                        <item.icon className={`w-6 h-6 ${item.color} group-hover:text-white`} />
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider">{item.label}</p>
                        <p className="text-sm font-black text-text-primary uppercase tracking-tight">{item.val}</p>
                    </div>
                  </GlassCard>
                ))}
             </div>

             {/* Contact Form */}
             <div className="lg:col-span-2">
                <GlassCard goldBorder className="p-8 sm:p-10 !bg-white/80 border border-white/60 shadow-sm relative overflow-hidden">
                   <h2 className="text-xl font-sora font-black text-text-primary mb-8 flex items-center gap-3 uppercase tracking-tight">
                      <MessageSquare className="w-6 h-6 text-accent-main" /> Send a Message
                   </h2>

                   <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1">YOUR NAME</label>
                         <input
                           type="text"
                           value={formData.name}
                           onChange={(e) => setFormData({...formData, name: e.target.value})}
                           className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-main uppercase"
                           required
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1">YOUR EMAIL</label>
                         <input
                           type="email"
                           value={formData.email}
                           onChange={(e) => setFormData({...formData, email: e.target.value})}
                           className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-main uppercase"
                           required
                         />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                         <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1">SUBJECT</label>
                         <input
                           type="text"
                           value={formData.subject}
                           onChange={(e) => setFormData({...formData, subject: e.target.value})}
                           className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-main uppercase"
                           required
                         />
                      </div>
                      <div className="sm:col-span-2 space-y-2">
                         <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1">MESSAGE</label>
                         <textarea
                           rows={4}
                           value={formData.message}
                           onChange={(e) => setFormData({...formData, message: e.target.value})}
                           className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-xs font-medium text-text-primary focus:outline-none focus:border-accent-main uppercase tracking-wide"
                           required
                         />
                      </div>
                      <div className="sm:col-span-2 pt-2">
                         <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={sending} icon={Send} className="py-4 font-black">
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
