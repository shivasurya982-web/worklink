import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import WorkerCard from '../../components/common/WorkerCard';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const CustomerFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const res = await API.get('/customers/favorites');
      if (res.success) {
        const list = (res.data || []).filter((fav) => fav && fav.worker);
        setFavorites(list);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (workerId) => {
    if (!workerId) return;
    try {
      const res = await API.delete(`/customers/favorites/${workerId}`);
      if (res.success) {
        showToast('Removed from Favorites', 'Worker removed from your favorites list.', 'info');
        setFavorites((prev) => prev.filter((fav) => fav.worker && fav.worker._id !== workerId));
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <DashboardLayout
      title="Saved Favorites"
      subtitle="Quickly access and book your favorite local service professionals"
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-gold border-t-transparent" />
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <WorkerCard
              key={fav._id}
              worker={fav.worker}
              isFavorite={true}
              onToggleFavorite={() => handleToggleFavorite(fav.worker._id)}
              onBook={(w) => navigate(`/workers/${w._id}`)}
            />
          ))}
        </div>
      ) : (
        <GlassCard className="text-center py-12 text-xs text-text-muted">
          Your favorites list is empty. Browse worker profiles and click the heart icon to save them here!
        </GlassCard>
      )}
    </DashboardLayout>
  );
};

export default CustomerFavorites;
