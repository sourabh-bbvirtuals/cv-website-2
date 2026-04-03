import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@remix-run/react';
import { ShoppingBagIcon, PackageIcon, ImageIcon } from 'lucide-react';

interface PurchaseHistoryProps {
  orders: any[];
  totalItems?: number;
  currentPage?: number;
  itemsPerPage?: number;
  totalPages?: number;
}

export function PurchaseHistory({ 
  orders, 
  totalItems = 0, 
  currentPage: serverCurrentPage = 1, 
  itemsPerPage: serverItemsPerPage = 5,
  totalPages: serverTotalPages = 1
}: PurchaseHistoryProps) {
  const navigate = useNavigate();
  const actualTotalItems = totalItems;
  const totalPages = serverTotalPages;
  const startIndex = (serverCurrentPage - 1) * serverItemsPerPage;
  const endIndex = startIndex + serverItemsPerPage;

  // State for image rotation per order
  const [imageIndices, setImageIndices] = useState<Record<string, number>>({});

  const getStatusColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'delivered':
      case 'fulfilled':
        return 'bg-green-100 text-green-800';
      case 'shipped':
      case 'partiallyfulfilled':
        return 'bg-indigo-100 text-indigo-800';
      case 'paymentauthorized':
        return 'bg-yellow-100 text-yellow-800';
      case 'arrangingpayment':
        return 'bg-red-100 text-red-800';
      case 'paymentsettled':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'declined':
        return 'bg-red-100 text-red-800';
      case 'paymentfailed':
        return 'bg-red-100 text-red-800';
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
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD'
    }).format(amount / 100);
  };

  const handleTrackOrder = (orderCode: string) => {
    navigate(`/track?orderId=${orderCode}`);
  };


  // Image rotation effect for each order
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];
    
    orders.forEach((order) => {
      let additionalInfo = null;
      try {
        const additionalInfoStr = order.lines?.[0]?.customFields?.additionalInformation;
        if (additionalInfoStr) {
          additionalInfo = JSON.parse(additionalInfoStr);
        }
      } catch (error) {
        console.log('Error parsing additional information:', error);
      }

      const imagesToRotate = additionalInfo?.faculty && additionalInfo.faculty.length > 0
        ? additionalInfo.faculty
            .map((f: any) => f.image)
            .filter((src: string | undefined) => !!src)
        : order.lines?.[0]?.featuredAsset?.preview
        ? [order.lines[0].featuredAsset.preview]
        : [];

      if (imagesToRotate.length > 1) {
        const interval = setInterval(() => {
          setImageIndices(prev => ({
            ...prev,
            [order.code]: ((prev[order.code] || 0) + 1) % imagesToRotate.length
          }));
        }, 5000);
        intervals.push(interval);
      }
    });

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [orders]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Purchase History</h2>
      </div>
      
      <div className="p-6">
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBagIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.code} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">Order #{order.id || order.code}</h3>
                    <p className="text-sm text-gray-600">Placed on {formatDate(order.orderPlacedAt)}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.state)}`}>
                      {order.state === 'PaymentAuthorized' 
                        ? 'PaymentAuthorized' 
                        : order.state === 'ArrangingPayment'
                        ? 'PaymentPending'
                        : order.state === 'Cancelled'
                        ? 'PaymentCancelled'
                        : order.state === 'Declined'
                        ? 'PaymentDeclined'
                        : order.state === 'PaymentFailed'
                        ? 'PaymentFailed'
                        : order.state}
                    </span>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {(() => {
                        // Debug cancelled orders
                        if (order.state === 'Cancelled' || order.state === 'Declined' || order.state === 'PaymentFailed') {
                          console.log('Cancelled order data:', {
                            orderCode: order.code,
                            state: order.state,
                            totalWithTax: order.totalWithTax,
                            currencyCode: order.currencyCode,
                            subTotal: order.subTotal,
                            subTotalWithTax: order.subTotalWithTax,
                            total: order.total
                          });
                        }
                        
                        // Try different price fields for cancelled orders
                        const amount = order.totalWithTax || order.subTotalWithTax || order.total || order.subTotal;
                        const currency = order.currencyCode || 'INR';
                        
                        // If no amount found, try to calculate from order lines
                        if (!amount && order.lines && order.lines.length > 0) {
                          const calculatedTotal = order.lines.reduce((sum: number, line: any) => {
                            return sum + (line.linePriceWithTax || line.unitPriceWithTax * line.quantity || 0);
                          }, 0);
                          
                          if (calculatedTotal > 0) {
                            return formatCurrency(calculatedTotal, currency);
                          }
                        }
                        
                        return amount && currency 
                          ? formatCurrency(amount, currency)
                          : order.state === 'Cancelled' || order.state === 'Declined' || order.state === 'PaymentFailed'
                          ? ''
                          : 'Amount Not Available';
                      })()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  {(() => {
                    // Parse additional information like cart does
                    let additionalInfo = null;
                    try {
                      const additionalInfoStr = order.lines?.[0]?.customFields?.additionalInformation;
                      if (additionalInfoStr) {
                        additionalInfo = JSON.parse(additionalInfoStr);
                      }
                    } catch (error) {
                      console.log('Error parsing additional information:', error);
                    }

                    // Get images to rotate (faculty images first, then product image)
                    const imagesToRotate = additionalInfo?.faculty && additionalInfo.faculty.length > 0
                      ? additionalInfo.faculty
                          .map((f: any) => f.image)
                          .filter((src: string | undefined) => !!src)
                      : order.lines?.[0]?.featuredAsset?.preview
                      ? [order.lines[0].featuredAsset.preview]
                      : [];

                    if (imagesToRotate.length > 0) {
                      const currentImageIndex = imageIndices[order.code] || 0;
                      return (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={imagesToRotate[currentImageIndex]} 
                            alt={additionalInfo?.faculty?.[currentImageIndex]?.name || 'Faculty'} 
                            className="w-full h-full object-cover transition-opacity duration-300" 
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.classList.remove('hidden');
                            }}
                          />
                          {/* Multiple faculty indicator */}
                          {/* {imagesToRotate.length > 1 && (
                            <div className="absolute bottom-0 right-0 bg-indigo-600 text-white text-xs px-1 py-0.5 rounded-tl-md">
                              {currentImageIndex + 1}/{imagesToRotate.length}
                            </div>
                          )} */}
                          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center hidden">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                      </div>
                    );
                  })()}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {(() => {
                        // Parse additional information like cart does
                        let additionalInfo = null;
                        try {
                          const additionalInfoStr = order.lines?.[0]?.customFields?.additionalInformation;
                          if (additionalInfoStr) {
                            additionalInfo = JSON.parse(additionalInfoStr);
                          }
                        } catch (error) {
                          console.log('Error parsing additional information for name:', error);
                        }

                        // Use productName from additionalInformation first, then fallback to product name
                        return additionalInfo?.productName || 
                               order.lines?.[0]?.productVariant?.product?.name || 
                               order.lines?.[0]?.productVariant?.name || 
                               'Product';
                      })()}
                      {order.lines && order.lines.length > 1 && ` + ${order.lines.length - 1} more items`}
                    </p>
                    <p className="text-xs text-gray-600">
                      {order.fulfillments?.[0]?.trackingCode 
                        ? `Tracking: ${order.fulfillments[0].trackingCode}`
                        : 'No tracking information available'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a 
                    // href={`/view-details?orderCode=${order.code}`}
                    href={`/track?orderNumber=${order.id}`}
                    target="_blank"
                    className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded border border-blue-200 transition-colors"
                  >
                    View Details
                  </a>
                  {/* {(order.state === 'PaymentSettled' || order.state === 'PartiallyShipped' || order.state === 'Shipped' || order.state === 'Delivered' || order.state === 'PartiallyDelivered' || order.state === 'Fulfilled') && (
                    <button 
                      onClick={() => handleTrackOrder(order.code)}
                      className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded border border-gray-200 transition-colors"
                    >
                      Track Package
                    </button>
                  )} */}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {orders.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, actualTotalItems)} of {actualTotalItems} orders
            </p>
            <div className="flex gap-2">
              <Link 
                to={`?page=${serverCurrentPage - 1}`}
                className={`px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded ${
                  serverCurrentPage === 1 
                    ? 'text-gray-400 cursor-not-allowed hover:bg-transparent' 
                    : ''
                }`}
              >
                Previous
              </Link>
              
              {/* Show page numbers with smart truncation */}
              {(() => {
                const pages = [];
                const maxVisiblePages = 5;
                
                if (totalPages <= maxVisiblePages) {
                  // Show all pages if total is small
                  for (let i = 1; i <= totalPages; i++) {
                    pages.push(i);
                  }
                } else {
                  // Smart pagination with ellipsis
                  if (serverCurrentPage <= 3) {
                    // Show first 3 pages, ellipsis, last page
                    for (let i = 1; i <= 3; i++) pages.push(i);
                    if (totalPages > 4) pages.push('...');
                    pages.push(totalPages);
                  } else if (serverCurrentPage >= totalPages - 2) {
                    // Show first page, ellipsis, last 3 pages
                    pages.push(1);
                    if (totalPages > 4) pages.push('...');
                    for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
                  } else {
                    // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
                    pages.push(1);
                    pages.push('...');
                    for (let i = serverCurrentPage - 1; i <= serverCurrentPage + 1; i++) pages.push(i);
                    pages.push('...');
                    pages.push(totalPages);
                  }
                }
                
                return pages.map((page, index) => {
                  if (page === '...') {
                    return (
                      <span key={`ellipsis-${index}`} className="px-3 py-1.5 text-sm text-gray-400">
                        ...
                      </span>
                    );
                  }
                  
                  return (
                    <Link
                      key={page}
                      to={`?page=${page}`}
                      className={`px-3 py-1.5 text-sm font-medium rounded ${
                        serverCurrentPage === page
                          ? 'bg-indigo-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </Link>
                  );
                });
              })()}
              
              <Link 
                to={`?page=${serverCurrentPage + 1}`}
                className={`px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded ${
                  serverCurrentPage === totalPages 
                    ? 'text-gray-400 cursor-not-allowed hover:bg-transparent' 
                    : ''
                }`}
              >
                Next
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
