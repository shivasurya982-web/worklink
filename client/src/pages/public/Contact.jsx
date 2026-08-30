import React, { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import GlassCard from '../../components/common/GlassCard';
import PremiumButton from '../../components/common/PremiumButton';
import { Mail, Phone, MapPin, MessageSquare, Send, Clock, Globe } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    // Mock send
    setTimeout(() => {
      setSending(false);
      alert('Message sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background-primary flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 pb-16">
        <div className="container-responsive">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
             <span className="text-xs font-bold text-accent-gold uppercase tracking-[0.2em] mb-4 block">Get Support</span>
             <h1 className="text-4xl font-sora font-extrabold text-text-primary mb-4">Contact <span className="text-accent-gold">WorkLink</span></h1>
             <p className="text-sm text-text-secondary leading-relaxed">
               Have questions about our services or need help with a booking? Our dedicated support team is available 24/7 to assist you.
             </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
             {/* Contact Info Cards */}
             <div className="space-y-4">
                <GlassCard className="p-6 border border-gray-100 flex items-center gap-4 group hover:border-accent-gold/30 transition-all">
                   <div className="w-12 h-12 rounded-2xl bg-amber-50 text-accent-gold flex items-center justify-center shrink-0 group-hover:bg-accent-gold group-hover:text-white transition-all">
                      <Phone className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-text-muted uppercase">Call Support</p>
                      <p className="text-sm font-bold text-text-primary">1800-000-0000</p>
                   </div>
                </GlassCard>

                <GlassCard className="p-6 border border-gray-100 flex items-center gap-4 group hover:border-accent-gold/30 transition-all">
                   <div className="w-12 h-12 rounded-2xl bg-blue-50 text-accent-blue flex items-center justify-center shrink-0 group-hover:bg-accent-blue group-hover:text-white transition-all">
                      <Mail className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-text-muted uppercase">Email Us</p>
                      <p className="text-sm font-bold text-text-primary">support@worklinkai.com</p>
                   </div>
                </GlassCard>

                <GlassCard className="p-6 border border-gray-100 flex items-center gap-4 group hover:border-accent-gold/30 transition-all">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-accent-green flex items-center justify-center shrink-0 group-hover:bg-accent-green group-hover:text-white transition-all">
                      <Clock className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-text-muted uppercase">Response Time</p>
                      <p className="text-sm font-bold text-text-primary">Under 15 Minutes</p>
                   </div>
                </GlassCard>

                <GlassCard className="p-6 border border-gray-100 flex items-center gap-4 group hover:border-accent-gold/30 transition-all">
                   <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-all">
                      <Globe className="w-6 h-6" />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-text-muted uppercase">Headquarters</p>
                      <p className="text-sm font-bold text-text-primary">Mumbai, India</p>
                   </div>
                </GlassCard>
             </div>

             {/* Contact Form */}
             <div className="lg:col-span-2">
                <GlassCard goldBorder className="p-8 bg-white/80">
                   <h2 className="text-xl font-sora font-bold text-text-primary mb-6 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-accent-gold" /> Send a Message
                   </h2>

                   <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Full Name</label>
                         <input
                           type="text"
                           value={formData.name}
                           onChange={(e) => setFormData({...formData, name: e.target.value})}
                           className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-accent-gold focus:bg-white transition-all"
                           required
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Email Address</label>
                         <input
                           type="email"
                           value={formData.email}
                           onChange={(e) => setFormData({...formData, email: e.target.value})}
                           className="w-full bg-gray-100/50 border border-gray-100 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-accent-gold focus:bg-white transition-all"
                           required
                         />
                      </div>
                      <div className="sm:col-span-2 space-y-1.5">
                         <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Subject</label>
                         <input
                           type="text"
                           value={formData.subject}
                           onChange={(e) => setFormData({...formData, subject: e.target.value})}
                           className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-accent-gold focus:bg-white transition-all"
                           required
                         />
                      </div>
                      <div className="sm:col-span-2 space-y-1.5">
                         <label className="text-[10px] font-bold text-text-muted uppercase tracking-widest ml-1">Message</label>
                         <textarea
                           rows={5}
                           value={formData.message}
                           onChange={(e) => setFormData({...formData, message: e.target.value})}
                           className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-accent-gold focus:bg-white transition-all"
                           required
                         />
                      </div>
                      <div className="sm:col-span-2 pt-2">
                         <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={sending} icon={Send}>
                            Send Inquiry
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
