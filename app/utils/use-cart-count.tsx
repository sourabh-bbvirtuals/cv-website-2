import { useState, useEffect } from 'react';

export function useCartCount() {
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = async () => {
    try {
      // Fetch cart count from Vendure
      const response = await fetch('/api/cart-count');
      if (response.ok) {
        const data: { count?: number } = await response.json();
        setCartCount(typeof data.count === 'number' ? data.count : 0);
      } else {
        setCartCount(0);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      setCartCount(0);
    }
  };

  useEffect(() => {
    // Initial load
    updateCartCount();

    // Listen for custom cart update events
    const handleCartUpdate = () => {
      updateCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  return { cartCount, updateCartCount };
}
