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
      const res = await API.get('/settings');
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
        showToast('Banner Uploaded!', 'Banner image updated.', 'success');
      }
    } catch (err) {
      showToast('Upload Error', err.message || 'Image upload failed', 'error');
    } finally {
      setUploadingBanner(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.put('/site-settings', formData);
      if (res.success) {
        showToast('Website Content Saved!', 'All words, headlines & images updated live on the public pages.', 'success');
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout
      title="Website CMS & Content Manager"
      subtitle="Full control to edit all words, headlines, images, and contact information across non-login pages"
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-gold border-t-transparent" />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-5xl">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
            {[
              { id: 'hero', label: 'Hero & Banner', icon: Sparkles },
              { id: 'contact', label: 'Contact & Footer', icon: Phone },
              { id: 'platform', label: 'Platform Fee', icon: Percent },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === id
                    ? 'bg-gradient-to-r from-accent-gold to-amber-500 text-white shadow-md'
                    : 'bg-white text-text-secondary hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* TAB 1: HERO & BANNER */}
          {activeTab === 'hero' && (
            <GlassCard goldBorder className="p-6 rounded-3xl space-y-5 animate-fade-in">
              <h3 className="font-sora font-bold text-base text-text-primary flex items-center gap-2 border-b border-gray-100 pb-3">
                <Sparkles className="w-5 h-5 text-accent-gold" /> Homepage Hero Words & Graphic Banner
              </h3>

              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1">Announcement Badge Text</label>
                <input
                  type="text"
                  name="announcementText"
                  value={formData.announcementText}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-accent-gold font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1">Main Hero Headline</label>
                <input
                  type="text"
                  name="heroTitle"
                  value={formData.heroTitle}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-accent-gold font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1">Hero Subtitle / Description</label>
                <textarea
                  rows={3}
                  name="heroSubtitle"
                  value={formData.heroSubtitle}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-accent-gold"
                  required
                />
              </div>

              {/* Banner Image Upload */}
              <div className="pt-3 border-t border-gray-100">
                <label className="text-xs font-semibold text-text-primary block mb-2">
                  Hero Graphic Banner Image (Optional)
                </label>
                {formData.heroBannerImage && (
                  <div className="mb-3 relative rounded-2xl overflow-hidden max-h-48 border border-gray-200">
                    <img src={formData.heroBannerImage} alt="Banner" className="w-full h-48 object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, heroBannerImage: '' }))}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  disabled={uploadingBanner}
                  className="text-xs text-text-muted file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-accent-gold hover:file:bg-amber-100"
                />
              </div>
            </GlassCard>
          )}

          {/* TAB 2: CONTACT & FOOTER */}
          {activeTab === 'contact' && (
            <GlassCard className="p-6 rounded-3xl space-y-4 animate-fade-in">
              <h3 className="font-sora font-bold text-base text-text-primary flex items-center gap-2 border-b border-gray-100 pb-3">
                <Phone className="w-5 h-5 text-accent-blue" /> Contact Info & Footer Copy
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1">Helpline Phone Number</label>
                  <input
                    type="text"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-accent-gold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-text-primary block mb-1">Support Email Address</label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-accent-gold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1">Footer Copyright Text</label>
                <input
                  type="text"
                  name="footerCopyrightText"
                  value={formData.footerCopyrightText}
                  onChange={handleChange}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-accent-gold"
                />
              </div>
            </GlassCard>
          )}

          {/* TAB 3: PLATFORM FEE */}
          {activeTab === 'platform' && (
            <GlassCard className="p-6 rounded-3xl space-y-4 animate-fade-in">
              <h3 className="font-sora font-bold text-base text-text-primary flex items-center gap-2 border-b border-gray-100 pb-3">
                <Percent className="w-5 h-5 text-emerald-600" /> Platform Commission Fee
              </h3>

              <div>
                <label className="text-xs font-semibold text-text-primary block mb-1">
                  Platform Commission Fee (%)
                </label>
                <input
                  type="number"
                  name="platformFeePercentage"
                  value={formData.platformFeePercentage}
                  onChange={handleChange}
                  min="0"
                  max="50"
                  className="w-full sm:w-48 bg-white border border-gray-200 rounded-xl p-3 text-xs focus:outline-none focus:border-accent-gold font-bold"
                  required
                />
              </div>
            </GlassCard>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <PremiumButton type="submit" variant="gold" size="lg" icon={Save} loading={saving}>
              Save All Website Words & Details
            </PremiumButton>
          </div>
        </form>
      )}
    </DashboardLayout>
  );
};

export default AdminSettings;
