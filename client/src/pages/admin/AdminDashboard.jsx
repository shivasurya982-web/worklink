import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, CheckSquare, ShieldCheck, Calendar, AlertCircle, Check, X, Eye } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import PremiumButton from '../../components/common/PremiumButton';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import API from '../../services/api';

const AdminDashboard = () => {
  const { showToast } = useNotification();

  const [stats, setStats] = useState({});
  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [dashRes, pendingRes] = await Promise.all([
        API.get('/admin/dashboard'),
        API.get('/admin/workers/pending'),
      ]);

      if (dashRes.success && dashRes.data) setStats(dashRes.data.stats || {});
      if (pendingRes.success && pendingRes.data) setPendingWorkers(pendingRes.data || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWorker = async (workerId) => {
    try {
      const res = await API.put(`/admin/workers/${workerId}/approve`);
      if (res.success) {
        showToast('Worker Approved!', 'Worker is now active on the platform.', 'success');
        setPendingWorkers((prev) => prev.filter((w) => w._id !== workerId));
        setSelectedWorker(null);
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleRejectWorker = async (workerId) => {
    const reason = prompt('Enter rejection reason:') || 'Application does not meet requirements';
    try {
      const res = await API.put(`/admin/workers/${workerId}/reject`, { reason });
      if (res.success) {
        showToast('Worker Rejected', 'Notification sent to applicant.', 'info');
        setPendingWorkers((prev) => prev.filter((w) => w._id !== workerId));
        setSelectedWorker(null);
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <DashboardLayout
      title="Control Center & Verification Queue"
      subtitle="Full platform administration, worker approval, and system control"
    >
      {/* Control Center Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-accent-gold flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-sora font-bold text-text-primary">
              {stats?.totalCustomers || 0}
            </div>
            <div className="text-xs text-text-muted">Total Customers</div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-accent-blue flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-sora font-bold text-text-primary">
              {stats?.totalWorkers || 0}
            </div>
            <div className="text-xs text-text-muted">Approved Workers</div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-sora font-bold text-text-primary">
              {stats?.pendingWorkers || pendingWorkers.length}
            </div>
            <div className="text-xs text-text-muted">Pending Approvals</div>
          </div>
        </GlassCard>
      </div>

      {/* Pending Worker Verification Queue */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-sora font-bold text-lg text-text-primary flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-accent-gold" /> Pending Worker Approval Queue ({pendingWorkers.length})
          </h3>
        </div>

        {loading ? (
           <div className="flex justify-center py-12">
             <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-gold border-t-transparent" />
           </div>
        ) : pendingWorkers.length > 0 ? (
          <div className="space-y-4">
            {pendingWorkers.map((worker) => (
              <GlassCard key={worker._id} hover={false} className="p-5 border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={worker.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=D4AF37&color=fff`}
                      alt={worker.name}
                      className="w-12 h-12 rounded-full object-cover border border-accent-gold/40"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                        {worker.name}
                        <Badge variant="warning" size="xs">
                          PENDING VERIFICATION
                        </Badge>
                      </h4>
                      <p className="text-xs text-text-muted">
                        Profession: {worker.profession} | Phone: {worker.phone} | Exp: {worker.experience} yrs
                      </p>
                      <p className="text-xs text-text-secondary mt-1">
                        Email: {worker.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedWorker(worker)}
                      className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-text-primary flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4 text-accent-gold" /> Review Application
                    </button>

                    <PremiumButton
                      variant="danger"
                      size="sm"
                      onClick={() => handleRejectWorker(worker._id)}
                    >
                      Reject
                    </PremiumButton>

                    <PremiumButton
                      variant="gold"
                      size="sm"
                      onClick={() => handleApproveWorker(worker._id)}
                    >
                      Approve & Verify
                    </PremiumButton>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard className="text-center py-8 text-xs text-text-muted">
            ✅ Verification Queue Clear! No pending worker applications right now.
          </GlassCard>
        )}
      </div>

      {/* Detail Modal */}
      {selectedWorker && (
        <Modal
          isOpen={!!selectedWorker}
          onClose={() => setSelectedWorker(null)}
          title={`Review Worker: ${selectedWorker.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-xl">
               <div><span className="font-semibold text-text-primary">Profession:</span> {selectedWorker.profession}</div>
               <div><span className="font-semibold text-text-primary">Experience:</span> {selectedWorker.experience} years</div>
               <div><span className="font-semibold text-text-primary">Email:</span> {selectedWorker.email}</div>
               <div><span className="font-semibold text-text-primary">Phone:</span> {selectedWorker.phone}</div>
            </div>

            {selectedWorker.identityProof && (
              <div>
                <span className="font-semibold text-text-primary block mb-1">Identity Proof Document:</span>
                <img src={selectedWorker.identityProof} alt="ID Proof" className="max-h-60 w-full object-contain rounded-xl border border-gray-200 shadow-inner bg-white" />
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 flex justify-end gap-2">
              <PremiumButton variant="danger" size="sm" onClick={() => handleRejectWorker(selectedWorker._id)}>
                Reject Application
              </PremiumButton>
              <PremiumButton variant="gold" size="sm" onClick={() => handleApproveWorker(selectedWorker._id)}>
                Approve & Activate
              </PremiumButton>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
