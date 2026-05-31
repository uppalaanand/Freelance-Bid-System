import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { 
  HiCreditCard, 
  HiCheckCircle, 
  HiClock, 
  HiLockClosed, 
  HiXCircle, 
  HiUser, 
  HiOfficeBuilding, 
  HiCurrencyDollar,
  HiPhone,
  HiLocationMarker
} from 'react-icons/hi';
import { createOrder, verifyPayment, releasePayment } from '../redux/slices/paymentSlice';
import { Card, Button, Badge, Input } from './common';
import { formatCurrency } from '../utils/helpers';

// 1. PaymentStatus Component
export const PaymentStatus = ({ status }) => {
  let variant = 'default';
  let label = status;

  switch (status) {
    case 'paid':
    case 'completed':
      variant = 'warning';
      label = 'In Escrow';
      break;
    case 'released':
      variant = 'success';
      label = 'Released';
      break;
    case 'failed':
      variant = 'danger';
      label = 'Failed';
      break;
    case 'pending':
    default:
      variant = 'primary';
      label = 'Pending';
      break;
  }

  return (
    <Badge variant={variant} className="capitalize py-1 px-2.5 font-bold tracking-wide">
      {label}
    </Badge>
  );
};

// Helper function to dynamically load Razorpay script
const loadRazorpaySDK = () => {
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

// 2. PaymentButton Component (Razorpay integration)
export const PaymentButton = ({ 
  projectId, 
  milestoneId = null, 
  amount, 
  type = 'advance', 
  label = 'Pay Now', 
  onSuccess = () => {},
  className = ''
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    const scriptLoaded = await loadRazorpaySDK();
    if (!scriptLoaded) {
      alert('Razorpay SDK failed to load. Please check your internet connection.');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create order on the backend
      const orderAction = await dispatch(
        createOrder({
          projectId,
          milestoneId: milestoneId || undefined,
          amount,
          type
        })
      ).unwrap();

      if (orderAction && orderAction.order) {
        const order = orderAction.order;
        const paymentRecord = orderAction.payment;

        // 2. Configure Razorpay checkout options
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SvrsSBcek3CXY1',
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'StudentBid Portal',
          description: type === 'advance' ? 'Advance Payment' : 'Milestone Payment',
          order_id: order.id,
          handler: async (response) => {
            setIsProcessing(true);
            try {
              // 3. Verify payment signature on the backend
              const verificationPayload = {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentId: paymentRecord._id,
                milestoneId: milestoneId || undefined,
                projectId
              };

              await dispatch(verifyPayment(verificationPayload)).unwrap();
              alert('Payment successful and escrow updated!');
              onSuccess();
            } catch (err) {
              console.error('Payment verification failed:', err);
              alert(err || 'Failed to verify payment.');
            } finally {
              setIsProcessing(false);
            }
          },
          prefill: {
            name: user?.fullName,
            email: user?.email,
            contact: user?.phone || '',
          },
          theme: {
            color: '#4f46e5',
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
            }
          }
        };

        const razorpayInstance = new window.Razorpay(options);
        razorpayInstance.open();
      }
    } catch (err) {
      console.error('Failed to create payment order:', err);
      alert(err || 'Failed to initiate payment.');
      setIsProcessing(false);
    }
  };

  return (
    <Button 
      variant="primary" 
      onClick={handlePayment} 
      isLoading={isProcessing}
      className={className}
    >
      {label}
    </Button>
  );
};

