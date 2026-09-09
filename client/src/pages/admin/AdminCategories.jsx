import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import FloatingInput from '../../components/common/FloatingInput';
import PremiumButton from '../../components/common/PremiumButton';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { Plus, Trash2, Edit, Grid } from 'lucide-react';
import API from '../../services/api';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const { showToast } = useNotification();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await API.get('/categories');
      if (res.success) {
        setCategories(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', 'Service category');
    formData.append('icon', 'Grid');

    try {
      let res;
      if (editingCategory) {
        res = await API.put(`/categories/${editingCategory._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Sync Successful', 'Service domain updated.', 'success');
      } else {
        res = await API.post('/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Node Created', 'New service segment initialized.', 'success');
      }

      if (res.success) {
        setModalOpen(false);
        fetchCategories();
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('PERMANENTLY PURGE this category? This will affect node filtering.')) return;

    try {
      const res = await API.delete(`/categories/${catId}`);
      if (res.success) {
        showToast('Data Purged', 'Domain segment removed.', 'info');
        setCategories((prev) => prev.filter((c) => c._id !== catId));
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <DashboardLayout
      title="Domain Architecture"
      subtitle="Ecosystem segmentation and service node categorization"
    >
      <div className="space-y-10">
        <div className="flex justify-end">
          <PremiumButton
            variant="gold"
            size="md"
            icon={Plus}
            onClick={handleOpenAddModal}
            className="px-8 shadow-orange"
          >
            INITIALIZE SEGMENT
          </PremiumButton>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent-bright border-t-transparent shadow-orange" />
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <GlassCard key={cat._id} goldBorder className="flex flex-col justify-between h-full p-6 !bg-background-card border-border-primary/40 shadow-2xl group">
                <div className="flex items-center justify-between mb-8">
                  <div className="min-w-0">
                    <h4 className="font-sora font-black text-base text-white truncate pr-2 uppercase tracking-tight group-hover:text-accent-bright transition-colors">
                      {cat.name}
                    </h4>
                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest mt-1">Operational Module</p>
                  </div>
                  <div className="bg-background-widget px-3 py-1 rounded-lg border border-accent-orange/20 shadow-xl shrink-0">
                    <span className="text-[10px] font-black text-accent-bright uppercase tracking-tighter">
                      {cat.workerCount || 0} NODES
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/5">
                  <button
                    onClick={() => handleOpenEditModal(cat)}
                    className="p-3 rounded-xl bg-background-widget hover:bg-accent-orange/20 hover:text-accent-bright text-text-muted transition-all border border-white/5"
                    title="Sync Config"
                  >
                    <Edit className="w-4.5 h-4.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat._id)}
                    className="p-3 rounded-xl bg-red-950/20 hover:bg-red-900/40 text-red-400 transition-all border border-red-500/20"
                    title="Purge Domain"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-background-cardSecondary/40 rounded-[3rem] border-2 border-dashed border-border-primary/20">
             <div className="w-20 h-20 bg-background-dark rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/5">
                <Grid className="w-10 h-10 text-accent-bright opacity-20" />
             </div>
             <p className="text-xs font-black text-text-muted uppercase tracking-[0.4em]">NO DOMAIN SEGMENTS INITIALIZED.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingCategory ? 'DOMAIN RECONFIGURATION' : 'SEGMENT INITIALIZATION'}
        >
          <form onSubmit={handleSubmit} className="space-y-10 pt-6">
            <div className="bg-background-dark/50 p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
               <FloatingInput
                id="name"
                label="SEGMENT IDENTIFIER"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="!bg-background-cardSecondary border-border-primary/30"
              />
              <p className="text-[10px] font-bold text-text-muted mt-4 uppercase tracking-[0.2em] px-2 italic">DETERMINE THE PRIMARY LABEL FOR THIS SERVICE CATEGORY MODULE.</p>
            </div>

            <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={formLoading} className="py-5 text-base shadow-orange font-black">
              {editingCategory ? 'SYNC PARAMETERS' : 'EXECUTE INITIALIZATION'}
            </PremiumButton>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AdminCategories;
