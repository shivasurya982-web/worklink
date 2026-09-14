import { getImageUrl, handleImageError, DEFAULT_AVATAR, DEFAULT_COVER } from '../../utils/imageUtils';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import PremiumButton from '../../components/common/PremiumButton';
import FloatingInput from '../../components/common/FloatingInput';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { Upload, X, Briefcase, Plus, Type, FileText, Sparkles, Image as ImageIcon } from 'lucide-react';
import API from '../../services/api';

const WorkerPortfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const { showToast } = useNotification();

  // Form state for new portfolio item
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const res = await API.get('/workers/profile');
      if (res.success && res.data.worker) {
        setPortfolio(res.data.worker.portfolio || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadItem = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Error', 'Please select an image first', 'error');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('images', selectedFile);
    formData.append('title', newTitle);
    formData.append('description', newDesc);

    try {
      const res = await API.put('/workers/portfolio', formData);

      if (res.success) {
        showToast('Photo Added', 'New work sample has been uploaded.', 'success');
        setPortfolio(res.data.portfolio || []);
        resetForm();
        setShowAddModal(false);
      }
    } catch (err) {
      showToast('Upload Error', err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewDesc('');
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleRemoveItem = async (itemToRemove) => {
    if (!window.confirm('Delete this work sample from your portfolio?')) return;

    const updated = portfolio.filter((item) => {
       if (item._id && itemToRemove._id) return item._id !== itemToRemove._id;
       return item.url !== itemToRemove.url;
    });

    try {
      const res = await API.put('/workers/profile', { portfolio: updated });
      if (res.success) {
        setPortfolio(updated);
        showToast('Deleted', 'Work sample removed.', 'info');
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <DashboardLayout
      title="My Work Photos"
      subtitle="Show customers what you can do by adding photos of your past jobs"
    >
      <div className="space-y-10">
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-background-cardSecondary p-8 rounded-[2.5rem] border border-white/5 shadow-2xl gap-6">
          <div className="text-center sm:text-left">
            <h3 className="font-sora font-black text-xl text-white uppercase tracking-tighter">Portfolio</h3>
            <p className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-widest opacity-80">You have {portfolio.length} work samples</p>
          </div>
          <PremiumButton
            variant="gold"
            size="lg"
            icon={Plus}
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto px-10 shadow-orange"
          >
            Add New Photo
          </PremiumButton>
        </div>

        {/* Portfolio gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolio.length > 0 ? (
            portfolio.map((item, index) => (
              <GlassCard key={item._id || index} className="p-0 overflow-hidden !bg-background-card border-border-primary/40 flex flex-col group h-full shadow-2xl relative">
                <div className="relative h-56 overflow-hidden bg-background-widget">
                  <img
                    src={getImageUrl(item.url, DEFAULT_COVER)}
                    alt={item.title || 'Work sample'}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => handleImageError(e, DEFAULT_COVER)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <button
                    onClick={() => handleRemoveItem(item)}
                    className="absolute top-4 right-4 p-2.5 bg-red-950/40 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all backdrop-blur-md opacity-0 group-hover:opacity-100 active:scale-95 border border-red-500/30 shadow-2xl z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 flex flex-col flex-1 relative">
                  <h4 className="font-sora font-black text-base text-white mb-2 uppercase tracking-tight group-hover:text-accent-bright transition-colors">
                    {item.title || `Work Sample #${index + 1}`}
                  </h4>
                  <p className="text-[11px] text-text-secondary leading-relaxed flex-1 font-bold italic opacity-90 mb-6">
                    {item.description ? `"${item.description}"` : 'No description added.'}
                  </p>
                  <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                    <span className="flex items-center gap-2 text-[9px] font-black text-accent-light uppercase tracking-widest">
                      <Briefcase className="w-3 h-3" /> VERIFIED WORK
                    </span>
                    {item.createdAt && <span className="text-[9px] font-bold text-text-muted">{new Date(item.createdAt).toLocaleDateString()}</span>}
                  </div>
                </div>
              </GlassCard>
            ))
          ) : (
            <div className="col-span-full">
              <div className="text-center py-32 bg-background-cardSecondary/40 rounded-[4rem] border-2 border-dashed border-border-primary/20 shadow-inner group">
                <div className="w-20 h-20 rounded-[1.5rem] bg-background-dark text-accent-bright flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/5 group-hover:scale-110 transition-all">
                   <ImageIcon className="w-10 h-10 opacity-40" />
                </div>
                <h3 className="font-sora font-black text-2xl text-white uppercase tracking-tighter">Empty Portfolio</h3>
                <p className="max-w-xs mx-auto text-xs font-bold text-text-muted uppercase tracking-widest mt-3 leading-relaxed opacity-70">Add photos of your work to help customers trust you more!</p>
                <PremiumButton
                  variant="gold"
                  size="lg"
                  className="mt-10 px-12 shadow-orange"
                  onClick={() => setShowAddModal(true)}
                >
                  Add Your First Photo
                </PremiumButton>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        title="ADD WORK PHOTO"
      >
        <form onSubmit={handleUploadItem} className="space-y-8 pt-4 pb-2">
          {/* File Picker */}
          <div className="relative group">
            {previewUrl ? (
              <div className="relative w-full h-56 rounded-3xl overflow-hidden border-2 border-accent-main shadow-2xl">
                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                  className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-xl hover:bg-accent-red border border-white/10"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center cursor-pointer py-12 bg-background-dark/50 border-2 border-dashed border-border-primary/40 rounded-3xl hover:border-accent-orange transition-all group shadow-inner">
                <div className="w-16 h-16 bg-background-cardSecondary rounded-2xl shadow-2xl border border-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7 text-accent-bright" />
                </div>
                <span className="text-xs font-black text-white uppercase tracking-widest">Pick a Photo</span>
                <span className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-tighter">JPG / PNG / WEBP</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
              </label>
            )}
          </div>

          <div className="space-y-6">
            <FloatingInput
              id="title"
              label="Job Title (e.g. House Painting)"
              icon={Plus}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
              className="!bg-background-dark/50 border-border-primary/20"
            />

            <div className="space-y-3">
              <label className="text-[10px] font-black text-accent-light uppercase tracking-widest ml-2">Job Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Briefly explain what you did in this job..."
                className="w-full bg-background-dark/50 border-2 border-border-primary/30 rounded-3xl p-6 text-sm font-bold text-white focus:outline-none focus:border-accent-main min-h-[120px] shadow-inner uppercase tracking-wider"
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={() => { setShowAddModal(false); resetForm(); }}
              className="flex-1 py-4 text-xs font-black text-text-muted uppercase tracking-widest bg-background-widget/40 rounded-2xl hover:bg-background-widget transition-colors border border-white/5"
            >
              Cancel
            </button>
            <PremiumButton
              type="submit"
              variant="gold"
              className="flex-[2] py-4 shadow-orange"
              loading={uploading}
            >
              UPLOAD PHOTO
            </PremiumButton>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default WorkerPortfolio;
