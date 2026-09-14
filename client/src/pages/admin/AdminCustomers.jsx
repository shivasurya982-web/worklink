import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import Badge from '../../components/common/Badge';
import PremiumButton from '../../components/common/PremiumButton';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { ShieldAlert, Trash2, Eye, User, Mail, Phone, MapPin, Calendar, ShieldCheck, Search, RefreshCw } from 'lucide-react';
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
      <div className="flex items-center justify-end mb-8">
        <button
          onClick={fetchCustomers}
          className="p-3.5 rounded-2xl bg-background-widget border border-border-primary/20 hover:bg-background-secondary text-[10px] font-black text-white flex items-center gap-2.5 shrink-0 shadow-lg uppercase tracking-widest transition-all"
        >
          <RefreshCw className={`w-4 h-4 text-accent-bright ${loading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent-bright border-t-transparent shadow-orange" />
        </div>
      ) : customers.length > 0 ? (
        <div className="space-y-5">
          {customers.map((c) => (
            <GlassCard key={c._id} hover={false} className="p-6 sm:p-8 !bg-background-card border-border-primary/40 shadow-2xl group">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                  <img
                    src={c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=F4510B&color=fff`}
                    alt={c.name}
                    className="w-16 h-16 sm:w-20 rounded-[1.5rem] object-cover border-2 border-accent-main shadow-2xl group-hover:scale-105 transition-all"
                  />
                  <div className="min-w-0">
                    <h4 className="font-sora font-black text-xl text-white flex items-center gap-3 uppercase tracking-tighter">
                      {c.name}
                      <Badge
                        variant={c.isSuspended ? 'danger' : 'success'}
                        size="xs"
                        className="font-black uppercase"
                      >
                        {c.isSuspended ? 'Suspended' : 'Active'}
                      </Badge>
                    </h4>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-2 opacity-80">
                      Email: {c.email} | Phone: {c.phone || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end lg:self-center flex-wrap">
                  <button
                    onClick={() => openViewModal(c)}
                    className="px-6 py-3.5 rounded-2xl bg-background-widget border border-white/5 text-[10px] font-black text-white hover:bg-background-secondary transition-all flex items-center gap-2.5 uppercase tracking-widest shadow-xl"
                  >
                    <Eye className="w-4 h-4 text-accent-bright" /> View Info
                  </button>

                  <button
                    onClick={() => handleSuspendCustomer(c._id, c.isSuspended)}
                    className={`px-6 py-3.5 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                      c.isSuspended
                        ? 'bg-emerald-950/20 text-emerald-400 border-emerald-500/20 hover:bg-emerald-900/30'
                        : 'bg-red-950/20 text-red-400 border-red-500/20 hover:bg-red-900/30'
                    }`}
                  >
                    {c.isSuspended ? 'Activate' : 'Suspend'}
                  </button>

                  <button
                    onClick={() => handleDeleteCustomer(c._id)}
                    className="p-3.5 rounded-2xl bg-red-950/20 text-red-400 border border-red-500/20 hover:bg-red-900/30 transition-all shadow-xl"
                    title="Delete Account"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-background-cardSecondary/40 rounded-[3rem] border-2 border-dashed border-border-primary/20">
           <div className="w-20 h-20 bg-background-dark rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/5">
              <User className="w-10 h-10 text-accent-bright opacity-20" />
           </div>
           <p className="text-xs font-black text-text-muted uppercase tracking-[0.4em]">NO CUSTOMERS FOUND IN THIS LIST.</p>
        </div>
      )}

      {/* View Customer Details Modal */}
      {viewModalOpen && selectedCustomer && (
        <Modal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={`Customer Info: ${selectedCustomer.name}`}
        >
          <div className="space-y-10 pt-4">
            <div className="flex flex-col items-center text-center">
               <div className="relative mb-6">
                 <img
                   src={selectedCustomer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCustomer.name)}&background=F4510B&color=fff`}
                   className="w-32 h-32 rounded-[2.5rem] border-4 border-accent-main shadow-[0_20px_50px_rgba(0,0,0,0.5)] object-cover"
                 />
                 <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-background-dark border-2 border-white/10 flex items-center justify-center shadow-2xl">
                    <ShieldCheck className={`w-6 h-6 ${selectedCustomer.isSuspended ? 'text-red-500' : 'text-accent-green'}`} />
                 </div>
               </div>
               <h3 className="font-sora font-black text-3xl text-white tracking-tighter uppercase">{selectedCustomer.name}</h3>
               <p className="text-[10px] font-black text-accent-light uppercase tracking-[0.4em] mt-3">{selectedCustomer.isSuspended ? 'ACCOUNT SUSPENDED' : 'ACCOUNT ACTIVE'}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-5 bg-background-dark/50 rounded-[2rem] border border-white/5 flex items-start gap-4 sm:col-span-2">
                 <div className="w-10 h-10 rounded-xl bg-background-widget flex items-center justify-center border border-accent-bright/20 shrink-0"><Mail className="w-5 h-5 text-accent-bright" /></div>
                 <div className="min-w-0">
                    <p className="text-[9px] font-black text-accent-light uppercase tracking-widest mb-1">EMAIL</p>
                    <p className="text-sm font-bold text-white break-all">{selectedCustomer.email}</p>
                 </div>
              </div>

              <div className="p-5 bg-background-dark/50 rounded-[2rem] border border-white/5 flex items-start gap-4 sm:col-span-2">
                 <div className="w-10 h-10 rounded-xl bg-background-widget flex items-center justify-center border border-accent-bright/20 shrink-0"><Phone className="w-5 h-5 text-accent-bright" /></div>
                 <div className="min-w-0">
                    <p className="text-[9px] font-black text-accent-light uppercase tracking-widest mb-1">PHONE</p>
                    <p className="text-sm font-bold text-white">{selectedCustomer.phone || 'N/A'}</p>
                 </div>
              </div>

              <div className="p-5 bg-background-dark/50 rounded-[2.5rem] border border-white/5 flex items-start gap-4 sm:col-span-2">
                 <div className="w-10 h-10 rounded-xl bg-background-widget flex items-center justify-center border border-accent-bright/20 shrink-0"><MapPin className="w-5 h-5 text-accent-bright" /></div>
                 <div className="min-w-0 flex-1">
                    <p className="text-[9px] font-black text-accent-light uppercase tracking-widest mb-1">ADDRESS</p>
                    {selectedCustomer.address?.street || selectedCustomer.address?.city ? (
                      <p className="text-sm font-bold text-white leading-relaxed uppercase tracking-tighter break-words">
                        {[
                          selectedCustomer.address?.street,
                          selectedCustomer.address?.city,
                          selectedCustomer.address?.state
                        ].filter(Boolean).join(', ')}
                        {selectedCustomer.address?.zip ? ` , PIN: ${selectedCustomer.address.zip}` : ''}
                      </p>
                    ) : (
                      <p className="text-[10px] font-black text-accent-orange uppercase tracking-widest italic opacity-70">NO ADDRESS PROVIDED BY CUSTOMER</p>
                    )}
                 </div>
              </div>

              <div className="p-5 bg-background-dark/50 rounded-[2rem] border border-white/5 flex items-start gap-4">
                 <div className="w-10 h-10 rounded-xl bg-background-widget flex items-center justify-center border border-accent-bright/20 shrink-0"><Calendar className="w-5 h-5 text-accent-bright" /></div>
                 <div className="min-w-0">
                    <p className="text-[9px] font-black text-accent-light uppercase tracking-widest mb-1">JOINED ON</p>
                    <p className="text-sm font-bold text-white">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
                 </div>
              </div>

              <div className="p-5 bg-background-dark/50 rounded-[2rem] border border-white/5 flex items-start gap-4">
                 <div className="w-10 h-10 rounded-xl bg-background-widget flex items-center justify-center border border-accent-bright/20 shrink-0"><ShieldCheck className="w-5 h-5 text-accent-bright" /></div>
                 <div className="min-w-0">
                    <p className="text-[9px] font-black text-accent-light uppercase tracking-widest mb-1">RECOVERY HINT</p>
                    <p className="text-sm font-bold text-accent-light italic break-words">"{selectedCustomer.securityHint || 'None'}"</p>
                 </div>
              </div>
            </div>

            {selectedCustomer.isSuspended && selectedCustomer.suspendReason && (
              <div className="p-6 bg-red-950/20 border-2 border-red-500/20 rounded-[2rem] shadow-inner">
                 <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> REASON FOR SUSPENSION</p>
                 <p className="text-sm text-text-primary italic leading-relaxed font-bold opacity-90">"{selectedCustomer.suspendReason}"</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/5">
               <PremiumButton
                 variant={selectedCustomer.isSuspended ? 'gold' : 'outline'}
                 fullWidth
                 className="py-5 text-base font-black"
                 onClick={() => handleSuspendCustomer(selectedCustomer._id, selectedCustomer.isSuspended)}
               >
                 {selectedCustomer.isSuspended ? 'ACTIVATE ACCOUNT' : 'SUSPEND ACCOUNT'}
               </PremiumButton>
               <PremiumButton
                 variant="danger"
                 fullWidth
                 className="py-5 text-base font-black"
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
