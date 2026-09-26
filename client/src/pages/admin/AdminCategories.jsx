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
        res = await API.put(`/categories/${editingCategory._id}`, formData);
        showToast('Success', 'Category updated successfully.', 'success');
      } else {
        res = await API.post('/categories', formData);
        showToast('Success', 'New category created.', 'success');
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
    if (!window.confirm('Are you sure you want to DELETE this category?')) return;

    try {
      const res = await API.delete(`/categories/${catId}`);
      if (res.success) {
        showToast('Deleted', 'Category removed.', 'info');
        setCategories((prev) => prev.filter((c) => c._id !== catId));
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <DashboardLayout
      title="Service Categories"
      subtitle="Manage the types of services available on the website"
    >
      <div className="space-y-8">
        <div className="flex justify-end">
          <PremiumButton
            variant="gold"
            size="md"
            icon={Plus}
            onClick={handleOpenAddModal}
            className="px-6 font-black"
          >
            ADD NEW CATEGORY
          </PremiumButton>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-main border-t-transparent" />
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <GlassCard key={cat._id} goldBorder className="flex flex-col justify-between h-full p-6 !bg-white/80 border border-white/60 shadow-xs group">
                <div className="flex items-center justify-between mb-6">
                  <div className="min-w-0">
                    <h4 className="font-sora font-black text-base text-text-primary truncate pr-2 uppercase tracking-tight group-hover:text-accent-main transition-colors">
                      {cat.name}
                    </h4>
                    <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Service Type</p>
                  </div>
                  <div className="bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 shrink-0">
                    <span className="text-[10px] font-black text-accent-main uppercase tracking-tight">
                      {cat.workerCount || 0} Workers
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenEditModal(cat)}
                    className="p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-accent-main transition-all border border-blue-100 cursor-pointer"
                    title="Edit Category"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat._id)}
                    className="p-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all border border-red-200 cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/60 rounded-[2.5rem] border-2 border-dashed border-gray-200">
             <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <Grid className="w-8 h-8 text-accent-main" />
             </div>
             <p className="text-xs font-bold text-text-muted uppercase tracking-wider">NO CATEGORIES FOUND.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingCategory ? 'EDIT CATEGORY' : 'NEW CATEGORY'}
        >
          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
               <FloatingInput
                id="name"
                label="CATEGORY NAME"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <p className="text-[10px] font-bold text-text-muted mt-3 uppercase tracking-wider px-1 italic">Enter the main name for this category.</p>
            </div>

            <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={formLoading} className="py-4 font-black">
              {editingCategory ? 'SAVE CHANGES' : 'CREATE CATEGORY'}
            </PremiumButton>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AdminCategories;
