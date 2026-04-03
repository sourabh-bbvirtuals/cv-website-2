import { Price } from '~/components/products/Price';
import { OrderDetailFragment } from '~/generated/graphql';
import { useTranslation } from 'react-i18next';
import { CouponCodeInput } from './CouponCodeInput';
import { CurrencyCode } from '~/generated/graphql';

type Order = {
  id: string;
  code: string;
  active: boolean;
  createdAt: any;
  state: string;
  currencyCode: CurrencyCode;
  totalQuantity: number;
  subTotal: number;
  subTotalWithTax: number;
  shippingWithTax: number;
  totalWithTax: number;
  discounts?: Array<{ amountWithTax: number }>;
};

export function CartTotals({ order, onCouponApply }: { order?: Order | null, onCouponApply: () => void }) {
  const { t } = useTranslation();
  console.log('CartTotals rendering with order:', order);

  const handleCouponApply = () => {
    onCouponApply()
  }
  
  const totalDiscount = order?.discounts?.reduce(
    (acc: number, curr: { amountWithTax: number }) => acc + curr.amountWithTax,
    0
  ) ?? 0;

  // Only render CouponCodeInput when we have an order
  const showCouponInput = Boolean(order);

  return (
    <dl className="border-t mt-6 border-gray-200 py-6 space-y-4">
      {/* Coupon Code Section */}
      {showCouponInput && (
        <div className="flex items-center justify-between gap-2">
          <dt className="text-s whitespace-nowrap mr-2">Coupon Code</dt>
          <dd className="flex-1 w-full flex justify-end">
            <CouponCodeInput onCouponApply={handleCouponApply} key={`coupon-input-${order?.id}`} />
          </dd>
        </div>
      )}

      {/* Subtotal */}
      <div className="flex items-center justify-between">
        <dt className="text-sm">{t('common.subtotal')}</dt>
        <dd className="text-sm font-medium text-gray-900">
          <Price
            priceWithTax={order?.subTotalWithTax}
            currencyCode={order?.currencyCode}
          />
        </dd>
      </div>

      {/* Applied Discounts */}
      {totalDiscount > 0 && (
        <div className="flex items-center justify-between text-green-600">
          <dt className="text-sm">{t('common.appliedCoupons')}</dt>
          <dd className="text-sm font-medium">
            -<Price
              priceWithTax={totalDiscount}
              currencyCode={order?.currencyCode}
            />
          </dd>
        </div>
      )}

      {/* Shipping */}
      <div className="flex items-center justify-between">
        <dt className="text-sm">{t('common.shipping')}</dt>
        <dd className="text-sm font-medium text-gray-900">
          <Price
            priceWithTax={order?.shippingWithTax ?? 0}
            currencyCode={order?.currencyCode}
          />
        </dd>
      </div>

      {/* Final Total */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-4">
        <dt className="text-base font-medium">{t('common.total')}</dt>
        <dd className="text-base font-medium text-gray-900">
          <Price
            priceWithTax={order?.totalWithTax}
            currencyCode={order?.currencyCode}
          />
        </dd>
      </div>
    </dl>
  );
}
