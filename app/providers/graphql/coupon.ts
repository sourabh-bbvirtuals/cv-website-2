import gql from 'graphql-tag';
import { QueryOptions, sdk } from '~/graphqlWrapper';

export async function applyCouponCode(couponCode: string, options: QueryOptions) {
  const result = await sdk.applyCouponCode({ couponCode }, options);
  return result;
}

gql`
  mutation applyCouponCode($couponCode: String!) {
    applyCouponCode(couponCode: $couponCode) {
      ... on Order {
        ...OrderDetail
      }
      ... on CouponCodeExpiredError {
        errorCode
        message
        couponCode
      }
      ... on CouponCodeInvalidError {
        errorCode
        message
        couponCode
      }
      ... on CouponCodeLimitError {
        errorCode
        message
        couponCode
        limit
      }
    }
  }
`; 