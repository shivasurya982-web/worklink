import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, MapPin, FileText, Sparkles, LayoutGrid } from 'lucide-react';
import API from '../../services/api';

const BroadcastBookingModal = ({ onClose, onBroadcast }) => {
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
    fetchCats();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.category || !form.city || !form.scheduledDate || !form.scheduledTime) {
      setError('Please fill in all required fields.');
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
      setError(err.message || 'Failed to broadcast request. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="glass-card bg-white/98 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-accent-gold/20 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6 border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-sora font-bold text-lg text-text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-gold" /> Broadcast Job Request
            </h3>
            <p className="text-xs text-text-muted">Notify all available workers in your area instantly</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-text-muted hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* Category Selection */}
          <div>
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
              <LayoutGrid className="w-3.5 h-3.5 inline mr-1" /> Service Category *
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-text-primary"
              disabled={fetchingCats}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Area / City */}
          <div>
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
              <MapPin className="w-3.5 h-3.5 inline mr-1" /> Service City / Area *
            </label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="e.g. Mumbai, Bandra, etc."
              required
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-text-primary"
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />Date *
              </label>
              <input
                type="date"
                name="scheduledDate"
                value={form.scheduledDate}
                onChange={handleChange}
                min={today}
                required
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-text-primary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
                <Clock className="w-3.5 h-3.5 inline mr-1" />Time *
              </label>
              <input
                type="time"
                name="scheduledTime"
                value={form.scheduledTime}
                onChange={handleChange}
                required
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-text-primary"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
              <FileText className="w-3.5 h-3.5 inline mr-1" />What work do you need?
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your issue or service required..."
              rows={3}
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-text-primary resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-ai py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 mt-2 shadow-lg"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {loading ? 'Broadcasting...' : 'Broadcast Job to All Local Workers'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BroadcastBookingModal;
