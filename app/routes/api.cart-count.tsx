import { json } from '@remix-run/server-runtime';
import { DataFunctionArgs } from '@remix-run/server-runtime';
import { getVendureCart } from '~/providers/cart/vendureCart';

export async function loader({ request }: DataFunctionArgs) {
  try {
    const cart = await getVendureCart({ request });
    
    if (cart && cart.items) {
      const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      return json({ count: totalQuantity });
    }
    
    return json({ count: 0 });
  } catch (error) {
    console.error('Error fetching cart count:', error);
    return json({ count: 0 });
  }
}
