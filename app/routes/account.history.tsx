import { useLoaderData, useNavigation } from '@remix-run/react';
import { PurchaseHistory, LoadingState } from '~/components/account';
import { getActiveCustomer, getActiveCustomerOrderList } from '~/providers/customer/customer';
import type { DataFunctionArgs } from '@remix-run/server-runtime';
import { json, redirect } from '@remix-run/server-runtime';
import { SortOrder } from '~/gql/graphql';

export async function loader({ request }: DataFunctionArgs) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const take = 5; // Items per page
    const skip = (page - 1) * take;
    
    // Proper server-side pagination - fetch exactly what we need
    // Exclude AddingItems orders from the query
    const customerOrders = await getActiveCustomerOrderList({ 
      take,
      skip,
      sort: {
        orderPlacedAt: SortOrder.DESC
      },
      filter: {
        state: {
          in: ['PaymentSettled', 'PartiallyShipped', 'Shipped', 'Delivered', 'PartiallyDelivered', 'Fulfilled']
        }
      }
    }, { request });
    
    if (!customerOrders?.activeCustomer) {
      return redirect('/');
    }

    // Show ALL orders regardless of status - no client-side filtering
    const orders = customerOrders.activeCustomer.orders?.items || [];
    const totalItems = customerOrders.activeCustomer.orders?.totalItems || 0;
    const totalPages = Math.ceil(totalItems / take);

    return json({ 
      orders,
      totalItems,
      currentPage: page,
      itemsPerPage: take,
      totalPages,
      hasMoreData: page < totalPages
    });
  } catch (error) {
    console.error('Purchase history loader error:', error);
    return redirect('/');
  }
}

export default function PurchaseHistoryPage() {
  const { orders, totalItems, currentPage, itemsPerPage, totalPages } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  // Show loading state while navigating
  if (navigation.state === 'loading') {
    return <LoadingState message="Loading purchase history..." />;
  }

  return <PurchaseHistory 
    orders={orders} 
    totalItems={totalItems} 
    currentPage={currentPage}
    itemsPerPage={itemsPerPage}
    totalPages={totalPages}
  />;
}
