import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import {
  HiCreditCard,
  HiCheckCircle,
  HiLockClosed,
  HiTrendingUp,
  HiClock,
  HiCurrencyDollar,
} from 'react-icons/hi';
import {
  createOrder,
  verifyPayment,
  releasePayment,
  fetchMyEarnings,
  fetchMyPayments,
} from '../redux/slices/paymentSlice';
import { fetchMyProjects } from '../redux/slices/projectSlice';
import {
  Card,
  Button,
  Badge,
  Spinner,
  EmptyState,
  Input,
} from '../components/common';
import { formatCurrency } from '../utils/helpers';
import { PaymentDetailsForm } from '../components/PaymentComponents';

const Payments = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { payments, earnings, isLoading: isPaymentLoading } = useSelector((state) => state.payments);
  const { myProjects, isLoading: isProjectLoading } = useSelector((state) => state.projects);

  const [checkoutMilestone, setCheckoutMilestone] = useState(null);
  const [checkoutProject, setCheckoutProject] = useState(null);
  const [loadingPaymentId, setLoadingPaymentId] = useState(null);

  const isClient = user?.role === 'client';

  // React Hook Form for billing info confirmation
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: user?.email || '',
      phone: '',
    },
  });

  useEffect(() => {
    dispatch(fetchMyPayments());
    if (isClient) {
      dispatch(fetchMyProjects());
    } else {
      dispatch(fetchMyEarnings());
    }
  }, [dispatch, isClient]);

  // Load Razorpay script dynamically
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayClick = (project, milestone) => {
    setCheckoutProject(project);
    setCheckoutMilestone(milestone);
  };

  const handleRelease = async (paymentId) => {
    if (!window.confirm('Are you sure you want to release this milestone payment to the student?')) return;
    setLoadingPaymentId(paymentId);
    await dispatch(releasePayment(paymentId));
    setLoadingPaymentId(null);
    dispatch(fetchMyPayments());
    if (isClient) dispatch(fetchMyProjects());
  };

  const handleCheckoutSubmit = async (data) => {
    if (!checkoutMilestone || !checkoutProject) return;

    const scriptLoaded = await loadRazorpay();
    if (!scriptLoaded) {
      alert('Failed to load payment gateway SDK. Please check your connection.');
      return;
    }

    setLoadingPaymentId(checkoutMilestone._id);
    try {
      const orderAction = await dispatch(
        createOrder({
          projectId: checkoutProject._id,
          milestoneId: checkoutMilestone._id,
          amount: checkoutMilestone.amount,
          type: 'milestone',
        })
      );

      if (createOrder.fulfilled.match(orderAction)) {
        const order = orderAction.payload.order;
        const options = {
          key: order.key || orderAction.payload.key || 'rzp_test_placeholder',
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'StudentBid Portal',
          description: `Milestone: ${checkoutMilestone.title}`,
          order_id: order.id,
          handler: async (response) => {
            const verificationPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              milestoneId: checkoutMilestone._id,
              projectId: checkoutProject._id,
              paymentId: orderAction.payload.payment?._id,
            };

            const verificationAction = await dispatch(verifyPayment(verificationPayload));
            if (verifyPayment.fulfilled.match(verificationAction)) {
              alert('Payment Successful!');
              setCheckoutMilestone(null);
              setCheckoutProject(null);
              dispatch(fetchMyPayments());
              dispatch(fetchMyProjects());
            } else {
              alert('Payment verification failed.');
            }
          },
          prefill: {
            name: user?.name,
            email: data.email,
            contact: data.phone,
          },
          theme: {
            color: '#4f46e5',
          },
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
      } else {
        alert(orderAction.payload || 'Failed to initiate order.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during checkout.');
    } finally {
      setLoadingPaymentId(null);
    }
  };

  // Student specific computations
  const totalEarned = earnings?.totalEarnings || payments.filter(p => p.status === 'released').reduce((acc, p) => acc + p.amount, 0);
  const pendingRelease = earnings?.pendingEarnings || payments.filter(p => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
          <HiCreditCard className="text-indigo-600 h-8 w-8" /> Payment Dashboard
        </h1>
        <p className="text-slate-500 mt-2">
          Manage milestones, view transactions, and handle escrow releases.
        </p>
      </div>

      {/* STATS OVERVIEW */}
      {!isClient && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="flex items-center gap-4 border-l-4 border-emerald-500">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <HiTrendingUp className="h-8 w-8" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Earnings</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(totalEarned)}</h3>
              </div>
            </Card>

            <Card className="flex items-center gap-4 border-l-4 border-amber-500">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <HiClock className="h-8 w-8" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Release</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatCurrency(pendingRelease)}</h3>
              </div>
            </Card>

            <Card className="flex items-center gap-4 border-l-4 border-indigo-500">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <HiCurrencyDollar className="h-8 w-8" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Released Payments</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">
                  {formatCurrency(payments.filter((p) => p.status === 'released').reduce((acc, p) => acc + p.amount, 0))}
                </h3>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <PaymentDetailsForm userId={user?._id} />
          </div>
        </div>
      )}

      {/* CLIENT: MILESTONES BY PROJECT */}
      {isClient && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Project Milestones</h2>
          {isProjectLoading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : myProjects.length === 0 ? (
            <EmptyState
              icon={HiCreditCard}
              title="No projects posted"
              description="Post a project and assign students to manage milestones."
            />
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {myProjects.map((project) => {
                const milestones = project.milestones || [];
                const activePaymentForProject = payments.filter(p => p.project === project._id || p.project?._id === project._id);

                return (
                  <Card key={project._id} className="space-y-4">
                    <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800">{project.title}</h3>
                        <p className="text-xs font-medium text-indigo-600">Assigned Student: {project.assignedTo?.name || 'Unassigned'}</p>
                      </div>
                      <Badge variant={project.status === 'completed' ? 'success' : 'primary'}>
                        {project.status}
                      </Badge>
                    </div>

                    {milestones.length === 0 ? (
                      <p className="text-sm text-slate-400 italic">No milestones defined for this project.</p>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {milestones.map((milestone) => {
                          // Find matching payment record if any
                          const paymentRecord = activePaymentForProject.find(p => p.milestone === milestone._id);
                          const status = paymentRecord?.status || milestone.status || 'pending';

                          return (
                            <div key={milestone._id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div>
                                <h4 className="text-sm font-semibold text-slate-800">{milestone.title}</h4>
                                 <p className="text-xs text-slate-500">{milestone.description || 'No description provided'}</p>
                                 <span className="text-xs font-bold text-slate-700 block mt-1">{formatCurrency(milestone.amount)}</span>
                              </div>

                              <div className="flex items-center gap-3">
                                {status === 'pending' && (
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handlePayClick(project, milestone)}
                                  >
                                    Pay Now
                                  </Button>
                                )}
                                {status === 'paid' && (
                                  <div className="flex items-center gap-2">
                                    <Badge variant="warning" className="flex items-center gap-1">
                                      <HiLockClosed className="h-3 w-3" /> In Escrow
                                    </Badge>
                                    <Button
                                      variant="success"
                                      size="sm"
                                      isLoading={loadingPaymentId === paymentRecord?._id}
                                      onClick={() => handleRelease(paymentRecord._id)}
                                    >
                                      Release
                                    </Button>
                                  </div>
                                )}
                                {status === 'released' && (
                                  <Badge variant="success" className="flex items-center gap-1">
                                    <HiCheckCircle className="h-3 w-3" /> Released
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* PAYMENT HISTORY TABLE */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Transaction History</h2>
        {isPaymentLoading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : payments.length === 0 ? (
          <EmptyState
            icon={HiCreditCard}
            title="No transactions yet"
            description="All payment logs, escrow events, and releases will appear here."
          />
        ) : (
          <Card className="overflow-x-auto !p-0">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
                  <th className="p-4">Milestone</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-slate-50/80 transition-colors">
                     <td className="p-4 font-semibold text-slate-800">{payment.milestone?.title || 'Milestone Payment'}</td>
                     <td className="p-4 font-bold text-indigo-600">{formatCurrency(payment.amount)}</td>
                    <td className="p-4 font-mono text-xs text-slate-400">{payment.transactionId || 'Escrow'}</td>
                    <td className="p-4">
                      <Badge variant={payment.status === 'released' ? 'success' : payment.status === 'paid' ? 'warning' : 'danger'}>
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-xs text-slate-400">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {/* RAZORPAY BILLING CHECKOUT MODAL */}
      {checkoutMilestone && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full shadow-2xl relative">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirm Payment</h3>
             <p className="text-xs text-slate-500 mb-6">
               You are about to deposit <span className="font-bold text-indigo-600">{formatCurrency(checkoutMilestone.amount)}</span> into escrow for milestone <span className="font-bold">"{checkoutMilestone.title}"</span>.
             </p>

            <form onSubmit={handleSubmit(handleCheckoutSubmit)} className="space-y-4">
              <Input
                label="Billing Email"
                type="email"
                error={errors.email?.message}
                {...register('email', { required: 'Email is required' })}
              />
              <Input
                label="Billing Phone"
                type="tel"
                error={errors.phone?.message}
                {...register('phone', { required: 'Phone number is required' })}
              />

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                <Button
                  variant="outline"
                  onClick={() => {
                    setCheckoutMilestone(null);
                    setCheckoutProject(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={loadingPaymentId === checkoutMilestone._id}
                >
                  Proceed to Pay
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Payments;
