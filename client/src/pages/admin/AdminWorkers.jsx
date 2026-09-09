import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import Badge from '../../components/common/Badge';
import PremiumButton from '../../components/common/PremiumButton';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { ShieldAlert, Trash2, CheckCircle, XCircle, Eye, RefreshCw, Filter } from 'lucide-react';
import API from '../../services/api';

const AdminWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, suspended, rejected
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const { showToast } = useNotification();

  useEffect(() => {
    fetchWorkers();
  }, [filterStatus]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      let url = '/admin/workers';
      if (filterStatus !== 'all') {
        url += `?status=${filterStatus}`;
      }
      const res = await API.get(url);
      if (res.success) {
        setWorkers(res.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to fetch workers list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWorker = async (workerId) => {
    try {
      const res = await API.put(`/admin/workers/${workerId}/approve`);
      if (res.success) {
        showToast('Authorized', 'Professional credentials validated.', 'success');
        fetchWorkers();
        if (selectedWorker?._id === workerId) setSelectedWorker(null);
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to approve worker', 'error');
    }
  };

  const handleRejectWorker = async (workerId) => {
    const reason = prompt('Enter rejection reason:') || 'Parameters do not meet standards';
    try {
      const res = await API.put(`/admin/workers/${workerId}/reject`, { reason });
      if (res.success) {
        showToast('Application Terminated', 'Notification sent to node.', 'info');
        fetchWorkers();
        if (selectedWorker?._id === workerId) setSelectedWorker(null);
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to reject worker', 'error');
    }
  };

  const handleToggleSuspendWorker = async (workerId, currentStatus) => {
    const isSuspended = currentStatus === 'suspended';
    const endpoint = isSuspended ? 'approve' : 'suspend';
    const reason = isSuspended ? '' : prompt('Enter suspension reason:') || 'Signal suppressed by administrator';

    try {
      const res = await API.put(`/admin/workers/${workerId}/${endpoint}`, { reason });
      if (res.success) {
        showToast('Status Updated', `Professional node ${isSuspended ? 'reactivated' : 'suppressed'}.`, 'success');
        fetchWorkers();
        if (selectedWorker?._id === workerId) setSelectedWorker(null);
      }
    } catch (err) {
      showToast('Error', err.message || 'Action failed', 'error');
    }
  };

  const handleDeleteWorker = async (workerId) => {
    if (!window.confirm('PERMANENTLY PURGE this professional node from the ecosystem? This is irreversible.')) return;

    try {
      const res = await API.delete(`/admin/workers/${workerId}`);
      if (res.success) {
        showToast('Data Purged', 'Node account removed permanently.', 'info');
        setWorkers((prev) => prev.filter((w) => w._id !== workerId));
        if (selectedWorker?._id === workerId) setSelectedWorker(null);
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to delete worker', 'error');
    }
  };

  return (
    <DashboardLayout
      title="Professional Registry"
      subtitle="Ecosystem node management, verification audit, and signal control"
    >
      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-6 mb-10 flex-wrap">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {[
            { id: 'all', label: 'All Professionals' },
            { id: 'pending', label: 'Audit Queue' },
            { id: 'approved', label: 'Active & Verified' },
            { id: 'suspended', label: 'Suppressed' },
            { id: 'rejected', label: 'Terminated' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                filterStatus === tab.id
                  ? 'bg-accent-orange text-white shadow-xl'
                  : 'bg-background-cardSecondary text-text-muted hover:text-white border border-border-primary/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={fetchWorkers}
          className="p-3.5 rounded-2xl bg-background-widget border border-border-primary/20 hover:bg-background-secondary text-[10px] font-black text-white flex items-center gap-2.5 shrink-0 shadow-lg uppercase tracking-widest"
        >
          <RefreshCw className={`w-4 h-4 text-accent-bright ${loading ? 'animate-spin' : ''}`} /> Sync
        </button>
      </div>

      {/* Worker List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent-bright border-t-transparent shadow-orange" />
        </div>
      ) : workers.length > 0 ? (
        <div className="space-y-5">
          {workers.map((worker) => (
            <GlassCard key={worker._id} hover={false} className="p-6 sm:p-8 !bg-background-card border-border-primary/40 shadow-2xl group">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                {/* Info */}
                <div className="flex items-center gap-6">
                  <img
                    src={worker.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=F4510B&color=fff`}
                    alt={worker.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] object-cover border-2 border-accent-main shadow-2xl group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="min-w-0">
                    <h4 className="font-sora font-black text-xl text-white flex items-center gap-3 uppercase tracking-tighter flex-wrap">
                      {worker.name}
                      <Badge
                        variant={
                          worker.approvalStatus === 'approved'
                            ? 'success'
                            : worker.approvalStatus === 'suspended'
                            ? 'danger'
                            : worker.approvalStatus === 'rejected'
                            ? 'danger'
                            : 'warning'
                        }
                        size="xs"
                        className="font-black"
                      >
                        {worker.approvalStatus}
                      </Badge>
                      {worker.isVerified && (
                        <Badge variant="verified" size="xs">
                          Verified
                        </Badge>
                      )}
                    </h4>
                    <div className="flex flex-wrap items-center gap-5 mt-3">
                      <p className="text-[10px] font-black text-accent-light uppercase tracking-widest bg-background-widget/40 px-3 py-1.5 rounded-lg border border-white/5">
                        Domain: {worker.profession}
                      </p>
                      <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                        Cycles: {worker.experience} Years
                      </p>
                    </div>
                    <p className="text-[10px] text-text-muted font-bold mt-3 opacity-60 uppercase tracking-tighter">
                      Identifier: {worker.email} | Comms: {worker.phone || 'Unknown'}
                    </p>
                  </div>
                </div>

                {/* Control Action Buttons */}
                <div className="flex items-center gap-3 flex-wrap shrink-0 self-end lg:self-center">
                  <button
                    onClick={() => setSelectedWorker(worker)}
                    className="px-5 py-3 rounded-2xl bg-background-widget hover:bg-background-secondary text-[10px] font-black text-white flex items-center gap-2.5 uppercase tracking-widest shadow-xl border border-white/5"
                  >
                    <Eye className="w-4 h-4 text-accent-bright" /> Audit
                  </button>

                  {worker.approvalStatus === 'pending' && (
                    <>
                      <PremiumButton
                        variant="danger"
                        size="sm"
                        icon={XCircle}
                        onClick={() => handleRejectWorker(worker._id)}
                        className="!rounded-xl px-6"
                      >
                        Terminate
                      </PremiumButton>
                      <PremiumButton
                        variant="gold"
                        size="sm"
                        icon={CheckCircle}
                        onClick={() => handleApproveWorker(worker._id)}
                        className="!rounded-xl px-8 shadow-orange"
                      >
                        Authorize
                      </PremiumButton>
                    </>
                  )}

                  {worker.approvalStatus === 'approved' && (
                    <PremiumButton
                      variant="outline"
                      size="sm"
                      icon={ShieldAlert}
                      onClick={() => handleToggleSuspendWorker(worker._id, worker.approvalStatus)}
                      className="!rounded-xl px-6"
                    >
                      Suppress
                    </PremiumButton>
                  )}

                  {worker.approvalStatus === 'suspended' && (
                    <PremiumButton
                      variant="gold"
                      size="sm"
                      icon={CheckCircle}
                      onClick={() => handleToggleSuspendWorker(worker._id, worker.approvalStatus)}
                      className="!rounded-xl px-8 shadow-orange"
                    >
                      Restore
                    </PremiumButton>
                  )}

                  <PremiumButton
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDeleteWorker(worker._id)}
                    className="!rounded-xl px-6"
                  >
                    Purge
                  </PremiumButton>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-background-cardSecondary/40 rounded-[3rem] border-2 border-dashed border-border-primary/20">
           <div className="w-20 h-20 bg-background-dark rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/5">
              <Users className="w-10 h-10 text-accent-bright opacity-20" />
           </div>
           <p className="text-xs font-black text-text-muted uppercase tracking-[0.4em]">REGISTRY EMPTY UNDER "{filterStatus.toUpperCase()}" FILTER.</p>
        </div>
      )}

      {/* Details Modal */}
      {selectedWorker && (
        <Modal
          isOpen={!!selectedWorker}
          onClose={() => setSelectedWorker(null)}
          title={`NODE AUDIT: ${selectedWorker.name}`}
        >
          <div className="space-y-8 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-background-dark/50 rounded-[2rem] border border-white/5 shadow-inner">
              <div className="space-y-1"><p className="text-[9px] font-black text-accent-light uppercase tracking-widest">IDENTIFIER</p><p className="text-sm font-bold text-white">{selectedWorker.name}</p></div>
              <div className="space-y-1"><p className="text-[9px] font-black text-accent-light uppercase tracking-widest">STATE</p><p className="text-sm font-bold text-accent-bright">{selectedWorker.approvalStatus?.toUpperCase()}</p></div>
              <div className="space-y-1"><p className="text-[9px] font-black text-accent-light uppercase tracking-widest">DOMAIN</p><p className="text-sm font-bold text-white">{selectedWorker.profession}</p></div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-accent-light uppercase tracking-widest">SEGMENT</p>
                <p className="text-sm font-bold text-white">
                  {selectedWorker.category?.name || "UNASSIGNED"}
                </p>
              </div>
              <div className="space-y-1"><p className="text-[9px] font-black text-accent-light uppercase tracking-widest">CYCLES</p><p className="text-sm font-bold text-white">{selectedWorker.experience} YEARS</p></div>
              <div className="space-y-1"><p className="text-[9px] font-black text-accent-light uppercase tracking-widest">CREDENTIAL</p><p className="text-sm font-bold text-white lowercase">{selectedWorker.email}</p></div>
              <div className="space-y-1"><p className="text-[9px] font-black text-accent-light uppercase tracking-widest">COMMS</p><p className="text-sm font-bold text-white">{selectedWorker.phone}</p></div>
              <div className="space-y-1"><p className="text-[9px] font-black text-accent-light uppercase tracking-widest">BASE RATE</p><p className="text-sm font-bold text-accent-light">₹{selectedWorker.pricing?.hourly || 0}/HR</p></div>
            </div>

            {selectedWorker.description && (
              <div className="space-y-3">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] block ml-2">Node Specification:</span>
                <p className="p-6 bg-background-dark/30 rounded-[2rem] text-sm text-text-secondary leading-relaxed font-bold italic opacity-90 border border-white/5 shadow-inner">"{selectedWorker.description}"</p>
              </div>
            )}

            {selectedWorker.identityProof && (
              <div className="space-y-3">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] block ml-2">Verification Artifact:</span>
                <div className="relative group rounded-[2.5rem] overflow-hidden border-2 border-border-primary/30 shadow-2xl bg-background-dark p-2">
                   <img src={selectedWorker.identityProof} alt="Identity Proof" className="max-h-64 w-full object-contain rounded-[2rem] transition-all duration-700 group-hover:scale-105" />
                </div>
              </div>
            )}

            <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4">
              {selectedWorker.approvalStatus === 'pending' && (
                <>
                  <PremiumButton variant="danger" size="lg" fullWidth onClick={() => handleRejectWorker(selectedWorker._id)} className="py-4">
                    TERMINATE
                  </PremiumButton>
                  <PremiumButton variant="gold" size="lg" fullWidth onClick={() => handleApproveWorker(selectedWorker._id)} className="py-4 shadow-orange">
                    AUTHORIZE
                  </PremiumButton>
                </>
              )}
              <PremiumButton variant="danger" size="lg" fullWidth onClick={() => handleDeleteWorker(selectedWorker._id)} className="py-4">
                PURGE NODE
              </PremiumButton>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AdminWorkers;
