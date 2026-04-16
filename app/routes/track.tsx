import { useLoaderData, useNavigation, MetaFunction } from '@remix-run/react';
import { getOrderByCode } from '~/providers/orders/order';
import type { DataFunctionArgs } from '@remix-run/server-runtime';
import { json, redirect } from '@remix-run/server-runtime';
import {
  PackageIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  TruckIcon,
} from 'lucide-react';
import Layout from '~/components/Layout';

export const meta: MetaFunction = () => {
  return [
    { title: 'Track Your Order - Commerce Virtuals' },
    {
      name: 'description',
      content: 'Track the status of your order and shipment details',
    },
  ];
};

export async function loader({ request }: DataFunctionArgs) {
  try {
    const url = new URL(request.url);
    const orderCode = url.searchParams.get('orderId') || '';

    if (!orderCode) {
      return json({
        order: null,
        orderCode: '',
        error: 'Please provide an order code to track',
      });
    }

    // Fetch order by code
    const order = await getOrderByCode(orderCode, { request });

    if (!order) {
      return json({
        order: null,
        orderCode,
        error: 'Order not found',
      });
    }

    // Parse tracking details from customFields
    let trackingDetails = [];
    try {
      if (order.customFields?.trackingDetails) {
        trackingDetails = JSON.parse(order.customFields.trackingDetails);
      }
    } catch (error) {
      console.error('Error parsing tracking details:', error);
      trackingDetails = [];
    }

    return json({
      order,
      orderCode,
      trackingDetails,
      error: null,
    });
  } catch (error) {
    console.error('Track order loader error:', error);
    return json({
      order: null,
      orderCode: '',
      error: 'Failed to fetch order details',
    });
  }
}

export default function TrackOrdersPage() {
  const loaderData = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const getStatusIcon = (state: string) => {
    switch (state.toLowerCase()) {
      case 'paymentsettled':
      case 'delivered':
      case 'partiallydelivered':
      case 'fulfilled':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'shipped':
      case 'partiallyshipped':
        return <PackageIcon className="w-5 h-5 text-blue-600" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <XCircleIcon className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'paymentsettled':
      case 'delivered':
      case 'partiallydelivered':
      case 'fulfilled':
        return 'bg-green-100 text-green-800';
      case 'shipped':
      case 'partiallyshipped':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
    }).format(amount / 100);
  };

  // Show loading state while navigating
  if (navigation.state === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight mb-2">
            Track Your Order
          </h1>
          <p className="text-gray-600">
            Monitor the status of your order and shipment details
          </p>
        </div>

        {/* Error State */}
        {loaderData.error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="text-center py-8">
              <XCircleIcon className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600">{loaderData.error}</p>
            </div>
          </div>
        )}

        {/* Order Details */}
        {loaderData.order && (
          <div className="space-y-6">
            {/* Order Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Order Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="text-lg font-medium text-gray-900">
                    #{loaderData.order.id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="text-lg font-medium text-gray-900">
                    {loaderData.order.createdAt
                      ? formatDate(loaderData.order.createdAt)
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-lg font-medium text-gray-900">
                    {formatCurrency(
                      loaderData.order.totalWithTax,
                      loaderData.order.currencyCode,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <div className="flex items-center mt-1">
                    {getStatusIcon(loaderData.order.state)}
                    <span
                      className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        loaderData.order.state,
                      )}`}
                    >
                      {loaderData.order.state}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tracking Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Tracking Details
              </h2>

              {loaderData.trackingDetails &&
              loaderData.trackingDetails.length > 0 ? (
                <div className="space-y-4">
                  {loaderData.trackingDetails.map(
                    (tracking: any, index: number) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <TruckIcon className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-sm text-gray-600">Product</p>
                                <p className="text-lg font-medium text-gray-900">
                                  {tracking.product || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">
                                  Tracking ID
                                </p>
                                <p className="text-lg font-medium text-blue-600">
                                  {tracking.trackingID || 'N/A'}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-600">Courier</p>
                                <p className="text-lg font-medium text-gray-900">
                                  {tracking.courier || 'N/A'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <PackageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tracking Details Will Update Soon
                  </h3>
                  <p className="text-gray-600">
                    Your tracking information is being processed and will be
                    available shortly.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Order State */}
        {!loaderData.order && !loaderData.error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <PackageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Order Found
              </h3>
              <p className="text-gray-600">
                Please provide a valid order code in the URL to view tracking
                information.
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
