import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import PremiumButton from '../../components/common/PremiumButton';
import { useNotification } from '../../context/NotificationContext';
import {
  Settings,
  Save,
  Sparkles,
  Phone,
  Mail,
  Percent,
  Upload,
  Image as ImageIcon,
  Trash2,
} from 'lucide-react';
import API from '../../services/api';

const AdminSettings = () => {
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  const [formData, setFormData] = useState({
    siteName: 'WorkLink',
    announcementText: 'Verified Local Service Marketplace',
    heroBannerImage: '',
    heroTitle: 'Find & Book Trusted Local Experts In Seconds',
    heroSubtitle:
      'WorkLink connects you with verified electricians, plumbers, carpenters, mechanics, and technicians nearby — powered by smart local matching.',

    contactPhone: '1800-000-0000',
    contactEmail: 'support@worklinkai.com',
    stayUpdatedText: 'Get updates on new service categories and special discounts near you.',
    footerCopyrightText: 'WorkLink. All rights reserved.',
    platformFeePercentage: 5,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await API.get('/site/settings');
      if (res.success && res.data) {
        setFormData((prev) => ({
          ...prev,
          ...res.data,
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingBanner(true);
    try {
      const body = new FormData();
      body.append('image', file);

      const res = await API.post('/upload/image', body);
      if (res.success && res.data?.url) {
        setFormData((prev) => ({ ...prev, heroBannerImage: res.data.url }));
        showToast('System Updated', 'Hero banner module uploaded.', 'success');
      }
    } catch (err) {
      showToast('Error', err.message || 'Module upload failed', 'error');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.put('/site/site-settings', formData);
      if (res.success) {
        showToast('Parameters Synced', 'Global CMS attributes updated across all nodes.', 'success');
      }
    } catch (err) {
      showToast('Error', err.message || 'Synchronization failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="Ecosystem Configuration"
      subtitle="Administrative terminal for global parameters, content modules, and platform economics"
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent-bright border-t-transparent shadow-orange" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-10 max-w-5xl">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-3 overflow-x-auto pb-4 border-b border-white/5 custom-scrollbar">
            {[
              { id: 'hero', label: 'Atmosphere & Hero', icon: Sparkles },
              { id: 'contact', label: 'Nodes & Footer', icon: Phone },
              { id: 'platform', label: 'Economics', icon: Percent },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shrink-0 ${
                  activeTab === id
                    ? 'bg-accent-orange text-white shadow-xl scale-105'
                    : 'bg-background-cardSecondary text-text-muted hover:text-white border border-border-primary/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* TAB 1: HERO & BANNER */}
          {activeTab === 'hero' && (
            <GlassCard goldBorder className="!bg-background-card p-8 sm:p-10 rounded-[3rem] space-y-10 animate-fade-in border-border-primary/40 shadow-2xl">
              <h3 className="font-sora font-black text-xl text-white flex items-center gap-4 border-b border-white/5 pb-6 uppercase tracking-tighter">
                <Sparkles className="w-7 h-7 text-accent-bright" /> Global Hero Parameters
              </h3>

              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-accent-light uppercase tracking-widest ml-1">ANNOUNCEMENT SIGNAL</label>
                  <input
                    type="text"
                    name="announcementText"
                    value={formData.announcementText}
                    onChange={handleChange}
                    className="w-full bg-background-dark/50 border-2 border-border-primary/30 rounded-2xl p-5 text-sm font-bold text-white focus:outline-none focus:border-accent-main shadow-inner"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-accent-light uppercase tracking-widest ml-1">PRIMARY HEADLINE</label>
                  <input
                    type="text"
                    name="heroTitle"
                    value={formData.heroTitle}
                    onChange={handleChange}
                    className="w-full bg-background-dark/50 border-2 border-border-primary/30 rounded-2xl p-5 text-sm font-bold text-white focus:outline-none focus:border-accent-main shadow-inner"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-accent-light uppercase tracking-widest ml-1">SUBTITLE / LOG</label>
                  <textarea
                    rows={4}
                    name="heroSubtitle"
                    value={formData.heroSubtitle}
                    onChange={handleChange}
                    className="w-full bg-background-dark/50 border-2 border-border-primary/30 rounded-[2rem] p-6 text-sm font-bold text-white focus:outline-none focus:border-accent-main shadow-inner"
                    required
                  />
                </div>
              </div>

              {/* Banner Image Upload */}
              <div className="pt-8 border-t border-white/5">
                <label className="text-[10px] font-black text-white uppercase tracking-widest block mb-6 ml-1">
                  ATMOSPHERIC BANNER ARTIFACT
                </label>
                {formData.heroBannerImage && (
                  <div className="mb-6 relative rounded-[2.5rem] overflow-hidden max-h-56 border-2 border-border-primary/40 shadow-2xl bg-background-dark p-2">
                    <img src={formData.heroBannerImage} alt="Banner" className="w-full h-52 object-cover rounded-[2rem]" />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, heroBannerImage: '' }))}
                      className="absolute top-6 right-6 p-2.5 bg-red-600/90 text-white rounded-xl hover:bg-red-700 shadow-2xl transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <div className="relative">
                  <input
                    type="file"
                    id="banner-upload"
                    accept="image/*"
                    onChange={handleBannerUpload}
                    disabled={uploadingBanner}
                    className="hidden"
                  />
                  <label htmlFor="banner-upload" className="cursor-pointer inline-flex items-center gap-3 px-8 py-4 bg-background-widget text-accent-bright rounded-2xl text-[10px] font-black border border-white/5 hover:bg-background-secondary transition-all uppercase tracking-widest shadow-xl">
                    {uploadingBanner ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploadingBanner ? 'UPLOADING...' : 'INITIALIZE UPLOAD'}
                  </label>
                </div>
              </div>
            </GlassCard>
          )}

          {/* TAB 2: CONTACT & FOOTER */}
          {activeTab === 'contact' && (
            <GlassCard className="!bg-background-card p-8 sm:p-10 rounded-[3rem] space-y-8 animate-fade-in border-border-primary/40 shadow-2xl">
              <h3 className="font-sora font-black text-xl text-white flex items-center gap-4 border-b border-white/5 pb-6 uppercase tracking-tighter">
                <Phone className="w-7 h-7 text-accent-light" /> Node Comms & Footer Metadata
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-accent-light uppercase tracking-widest ml-1">CENTRAL HELPLINE</label>
                  <input
                    type="text"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full bg-background-dark/50 border-2 border-border-primary/30 rounded-2xl p-5 text-sm font-bold text-white focus:outline-none focus:border-accent-main shadow-inner"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-accent-light uppercase tracking-widest ml-1">SYSTEM SUPPORT ID</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="w-full bg-background-dark/50 border-2 border-border-primary/30 rounded-2xl p-5 text-sm font-bold text-white focus:outline-none focus:border-accent-main shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-accent-light uppercase tracking-widest ml-1">FOOTER DESIGNATION</label>
                <input
                  type="text"
                  name="footerCopyrightText"
                  value={formData.footerCopyrightText}
                  onChange={handleChange}
                  className="w-full bg-background-dark/50 border-2 border-border-primary/30 rounded-2xl p-5 text-sm font-bold text-white focus:outline-none focus:border-accent-main shadow-inner"
                />
              </div>
            </GlassCard>
          )}

          {/* TAB 3: PLATFORM FEE */}
          {activeTab === 'platform' && (
            <GlassCard className="!bg-background-card p-8 sm:p-10 rounded-[3rem] space-y-8 animate-fade-in border-border-primary/40 shadow-2xl">
              <h3 className="font-sora font-black text-xl text-white flex items-center gap-4 border-b border-white/5 pb-6 uppercase tracking-tighter">
                <Percent className="w-7 h-7 text-emerald-400" /> Ecosystem Economics
              </h3>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-accent-light uppercase tracking-widest ml-1">
                  PLATFORM OPERATIONAL TAX (%)
                </label>
                <div className="flex items-center gap-5">
                   <input
                    type="number"
                    name="platformFeePercentage"
                    value={formData.platformFeePercentage}
                    onChange={handleChange}
                    min="0"
                    max="50"
                    className="w-full sm:w-48 bg-background-dark/50 border-2 border-border-primary/40 rounded-2xl p-5 text-xl font-black text-white focus:outline-none focus:border-accent-main shadow-2xl text-center"
                    required
                  />
                  <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Global transaction percentage applied to all successful service completions.</p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <PremiumButton type="submit" variant="gold" size="lg" icon={Save} loading={saving} className="px-16 py-6 text-base font-black shadow-orange">
              SYNC ECOSYSTEM ATTRIBUTES
            </PremiumButton>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
};

export default AdminSettings;
