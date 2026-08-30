import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, FileText, DollarSign, Sparkles } from 'lucide-react';
import FloatingInput from './FloatingInput';

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

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="glass-card bg-white/98 rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-accent-gold/20 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <img
              src={
                worker.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=D4AF37&color=fff`
              }
              alt={worker.name}
              className="w-12 h-12 rounded-2xl object-cover border border-accent-gold/30"
            />
            <div>
              <h3 className="font-sora font-bold text-text-primary">{worker.name}</h3>
              <p className="text-xs text-text-muted">{worker.category?.name || worker.category}</p>
              <p className="text-xs font-semibold text-accent-gold">₹{hourlyRate}/hr</p>
            </div>
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

          {/* Address */}
          <div>
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
              <MapPin className="w-3.5 h-3.5 inline mr-1" />Service Address *
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter your full address"
              required
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-text-primary placeholder-text-muted"
            />
          </div>

          {/* Estimated Hours */}
          <div>
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
              <Clock className="w-3.5 h-3.5 inline mr-1" />Estimated Hours
            </label>
            <select
              name="estimatedHours"
              value={form.estimatedHours}
              onChange={handleChange}
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-text-primary"
            >
              {[1, 2, 3, 4, 5, 6, 8].map((h) => (
                <option key={h} value={h}>{h} hour{h > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-text-secondary mb-1.5 block">
              <FileText className="w-3.5 h-3.5 inline mr-1" />Description / Issues
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the work you need done..."
              rows={3}
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-accent-gold/30 focus:border-accent-gold text-text-primary placeholder-text-muted resize-none"
            />
          </div>

          {/* Estimated Cost */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-accent-gold/20 flex items-center justify-between">
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <DollarSign className="w-4 h-4 text-accent-gold" />
              <span className="font-medium">Estimated Total</span>
            </div>
            <span className="font-sora font-bold text-lg text-accent-gold">₹{estimatedCost.toLocaleString()}</span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-text-primary/30 border-t-text-primary rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
