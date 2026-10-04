import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import WorkerCard from '../../components/common/WorkerCard';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import PremiumButton from '../../components/common/PremiumButton';

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
        showToast('Favorite Removed', 'Worker removed from your favorites list.', 'info');
        setFavorites((prev) => prev.filter((fav) => fav.worker && fav.worker._id !== workerId));
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <DashboardLayout
      title="Saved Workers"
      subtitle="Rapid access to your favorite service professionals"
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-main border-t-transparent" />
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((fav) => (
            <WorkerCard
              key={fav._id}
              worker={fav.worker}
              isFavorite={true}
              onToggleFavorite={() => handleToggleFavorite(fav.worker._id)}
              onBook={(w) => navigate(`/workers/${w._id}?book=true`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/60 rounded-[2.5rem] border-2 border-dashed border-gray-200">
           <div className="w-16 h-16 bg-orange-50/80 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-100/80">
              <Heart className="w-8 h-8 text-accent-main" />
           </div>
           <h4 className="font-sora font-black text-xl text-text-primary mb-2 uppercase tracking-tight">No Favorites Yet</h4>
           <p className="text-xs text-text-muted max-w-[280px] mx-auto leading-relaxed font-semibold uppercase tracking-wider mb-6">Explore workers and tap the heart icon to save them for later.</p>
           <PremiumButton variant="black" size="lg" onClick={() => navigate('/customer/search')}>EXPLORE WORKERS</PremiumButton>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CustomerFavorites;
