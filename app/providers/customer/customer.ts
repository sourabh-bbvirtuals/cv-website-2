import gql from 'graphql-tag';
import { QueryOptions, sdk } from '~/graphqlWrapper';
import { OrderListOptions, CustomerOrdersArgs } from '~/generated/graphql';

export function getActiveCustomer(options: QueryOptions) {
  return sdk.activeCustomer(undefined, options);
}

export function getActiveCustomerDetails(options: QueryOptions) {
  return sdk.activeCustomerDetails(undefined, options);
}

export function getActiveCustomerAddresses(options: QueryOptions) {
  return sdk.activeCustomerAddresses(undefined, options);
}

export function getActiveCustomerOrderList(
  orderListOptions: OrderListOptions,
  options: QueryOptions,
) {
  return sdk.activeCustomerOrderList({ orderListOptions }, options);
}

export function updateCustomerPassword(
  currentPassword: string,
  newPassword: string,
  options: QueryOptions,
) {
  return sdk.updateCustomerPasswordInCustomer(
    { currentPassword, newPassword },
    options,
  );
}

// Note: Detailed order query available for future use
// export function getActiveCustomerOrderDetails(orderCode: string, options: QueryOptions) {
//   return sdk.activeCustomerOrderDetails({orderCode}, options);
// }

// Note: Address management functions are available in ~/providers/account/account.ts

gql`
  query activeCustomer {
    activeCustomer {
      id
      firstName
      lastName
      emailAddress
      phoneNumber
      customFields {
        contactEmail
      }
    }
  }
`;

gql`
  query activeCustomerDetails {
    activeCustomer {
      id
      title
      firstName
      lastName
      phoneNumber
      emailAddress
      customFields {
        dateOfBirth
        gender
        board
        studentClass
        contactEmail
      }
    }
  }
`;

gql`
  query activeCustomerAddresses {
    activeCustomer {
      id
      addresses {
        id
        company
        fullName
        streetLine1
        streetLine2
        city
        province
        postalCode
        country {
          id
          code
          name
        }
        phoneNumber
        customFields
        defaultShippingAddress
        defaultBillingAddress
      }
    }
  }
`;

gql`
  query activeCustomerOrderList($orderListOptions: OrderListOptions) {
    activeCustomer {
      orders(options: $orderListOptions) {
        totalItems
        items {
          id
          code
          state
          orderPlacedAt
          currencyCode
          totalWithTax
          subTotal
          subTotalWithTax
          total
          fulfillments {
            trackingCode
          }
          payments {
            id
            state
            method
            transactionId
            metadata
          }
          lines {
            quantity
            linePriceWithTax
            unitPriceWithTax
            featuredAsset {
              preview
            }
            productVariant {
              name
              product {
                name
              }
            }
            customFields
          }
        }
      }
    }
  }
`;

gql`
  query activeCustomerOrderDetails($orderCode: String!) {
    activeCustomer {
      orders(options: { filter: { code: { eq: $orderCode } } }) {
        items {
          code
          state
          orderPlacedAt
          currencyCode
          subTotal
          subTotalWithTax
          total
          totalWithTax
          shippingWithTax
          shippingLines {
            priceWithTax
          }
          taxSummary {
            taxBase
            taxTotal
          }
          discounts {
            amountWithTax
          }
          fulfillments {
            trackingCode
          }
          lines {
            quantity
            discountedLinePriceWithTax
            discountedUnitPriceWithTax
            fulfillmentLines {
              quantity
              fulfillment {
                state
                updatedAt
              }
            }
            featuredAsset {
              name
              source
              preview
            }
            productVariant {
              name
              sku
              currencyCode
              priceWithTax
              product {
                slug
              }
            }
          }
        }
      }
    }
  }
`;

gql`
  mutation updateCustomerPasswordInCustomer(
    $currentPassword: String!
    $newPassword: String!
  ) {
    updateCustomerPassword(
      currentPassword: $currentPassword
      newPassword: $newPassword
    ) {
      __typename
      ... on Success {
        success
      }
      ... on InvalidCredentialsError {
        errorCode
        message
      }
      ... on PasswordValidationError {
        errorCode
        message
      }
      ... on NativeAuthStrategyError {
        errorCode
        message
      }
    }
  }
`;
