import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import Badge from '../../components/common/Badge';
import PremiumButton from '../../components/common/PremiumButton';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { ShieldAlert, Trash2, Eye, User, Mail, Phone, MapPin, Calendar, ShieldCheck, Search } from 'lucide-react';
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
    const reason = isSuspended ? '' : prompt('Enter suspension reason:') || 'Administrative protocol execution';

    try {
      const res = await API.put(`/admin/customers/${customerId}/${action}`, {
        isSuspended: !isSuspended,
        reason,
      });

      if (res.success) {
        showToast('Operation Sync', `Node ${isSuspended ? 'reactivated' : 'suppressed'} successfully.`, 'success');
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
    if (!window.confirm('PERMANENTLY PURGE this consumer node? All associated data will be lost.')) return;

    try {
      const res = await API.delete(`/admin/customers/${customerId}`);
      if (res.success) {
        showToast('Data Purged', 'Consumer removed from ecosystem.', 'info');
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
      title="Consumer Registry"
      subtitle="Ecosystem node management and behavioral monitoring"
    >
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
                        className="font-black"
                      >
                        {c.isSuspended ? 'Suppressed' : 'Active'}
                      </Badge>
                    </h4>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mt-2 opacity-80">
                      ID: {c.email} | Comms: {c.phone || 'Dark'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end lg:self-center flex-wrap">
                  <PremiumButton
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => openViewModal(c)}
                    className="!rounded-xl px-6"
                  >
                    Examine
                  </PremiumButton>

                  <PremiumButton
                    variant={c.isSuspended ? 'gold' : 'outline'}
                    size="sm"
                    icon={ShieldAlert}
                    onClick={() => handleSuspendCustomer(c._id, c.isSuspended)}
                    className="!rounded-xl px-6"
                  >
                    {c.isSuspended ? 'Restore' : 'Suppress'}
                  </PremiumButton>

                  <button
                    onClick={() => handleDeleteCustomer(c._id)}
                    className="p-3.5 rounded-2xl bg-red-950/20 text-red-400 border border-red-500/20 hover:bg-red-900/30 transition-all shadow-xl"
                    title="Purge Node"
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
           <p className="text-xs font-black text-text-muted uppercase tracking-[0.4em]">NO CONSUMER NODES DETECTED ON NETWORK.</p>
        </div>
      )}

      {/* View Customer Details Modal */}
      {viewModalOpen && selectedCustomer && (
        <Modal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title="CONSUMER NODE PROFILE"
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
               <p className="text-[10px] font-black text-accent-light uppercase tracking-[0.4em] mt-3">{selectedCustomer.isSuspended ? 'SIGNAL SUPPRESSED' : 'BROADCASTING ACTIVE'}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="p-5 bg-background-dark/50 rounded-[2rem] border border-white/5 flex items-start gap-4">
                 <div className="w-10 h-10 rounded-xl bg-background-widget flex items-center justify-center border border-accent-bright/20"><Mail className="w-5 h-5 text-accent-bright" /></div>
                 <div className="min-w-0">
                    <p className="text-[9px] font-black text-accent-light uppercase tracking-widest mb-1">IDENTIFIER</p>
                    <p className="text-sm font-bold text-white truncate">{selectedCustomer.email}</p>
                 </div>
              </div>

              <div className="p-5 bg-background-dark/50 rounded-[2rem] border border-white/5 flex items-start gap-4">
                 <div className="w-10 h-10 rounded-xl bg-background-widget flex items-center justify-center border border-accent-bright/20"><Phone className="w-5 h-5 text-accent-bright" /></div>
                 <div>
                    <p className="text-[9px] font-black text-accent-light uppercase tracking-widest mb-1">COMMS</p>
                    <p className="text-sm font-bold text-white">{selectedCustomer.phone || 'LINK DARK'}</p>
                 </div>
              </div>

              <div className="p-5 bg-background-dark/50 rounded-[2.5rem] border border-white/5 flex items-start gap-4 sm:col-span-2">
                 <div className="w-10 h-10 rounded-xl bg-background-widget flex items-center justify-center border border-accent-bright/20 shrink-0"><MapPin className="w-5 h-5 text-accent-bright" /></div>
                 <div>
                    <p className="text-[9px] font-black text-accent-light uppercase tracking-widest mb-1">GEO-COORDINATES</p>
                    <p className="text-sm font-bold text-white leading-relaxed uppercase tracking-tighter">
                       {selectedCustomer.address?.street}, {selectedCustomer.address?.city}, {selectedCustomer.address?.state} - {selectedCustomer.address?.zip}
                    </p>
                 </div>
              </div>

              <div className="p-5 bg-background-dark/50 rounded-[2rem] border border-white/5 flex items-start gap-4">
                 <div className="w-10 h-10 rounded-xl bg-background-widget flex items-center justify-center border border-accent-bright/20"><Calendar className="w-5 h-5 text-accent-bright" /></div>
                 <div>
                    <p className="text-[9px] font-black text-accent-light uppercase tracking-widest mb-1">NODE CREATED</p>
                    <p className="text-sm font-bold text-white">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
                 </div>
              </div>

              <div className="p-5 bg-background-dark/50 rounded-[2rem] border border-white/5 flex items-start gap-4">
                 <div className="w-10 h-10 rounded-xl bg-background-widget flex items-center justify-center border border-accent-bright/20"><ShieldCheck className="w-5 h-5 text-accent-bright" /></div>
                 <div>
                    <p className="text-[9px] font-black text-accent-light uppercase tracking-widest mb-1">SECURITY TOKEN</p>
                    <p className="text-sm font-bold text-accent-light italic">"{selectedCustomer.securityHint || 'NULL'}"</p>
                 </div>
              </div>
            </div>

            {selectedCustomer.isSuspended && selectedCustomer.suspendReason && (
              <div className="p-6 bg-red-950/20 border-2 border-red-500/20 rounded-[2rem] shadow-inner">
                 <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-3 flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> SUPPRESSION LOG</p>
                 <p className="text-sm text-text-primary italic leading-relaxed font-bold opacity-90">"{selectedCustomer.suspendReason}"</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-white/5">
               <PremiumButton
                 variant={selectedCustomer.isSuspended ? 'gold' : 'outline'}
                 fullWidth
                 className="py-5 text-base"
                 onClick={() => handleSuspendCustomer(selectedCustomer._id, selectedCustomer.isSuspended)}
               >
                 {selectedCustomer.isSuspended ? 'RESTORE NODE' : 'SUPPRESS NODE'}
               </PremiumButton>
               <PremiumButton
                 variant="danger"
                 fullWidth
                 className="py-5 text-base"
                 onClick={() => handleDeleteCustomer(selectedCustomer._id)}
               >
                 PURGE DATA
               </PremiumButton>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AdminCustomers;
