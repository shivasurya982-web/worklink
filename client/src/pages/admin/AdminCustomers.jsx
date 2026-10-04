import { getImageUrl, handleImageError, DEFAULT_AVATAR } from '../../utils/imageUtils';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import Badge from '../../components/common/Badge';
import PremiumButton from '../../components/common/PremiumButton';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { ShieldAlert, Trash2, Eye, User, Mail, Phone, MapPin, Calendar, ShieldCheck, RefreshCw } from 'lucide-react';
import API from '../../services/api';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const { showToast } = useNotification();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await API.get('/admin/customers');
      if (res.success) {
        setCustomers(res.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendCustomer = async (customerId, currentSuspended) => {
    const isSuspended = currentSuspended;
    const action = isSuspended ? 'update' : 'suspend';
    const reason = isSuspended ? '' : prompt('Reason for suspension:') || 'Rules violation';

    try {
      const res = await API.put(`/admin/customers/${customerId}/${action}`, {
        isSuspended: !isSuspended,
        reason,
      });

      if (res.success) {
        showToast('Success', `Customer account ${isSuspended ? 'activated' : 'suspended'}.`, 'success');
        fetchCustomers();
        if (selectedCustomer && selectedCustomer._id === customerId) {
            setViewModalOpen(false);
        }
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY DELETE this customer? All their data will be lost.')) return;

    try {
      const res = await API.delete(`/admin/customers/${customerId}`);
      if (res.success) {
        showToast('Deleted', 'Customer account removed forever.', 'info');
        setCustomers((prev) => prev.filter((c) => c._id !== customerId));
        if (selectedCustomer && selectedCustomer._id === customerId) {
            setViewModalOpen(false);
        }
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const openViewModal = (customer) => {
    setSelectedCustomer(customer);
    setViewModalOpen(true);
  };

  return (
    <DashboardLayout
      title="Manage Customers"
      subtitle="View and manage all registered users"
    >
      <div className="flex items-center justify-end mb-6">
        <button
          onClick={fetchCustomers}
          className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-[10px] font-black text-text-primary flex items-center gap-2 shrink-0 shadow-xs uppercase tracking-wider cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-accent-main ${loading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-main border-t-transparent" />
        </div>
      ) : customers.length > 0 ? (
        <div className="space-y-4">
          {customers.map((c) => (
            <GlassCard key={c._id} hover={false} className="p-6 !bg-white/80 border border-white/60 shadow-xs group">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <img
                    src={getImageUrl(c.avatar, DEFAULT_AVATAR(c.name))} onError={(e) => handleImageError(e, DEFAULT_AVATAR(c.name))}
                    alt={c.name}
                    className="w-16 h-16 sm:w-20 rounded-2xl object-cover border-2 border-accent-main shadow-xs"
                  />
                  <div className="min-w-0">
                    <h4 className="font-sora font-black text-lg text-text-primary flex items-center gap-2 uppercase tracking-tight">
                      {c.name}
                      <Badge
                        variant={c.isSuspended ? 'danger' : 'success'}
                        size="xs"
                        className="font-black uppercase"
                      >
                        {c.isSuspended ? 'Suspended' : 'Active'}
                      </Badge>
                    </h4>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-1">
                      Email: {c.email} | Phone: {c.phone || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end lg:self-center flex-wrap">
                  <button
                    onClick={() => openViewModal(c)}
                    className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-[10px] font-black text-text-primary hover:bg-gray-100 transition-all flex items-center gap-2 uppercase tracking-wider shadow-xs cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-accent-main" /> View Info
                  </button>

                  <button
                    onClick={() => handleSuspendCustomer(c._id, c.isSuspended)}
                    className={`px-5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      c.isSuspended
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                    }`}
                  >
                    {c.isSuspended ? 'Activate' : 'Suspend'}
                  </button>

                  <button
                    onClick={() => handleDeleteCustomer(c._id)}
                    className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all shadow-xs cursor-pointer"
                    title="Delete Account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/60 rounded-[2.5rem] border-2 border-dashed border-gray-200">
           <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <User className="w-8 h-8 text-accent-main" />
           </div>
           <p className="text-xs font-bold text-text-muted uppercase tracking-wider">NO CUSTOMERS FOUND IN THIS LIST.</p>
        </div>
      )}

      {/* View Customer Details Modal */}
      {viewModalOpen && selectedCustomer && (
        <Modal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={`Customer Info: ${selectedCustomer.name}`}
        >
          <div className="space-y-6 pt-2">
            <div className="flex flex-col items-center text-center">
               <div className="relative mb-4">
                 <img
                   src={getImageUrl(selectedCustomer.avatar, DEFAULT_AVATAR(selectedCustomer.name))} onError={(e) => handleImageError(e, DEFAULT_AVATAR(selectedCustomer.name))}
                   className="w-24 h-24 rounded-2xl border-2 border-accent-main shadow-xs object-cover"
                 />
               </div>
               <h3 className="font-sora font-black text-2xl text-text-primary tracking-tight uppercase">{selectedCustomer.name}</h3>
               <p className="text-[10px] font-black text-accent-main uppercase tracking-wider mt-1">{selectedCustomer.isSuspended ? 'ACCOUNT SUSPENDED' : 'ACCOUNT ACTIVE'}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/80 flex items-start gap-3 sm:col-span-2">
                 <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-orange-100/80 shrink-0"><Mail className="w-4 h-4 text-accent-main" /></div>
                 <div className="min-w-0">
                    <p className="text-[9px] font-black text-accent-main uppercase tracking-wider mb-0.5">EMAIL</p>
                    <p className="text-xs font-bold text-text-primary break-all">{selectedCustomer.email}</p>
                 </div>
              </div>

              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/80 flex items-start gap-3 sm:col-span-2">
                 <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-orange-100/80 shrink-0"><Phone className="w-4 h-4 text-accent-main" /></div>
                 <div className="min-w-0">
                    <p className="text-[9px] font-black text-accent-main uppercase tracking-wider mb-0.5">PHONE</p>
                    <p className="text-xs font-bold text-text-primary">{selectedCustomer.phone || 'N/A'}</p>
                 </div>
              </div>

              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100/80 flex items-start gap-3 sm:col-span-2">
                 <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-orange-100/80 shrink-0"><MapPin className="w-4 h-4 text-accent-main" /></div>
                 <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black text-accent-main uppercase tracking-wider mb-0.5">ADDRESS</p>
                    {selectedCustomer.address?.street || selectedCustomer.address?.city ? (
                      <p className="text-xs font-bold text-text-primary leading-relaxed uppercase tracking-tight break-words">
                        {[
                          selectedCustomer.address?.street,
                          selectedCustomer.address?.city,
                          selectedCustomer.address?.state
                        ].filter(Boolean).join(', ')}
                        {selectedCustomer.address?.zip ? ` , PIN: ${selectedCustomer.address.zip}` : ''}
                      </p>
                    ) : (
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider italic">NO ADDRESS PROVIDED BY CUSTOMER</p>
                    )}
                 </div>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3">
                 <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-blue-100 shrink-0"><Calendar className="w-4 h-4 text-accent-main" /></div>
                 <div className="min-w-0">
                    <p className="text-[9px] font-black text-accent-main uppercase tracking-wider mb-0.5">JOINED ON</p>
                    <p className="text-xs font-bold text-text-primary">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
                 </div>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3">
                 <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center border border-blue-100 shrink-0"><ShieldCheck className="w-4 h-4 text-accent-main" /></div>
                 <div className="min-w-0">
                    <p className="text-[9px] font-black text-accent-main uppercase tracking-wider mb-0.5">RECOVERY HINT</p>
                    <p className="text-xs font-bold text-accent-main italic break-words">"{selectedCustomer.securityHint || 'None'}"</p>
                 </div>
              </div>
            </div>

            {selectedCustomer.isSuspended && selectedCustomer.suspendReason && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                 <p className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-1 flex items-center gap-1.5"><ShieldAlert className="w-4 h-4" /> REASON FOR SUSPENSION</p>
                 <p className="text-xs text-text-primary italic leading-relaxed font-bold">"{selectedCustomer.suspendReason}"</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
               <PremiumButton
                 variant={selectedCustomer.isSuspended ? 'gold' : 'outline'}
                 fullWidth
                 className="py-3.5 text-xs font-black"
                 onClick={() => handleSuspendCustomer(selectedCustomer._id, selectedCustomer.isSuspended)}
               >
                 {selectedCustomer.isSuspended ? 'ACTIVATE ACCOUNT' : 'SUSPEND ACCOUNT'}
               </PremiumButton>
               <PremiumButton
                 variant="danger"
                 fullWidth
                 className="py-3.5 text-xs font-black"
                 onClick={() => handleDeleteCustomer(selectedCustomer._id)}
               >
                 DELETE ACCOUNT
               </PremiumButton>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AdminCustomers;
