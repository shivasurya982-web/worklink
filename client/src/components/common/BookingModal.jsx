import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, FileText, DollarSign, Sparkles } from 'lucide-react';
import { getImageUrl, handleImageError, DEFAULT_AVATAR } from '../../utils/imageUtils';

const BookingModal = ({ worker, onClose, onBook }) => {
  const [form, setForm] = useState({
    scheduledDate: '',
    scheduledTime: '',
    address: '',
    description: '',
    estimatedHours: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.scheduledDate || !form.scheduledTime || !form.address) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await onBook({
        workerId: worker._id,
        ...form,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create booking. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const hourlyRate = worker.hourlyRate || 500;
  const estimatedCost = hourlyRate * form.estimatedHours;

  const today = new Date().toISOString().split('T')[0];
  const fallbackAvatar = DEFAULT_AVATAR(worker.name);
  const avatarUrl = getImageUrl(worker.avatar, fallbackAvatar);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-md">
      <div
        className="glass-card bg-white/90 backdrop-blur-xl rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-white/60 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <img
              src={avatarUrl}
              alt={worker.name}
              onError={(e) => handleImageError(e, fallbackAvatar)}
              className="w-12 h-12 rounded-2xl object-cover border border-accent-main"
            />
            <div>
              <h3 className="font-sora font-black text-text-primary text-base">{worker.name}</h3>
              <p className="text-xs text-text-muted font-semibold">{worker.category?.name || worker.category}</p>
              <p className="text-xs font-bold text-accent-main mt-0.5">₹{hourlyRate}/hr</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-text-muted hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-bold">
              {error}
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-text-secondary mb-1.5 block">
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-accent-main" />Date *
              </label>
              <input
                type="date"
                name="scheduledDate"
                value={form.scheduledDate}
                onChange={handleChange}
                min={today}
                required
                className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:border-accent-main text-text-primary"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-text-secondary mb-1.5 block">
                <Clock className="w-3.5 h-3.5 inline mr-1 text-accent-main" />Time *
              </label>
              <input
                type="time"
                name="scheduledTime"
                value={form.scheduledTime}
                onChange={handleChange}
                required
                className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:border-accent-main text-text-primary"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-bold text-text-secondary mb-1.5 block">
              <MapPin className="w-3.5 h-3.5 inline mr-1 text-accent-main" />Service Address *
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter your full address"
              required
              className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:border-accent-main text-text-primary placeholder:text-text-muted"
            />
          </div>

          {/* Estimated Hours */}
          <div>
            <label className="text-xs font-bold text-text-secondary mb-1.5 block">
              <Clock className="w-3.5 h-3.5 inline mr-1 text-accent-main" />Estimated Hours
            </label>
            <select
              name="estimatedHours"
              value={form.estimatedHours}
              onChange={handleChange}
              className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:border-accent-main text-text-primary"
            >
              {[1, 2, 3, 4, 5, 6, 8].map((h) => (
                <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-text-secondary mb-1.5 block">
              <FileText className="w-3.5 h-3.5 inline mr-1 text-accent-main" />Description / Issues
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the work you need done..."
              rows={3}
              className="w-full text-xs font-semibold px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:border-accent-main text-text-primary placeholder:text-text-muted resize-none"
            />
          </div>

          {/* Estimated Cost */}
          <div className="p-4 rounded-2xl bg-orange-50/80 border border-orange-100/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <DollarSign className="w-4 h-4 text-accent-main" />
              <span className="font-bold uppercase tracking-wider text-xs">Estimated Total</span>
            </div>
            <span className="font-sora font-black text-lg text-accent-main">₹{estimatedCost.toLocaleString()}</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-gradient-to-b from-[#2C2C2E] to-[#1C1C1E] hover:from-[#3A3A3C] hover:to-[#2C2C2E] text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-accent-main" />
            )}
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
