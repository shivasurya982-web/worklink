import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, FileText, Sparkles, LayoutGrid } from 'lucide-react';
import API from '../../services/api';
import PremiumButton from './PremiumButton';
import Modal from './Modal';

const BroadcastBookingModal = ({ isOpen, onClose, onBroadcast }) => {
  const [form, setForm] = useState({
    category: '',
    city: '',
    scheduledDate: '',
    scheduledTime: '',
    description: '',
    estimatedCost: 500,
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCats, setFetchingCats] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCats();
    }
  }, [isOpen]);

  const fetchCats = async () => {
    try {
      const res = await API.get('/categories');
      if (res.success) setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingCats(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.category || !form.city || !form.scheduledDate || !form.scheduledTime) {
      setError('Required parameters missing.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        category: form.category,
        broadcastArea: { city: form.city },
        scheduledDate: form.scheduledDate,
        scheduledTime: form.scheduledTime,
        description: form.description,
        estimatedCost: form.estimatedCost,
      };

      const res = await API.post('/bookings/broadcast', payload);
      if (res.success) {
        onBroadcast(res.data.booking);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Signal broadcast failed.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Signal Broadcast"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 relative z-10 pb-2">
        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] -mt-4 mb-6 opacity-80">Notify all available market nodes instantly</p>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-[10px] text-red-400 font-black text-center uppercase tracking-widest animate-shake">
            {error}
          </div>
        )}

        <div className="space-y-5 bg-background-dark/30 p-5 sm:p-6 rounded-3xl border border-white/5 shadow-inner">
          {/* Category */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-accent-light uppercase tracking-widest ml-1">
              SERVICE DOMAIN SEGMENT
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full bg-background-card border border-border-primary/30 rounded-xl p-3 text-xs font-black text-white focus:outline-none focus:border-accent-main shadow-2xl uppercase tracking-widest"
              disabled={fetchingCats}
            >
              <option value="">SELECT DOMAIN</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id} className="bg-background-card">{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Area */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-accent-light uppercase tracking-widest ml-1">
              TARGET GEO ZONE
            </label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="E.G. MUMBAI, DELHI, ETC."
              required
              className="w-full bg-background-card border border-border-primary/30 rounded-xl p-3 text-xs font-black text-white focus:outline-none focus:border-accent-main shadow-2xl uppercase tracking-widest placeholder:text-text-muted"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-accent-light uppercase tracking-widest ml-1">START DATE</label>
              <input
                type="date"
                name="scheduledDate"
                value={form.scheduledDate}
                onChange={handleChange}
                min={today}
                required
                className="w-full bg-background-card border border-border-primary/30 rounded-xl p-3 text-[10px] font-black text-white focus:outline-none focus:border-accent-main shadow-2xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-accent-light uppercase tracking-widest ml-1">TIME WINDOW</label>
              <input
                type="time"
                name="scheduledTime"
                value={form.scheduledTime}
                onChange={handleChange}
                required
                className="w-full bg-background-card border border-border-primary/30 rounded-xl p-3 text-[10px] font-black text-white focus:outline-none focus:border-accent-main shadow-2xl"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-accent-light uppercase tracking-widest ml-1">OPERATIONAL REQUIREMENTS</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="DESCRIBE SERVICE PARAMETERS..."
              rows={3}
              className="w-full bg-background-card border border-border-primary/30 rounded-2xl p-4 text-xs font-bold focus:outline-none focus:border-accent-main text-white shadow-2xl resize-none uppercase tracking-wider"
            />
          </div>
        </div>

        <PremiumButton
          type="submit"
          disabled={loading}
          variant="gold"
          size="lg"
          fullWidth
          className="py-4 text-sm font-black shadow-orange"
        >
          {loading ? 'EXECUTING BROADCAST...' : 'EXECUTE GLOBAL BROADCAST'}
        </PremiumButton>
      </form>
    </Modal>
  );
};

export default BroadcastBookingModal;
