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
        showToast('Worker Approved!', 'Node initialized and active.', 'success');
        setPendingWorkers((prev) => prev.filter((w) => w._id !== workerId));
        setSelectedWorker(null);
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  const handleRejectWorker = async (workerId) => {
    const reason = prompt('Enter rejection reason:') || 'Parameters do not meet standards';
    try {
      const res = await API.put(`/admin/workers/${workerId}/reject`, { reason });
      if (res.success) {
        showToast('Application Terminated', 'Notification sent to node.', 'info');
        setPendingWorkers((prev) => prev.filter((w) => w._id !== workerId));
        setSelectedWorker(null);
      }
    } catch (err) {
      showToast('Error', err.message, 'error');
    }
  };

  return (
    <DashboardLayout
      title="Control Center"
      subtitle="Total ecosystem administration and terminal monitoring"
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
            <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-1">Total Consumers</div>
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
            <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-1">Verified Nodes</div>
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
            <div className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mt-1">Verification Queue</div>
          </div>
        </GlassCard>
      </div>

      {/* Verification Queue */}
      <div className="mb-16">
        <div className="flex items-center justify-between mb-8 px-2">
          <h3 className="font-sora font-black text-2xl text-white flex items-center gap-4 tracking-tight">
            <CheckSquare className="w-8 h-8 text-accent-bright" /> APPROVAL PROTOCOL ({pendingWorkers.length})
          </h3>
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
                      src={worker.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=F4510B&color=fff`}
                      alt={worker.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.5rem] object-cover border-2 border-accent-main shadow-2xl group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="min-w-0">
                      <h4 className="font-sora font-black text-xl text-white flex items-center gap-3 uppercase tracking-tighter">
                        {worker.name}
                        <Badge variant="warning" size="xs">
                          Pending Audit
                        </Badge>
                      </h4>
                      <div className="flex flex-wrap items-center gap-5 mt-3">
                        <p className="text-[10px] font-black text-accent-light uppercase tracking-widest bg-background-widget/40 px-3 py-1.5 rounded-lg border border-white/5">
                          Module: {worker.profession}
                        </p>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                          Contact: {worker.phone}
                        </p>
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                          Exp: {worker.experience} Cycles
                        </p>
                      </div>
                      <p className="text-[10px] text-text-muted font-bold mt-3 opacity-60 uppercase tracking-tighter">
                        System ID: {worker.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 self-end lg:self-center">
                    <button
                      onClick={() => setSelectedWorker(worker)}
                      className="px-6 py-3.5 rounded-2xl bg-background-widget border border-white/5 text-[10px] font-black text-white hover:bg-background-secondary transition-all flex items-center gap-2.5 uppercase tracking-widest shadow-xl"
                    >
                      <Eye className="w-4 h-4 text-accent-bright" /> Review Node
                    </button>

                    <PremiumButton
                      variant="danger"
                      size="sm"
                      onClick={() => handleRejectWorker(worker._id)}
                      className="px-6 !rounded-xl"
                    >
                      Purge
                    </PremiumButton>

                    <PremiumButton
                      variant="gold"
                      size="sm"
                      onClick={() => handleApproveWorker(worker._id)}
                      className="px-8 !rounded-xl shadow-orange"
                    >
                      Authorize
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
             <p className="text-xs font-black text-text-muted uppercase tracking-[0.4em]">QUERIES PROCESSED. QUEUE CLEAR.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedWorker && (
        <Modal
          isOpen={!!selectedWorker}
          onClose={() => setSelectedWorker(null)}
          title={`NODE AUDIT: ${selectedWorker.name}`}
        >
          <div className="space-y-8 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-background-dark/50 rounded-[2rem] border border-white/5 shadow-inner">
               <div className="space-y-1"><p className="text-[9px] font-black text-accent-light uppercase tracking-widest">DOMAIN</p><p className="text-sm font-bold text-white uppercase">{selectedWorker.profession}</p></div>
               <div className="space-y-1"><p className="text-[9px] font-black text-accent-light uppercase tracking-widest">CYCLES</p><p className="text-sm font-bold text-white uppercase">{selectedWorker.experience} YEARS</p></div>
               <div className="space-y-1"><p className="text-[9px] font-black text-accent-light uppercase tracking-widest">IDENTIFIER</p><p className="text-sm font-bold text-white lowercase">{selectedWorker.email}</p></div>
               <div className="space-y-1"><p className="text-[9px] font-black text-accent-light uppercase tracking-widest">COMMS</p><p className="text-sm font-bold text-white uppercase">{selectedWorker.phone}</p></div>
            </div>

            {selectedWorker.identityProof && (
              <div className="space-y-3">
                <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] block ml-2">Verification Artifact:</span>
                <div className="relative group rounded-[2.5rem] overflow-hidden border-2 border-border-primary/30 shadow-2xl bg-background-dark p-2">
                   <img src={selectedWorker.identityProof} alt="ID Proof" className="max-h-80 w-full object-contain rounded-[2rem] transition-transform duration-700 group-hover:scale-105" />
                   <div className="absolute inset-0 bg-accent-orange/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
              </div>
            )}

            <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4">
              <PremiumButton variant="danger" size="lg" fullWidth onClick={() => handleRejectWorker(selectedWorker._id)} className="py-4">
                TERMINATE APPLICATION
              </PremiumButton>
              <PremiumButton variant="gold" size="lg" fullWidth onClick={() => handleApproveWorker(selectedWorker._id)} className="py-4 shadow-orange">
                AUTHORIZE NODE
              </PremiumButton>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
