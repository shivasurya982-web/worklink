import { getImageUrl, handleImageError, DEFAULT_AVATAR } from '../../utils/imageUtils';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import Badge from '../../components/common/Badge';
import PremiumButton from '../../components/common/PremiumButton';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { ShieldAlert, Trash2, CheckCircle, XCircle, Eye, RefreshCw, Users, AlertCircle, Download } from 'lucide-react';
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
      if (res && res.success) {
        const data = res.data;
        if (Array.isArray(data)) {
          setWorkers(data);
        } else if (data && Array.isArray(data.workers)) {
          setWorkers(data.workers);
        } else if (data && typeof data === 'object') {
          setWorkers(Array.isArray(data) ? data : []);
        } else {
          setWorkers([]);
        }
      }
    } catch (err) {
      console.error('Fetch workers error:', err);
      showToast('Error', err.message || 'Failed to get workers list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWorker = async (workerId) => {
    try {
      const res = await API.put(`/admin/workers/${workerId}/approve`);
      if (res && res.success) {
        showToast('Approved', 'Worker can now start working.', 'success');
        fetchWorkers();
        if (selectedWorker?._id === workerId) setSelectedWorker(null);
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to approve worker', 'error');
    }
  };

  const handleRejectWorker = async (workerId) => {
    const reason = prompt('Reason for rejection:') || 'Documents not clear';
    try {
      const res = await API.put(`/admin/workers/${workerId}/reject`, { reason });
      if (res && res.success) {
        showToast('Rejected', 'Worker has been notified.', 'info');
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
    const reason = isSuspended ? '' : prompt('Reason for suspension:') || 'Rules violation';

    try {
      const res = await API.put(`/admin/workers/${workerId}/${endpoint}`, { reason });
      if (res && res.success) {
        showToast('Status Updated', `Worker is now ${isSuspended ? 'active' : 'suspended'}.`, 'success');
        fetchWorkers();
        if (selectedWorker?._id === workerId) setSelectedWorker(null);
      }
    } catch (err) {
      showToast('Error', err.message || 'Action failed', 'error');
    }
  };

  const handleDeleteWorker = async (workerId) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY DELETE this worker?')) return;

    try {
      const res = await API.delete(`/admin/workers/${workerId}`);
      if (res && res.success) {
        showToast('Deleted', 'Worker account removed forever.', 'info');
        setWorkers((prev) => prev.filter((w) => w._id !== workerId));
        if (selectedWorker?._id === workerId) setSelectedWorker(null);
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to delete worker', 'error');
    }
  };

  return (
    <DashboardLayout
      title="Manage Workers"
      subtitle="View, approve, and manage all service workers"
    >
      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {[
            { id: 'all', label: 'All Workers' },
            { id: 'pending', label: 'Pending Approval' },
            { id: 'approved', label: 'Approved' },
            { id: 'suspended', label: 'Suspended' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-accent-main text-white shadow-xs'
                  : 'bg-white text-text-muted hover:text-text-primary border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={fetchWorkers}
          className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-[10px] font-black text-text-primary flex items-center gap-2 shrink-0 shadow-xs uppercase tracking-wider cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-accent-main ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Worker List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-main border-t-transparent" />
        </div>
      ) : workers.length > 0 ? (
        <div className="space-y-4">
          {workers.map((worker) => (
            <GlassCard key={worker._id} hover={false} className="p-6 !bg-white/80 border border-white/60 shadow-xs group">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={getImageUrl(worker.avatar, DEFAULT_AVATAR(worker.name))} onError={(e) => handleImageError(e, DEFAULT_AVATAR(worker.name))}
                    alt={worker.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-accent-main shadow-xs"
                  />
                  <div className="min-w-0">
                    <h4 className="font-sora font-black text-lg text-text-primary flex items-center gap-2 uppercase tracking-tight flex-wrap">
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
                        className="font-black uppercase"
                      >
                        {worker.approvalStatus}
                      </Badge>
                      {worker.isVerified && (
                        <Badge variant="verified" size="xs">
                          Verified
                        </Badge>
                      )}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <p className="text-[10px] font-bold text-accent-main uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                        {worker.profession}
                      </p>
                      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                        Exp: {worker.experience} Years
                      </p>
                    </div>
                    <p className="text-[10px] text-text-muted font-bold mt-2 uppercase tracking-wider">
                      Email: {worker.email} | Phone: {worker.phone || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Control Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap shrink-0 self-end lg:self-center">
                  <button
                    onClick={() => setSelectedWorker(worker)}
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-[10px] font-black text-text-primary flex items-center gap-2 uppercase tracking-wider shadow-xs border border-gray-200 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-accent-main" /> View Details
                  </button>

                  {worker.approvalStatus === 'pending' && (
                    <>
                      <PremiumButton
                        variant="danger"
                        size="sm"
                        icon={XCircle}
                        onClick={() => handleRejectWorker(worker._id)}
                        className="!rounded-xl px-4"
                      >
                        Reject
                      </PremiumButton>
                      <PremiumButton
                        variant="gold"
                        size="sm"
                        icon={CheckCircle}
                        onClick={() => handleApproveWorker(worker._id)}
                        className="!rounded-xl px-6"
                      >
                        Approve
                      </PremiumButton>
                    </>
                  )}

                  {worker.approvalStatus === 'approved' && (
                    <PremiumButton
                      variant="outline"
                      size="sm"
                      icon={ShieldAlert}
                      onClick={() => handleToggleSuspendWorker(worker._id, worker.approvalStatus)}
                      className="!rounded-xl px-4"
                    >
                      Suspend
                    </PremiumButton>
                  )}

                  {worker.approvalStatus === 'suspended' && (
                    <PremiumButton
                      variant="gold"
                      size="sm"
                      icon={CheckCircle}
                      onClick={() => handleToggleSuspendWorker(worker._id, worker.approvalStatus)}
                      className="!rounded-xl px-6"
                    >
                      Activate
                    </PremiumButton>
                  )}

                  <PremiumButton
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDeleteWorker(worker._id)}
                    className="!rounded-xl px-4"
                  >
                    Delete
                  </PremiumButton>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/60 rounded-[2.5rem] border-2 border-dashed border-gray-200">
           <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Users className="w-8 h-8 text-accent-main" />
           </div>
           <p className="text-xs font-bold text-text-muted uppercase tracking-wider">NO WORKERS FOUND IN THIS LIST.</p>
        </div>
      )}

      {/* Details Modal */}
      {selectedWorker && (
        <Modal
          isOpen={!!selectedWorker}
          onClose={() => setSelectedWorker(null)}
          title={`Worker Details: ${selectedWorker.name}`}
        >
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
              <div className="space-y-1"><p className="text-[9px] font-black text-accent-main uppercase tracking-wider">NAME</p><p className="text-xs font-bold text-text-primary uppercase">{selectedWorker.name}</p></div>
              <div className="space-y-1"><p className="text-[9px] font-black text-accent-main uppercase tracking-wider">STATUS</p><p className="text-xs font-bold text-accent-main uppercase">{selectedWorker.approvalStatus}</p></div>
              <div className="space-y-1"><p className="text-[9px] font-black text-accent-main uppercase tracking-wider">PROFESSION</p><p className="text-xs font-bold text-text-primary uppercase">{selectedWorker.profession}</p></div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-accent-main uppercase tracking-wider">CATEGORY</p>
                <p className="text-xs font-bold text-text-primary uppercase">
                  {selectedWorker.category?.name || "None"}
                </p>
              </div>
              <div className="space-y-1"><p className="text-[9px] font-black text-accent-main uppercase tracking-wider">EXPERIENCE</p><p className="text-xs font-bold text-text-primary uppercase">{selectedWorker.experience} YEARS</p></div>
              <div className="space-y-1"><p className="text-[9px] font-black text-accent-main uppercase tracking-wider">PRICING</p><p className="text-xs font-bold text-accent-main uppercase">QUOTE-BASED</p></div>
              <div className="space-y-1"><p className="text-[9px] font-black text-accent-main uppercase tracking-wider">EMAIL</p><p className="text-xs font-bold text-text-primary lowercase break-all">{selectedWorker.email}</p></div>
              <div className="space-y-1"><p className="text-[9px] font-black text-accent-main uppercase tracking-wider">PHONE</p><p className="text-xs font-bold text-text-primary uppercase">{selectedWorker.phone}</p></div>
              <div className="space-y-1 sm:col-span-2">
                 <p className="text-[9px] font-black text-accent-main uppercase tracking-wider">ADDRESS</p>
                 <p className="text-xs font-bold text-text-primary uppercase leading-relaxed">
                   {selectedWorker.address?.street}, {selectedWorker.address?.city}, {selectedWorker.address?.state} , PIN: {selectedWorker.address?.zip}
                 </p>
              </div>
            </div>

            {selectedWorker.description && (
              <div className="space-y-2">
                <span className="text-[10px] font-black text-text-primary uppercase tracking-wider block ml-1">Bio / Description:</span>
                <p className="p-4 bg-white rounded-2xl text-xs text-text-secondary leading-relaxed font-semibold italic border border-gray-200">"{selectedWorker.description}"</p>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] font-black text-text-primary uppercase tracking-wider block">Verification Document:</span>
                {selectedWorker.identityProof && (
                  <a
                    href={selectedWorker.identityProof}
                    download={`verification_${selectedWorker.name}.jpg`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] font-bold text-accent-main hover:underline flex items-center gap-1 uppercase tracking-wider"
                  >
                    <Download className="w-3.5 h-3.5" /> Download ID
                  </a>
                )}
              </div>
              {selectedWorker.identityProof ? (
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-white p-2">
                   <img
                    src={getImageUrl(selectedWorker.identityProof)}
                    alt="ID Proof"
                    className="max-h-72 w-full object-contain rounded-xl"
                   />
                </div>
              ) : (
                <div className="p-8 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                   <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">No verification image uploaded.</p>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
              {selectedWorker.approvalStatus === 'pending' && (
                <>
                  <PremiumButton variant="danger" size="lg" fullWidth onClick={() => handleRejectWorker(selectedWorker._id)} className="py-3.5 font-black">
                    REJECT
                  </PremiumButton>
                  <PremiumButton variant="gold" size="lg" fullWidth onClick={() => handleApproveWorker(selectedWorker._id)} className="py-3.5 font-black">
                    APPROVE
                  </PremiumButton>
                </>
              )}
              <PremiumButton variant="danger" size="lg" fullWidth onClick={() => handleDeleteWorker(selectedWorker._id)} className="py-3.5 font-black">
                DELETE ACCOUNT
              </PremiumButton>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AdminWorkers;
