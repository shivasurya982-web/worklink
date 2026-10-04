import { getImageUrl, handleImageError, DEFAULT_AVATAR } from '../../utils/imageUtils';
import React, { useState, useEffect } from 'react';
import { Users, CheckSquare, ShieldCheck, Eye, RefreshCw, Download } from 'lucide-react';
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
        showToast('Worker Approved!', 'The worker can now take jobs.', 'success');
        setPendingWorkers((prev) => prev.filter((w) => w._id !== workerId));
        setSelectedWorker(null);
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleRejectWorker = async (workerId) => {
    const reason = prompt('Why are you rejecting this worker?') || 'Documents missing';
    try {
      const res = await API.put(`/admin/workers/${workerId}/reject`, { reason });
      if (res.success) {
        showToast('Rejected', 'Notification sent to the worker.', 'info');
        setPendingWorkers((prev) => prev.filter((w) => w._id !== workerId));
        setSelectedWorker(null);
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <DashboardLayout
      title="Admin Panel"
      subtitle="Manage users, workers, and website settings"
    >
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <GlassCard className="flex items-center gap-5 p-6 !bg-white/80 border border-white/75 shadow-xs relative overflow-hidden group">
          <div className="w-14 h-14 rounded-2xl bg-orange-50/80 text-accent-main flex items-center justify-center shrink-0 border border-orange-100/80 shadow-xs group-hover:bg-accent-main group-hover:text-white transition-all">
            <Users className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="text-3xl font-sora font-black text-text-primary tracking-tight">
              {stats?.totalCustomers || 0}
            </div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Total Customers</div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-5 p-6 !bg-white/80 border border-white/60 shadow-xs relative overflow-hidden group">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 shadow-xs group-hover:bg-emerald-600 group-hover:text-white transition-all">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="text-3xl font-sora font-black text-text-primary tracking-tight">
              {stats?.totalWorkers || 0}
            </div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Approved Workers</div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-5 p-6 !bg-white/80 border border-white/60 shadow-xs relative overflow-hidden group">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 shadow-xs group-hover:bg-amber-500 group-hover:text-white transition-all">
            <CheckSquare className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <div className="text-3xl font-sora font-black text-text-primary tracking-tight">
              {stats?.pendingWorkers || pendingWorkers.length}
            </div>
            <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">Waiting for Approval</div>
          </div>
        </GlassCard>
      </div>

      {/* Verification Queue */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6 px-1">
          <h3 className="font-sora font-black text-xl text-text-primary flex items-center gap-3 tracking-tight uppercase">
            <CheckSquare className="w-6 h-6 text-accent-main" /> New Worker Applications ({pendingWorkers.length})
          </h3>
          <button
            onClick={fetchAdminData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-[10px] font-black text-text-primary hover:bg-gray-100 transition-all shadow-xs uppercase tracking-wider cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-accent-main ${loading ? 'animate-spin' : ''}`} /> Refresh Apps
          </button>
        </div>

        {loading ? (
           <div className="flex justify-center py-20">
             <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-main border-t-transparent" />
           </div>
        ) : pendingWorkers.length > 0 ? (
          <div className="space-y-4">
            {pendingWorkers.map((worker) => (
              <GlassCard key={worker._id} hover={false} className="p-6 !bg-white/80 border border-white/60 shadow-xs group">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <img
                      src={getImageUrl(worker.avatar, DEFAULT_AVATAR(worker.name))} onError={(e) => handleImageError(e, DEFAULT_AVATAR(worker.name))}
                      alt={worker.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-accent-main shadow-xs"
                    />
                    <div className="min-w-0">
                      <h4 className="font-sora font-black text-lg text-text-primary flex items-center gap-3 uppercase tracking-tight">
                        {worker.name}
                        <Badge variant="warning" size="xs">
                          Pending
                        </Badge>
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-2">
                        <p className="text-[10px] font-bold text-accent-main uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                          {worker.profession}
                        </p>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                          Phone: {worker.phone}
                        </p>
                        <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                          Exp: {worker.experience} Years
                        </p>
                      </div>
                      <p className="text-[10px] text-text-muted font-bold mt-2 uppercase tracking-wider">
                        Email: {worker.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
                    <button
                      onClick={() => setSelectedWorker(worker)}
                      className="px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-[10px] font-black text-text-primary hover:bg-gray-100 transition-all flex items-center gap-2 uppercase tracking-wider shadow-xs cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-accent-main" /> Review Info
                    </button>

                    <button
                      onClick={() => handleRejectWorker(worker._id)}
                      className="px-5 py-2.5 rounded-xl bg-red-50 border border-red-200 text-[10px] font-black text-red-600 hover:bg-red-100 transition-all uppercase tracking-wider cursor-pointer"
                    >
                      Reject
                    </button>

                    <PremiumButton
                      variant="gold"
                      size="sm"
                      onClick={() => handleApproveWorker(worker._id)}
                      className="px-6 !rounded-xl"
                    >
                      Approve
                    </PremiumButton>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/60 rounded-[2.5rem] border-2 border-dashed border-gray-200">
             <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <CheckSquare className="w-8 h-8 text-emerald-600" />
             </div>
             <p className="text-xs font-bold text-text-muted uppercase tracking-wider">NO NEW APPLICATIONS TO REVIEW.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedWorker && (
        <Modal
          isOpen={!!selectedWorker}
          onClose={() => setSelectedWorker(null)}
          title={`Review Worker: ${selectedWorker.name}`}
        >
          <div className="space-y-6 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
               <div className="space-y-1"><p className="text-[9px] font-black text-accent-main uppercase tracking-wider">PROFESSION</p><p className="text-xs font-bold text-text-primary uppercase">{selectedWorker.profession}</p></div>
               <div className="space-y-1"><p className="text-[9px] font-black text-accent-main uppercase tracking-wider">EXPERIENCE</p><p className="text-xs font-bold text-text-primary uppercase">{selectedWorker.experience} YEARS</p></div>
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
              <PremiumButton variant="danger" size="lg" fullWidth onClick={() => handleRejectWorker(selectedWorker._id)} className="py-3.5 font-black">
                REJECT WORKER
              </PremiumButton>
              <PremiumButton variant="gold" size="lg" fullWidth onClick={() => handleApproveWorker(selectedWorker._id)} className="py-3.5 font-black">
                APPROVE WORKER
              </PremiumButton>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