// 3. PaymentCard Component
export const PaymentCard = ({ project, payment, onPaymentSuccess }) => {
  const isPaid = payment && (payment.status === 'paid' || payment.status === 'released');
  const amountToPay = project.budget?.min || 1000; // fallback to min budget

  return (
    <Card className="border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">{project.title}</h3>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <HiUser className="h-3.5 w-3.5 text-slate-400" />
            Assigned Student: <span className="font-semibold text-slate-700">{project.assignedStudent?.fullName || 'Assigned Student'}</span>
          </p>
          <div className="flex items-center gap-4 mt-2">
            <div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Project Budget</p>
              <p className="text-sm font-bold text-slate-800">
                {project.budget ? `${formatCurrency(project.budget.min)} - ${formatCurrency(project.budget.max)}` : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">Advance Status</p>
              <div className="mt-0.5">
                {isPaid ? (
                  <Badge variant="success" className="flex items-center gap-1 font-bold">
                    <HiCheckCircle className="h-3.5 w-3.5" /> Paid
                  </Badge>
                ) : (
                  <Badge variant="warning" className="flex items-center gap-1 font-bold">
                    <HiClock className="h-3.5 w-3.5" /> Pending
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 min-w-[150px]">
          {isPaid ? (
            <div className="text-right">
              <span className="text-xs font-semibold text-emerald-600 block">Payment Completed</span>
              <span className="text-[10px] text-slate-400">{payment.razorpayPaymentId ? `ID: ${payment.razorpayPaymentId}` : 'Escrow'}</span>
            </div>
          ) : (
            <PaymentButton 
              projectId={project._id}
              amount={amountToPay}
              type="advance"
              label="Pay Advance"
              onSuccess={onPaymentSuccess}
              className="w-full sm:w-auto"
            />
          )}
        </div>
      </div>
    </Card>
  );
};

// 4. PaymentHistory Component
export const PaymentHistory = ({ payments, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 bg-white border border-slate-200 rounded-xl">
        <HiCreditCard className="mx-auto h-12 w-12 text-slate-300 mb-3" />
        <p className="font-semibold text-slate-800">No transactions recorded</p>
        <p className="text-xs">Any billing logs, deposits, or payouts will be displayed here.</p>
      </div>
    );
  }

  return (
    <Card className="overflow-x-auto !p-0 border border-slate-250 shadow-sm">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold tracking-wide">
            <th className="p-4">Project</th>
            <th className="p-4">Type</th>
            <th className="p-4">Amount</th>
            <th className="p-4">Transaction ID</th>
            <th className="p-4">Status</th>
            <th className="p-4">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {payments.map((payment) => (
            <tr key={payment._id} className="hover:bg-slate-50/50 transition-colors">
              <td className="p-4">
                <span className="font-semibold text-slate-800 block truncate max-w-xs">
                  {payment.project?.title || 'Project Details'}
                </span>
              </td>
              <td className="p-4 capitalize">
                <Badge variant={payment.type === 'advance' ? 'info' : 'primary'} className="text-[10px]">
                  {payment.type}
                </Badge>
              </td>
              <td className="p-4 font-bold text-indigo-650">{formatCurrency(payment.amount)}</td>
              <td className="p-4 font-mono text-xs text-slate-400">
                {payment.razorpayPaymentId || 'Escrow Hold'}
              </td>
              <td className="p-4">
                <PaymentStatus status={payment.status} />
              </td>
              <td className="p-4 text-xs text-slate-400">
                {new Date(payment.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
};

// 5. PaymentDetailsForm Component
export const PaymentDetailsForm = ({ userId }) => {
  const [successMsg, setSuccessMsg] = useState('');
  const storageKey = `student_payment_details_${userId}`;

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: JSON.parse(localStorage.getItem(storageKey)) || {
      holderName: '',
      accountNumber: '',
      bankName: '',
      ifscCode: '',
      upiId: '',
      contactPhone: ''
    }
  });

  const onSubmit = (data) => {
    localStorage.setItem(storageKey, JSON.stringify(data));
    setSuccessMsg('Payment details saved successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <Card className="border border-slate-205">
      <div className="border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
        <HiCreditCard className="h-5 w-5 text-indigo-600" />
        <h3 className="text-lg font-bold text-slate-800">Your Bank Payout Details</h3>
      </div>
      <p className="text-xs text-slate-500 mb-6">
        Please configure your bank details so that the platform can release payments directly into your account.
      </p>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
          <HiCheckCircle className="h-5 w-5" /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Account Holder Name" 
            placeholder="John Doe"
            error={errors.holderName?.message}
            {...register('holderName', { required: 'Account holder name is required' })}
          />
          <Input 
            label="Bank Account Number" 
            placeholder="123456789012"
            error={errors.accountNumber?.message}
            {...register('accountNumber', { required: 'Account number is required' })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="Bank Name" 
            placeholder="State Bank of India"
            error={errors.bankName?.message}
            {...register('bankName', { required: 'Bank name is required' })}
          />
          <Input 
            label="IFSC Code" 
            placeholder="SBIN0001234"
            error={errors.ifscCode?.message}
            {...register('ifscCode', { 
              required: 'IFSC code is required',
              pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: 'Invalid IFSC format' }
            })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            label="UPI ID (Optional)" 
            placeholder="john@okaxis"
            error={errors.upiId?.message}
            {...register('upiId')}
          />
          <Input 
            label="Contact Details (Phone)" 
            placeholder="9876543210"
            error={errors.contactPhone?.message}
            {...register('contactPhone', { required: 'Contact phone number is required' })}
          />
        </div>

        <Button type="submit" variant="primary" fullWidth className="mt-4">
          Save Payment Details
        </Button>
      </form>
    </Card>
  );
};
