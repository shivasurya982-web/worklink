import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import GlassCard from '../../components/common/GlassCard';
import Badge from '../../components/common/Badge';
import PremiumButton from '../../components/common/PremiumButton';
import Modal from '../../components/common/Modal';
import { useNotification } from '../../context/NotificationContext';
import { ShieldAlert, Trash2, Eye, User, Mail, Phone, MapPin, Calendar, ShieldCheck } from 'lucide-react';
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
    const reason = isSuspended ? '' : prompt('Enter suspension reason:') || 'Suspended by admin';

    try {
      const res = await API.put(`/admin/customers/${customerId}/${action}`, {
        isSuspended: !isSuspended,
        reason,
      });

      if (res.success) {
        showToast('Customer Status Updated', `Customer has been ${isSuspended ? 'activated' : 'suspended'}.`, 'success');
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
    if (!window.confirm('Are you sure you want to permanently delete this customer account?')) return;

    try {
      const res = await API.delete(`/admin/customers/${customerId}`);
      if (res.success) {
        showToast('Customer Deleted', 'Customer account removed permanently.', 'info');
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
      subtitle="View, suspend, reactivate, or delete customer accounts"
    >
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-gold border-t-transparent" />
        </div>
      ) : customers.length > 0 ? (
        <div className="space-y-4">
          {customers.map((c) => (
            <GlassCard key={c._id} hover={false} className="p-5 border border-gray-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={c.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=D4AF37&color=fff`}
                    alt={c.name}
                    className="w-12 h-12 rounded-full object-cover border border-accent-blue/30"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                      {c.name}
                      <Badge
                        variant={c.isSuspended ? 'danger' : 'success'}
                        size="xs"
                      >
                        {c.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                      </Badge>
                    </h4>
                    <p className="text-xs text-text-muted">
                      Email: {c.email} | Phone: {c.phone || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <PremiumButton
                    variant="outline"
                    size="sm"
                    icon={Eye}
                    onClick={() => openViewModal(c)}
                  >
                    View Details
                  </PremiumButton>

                  <PremiumButton
                    variant={c.isSuspended ? 'gold' : 'outline'}
                    size="sm"
                    icon={ShieldAlert}
                    onClick={() => handleSuspendCustomer(c._id, c.isSuspended)}
                  >
                    {c.isSuspended ? 'Reactivate' : 'Suspend'}
                  </PremiumButton>

                  <PremiumButton
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleDeleteCustomer(c._id)}
                  >
                    Delete
                  </PremiumButton>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <GlassCard className="text-center py-12 text-xs text-text-muted">
          No customers registered on the platform yet.
        </GlassCard>
      )}

      {/* View Customer Details Modal */}
      {viewModalOpen && selectedCustomer && (
        <Modal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title="Customer Profile Details"
        >
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center pb-6 border-b border-gray-100">
               <img
                 src={selectedCustomer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCustomer.name)}&background=D4AF37&color=fff`}
                 className="w-24 h-24 rounded-full border-4 border-accent-gold/20 shadow-lg mb-3 object-cover"
               />
               <h3 className="font-sora font-bold text-lg text-text-primary">{selectedCustomer.name}</h3>
               <Badge variant={selectedCustomer.isSuspended ? 'danger' : 'success'} size="xs" className="mt-1">
                  {selectedCustomer.isSuspended ? 'Account Suspended' : 'Account Active'}
               </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-2xl flex items-start gap-3">
                 <Mail className="w-4 h-4 text-accent-gold mt-0.5" />
                 <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase">Email Address</p>
                    <p className="text-xs font-semibold text-text-primary">{selectedCustomer.email}</p>
                 </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl flex items-start gap-3">
                 <Phone className="w-4 h-4 text-accent-gold mt-0.5" />
                 <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase">Phone Number</p>
                    <p className="text-xs font-semibold text-text-primary">{selectedCustomer.phone || 'Not provided'}</p>
                 </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl flex items-start gap-3 sm:col-span-2">
                 <MapPin className="w-4 h-4 text-accent-gold mt-0.5" />
                 <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase">Full Address</p>
                    <p className="text-xs font-semibold text-text-primary">
                       {selectedCustomer.address?.street}, {selectedCustomer.address?.city}, {selectedCustomer.address?.state} - {selectedCustomer.address?.zip}
                    </p>
                 </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl flex items-start gap-3">
                 <Calendar className="w-4 h-4 text-accent-gold mt-0.5" />
                 <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase">Registered On</p>
                    <p className="text-xs font-semibold text-text-primary">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
                 </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl flex items-start gap-3">
                 <ShieldCheck className="w-4 h-4 text-accent-gold mt-0.5" />
                 <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase">Security Hint</p>
                    <p className="text-xs font-semibold text-text-primary italic">"{selectedCustomer.securityHint || 'None set'}"</p>
                 </div>
              </div>
            </div>

            {selectedCustomer.isSuspended && selectedCustomer.suspendReason && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                 <p className="text-[10px] font-bold text-accent-red uppercase mb-1">Reason for Suspension</p>
                 <p className="text-xs text-text-primary italic leading-relaxed">"{selectedCustomer.suspendReason}"</p>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-gray-100">
               <PremiumButton
                 variant={selectedCustomer.isSuspended ? 'gold' : 'outline'}
                 fullWidth
                 onClick={() => handleSuspendCustomer(selectedCustomer._id, selectedCustomer.isSuspended)}
               >
                 {selectedCustomer.isSuspended ? 'Reactivate User' : 'Suspend User'}
               </PremiumButton>
               <PremiumButton
                 variant="danger"
                 fullWidth
                 onClick={() => handleDeleteCustomer(selectedCustomer._id)}
               >
                 Delete User
               </PremiumButton>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default AdminCustomers;
