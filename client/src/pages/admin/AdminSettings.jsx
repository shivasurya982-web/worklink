import { getImageUrl } from '../../utils/imageUtils';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import PremiumButton from '../../components/common/PremiumButton';
import { useNotification } from '../../context/NotificationContext';
import {
  Save,
  Sparkles,
  Phone,
  Upload,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import API from '../../services/api';

const AdminSettings = () => {
  const { showToast } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');

  const [formData, setFormData] = useState({
    siteName: 'Worklyn',
    announcementText: 'Verified Local Service Marketplace',
    heroBannerImage: '',
    heroTitle: 'Find & Book Trusted Local Experts In Seconds',
    heroSubtitle:
      'Worklyn connects you with verified electricians, plumbers, carpenters, mechanics, and technicians nearby — powered by smart local matching.',

    contactPhone: '1800-000-0000',
    contactEmail: 'support@worklynai.com',
    stayUpdatedText: 'Get updates on new service categories and special discounts near you.',
    footerCopyrightText: 'Worklyn. All rights reserved.',
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
        showToast('Success', 'Homepage image uploaded.', 'success');
      }
    } catch (err) {
      showToast('Error', err.message || 'Upload failed', 'error');
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
        showToast('Success', 'Website settings saved.', 'success');
      }
    } catch (err) {
      showToast('Error', err.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="Website Settings"
      subtitle="Change website text, contact info, and fees"
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-main border-t-transparent" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-gray-100 custom-scrollbar">
            {[
              { id: 'hero', label: 'Homepage Text', icon: Sparkles },
              { id: 'contact', label: 'Contact & Footer', icon: Phone },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
                  activeTab === id
                    ? 'bg-accent-main text-white shadow-xs'
                    : 'bg-white text-text-muted hover:text-text-primary border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* TAB 1: HERO & BANNER */}
          {activeTab === 'hero' && (
            <GlassCard goldBorder className="!bg-white/80 p-6 sm:p-8 rounded-[2.5rem] space-y-8 animate-fade-in border border-white/60 shadow-xs">
              <h3 className="font-sora font-black text-lg text-text-primary flex items-center gap-3 border-b border-gray-100 pb-4 uppercase tracking-tight">
                <Sparkles className="w-6 h-6 text-accent-main" /> Homepage Header
              </h3>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1">TOP SMALL TEXT</label>
                  <input
                    type="text"
                    name="announcementText"
                    value={formData.announcementText}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-main"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1">MAIN BIG TITLE</label>
                  <input
                    type="text"
                    name="heroTitle"
                    value={formData.heroTitle}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-main"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1">SUBTITLE TEXT</label>
                  <textarea
                    rows={3}
                    name="heroSubtitle"
                    value={formData.heroSubtitle}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-main"
                    required
                  />
                </div>
              </div>

              {/* Banner Image Upload */}
              <div className="pt-6 border-t border-gray-100">
                <label className="text-[10px] font-black text-text-primary uppercase tracking-widest block mb-4 ml-1">
                  MAIN IMAGE (HERO BANNER)
                </label>
                {formData.heroBannerImage && (
                  <div className="mb-4 relative rounded-2xl overflow-hidden max-h-48 border border-gray-200 bg-white p-2">
                    <img src={getImageUrl(formData.heroBannerImage)} alt="Banner" className="w-full h-44 object-cover rounded-xl" />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, heroBannerImage: '' }))}
                      className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
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
                  <label htmlFor="banner-upload" className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-blue-50 text-accent-main rounded-xl text-[10px] font-black border border-blue-100 hover:bg-blue-100 transition-all uppercase tracking-wider shadow-xs">
                    {uploadingBanner ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploadingBanner ? 'UPLOADING...' : 'UPLOAD NEW IMAGE'}
                  </label>
                </div>
              </div>
            </GlassCard>
          )}

          {/* TAB 2: CONTACT & FOOTER */}
          {activeTab === 'contact' && (
            <GlassCard className="!bg-white/80 p-6 sm:p-8 rounded-[2.5rem] space-y-6 animate-fade-in border border-white/60 shadow-xs">
              <h3 className="font-sora font-black text-lg text-text-primary flex items-center gap-3 border-b border-gray-100 pb-4 uppercase tracking-tight">
                <Phone className="w-6 h-6 text-accent-main" /> Contact Info & Footer
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1">SUPPORT PHONE</label>
                  <input
                    type="text"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-main"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1">SUPPORT EMAIL</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-main"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1">FOOTER COPYRIGHT TEXT</label>
                <input
                  type="text"
                  name="footerCopyrightText"
                  value={formData.footerCopyrightText}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-main"
                />
              </div>
            </GlassCard>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <PremiumButton type="submit" variant="gold" size="lg" icon={Save} loading={saving} className="px-12 py-4 text-sm font-black">
              SAVE ALL SETTINGS
            </PremiumButton>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
};

export default AdminSettings;
