import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import PremiumButton from '../../components/common/PremiumButton';
import FloatingInput from '../../components/common/FloatingInput';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { Upload, X, Briefcase, Plus, Type, FileText } from 'lucide-react';
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
      const res = await API.put('/workers/portfolio', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.success) {
        showToast('Portfolio Updated', 'Work sample added successfully.', 'success');
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
    if (!window.confirm('Remove this work sample from your portfolio?')) return;

    // Use specific item comparison
    const updated = portfolio.filter((item) => {
       if (item._id && itemToRemove._id) return item._id !== itemToRemove._id;
       return item.url !== itemToRemove.url;
    });

    try {
      // Use the profile update endpoint to sync the array
      const res = await API.put('/workers/profile', { portfolio: updated });
      if (res.success) {
        setPortfolio(updated);
        showToast('Item Removed', 'Sample removed permanently.', 'info');
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <DashboardLayout
      title="Work Portfolio"
      subtitle="Showcase your best projects and completed jobs with descriptions to build trust"
    >
      <div className="space-y-8">
        {/* Action Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div>
            <h3 className="font-sora font-bold text-lg text-text-primary">My Work Samples</h3>
            <p className="text-xs text-text-muted mt-0.5">Manage your service showcase</p>
          </div>
          <PremiumButton
            variant="gold"
            size="md"
            icon={Plus}
            onClick={() => setShowAddModal(true)}
          >
            Add New Sample
          </PremiumButton>
        </div>

        {/* Portfolio gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolio.length > 0 ? (
            portfolio.map((item, index) => (
              <GlassCard key={item._id || index} hover={false} className="p-0 overflow-hidden border border-gray-100 flex flex-col group h-full">
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img
                    src={item.url}
                    alt={item.title || 'Work sample'}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Work+Sample';
                    }}
                  />
                  <button
                    onClick={() => handleRemoveItem(item)}
                    className="absolute top-3 right-3 p-2 bg-black/40 text-white hover:bg-accent-red rounded-full transition-all backdrop-blur-sm opacity-0 group-hover:opacity-100 active:scale-90"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <h4 className="font-sora font-bold text-sm text-text-primary mb-1">
                    {item.title || `Work Sample #${index + 1}`}
                  </h4>
                  <p className="text-[11px] text-text-secondary leading-relaxed flex-1 italic">
                    {item.description ? `"${item.description}"` : 'No description provided.'}
                  </p>
                  <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center text-[9px] text-text-muted">
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-2.5 h-3" /> Professional Work
                    </span>
                    {item.createdAt && <span>{new Date(item.createdAt).toLocaleDateString()}</span>}
                  </div>
                </div>
              </GlassCard>
            ))
          ) : (
            <div className="col-span-full">
              <GlassCard className="text-center py-20 text-xs text-text-muted bg-gray-50/30">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-accent-gold flex items-center justify-center mx-auto mb-4">
                   <Briefcase className="w-8 h-8" />
                </div>
                <p className="max-w-xs mx-auto">Your portfolio is empty. Add high-quality images and descriptions of your work to attract 5x more customers!</p>
                <PremiumButton
                  variant="outline"
                  size="sm"
                  className="mt-6"
                  onClick={() => setShowAddModal(true)}
                >
                  Get Started - Add First Item
                </PremiumButton>
              </GlassCard>
            </div>
          )}
        </div>
      </div>

      {/* Add Item Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        title="Add Work Sample"
      >
        <form onSubmit={handleUploadItem} className="space-y-5 pt-2">
          {/* File Picker */}
          <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
            {previewUrl ? (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-accent-gold/20 shadow-sm">
                <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-accent-red"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center cursor-pointer py-4">
                <div className="w-12 h-12 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mb-2">
                  <Upload className="w-5 h-5 text-accent-gold" />
                </div>
                <span className="text-xs font-bold text-text-primary">Select Job Photo</span>
                <span className="text-[10px] text-text-muted mt-1">Tap to browse gallery</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
              </label>
            )}
          </div>

          <div className="space-y-4">
            <FloatingInput
              id="title"
              label="Work Title (e.g. Living Room Painting)"
              icon={Plus}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />

            <div className="relative">
              <label className="text-[10px] font-bold text-accent-gold uppercase tracking-wider ml-1 mb-1 block">Work Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Explain what you did in this job..."
                className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-xs focus:outline-none focus:border-accent-gold min-h-[100px] shadow-inner"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="flex-1 py-3 text-xs font-bold text-text-secondary bg-gray-100 rounded-2xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <PremiumButton
              type="submit"
              variant="gold"
              className="flex-[2]"
              loading={uploading}
            >
              Post to Portfolio
            </PremiumButton>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default WorkerPortfolio;
