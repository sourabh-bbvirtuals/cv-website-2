import { useState, useEffect } from 'react';
import { useFetcher, useNavigate } from '@remix-run/react';
import Alert from '~/components/Alert';
import { useActiveOrder } from '~/utils/use-active-order';

type FetcherData = {
  error?: string;
  success?: boolean;
};

export function CouponCodeInput({ onCouponApply }: { onCouponApply: () => void }) {
  console.log('CouponCodeInput - Starting render');
  
  const [couponCode, setCouponCode] = useState('');
  const fetcher = useFetcher<FetcherData>();
  const { activeOrder, refresh, activeOrderFetcher } = useActiveOrder();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

 
  


  // Log when fetcher state changes
  useEffect(() => {
    console.log('CouponCodeInput - Fetcher state changed', {
      state: fetcher.state,
      data: fetcher.data
    });
    console.log("Navigating to checkout")
    setSuccess(true)
    onCouponApply()
  }, [fetcher.data?.success]);

  useEffect(() => {
    if (success) {
      refresh()
      activeOrderFetcher.load('/api/active-order')
    }
  }, [success])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    console.log('CouponCodeInput - Submitting', {
      code: couponCode,
      orderId: activeOrder?.id
    });
    
    fetcher.submit(
      { couponCode: couponCode.trim() },
      { method: 'post', action: '/api/apply-coupon' }
    );
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-row w-full gap-2">
        <input
          type="text"
          value={couponCode}
          onChange={(e) => {
            console.log('CouponCodeInput - Input change', {
              value: e.target.value,
              orderId: activeOrder?.id
            });
            setCouponCode(e.target.value);
          }}
          placeholder="Enter Coupon Code"
          className="w-full max-w-xs rounded-md border border-gray-300 py-1 px-2 text-sm leading-5 font-medium text-gray-700 text-left shadow-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          disabled={fetcher.state === 'submitting'}
        />
        <button
          type="submit"
          disabled={fetcher.state === 'submitting' || !couponCode.trim()}
          className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {fetcher.state === 'submitting' ? "Applying..." : "Apply"}
        </button>
      </form>

      {fetcher.data?.error && (
        <div className="mt-2">
          <Alert message={fetcher.data.error} />
        </div>
      )}
      {fetcher.data?.success && (
        <div className="mt-2 text-sm text-green-600">
          Coupon Code Applied
        </div>
      )}
    </div>
  );
}