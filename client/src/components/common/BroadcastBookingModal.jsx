import React, { useState, useEffect } from 'react';
import { Calendar, Clock, LayoutGrid, Maximize2 } from 'lucide-react';
import API from '../../services/api';
import PremiumButton from './PremiumButton';
import Modal from './Modal';

const BroadcastBookingModal = ({ isOpen, onClose, onBroadcast }) => {
  const [bookingType, setBookingType] = useState('small'); // 'small' or 'large'
  const [form, setForm] = useState({
    category: '',
    city: '',
    scheduledDate: '',
    endDate: '',
    scheduledTime: '10:00',
    workingHours: 'full-day',
    customHours: '',
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

    if (!form.category || !form.city || !form.scheduledDate) {
      setError('Please fill in all required fields.');
      return;
    }

    if (bookingType === 'large' && !form.endDate) {
      setError('Please select an end date for large works.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        category: form.category,
        bookingType,
        broadcastArea: { city: form.city },
        scheduledDate: form.scheduledDate,
        description: form.description,
        estimatedCost: form.estimatedCost,
      };

      if (bookingType === 'small') {
        payload.scheduledTime = form.scheduledTime;
      } else {
        payload.endDate = form.endDate;
        payload.scheduledTime = '00:00';
        payload.workingHours = form.workingHours === 'full-day' ? 'Full Day (8am - 8pm)' : form.customHours;
      }

      const res = await API.post('/bookings/broadcast', payload);
      if (res.success) {
        onBroadcast(res.data.booking);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to post request.');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Post a Job Request"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6 relative z-10 pb-2">

        {/* Booking Type Toggle */}
        <div className="flex bg-orange-50/80 p-1.5 rounded-full border border-orange-100/80 mb-6">
           <button
             type="button"
             onClick={() => setBookingType('small')}
             className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
               bookingType === 'small' ? 'bg-gradient-to-b from-[#2C2C2E] to-[#1C1C1E] text-white shadow-xs' : 'text-text-muted hover:text-text-primary'
             }`}
           >
             <LayoutGrid className="w-4 h-4" /> Small Work
           </button>
           <button
             type="button"
             onClick={() => setBookingType('large')}
             className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
               bookingType === 'large' ? 'bg-gradient-to-b from-[#2C2C2E] to-[#1C1C1E] text-white shadow-xs' : 'text-text-muted hover:text-text-primary'
             }`}
           >
             <Maximize2 className="w-4 h-4" /> Large Work
           </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-[10px] text-red-600 font-black text-center uppercase tracking-widest">
            {error}
          </div>
        )}

        <div className="space-y-5 bg-white/60 p-5 sm:p-6 rounded-3xl border border-white/60 shadow-sm">
          <div className="space-y-2">
            <label className="text-[9px] font-black text-accent-main uppercase tracking-widest ml-1">
              WHAT SERVICE DO YOU NEED?
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-black text-text-primary focus:outline-none focus:border-accent-main uppercase tracking-widest"
              disabled={fetchingCats}
            >
              <option value="">SELECT CATEGORY</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id} className="bg-white">{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-accent-main uppercase tracking-widest ml-1">
              YOUR CITY / AREA
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Tiruchendur"
                required
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-black text-text-primary focus:outline-none focus:border-accent-main uppercase tracking-widest placeholder:text-text-muted"
              />
              <input
                type="text"
                name="zip"
                value={form.zip || ''}
                onChange={handleChange}
                placeholder="Pin Code"
                required
                className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-black text-text-primary focus:outline-none focus:border-accent-main uppercase tracking-widest placeholder:text-text-muted"
              />
            </div>
          </div>

          {/* Date & Time based on type */}
          {bookingType === 'small' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-accent-main uppercase tracking-widest ml-1">DATE</label>
                <div className="relative group cursor-pointer" onClick={(e) => {
                  const input = e.currentTarget.querySelector('input');
                  if (input) input.showPicker();
                }}>
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-main z-10 pointer-events-none" />
                  <input
                    type="date"
                    name="scheduledDate"
                    value={form.scheduledDate}
                    onChange={handleChange}
                    min={today}
                    required
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 pl-10 text-[10px] font-black text-text-primary focus:outline-none focus:border-accent-main relative"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-accent-main uppercase tracking-widest ml-1">TIME</label>
                <div className="relative group cursor-pointer" onClick={(e) => {
                  const input = e.currentTarget.querySelector('input');
                  if (input) input.showPicker();
                }}>
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-main z-10 pointer-events-none" />
                  <input
                    type="time"
                    name="scheduledTime"
                    value={form.scheduledTime}
                    onChange={handleChange}
                    required
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 pl-10 text-[10px] font-black text-text-primary focus:outline-none focus:border-accent-main relative"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-accent-main uppercase tracking-widest ml-1">START DATE</label>
                  <div className="relative group cursor-pointer" onClick={(e) => {
                    const input = e.currentTarget.querySelector('input');
                    if (input) input.showPicker();
                  }}>
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-main z-10 pointer-events-none" />
                    <input
                      type="date"
                      name="scheduledDate"
                      value={form.scheduledDate}
                      onChange={handleChange}
                      min={today}
                      required
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 pl-10 text-[10px] font-black text-text-primary focus:outline-none focus:border-accent-main relative"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-accent-main uppercase tracking-widest ml-1">END DATE</label>
                  <div className="relative group cursor-pointer" onClick={(e) => {
                    const input = e.currentTarget.querySelector('input');
                    if (input) input.showPicker();
                  }}>
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent-main z-10 pointer-events-none" />
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      min={form.scheduledDate || today}
                      required
                      className="w-full bg-white border border-gray-200 rounded-xl p-3 pl-10 text-[10px] font-black text-text-primary focus:outline-none focus:border-accent-main relative"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-accent-main uppercase tracking-widest ml-1">DAILY AVAILABILITY</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({...prev, workingHours: 'full-day'}))}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      form.workingHours === 'full-day' ? 'bg-orange-100/80 border-accent-main text-accent-main' : 'bg-white border-gray-200 text-text-muted'
                    }`}
                  >
                    Full Day
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({...prev, workingHours: 'custom'}))}
                    className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      form.workingHours === 'custom' ? 'bg-orange-100/80 border-accent-main text-accent-main' : 'bg-white border-gray-200 text-text-muted'
                    }`}
                  >
                    Custom Time
                  </button>
                </div>
                {form.workingHours === 'custom' && (
                  <input
                    type="text"
                    name="customHours"
                    placeholder="e.g. 10 AM to 4 PM"
                    value={form.customHours}
                    onChange={handleChange}
                    className="w-full bg-white border border-gray-200 rounded-xl p-3 text-xs font-black text-text-primary focus:outline-none focus:border-accent-main mt-2 uppercase tracking-widest"
                    required={form.workingHours === 'custom'}
                  />
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[9px] font-black text-accent-main uppercase tracking-widest ml-1">JOB DETAILS</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe what you need help with..."
              rows={3}
              className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-xs font-bold focus:outline-none focus:border-accent-main text-text-primary resize-none uppercase tracking-wider"
            />
          </div>
        </div>

        <PremiumButton
          type="submit"
          disabled={loading}
          variant="gold"
          size="lg"
          fullWidth
          className="py-4 text-sm font-black"
        >
          {loading ? 'SENDING...' : 'SEND REQUEST'}
        </PremiumButton>
      </form>
    </Modal>
  );
};

export default BroadcastBookingModal;
