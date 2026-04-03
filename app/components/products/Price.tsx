import { CurrencyCode } from '~/generated/graphql';
import { ProductCardProps } from './ProductCard';

export function Price({
  priceWithTax,
  currencyCode,
  reduceByOne = false,
}: {
  priceWithTax?: number | ProductCardProps['priceWithTax'];
  currencyCode?: ProductCardProps['currencyCode'];
  reduceByOne?: boolean;
}) {
  if (priceWithTax == null || !currencyCode) {
    return <></>;
  }
  if (typeof priceWithTax === 'number') {
    return <>{formatPrice(priceWithTax, currencyCode, reduceByOne)}</>;
  }
  if ('value' in priceWithTax) {
    return <>{formatPrice(priceWithTax.value, currencyCode, reduceByOne)}</>;
  }
  if (priceWithTax.min === priceWithTax.max) {
    return <>{formatPrice(priceWithTax.min, currencyCode, reduceByOne)}</>;
  }
  return (
    <>
      {formatPrice(priceWithTax.min, currencyCode, reduceByOne)} -{' '}
      {formatPrice(priceWithTax.max, currencyCode, reduceByOne)}
    </>
  );
}

export function formatPrice(value: number, currency: CurrencyCode, reduceByOne: boolean = false) {
  // Subtract Rs. 1 (100 paise) from display price only when specified
  const adjustedValue = reduceByOne ? Math.max(0, value - 100) : value;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(adjustedValue / 100);
}
