import { json } from '@remix-run/server-runtime';
import type { LoaderFunctionArgs } from '@remix-run/server-runtime';
import { Link, useLoaderData } from '@remix-run/react';
import { API_URL } from '~/constants';
import { getSessionStorage } from '~/sessions';

const ORDERS_QUERY = `
  query {
    activeCustomer {
      orders(options: { take: 20, sort: { orderPlacedAt: DESC }, filter: { state: { in: ["PaymentSettled", "PartiallyShipped", "Shipped", "Delivered", "Fulfilled"] } } }) {
        totalItems
        items {
          id
          code
          state
          orderPlacedAt
          totalWithTax
          currencyCode
          lines {
            quantity
            linePriceWithTax
            productVariant {
              name
              product { name slug featuredAsset { preview } }
            }
          }
        }
      }
    }
  }
`;

type GqlOrderLine = {
  quantity: number;
  linePriceWithTax: number;
  productVariant: {
    name: string;
    product: {
      name: string;
      slug: string;
      featuredAsset: { preview: string } | null;
    };
  } | null;
};

type GqlOrder = {
  id: string;
  code: string;
  state: string;
  orderPlacedAt: string | null;
  totalWithTax: number;
  currencyCode: string;
  lines: GqlOrderLine[];
};

type OrderRow = {
  id: string;
  dateLabel: string;
  title: string;
  priceLabel: string;
  image: string;
};

function formatOrderDate(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

function formatPriceRupees(totalWithTax: number, currencyCode: string): string {
  const rupees = totalWithTax / 100;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode || 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(rupees);
  } catch {
    return `₹${rupees.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  }
}

function firstLineTitle(lines: GqlOrderLine[]): string {
  const first = lines[0];
  const variantName = first?.productVariant?.name;
  const productName = first?.productVariant?.product?.name;
  return (variantName || productName || 'Order').trim();
}

function firstLineImage(lines: GqlOrderLine[]): string {
  const preview = lines[0]?.productVariant?.product?.featuredAsset?.preview;
  return preview || '/placeholder.jpg';
}

export async function loader({ request }: LoaderFunctionArgs) {
  const sessionStorage = await getSessionStorage();
  const session = await sessionStorage.getSession(
    request.headers.get('Cookie'),
  );
  const authToken = session.get('authToken') as string | undefined;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let orders: OrderRow[] = [];

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query: ORDERS_QUERY }),
    });

    const body = (await res.json()) as {
      errors?: unknown;
      data?: {
        activeCustomer?: {
          orders?: { items?: GqlOrder[] };
        } | null;
      };
    };

    if (body.errors) {
      console.error('account.orders GraphQL errors:', body.errors);
    } else {
      const items = body.data?.activeCustomer?.orders?.items ?? [];
      orders = items.map((order) => ({
        id: order.code,
        dateLabel: formatOrderDate(order.orderPlacedAt),
        title: firstLineTitle(order.lines ?? []),
        priceLabel: formatPriceRupees(order.totalWithTax, order.currencyCode),
        image: firstLineImage(order.lines ?? []),
      }));
    }
  } catch (e) {
    console.error('account.orders fetch failed:', e);
  }

  return json({ orders });
}

const TrackIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 12.75V19.5C18 19.8978 17.842 20.2794 17.5607 20.5607C17.2794 20.842 16.8978 21 16.5 21H4.5C4.10218 21 3.72064 20.842 3.43934 20.5607C3.15804 20.2794 3 19.8978 3 19.5V7.5C3 7.10218 3.15804 6.72064 3.43934 6.43934C3.72064 6.15804 4.10218 6 4.5 6H11.25C11.4489 6 11.6397 6.07902 11.7803 6.21967C11.921 6.36032 12 6.55109 12 6.75C12 6.94891 11.921 7.13968 11.7803 7.28033C11.6397 7.42098 11.4489 7.5 11.25 7.5H4.5V19.5H16.5V12.75C16.5 12.5511 16.579 12.3603 16.7197 12.2197C16.8603 12.079 17.0511 12 17.25 12C17.4489 12 17.6397 12.079 17.7803 12.2197C17.921 12.3603 18 12.5511 18 12.75ZM21 3.75C21 3.55109 20.921 3.36032 20.7803 3.21967C20.6397 3.07902 20.4489 3 20.25 3H14.25C14.1016 2.99988 13.9565 3.04381 13.833 3.12621C13.7096 3.20861 13.6133 3.32579 13.5565 3.46291C13.4997 3.60002 13.4849 3.75092 13.5139 3.89648C13.5428 4.04204 13.6144 4.17573 13.7194 4.28063L16.1897 6.75L12.2194 10.7194C12.0786 10.8601 11.9996 11.051 11.9996 11.25C11.9996 11.449 12.0786 11.6399 12.2194 11.7806C12.3601 11.9214 12.551 12.0004 12.75 12.0004C12.949 12.0004 13.1399 11.9214 13.2806 11.7806L17.25 7.81031L19.7194 10.2806C19.8243 10.3856 19.958 10.4572 20.1035 10.4861C20.2491 10.5151 20.4 10.5003 20.5371 10.4435C20.6742 10.3867 20.7914 10.2904 20.8738 10.167C20.9562 10.0435 21.0001 9.89842 21 9.75V3.75Z"
      fill="#3A6BFC"
    />
  </svg>
);

export default function OrdersTab() {
  const { orders } = useLoaderData<typeof loader>();

  return (
    <div className="bg-white rounded-lg sm:rounded-3xl border border-[#0816271A] shadow-sm p-4 xl:p-9">
      <h2 className="text-xl xl:text-2xl font-bold text-lightgray mb-4 sm:mb-5 xl:mb-7.5">
        My Orders
      </h2>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center gap-4">
          <p className="text-lightgray text-base sm:text-lg font-medium">
            No orders yet
          </p>
          <Link
            to="/our-courses"
            className="text-[#3A6BFC] text-sm sm:text-base font-semibold hover:underline"
          >
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="space-y-4 xl:space-y-7.5">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-center justify-between pb-4 sm:pb-6 xl:pb-9 border-b border-[#0816271A] last:border-0 last:pb-0 max-sm:items-end"
            >
              <div className="flex gap-2 sm:gap-4 items-start">
                <div className="w-16 sm:w-20 h-10 sm:h-13 bg-gray-100 rounded-lg overflow-hidden shrink-0 mt-1">
                  <img
                    src={order.image}
                    alt={order.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-base lg:text-lg xl:text-xl leading-[120%] mb-1 sm:mb-2 xl:mb-3 text-lightgray font-medium">
                    {order.title}
                  </h3>
                  <div className="flex items-center gap-1 sm:gap-2 text-lightgray opacity-50 text-xs sm:text-sm xl:text-base leadin-[120%]">
                    <span>{order.id}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{order.dateLabel}</span>
                  </div>

                  <button
                    type="button"
                    className="mt-3 xl:mt-4 flex items-center gap-1 xl:gap-3 px-4 xl:px-6 py-1 xl:py-2.25 rounded-full border border-[#3A6BFC33] text-[#3A6BFC] text-sm sm:text-base xl:text-xl leading-[120%] font-medium hover:bg-blue-50 transition"
                  >
                    <TrackIcon /> Track Order
                  </button>
                </div>
              </div>

              <div className="sm:self-start mt-2 sm:mt-0">
                <span className="text-base sm:text-lg xl:text-xl text-lightgray font-semibold">
                  {order.priceLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
