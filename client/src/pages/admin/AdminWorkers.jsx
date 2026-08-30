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
        showToast('Worker Approved!', 'Worker is now active on the platform.', 'success');
        fetchWorkers();
        if (selectedWorker?._id === workerId) setSelectedWorker(null);
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to approve worker', 'error');
    }
  };

  const handleRejectWorker = async (workerId) => {
    const reason = prompt('Enter rejection reason:') || 'Application does not meet platform requirements';
    try {
      const res = await API.put(`/admin/workers/${workerId}/reject`, { reason });
      if (res.success) {
        showToast('Worker Rejected', 'Notification sent to applicant.', 'info');
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
    const reason = isSuspended ? '' : prompt('Enter suspension reason:') || 'Suspended by platform administrator';

    try {
      const res = await API.put(`/admin/workers/${workerId}/${endpoint}`, { reason });
      if (res.success) {
        showToast('Worker Status Updated', `Worker has been ${isSuspended ? 'reactivated' : 'suspended'}.`, 'success');
        fetchWorkers();
        if (selectedWorker?._id === workerId) setSelectedWorker(null);
      }
    } catch (err) {
      showToast('Error', err.message || 'Action failed', 'error');
    }
  };

  const handleDeleteWorker = async (workerId) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this worker account? This action cannot be undone.')) return;

    try {
      const res = await API.delete(`/admin/workers/${workerId}`);
      if (res.success) {
        showToast('Worker Deleted', 'Worker account removed permanently.', 'info');
        setWorkers((prev) => prev.filter((w) => w._id !== workerId));
        if (selectedWorker?._id === workerId) setSelectedWorker(null);
      }
    } catch (err) {
      showToast('Error', err.message || 'Failed to delete worker', 'error');
    }
  };

  return (
    <DashboardLayout
      title="Admin Worker Control Center"
      subtitle="Full control to review registrations, approve applicants, suspend accounts, or delete workers"
    >
      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Workers' },
            { id: 'pending', label: 'Pending Approval Queue ⏳' },
            { id: 'approved', label: 'Approved & Active ✅' },
            { id: 'suspended', label: 'Suspended 🚫' },
            { id: 'rejected', label: 'Rejected ❌' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === tab.id
                  ? 'bg-accent-gold text-text-primary shadow-md font-bold'
                  : 'bg-white text-text-secondary hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={fetchWorkers}
          className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-text-primary flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Worker List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-gold border-t-transparent" />
        </div>
      ) : workers.length > 0 ? (
        <div className="space-y-4">
          {workers.map((worker) => (
            <GlassCard key={worker._id} hover={false} className="p-5 border border-gray-200">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Info */}
                <div className="flex items-start gap-4">
                  <img
                    src={worker.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=D4AF37&color=fff`}
                    alt={worker.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-accent-gold/40 shrink-0"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-text-primary flex items-center gap-2 flex-wrap">
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
                      >
                        {(worker.approvalStatus || 'pending').toUpperCase()}
                      </Badge>
                      {worker.isVerified && (
                        <Badge variant="verified" size="xs">
                          Verified
                        </Badge>
                      )}
                    </h4>
                    <p className="text-xs font-medium text-text-secondary mt-0.5">
                      Profession: <span className="font-semibold text-text-primary">{worker.profession}</span> | Exp: {worker.experience} yrs
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      Email: {worker.email} | Phone: {worker.phone || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Control Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <button
                    onClick={() => setSelectedWorker(worker)}
                    className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-text-primary flex items-center gap-1 min-h-[38px]"
                  >
                    <Eye className="w-4 h-4 text-accent-gold" /> Details
                  </button>

                  {worker.approvalStatus === 'pending' && (
                    <>
                      <PremiumButton
                        variant="danger"
                        size="sm"
                        icon={XCircle}
                        onClick={() => handleRejectWorker(worker._id)}
                      >
                        Reject
                      </PremiumButton>
                      <PremiumButton
                        variant="gold"
                        size="sm"
                        icon={CheckCircle}
                        onClick={() => handleApproveWorker(worker._id)}
                      >
                        Approve & Verify
                      </PremiumButton>
                    </>
                  )}

                  {worker.approvalStatus === 'approved' && (
                    <PremiumButton
                      variant="outline"
                      size="sm"
                      icon={ShieldAlert}
                      onClick={() => handleToggleSuspendWorker(worker._id, worker.approvalStatus)}
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
                    >
                      Reactivate
                    </PremiumButton>
                  )}

                  <PremiumButton
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDeleteWorker(worker._id)}
                  >
                    Delete Permanently
                  </PremiumButton>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="text-center py-12 text-xs text-text-muted">
          No workers found under "{filterStatus.toUpperCase()}" filter.
        </GlassCard>
      )}

      {/* Details Modal */}
      {selectedWorker && (
        <Modal
          isOpen={!!selectedWorker}
          onClose={() => setSelectedWorker(null)}
          title={`Worker Details: ${selectedWorker.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl">
              <div><span className="font-semibold">Name:</span> {selectedWorker.name}</div>
              <div><span className="font-semibold">Status:</span> {(selectedWorker.approvalStatus || 'pending').toUpperCase()}</div>
              <div><span className="font-semibold">Profession:</span> {selectedWorker.profession}</div>
              <div>
                <span className="font-semibold">Category:</span>{' '}
                {selectedWorker.category?.name || (
                  <span className="text-accent-blue font-bold">
                    Suggested: {selectedWorker.suggestedCategory || 'None'}
                  </span>
                )}
              </div>
              <div><span className="font-semibold">Experience:</span> {selectedWorker.experience} years</div>
              <div><span className="font-semibold">Email:</span> {selectedWorker.email}</div>
              <div><span className="font-semibold">Phone:</span> {selectedWorker.phone}</div>
              <div><span className="font-semibold">Hourly Rate:</span> ₹{selectedWorker.pricing?.hourly || 0}</div>
              <div><span className="font-semibold">Rating:</span> ★ {selectedWorker.rating || 0}</div>
            </div>

            {selectedWorker.description && (
              <div>
                <span className="font-semibold text-text-primary block mb-1">About / Bio:</span>
                <p className="p-2.5 bg-gray-50 rounded-xl text-text-secondary">{selectedWorker.description}</p>
              </div>
            )}

            {selectedWorker.identityProof && (
              <div>
                <span className="font-semibold text-text-primary block mb-1">Identity Proof Document:</span>
                <img src={selectedWorker.identityProof} alt="Identity Proof" className="max-h-48 rounded-xl border border-gray-200" />
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-2 flex-wrap">
              {selectedWorker.approvalStatus === 'pending' && (
                <>
                  <PremiumButton variant="danger" size="sm" onClick={() => handleRejectWorker(selectedWorker._id)}>
                    Reject Applicant
                  </PremiumButton>
                  <PremiumButton variant="gold" size="sm" onClick={() => handleApproveWorker(selectedWorker._id)}>
                    Approve & Activate
                  </PremiumButton>
                </>
              )}
              <PremiumButton variant="danger" size="sm" onClick={() => handleDeleteWorker(selectedWorker._id)}>
                Delete Account
              </PremiumButton>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AdminWorkers;
