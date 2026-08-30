import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import FloatingInput from '../../components/common/FloatingInput';
import PremiumButton from '../../components/common/PremiumButton';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { Plus, Trash2, Edit } from 'lucide-react';
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
    // Keep internal defaults to prevent backend errors if they are required in schema
    formData.append('description', 'Service category');
    formData.append('icon', 'Wrench');

    try {
      let res;
      if (editingCategory) {
        res = await API.put(`/categories/${editingCategory._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Category Updated', 'Service category updated successfully.', 'success');
      } else {
        res = await API.post('/categories', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        showToast('Category Added', 'New service category created successfully.', 'success');
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
    if (!window.confirm('Are you sure you want to delete this category? Workers assigned to it may need categories updated.')) return;

    try {
      const res = await API.delete(`/categories/${catId}`);
      if (res.success) {
        showToast('Category Deleted', 'Service category deleted successfully.', 'info');
        setCategories((prev) => prev.filter((c) => c._id !== catId));
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <DashboardLayout
      title="Manage Categories"
      subtitle="Configure, add, edit, or delete platform service categories"
    >
      <div className="space-y-6">
        <div className="flex justify-end">
          <PremiumButton
            variant="gold"
            size="sm"
            icon={Plus}
            onClick={handleOpenAddModal}
          >
            Add New Category
          </PremiumButton>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-gold border-t-transparent" />
          </div>
        ) : categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <GlassCard key={cat._id} goldBorder className="flex flex-col justify-between h-full p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-sora font-bold text-sm text-text-primary truncate pr-2">
                    {cat.name}
                  </h4>
                  <span className="text-[9px] font-bold text-accent-gold bg-amber-50 px-2 py-0.5 rounded-full shrink-0">
                    {cat.workerCount || 0} Pros
                  </span>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleOpenEditModal(cat)}
                    className="p-2 rounded-xl bg-gray-50 hover:bg-amber-50 hover:text-accent-gold text-text-secondary transition-colors"
                    title="Edit Category"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat._id)}
                    className="p-2 rounded-xl bg-gray-50 hover:bg-red-50 hover:text-accent-red text-text-secondary transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard className="text-center py-12 text-xs text-text-muted">
            No service categories defined on the platform yet.
          </GlassCard>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingCategory ? 'Edit Category' : 'Add New Category'}
        >
          <form onSubmit={handleSubmit} className="space-y-6 pt-2">
            <FloatingInput
              id="name"
              label="Category Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <PremiumButton type="submit" variant="gold" size="lg" fullWidth loading={formLoading}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </PremiumButton>
          </form>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AdminCategories;
