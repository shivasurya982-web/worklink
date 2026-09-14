import { getImageUrl, handleImageError, DEFAULT_AVATAR, DEFAULT_COVER } from '../../utils/imageUtils';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, CheckSquare, ShieldCheck, Calendar, AlertCircle, Check, X, Eye, RefreshCw, Download } from 'lucide-react';
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <GlassCard className="flex items-center gap-6 p-6 md:p-8 !bg-background-card border-border-primary/40 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent-orange/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-accent-orange/10 transition-all" />
          <div className="w-16 h-16 rounded-[1.5rem] bg-background-widget text-accent-bright flex items-center justify-center shrink-0 border border-white/5 shadow-2xl group-hover:bg-accent-orange group-hover:text-white transition-all duration-500">
            <Users className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <div className="text-3xl md:text-4xl font-sora font-black text-white tracking-tighter">
              {stats?.totalCustomers || 0}
            </div>
            <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-1">Total Customers</div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-6 p-6 md:p-8 !bg-background-card border-border-primary/40 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent-green/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-accent-green/10 transition-all" />
          <div className="w-16 h-16 rounded-[1.5rem] bg-background-widget text-accent-green flex items-center justify-center shrink-0 border border-white/5 shadow-2xl group-hover:bg-accent-green group-hover:text-white transition-all duration-500">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <div className="text-3xl md:text-4xl font-sora font-black text-white tracking-tighter">
              {stats?.totalWorkers || 0}
            </div>
            <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-1">Approved Workers</div>
          </div>
        </GlassCard>

        <GlassCard className="flex items-center gap-6 p-6 md:p-8 !bg-background-card border-border-primary/40 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-accent-orange/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-accent-orange/10 transition-all" />
          <div className="w-16 h-16 rounded-[1.5rem] bg-background-widget text-accent-bright flex items-center justify-center shrink-0 border border-white/5 shadow-2xl group-hover:bg-accent-bright group-hover:text-white transition-all duration-500">
            <CheckSquare className="w-8 h-8" />
          </div>
          <div className="min-w-0">
            <div className="text-3xl md:text-4xl font-sora font-black text-white tracking-tighter">
              {stats?.pendingWorkers || pendingWorkers.length}
            </div>
            <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-1">Waiting for Approval</div>
          </div>
        </GlassCard>
      </div>

      {/* Verification Queue */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8 px-2">
          <h3 className="font-sora font-black text-2xl text-white flex items-center gap-4 tracking-tight uppercase">
            <CheckSquare className="w-8 h-8 text-accent-bright" /> New Worker Applications ({pendingWorkers.length})
          </h3>
          <button
            onClick={fetchAdminData}
            className="flex items-center gap-2 px-5 py-2.5 bg-background-widget border border-white/5 rounded-xl text-[10px] font-black text-white hover:bg-background-secondary transition-all shadow-lg uppercase tracking-widest"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-accent-bright ${loading ? 'animate-spin' : ''}`} /> Refresh Apps
          </button>
        </div>

        {loading ? (
           <div className="flex justify-center py-20">
             <div className="animate-spin rounded-full h-10 w-10 border-2 border-accent-bright border-t-transparent shadow-orange" />
           </div>
        ) : pendingWorkers.length > 0 ? (
          <div className="space-y-6">
            {pendingWorkers.map((worker) => (
              <GlassCard key={worker._id} hover={false} className="p-6 sm:p-8 !bg-background-card border-border-primary/40 shadow-2xl group">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <img
                      src={getImageUrl(worker.avatar, DEFAULT_AVATAR(worker.name))} onError={(e) => handleImageError(e, DEFAULT_AVATAR(worker.name))}
                      alt={worker.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] object-cover border-2 border-accent-main shadow-2xl group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="min-w-0">
                      <h4 className="font-sora font-black text-xl text-white flex items-center gap-3 uppercase tracking-tighter">
                        {worker.name}
                        <Badge variant="warning" size="xs">
                          Pending
                        </Badge>
                      </h4>
                      <div className="flex flex-wrap items-center gap-5 mt-3">
                        <p className="text-[10px] font-black text-accent-light uppercase tracking-widest bg-background-widget/40 px-3 py-1.5 rounded-lg border border-white/5">
                          {worker.profession}
                        </p>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                          Phone: {worker.phone}
                        </p>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                          Exp: {worker.experience} Years
                        </p>
                      </div>
                      <p className="text-[10px] text-text-muted font-bold mt-3 opacity-60 uppercase tracking-tighter">
                        Email: {worker.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 self-end lg:self-center">
                    <button
                      onClick={() => setSelectedWorker(worker)}
                      className="px-6 py-3.5 rounded-2xl bg-background-widget border border-white/5 text-[10px] font-black text-white hover:bg-background-secondary transition-all flex items-center gap-2.5 uppercase tracking-widest shadow-xl"
                    >
                      <Eye className="w-4 h-4 text-accent-bright" /> Review Info
                    </button>

                    <button
                      onClick={() => handleRejectWorker(worker._id)}
                      className="px-6 py-3.5 rounded-2xl bg-red-950/20 border border-red-500/20 text-[10px] font-black text-red-400 hover:bg-red-900/30 transition-all uppercase tracking-widest"
                    >
                      Reject
                    </button>

                    <PremiumButton
                      variant="gold"
                      size="sm"
                      onClick={() => handleApproveWorker(worker._id)}
                      className="px-8 !rounded-xl shadow-orange"
                    >
                      Approve
                    </PremiumButton>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-background-cardSecondary/40 rounded-[3rem] border-2 border-dashed border-border-primary/20">
             <div className="w-20 h-20 bg-background-dark rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/5">
                <CheckSquare className="w-10 h-10 text-accent-green opacity-20" />
             </div>
             <p className="text-xs font-black text-text-muted uppercase tracking-[0.4em]">NO NEW APPLICATIONS TO REVIEW.</p>
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
          <div className="space-y-8 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-background-dark/50 rounded-[2rem] border border-white/5 shadow-inner">
               <div className="space-y-1"><p className="text-[9px] font-black text-accent-light uppercase tracking-widest">PROFESSION</p><p className="text-sm font-bold text-white uppercase">{selectedWorker.profession}</p></div>
               <div className="space-y-1"><p className="text-[9px] font-black text-accent-light uppercase tracking-widest">EXPERIENCE</p><p className="text-sm font-bold text-white uppercase">{selectedWorker.experience} YEARS</p></div>
               <div className="space-y-1"><p className="text-[9px) font-black text-accent-light uppercase tracking-widest">EMAIL</p><p className="text-sm font-bold text-white lowercase break-all">{selectedWorker.email}</p></div>
               <div className="space-y-1"><p className="text-[9px] font-black text-accent-light uppercase tracking-widest">PHONE</p><p className="text-sm font-bold text-white uppercase">{selectedWorker.phone}</p></div>
               <div className="space-y-1 sm:col-span-2">
                 <p className="text-[9px] font-black text-accent-light uppercase tracking-widest">ADDRESS</p>
                 <p className="text-sm font-bold text-white uppercase leading-relaxed">
                   {selectedWorker.address?.street}, {selectedWorker.address?.city}, {selectedWorker.address?.state} , PIN: {selectedWorker.address?.zip}
                 </p>
               </div>
            </div>

            {selectedWorker.description && (
              <div className="space-y-3">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] block ml-2">Bio / Description:</span>
                <p className="p-6 bg-background-dark/30 rounded-[2rem] text-sm text-text-secondary leading-relaxed font-bold italic opacity-90 border border-white/5 shadow-inner">"{selectedWorker.description}"</p>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] block">Verification Document:</span>
                {selectedWorker.identityProof && (
                  <a
                    href={selectedWorker.identityProof}
                    download={`verification_${selectedWorker.name}.jpg`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] font-black text-accent-bright hover:text-white transition-colors flex items-center gap-1.5 uppercase tracking-widest"
                  >
                    <Download className="w-3.5 h-3.5" /> Download ID
                  </a>
                )}
              </div>
              {selectedWorker.identityProof ? (
                <div className="relative group rounded-[2.5rem] overflow-hidden border-2 border-border-primary/30 shadow-2xl bg-background-dark p-2">
                   <img
                    src={getImageUrl(selectedWorker.identityProof)}
                    alt="ID Proof"
                    className="max-h-80 w-full object-contain rounded-[2rem] transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      if (!e.target.src.includes('placehold.co')) {
                        e.target.src = `https://placehold.co/600x400/080808/F4510B?text=IMAGE+NOT+FOUND`;
                      }
                    }}
                   />
                   <div className="absolute inset-0 bg-accent-orange/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              ) : (
                <div className="p-10 bg-background-dark/30 rounded-[2.5rem] border-2 border-dashed border-white/5 text-center">
                   <AlertCircle className="w-10 h-10 text-accent-orange mx-auto mb-4 opacity-40" />
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-relaxed">No verification image recorded in database.<br/>Worker may need to re-register.</p>
                </div>
              )}
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4">
              <PremiumButton variant="danger" size="lg" fullWidth onClick={() => handleRejectWorker(selectedWorker._id)} className="py-4 font-black">
                REJECT WORKER
              </PremiumButton>
              <PremiumButton variant="gold" size="lg" fullWidth onClick={() => handleApproveWorker(selectedWorker._id)} className="py-4 shadow-orange font-black">
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
