import {
  MetaFunction,
  useLoaderData,
  useLocation,
  Outlet,
  useNavigate,
} from '@remix-run/react';
import { useState, useEffect } from 'react';
import { DataFunctionArgs, json, redirect } from '@remix-run/server-runtime';
import { APP_META_TITLE, API_URL } from '~/constants';
import Layout from '~/components/Layout';
import { ArrowLeftIcon } from 'lucide-react';

import {
  getActiveCustomerDetails,
  getActiveCustomerAddresses,
  getActiveCustomer,
} from '~/providers/customer/customer';
import { getTopAnnouncementsForLayout } from '~/providers/announcements';
import { getSessionStorage } from '~/sessions';

export const meta: MetaFunction = () => {
  return [
    {
      title: `Checkout - ${APP_META_TITLE}`,
    },
    {
      name: 'description',
      content: 'Complete your purchase with secure checkout',
    },
  ];
};

const ACTIVE_ORDER_QUERY = `
  query {
    activeOrder {
      id
      code
      state
      active
      totalQuantity
      subTotalWithTax
      totalWithTax
      currencyCode
      shippingWithTax
      discounts { amount description }
      lines {
        id
        quantity
        unitPriceWithTax
        linePriceWithTax
        productVariant {
          id
          name
          price
          sku
          product { id name slug featuredAsset { id preview } }
        }
      }
      shippingLines {
        shippingMethod { id name }
        priceWithTax
      }
      couponCodes
    }
  }
`;

async function fetchActiveOrderDirect(request: Request) {
  const sessionStorage = await getSessionStorage();
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie'),
  );
  const authToken: string | undefined = session.get('authToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: ACTIVE_ORDER_QUERY }),
    });
    const result = await res.json();
    const order = result?.data?.activeOrder;
    if (!order) return null;

    return {
      id: order.id,
      code: order.code,
      state: order.state,
      active: order.active,
      totalQuantity: order.totalQuantity,
      subTotalWithTax: order.subTotalWithTax,
      totalWithTax: order.totalWithTax,
      currencyCode: order.currencyCode,
      shippingWithTax: order.shippingWithTax,
      discounts: order.discounts || [],
      items: (order.lines || []).map((line: any) => ({
        id: line.id,
        quantity: line.quantity,
        unitPriceWithTax: line.unitPriceWithTax,
        linePriceWithTax: line.linePriceWithTax,
        productVariant: line.productVariant,
      })),
      shippingLines: order.shippingLines || [],
      couponCodes: order.couponCodes || [],
    };
  } catch (e) {
    console.error('fetchActiveOrderDirect error:', e);
    return null;
  }
}

export async function loader({ request }: DataFunctionArgs) {
  try {
    const url = new URL(request.url);
    const isConfirmationPage = url.pathname.startsWith(
      '/checkout2/confirmation',
    );
    const isPaymentPage = url.pathname.startsWith('/checkout2/payment');
    const isRetryPayment =
      isPaymentPage && url.searchParams.get('retry') === 'true';

    const [cartData, customer, customerAddresses, announcements] =
      await Promise.all([
        fetchActiveOrderDirect(request),
        getActiveCustomerDetails({ request }).catch(() => null),
        getActiveCustomerAddresses({ request }).catch(() => null),
        getTopAnnouncementsForLayout({ request }),
      ]);

    if (
      !isConfirmationPage &&
      !isRetryPayment &&
      (!cartData || cartData.items.length === 0)
    ) {
      return redirect('/cart');
    }

    if (!isConfirmationPage) {
      if (!customer?.activeCustomer) {
        return redirect(
          `/sign-in?redirectTo=${encodeURIComponent('/checkout2')}`,
        );
      }
    }

    const addresses = customerAddresses?.activeCustomer?.addresses || [];
    const defaultShippingAddress = addresses.find(
      (addr: any) => addr.defaultShippingAddress,
    );
    const defaultBillingAddress = addresses.find(
      (addr: any) => addr.defaultBillingAddress,
    );

    return json({
      cart: cartData || {
        items: [],
        totalQuantity: 0,
        subTotalWithTax: 0,
        totalWithTax: 0,
        currencyCode: 'INR',
      },
      customer: customer?.activeCustomer || null,
      addresses,
      defaultShippingAddress: defaultShippingAddress || null,
      defaultBillingAddress: defaultBillingAddress || null,
      announcements: announcements || [],
      isRetryPayment,
    });
  } catch (error) {
    console.error('Checkout loader error:', error);
    return redirect('/cart');
  }
}

export default function Checkout2Layout() {
  const {
    cart,
    customer,
    addresses,
    defaultShippingAddress,
    defaultBillingAddress,
    announcements,
  } = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigate = useNavigate();

  // Form data state for sharing between nested routes
  const [formData, setFormData] = useState<any>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);

  // Determine current step based on pathname
  const getCurrentStep = () => {
    if (location.pathname === '/checkout2') return 1;
    if (location.pathname === '/checkout2/payment') return 2;
    if (location.pathname.startsWith('/checkout2/confirmation')) return 3;
    return 1;
  };

  const currentStep = getCurrentStep();

  console.log('=== CHECKOUT2 LAYOUT CLIENT ===');
  console.log('Current pathname:', location.pathname);
  console.log('Current step:', currentStep);

  const handleBackNavigation = () => {
    // Navigate back to cart if we're on the first step, otherwise go to previous step
    if (currentStep === 1) {
      navigate('/cart');
    } else {
      navigate(-1);
    }
  };

  const isConfirmation = currentStep === 3;

  return (
    <div className="bg-gray-50 min-h-screen">
      <Layout>
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
            isConfirmation ? 'pt-28 md:pt-36 pb-8' : 'py-8'
          }`}
        >
          {!isConfirmation && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={handleBackNavigation}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
                  Checkout
                </h1>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span
                  className={`px-3 py-1 rounded-full font-medium ${
                    currentStep >= 1
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  1. Shipping
                </span>
                <div className="w-8 h-px bg-gray-300"></div>
                <span
                  className={`px-3 py-1 rounded-full font-medium ${
                    currentStep >= 2
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  2. Payment
                </span>
                <div className="w-8 h-px bg-gray-300"></div>
                <span
                  className={`px-3 py-1 rounded-full font-medium ${
                    currentStep >= 3
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  3. Confirmation
                </span>
              </div>
            </div>
          )}

          <Outlet
            context={{
              cart,
              customer,
              addresses,
              defaultShippingAddress,
              defaultBillingAddress,
              announcements,
              formData,
              setFormData,
              orderCode,
              setOrderCode,
            }}
          />
        </div>
      </Layout>
    </div>
  );
}
