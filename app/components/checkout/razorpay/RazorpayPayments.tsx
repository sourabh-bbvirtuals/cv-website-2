import { useRazorpay, RazorpayOrderOptions } from 'react-razorpay';
import { CreditCardIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useNavigate, useSubmit } from '@remix-run/react';

type RazorpayPaymentsProps = {
  orderCode: string;
  amount: number; // in paise
  description: string;
  name: string;
  email: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
};

export function RazorpayPayments({
  orderCode,
  amount,
  description,
  name,
  email,
  razorpayOrderId,
  razorpayKeyId,
}: RazorpayPaymentsProps) {
  const { error, isLoading, Razorpay } = useRazorpay();
  const { t } = useTranslation();
  const [isGeneratingOrderId, setIsGeneratingOrderId] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const navigate = useNavigate();
  const submit = useSubmit();

  const handlePaymentSuccess = async (response: any) => {
    try {
      setIsGeneratingOrderId(true);
      setPaymentError(null);

      // Log the Razorpay response
      console.log('Razorpay Response:', response);

      const formData = new FormData();
      formData.set('action', 'addPaymentToOrder');
      formData.set('paymentMethodCode', 'razorpay');
      formData.set('orderCode', orderCode);
      formData.set('paymentNonce', JSON.stringify(response));

      // Submit the form data to the action function
      submit(formData, { method: 'post' });
    } catch (err) {
      console.error('Error processing payment:', err);
      setPaymentError('Failed to process payment. Please try again.');
    } finally {
      setIsGeneratingOrderId(false);
    }
  };

  const handleManualClose = () => {
    if (window.confirm('Are you sure you want to close the payment form?')) {
      console.log('Checkout form closed by the user');
    } else {
      console.log('Complete the Payment');
    }
  };

  const handlePayment = async () => {
    try {
      setIsGeneratingOrderId(true);
      setPaymentError(null);
      const razorpayKey = razorpayKeyId || '';
      if (!razorpayKey) {
        setPaymentError('Razorpay key is not configured.');
        return;
      }
      const options: RazorpayOrderOptions = {
        key: razorpayKey,
        amount: amount,
        currency: 'INR',
        name: name,
        description: description,
        order_id: razorpayOrderId,
        handler: handlePaymentSuccess,
        prefill: {
          name: name,
          email: email,
        },
        theme: {
          color: '#F37254',
        },
        modal: {
          ondismiss: handleManualClose,
        },
      };
      const razorpayInstance = new Razorpay(options);
      razorpayInstance.on('payment.failed', (response: any) => {
        console.error('Payment failed:', response.error);
        setPaymentError('Payment failed. Please try again.');
      });
      razorpayInstance.open();
    } catch (err) {
      console.error('Error initializing Razorpay:', err);
      setPaymentError('Failed to initialize payment. Please try again.');
    } finally {
      setIsGeneratingOrderId(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mt-4">
      <div className="flex items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          {'Complete Payment'}
        </h2>
      </div>

      {(isLoading || isGeneratingOrderId) && (
        <div className="flex items-center space-x-2 my-3">
          <svg
            className="animate-spin h-5 w-5 text-indigo-600"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
          <p className="text-indigo-600">
            {t ? t('checkout.loadingRazorpay') : 'Loading Razorpay...'}
          </p>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3">
          <p className="font-semibold">
            {t ? t('checkout.errorLoadingRazorpay') : 'Error loading Razorpay:'}
          </p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      {paymentError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3">
          <p className="font-semibold">Payment Error:</p>
          <p className="text-sm">{paymentError}</p>
        </div>
      )}
      <button
        disabled={isLoading || !!error || isGeneratingOrderId}
        onClick={handlePayment}
        className={`flex w-full max-w-xl px-8 items-center justify-center space-x-2 py-4 my-4 border border-transparent text-lg font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition
          ${
            isLoading || !!error || isGeneratingOrderId
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        style={{ minWidth: '320px' }}
      >
        <CreditCardIcon className="w-6 h-6" />
        <span>{`Pay with Razorpay`}</span>
      </button>
    </div>
  );
}
