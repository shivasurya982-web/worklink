import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import WorkerCard from '../../components/common/WorkerCard';
import API from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Heart, Sparkles } from 'lucide-react';
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
        showToast('Node Purged', 'Professional removed from local dashboard.', 'info');
        setFavorites((prev) => prev.filter((fav) => fav.worker && fav.worker._id !== workerId));
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <DashboardLayout
      title="Pinned Modules"
      subtitle="Rapid access to frequently deployed service professionals"
    >
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent-bright border-t-transparent shadow-orange" />
        </div>
      ) : favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
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
        <div className="text-center py-32 bg-background-cardSecondary/40 rounded-[3rem] border-2 border-dashed border-border-primary/20">
           <div className="w-24 h-24 bg-background-dark rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/5 opacity-20">
              <Heart className="w-12 h-12 text-accent-bright" />
           </div>
           <h4 className="font-sora font-black text-2xl text-white mb-3">Registry Empty</h4>
           <p className="text-sm text-text-muted max-w-[320px] mx-auto leading-relaxed font-bold uppercase tracking-widest opacity-80 mb-10">Scan the market directory and pin professional nodes for rapid re-deployment.</p>
           <PremiumButton variant="gold" size="lg" onClick={() => navigate('/customer/search')}>OPEN DIRECTORY</PremiumButton>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CustomerFavorites;
