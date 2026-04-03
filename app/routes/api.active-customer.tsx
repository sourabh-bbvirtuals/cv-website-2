import { DataFunctionArgs, json } from '@remix-run/server-runtime';
import { getActiveCustomer } from "~/providers/customer";

// Loader for fetching the current active customer
export async function loader({ request }: DataFunctionArgs) {
  try {
    const activeCustomerData = await getActiveCustomer({ request });

    return json({
      activeCustomer: activeCustomerData?.activeCustomer || null,
    });
  } catch (error) {
    console.error("Error fetching active customer:", error);
    return json({ activeCustomer: null });
  }
}
