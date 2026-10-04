import { getImageUrl, handleImageError, DEFAULT_COVER } from '../../utils/imageUtils';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import PremiumButton from '../../components/common/PremiumButton';
import FloatingInput from '../../components/common/FloatingInput';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { Upload, X, Briefcase, Plus, Image as ImageIcon } from 'lucide-react';
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
      <div className="space-y-8">
        {/* Action Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white/80 backdrop-blur-2xl p-6 sm:p-8 rounded-[2rem] border border-white/60 shadow-xs gap-4">
          <div className="text-center sm:text-left">
            <h3 className="font-sora font-black text-lg text-text-primary uppercase tracking-tight">Portfolio</h3>
            <p className="text-[10px] text-text-muted font-bold mt-0.5 uppercase tracking-wider">You have {portfolio.length} work samples</p>
          </div>
          <PremiumButton
            variant="gold"
            size="lg"
            icon={Plus}
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto px-8"
          >
            Add New Photo
          </PremiumButton>
        </div>

        {/* Portfolio gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.length > 0 ? (
            portfolio.map((item, index) => (
              <GlassCard key={item._id || index} className="p-0 overflow-hidden !bg-white/80 border border-white/60 flex flex-col group h-full shadow-xs relative">
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={getImageUrl(item.url, DEFAULT_COVER)}
                    alt={item.title || 'Work sample'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => handleImageError(e, DEFAULT_COVER)}
                  />

                  <button
                    onClick={() => handleRemoveItem(item)}
                    className="absolute top-3 right-3 p-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all opacity-0 group-hover:opacity-100 border border-red-200 shadow-xs"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-5 flex flex-col flex-1 relative">
                  <h4 className="font-sora font-black text-sm text-text-primary mb-1 uppercase tracking-tight group-hover:text-accent-main transition-colors">
                    {item.title || `Work Sample #${index + 1}`}
                  </h4>
                  <p className="text-[11px] text-text-secondary leading-relaxed flex-1 font-semibold italic mb-4">
                    {item.description ? `"${item.description}"` : 'No description added.'}
                  </p>
                  <div className="mt-auto pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="flex items-center gap-1.5 text-[9px] font-black text-accent-main uppercase tracking-wider">
                      <Briefcase className="w-3 h-3" /> VERIFIED WORK
                    </span>
                    {item.createdAt && <span className="text-[9px] font-bold text-text-muted">{new Date(item.createdAt).toLocaleDateString()}</span>}
                  </div>
                </div>
              </GlassCard>
            ))
          ) : (
            <div className="col-span-full">
              <div className="text-center py-20 bg-white/60 rounded-[2.5rem] border-2 border-dashed border-gray-200 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-orange-50/80 text-accent-main flex items-center justify-center mx-auto mb-4 border border-orange-100/80">
                   <ImageIcon className="w-8 h-8" />
                </div>
                <h3 className="font-sora font-black text-xl text-text-primary uppercase tracking-tight">Empty Portfolio</h3>
                <p className="max-w-xs mx-auto text-xs font-semibold text-text-muted uppercase tracking-wider mt-1 leading-relaxed">Add photos of your work to help customers trust you more!</p>
                <PremiumButton
                  variant="black"
                  size="lg"
                  className="mt-6 px-10"
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
        <form onSubmit={handleUploadItem} className="space-y-6 pt-2 pb-2">
          {/* File Picker */}
          <div className="relative group">
            {previewUrl ? (
              <div className="relative w-full h-48 rounded-2xl overflow-hidden border-2 border-accent-main shadow-xs">
                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                  className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-lg hover:bg-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center cursor-pointer py-10 bg-white/80 border-2 border-dashed border-gray-200 rounded-2xl hover:border-accent-main transition-all group shadow-xs">
                <div className="w-14 h-14 bg-orange-50/80 rounded-2xl border border-orange-100/80 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6 text-accent-main" />
                </div>
                <span className="text-xs font-black text-text-primary uppercase tracking-wider">Pick a Photo</span>
                <span className="text-[10px] text-text-muted font-bold mt-0.5 uppercase tracking-wider">JPG / PNG / WEBP</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
              </label>
            )}
          </div>

          <div className="space-y-4">
            <FloatingInput
              id="title"
              label="Job Title (e.g. House Painting)"
              icon={Plus}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />

            <div className="space-y-2">
              <label className="text-[10px] font-black text-accent-main uppercase tracking-widest ml-1">Job Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Briefly explain what you did in this job..."
                className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-xs font-bold text-text-primary focus:outline-none focus:border-accent-main min-h-[100px] shadow-xs"
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowAddModal(false); resetForm(); }}
              className="flex-1 py-3.5 text-xs font-bold text-text-muted uppercase tracking-wider bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <PremiumButton
              type="submit"
              variant="gold"
              className="flex-[2] py-3.5 font-black"
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
