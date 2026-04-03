import { CreditCardIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from '@remix-run/react';
import { OutletContext } from '~/types';

type EasebuzzPaymentsProps = {
  orderCode: string;
  amount: number; // in paise
  description: string;
  name: string;
  email: string;
  paymentError: string | undefined;
};

export function EasebuzzPayments({
  orderCode,
  amount,
  description,
  name,
  email,
  paymentError,
}: EasebuzzPaymentsProps) {
  const { activeOrderFetcher, activeOrder } = useOutletContext<OutletContext>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [easebuzzError, setEasebuzzError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsLoading(true);
    setEasebuzzError(null);
    try {
      const formData = new FormData();
      formData.append('paymentMethodCode', 'easebuzz');
      formData.append('action', 'addPaymentToOrder');
      formData.append('orderCode', orderCode);
      formData.append('amount', amount.toString());
      formData.append('description', description);
      formData.append('name', name);
      formData.append('email', email);
      activeOrderFetcher.submit(formData, {
        method: 'post',
        action: '/api/active-order',
      });
    } catch (err) {
      console.error('Error initializing Easebuzz:', err);
      setEasebuzzError('Failed to initialize payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeOrder?.__typename === 'Order') {
      const easebuzzData = activeOrder.payments?.find(
        (item) => item.method === 'easebuzz',
      );
      if (easebuzzData && easebuzzData.state === 'Authorized') {
        const easebuzzToken = easebuzzData.customFields?.easebuzzToken;
        if (easebuzzToken) {
          window.location.href = `https://pay.easebuzz.in/pay/${easebuzzToken}`;
          // openEasebuzzPayment(easebuzzToken, activeOrder.code);
        }
      }
    }
  }, [activeOrder]);

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mt-4">
      <div className="flex items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          {'Complete Payment'}
        </h2>
      </div>

      {isLoading && (
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
            {t ? t('checkout.loadingEasebuzz') : 'Loading Easebuzz...'}
          </p>
        </div>
      )}
      {easebuzzError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3">
          <p className="font-semibold">
            {t ? t('checkout.errorLoadingEasebuzz') : 'Error loading Razorpay:'}
          </p>
          <p className="text-sm">{easebuzzError}</p>
        </div>
      )}
      {paymentError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3">
          <p className="font-semibold">Payment Error:</p>
          <p className="text-sm">{paymentError}</p>
        </div>
      )}
      <button
        disabled={isLoading || !!easebuzzError}
        onClick={handlePayment}
        className={`flex w-full max-w-xl px-8 items-center justify-center space-x-2 py-4 my-4 border border-transparent text-lg font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition
          ${
            isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        style={{ minWidth: '320px' }}
      >
        <CreditCardIcon className="w-6 h-6" />
        <span>{`Pay with Easebuzz`}</span>
      </button>
    </div>
  );
}
