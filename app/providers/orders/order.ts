import gql from 'graphql-tag';
import { QueryOptions, sdk } from '../../graphqlWrapper';
import {
  AddItemInput,
  CreateAddressInput,
  CreateCustomerInput,
  UpdateOrderInput,
} from '~/generated/graphql';

export function getActiveOrder(options: QueryOptions) {
  return sdk
    .activeOrder(undefined, options)
    .then(({ activeOrder }) => activeOrder);
}

export function getOrderByCode(code: string, options: QueryOptions) {
  console.log('getOrderByCode called with:', { code, codeType: typeof code });

  if (!code || code === 'undefined' || code === 'null') {
    console.error('Invalid orderCode provided to getOrderByCode:', code);
    throw new Error('Invalid orderCode provided');
  }

  return sdk
    .orderByCode({ code }, options)
    .then(({ orderByCode }) => {
      console.log('getOrderByCode result:', orderByCode);
      return orderByCode;
    })
    .catch((error) => {
      console.error('getOrderByCode error:', error);

      // Check if it's a FORBIDDEN error
      if (error.message && error.message.includes('FORBIDDEN')) {
        console.log(
          'Order access forbidden - this might be a guest order or order belongs to different customer',
        );
        throw new Error(
          'Order not accessible - it may be a guest order that has expired or belongs to a different customer',
        );
      }

      // Re-throw other errors
      throw error;
    });
}

export function addItemToOrder(
  productVariantId: string,
  quantity: number,
  options: QueryOptions,
  customFields?: {
    additionalInformation?: string;
  },
) {
  return sdk.addItemToOrder(
    {
      productVariantId,
      quantity,
      customFields,
    },
    options,
  );
}

export function addItemsToOrder(
  inputs: Array<{
    productVariantId: string;
    quantity: number;
    customFields?: {
      additionalInformation?: string;
    };
  }>,
  options: QueryOptions,
) {
  const addItemInputs: AddItemInput[] = inputs.map((input) => ({
    productVariantId: input.productVariantId,
    quantity: input.quantity,
    customFields: input.customFields
      ? {
          additionalInformation: input.customFields.additionalInformation,
        }
      : undefined,
  }));

  return sdk.addItemsToOrder(
    {
      inputs: addItemInputs,
    },
    options,
  );
}

export function removeOrderLine(lineId: string, options: QueryOptions) {
  return sdk.removeOrderLine({ orderLineId: lineId }, options);
}

export function adjustOrderLine(
  lineId: string,
  quantity: number,
  options: QueryOptions,
) {
  return sdk.adjustOrderLine({ orderLineId: lineId, quantity }, options);
}

export function setCustomerForOrder(
  input: CreateCustomerInput,
  options: QueryOptions,
) {
  return sdk.setCustomerForOrder({ input }, options);
}

export function setOrderShippingAddress(
  input: CreateAddressInput,
  options: QueryOptions,
) {
  return sdk.setOrderShippingAddress({ input }, options);
}

export function setOrderBillingAddress(
  input: CreateAddressInput,
  options: QueryOptions,
) {
  return sdk.setOrderBillingAddress({ input }, options);
}

export function setOrderCustomFields(
  input: UpdateOrderInput,
  options: QueryOptions,
) {
  return sdk.setOrderCustomFields({ input }, options);
}

export function setOrderShippingMethod(
  shippingMethodId: string,
  options: QueryOptions,
) {
  return sdk.setOrderShippingMethod({ shippingMethodId }, options);
}

export function applyCouponCode(couponCode: string, options: QueryOptions) {
  return sdk.applyCouponCode({ couponCode }, options);
}

export function removeCouponCode(couponCode: string, options: QueryOptions) {
  return sdk.removeCouponCode({ couponCode }, options);
}

export function addPaymentToOrder(
  input: { method: string; metadata: any },
  options: QueryOptions,
) {
  return sdk.addPaymentToOrder({ input }, options);
}

export function transitionOrderToState(state: string, options: QueryOptions) {
  return sdk.transitionOrderToState({ state }, options);
}

export function getNextOrderStates(options: QueryOptions) {
  return sdk
    .nextOrderStates(undefined, options)
    .then(({ nextOrderStates }) => nextOrderStates);
}

export function getEligibleShippingMethods(options: QueryOptions) {
  return sdk
    .eligibleShippingMethods(undefined, options)
    .then(({ eligibleShippingMethods }) => eligibleShippingMethods);
}

export function getActiveShippingMethods(options: QueryOptions) {
  return sdk
    .activeShippingMethods(undefined, options)
    .then(({ activeShippingMethods }) => activeShippingMethods);
}

gql`
  mutation setCustomerForOrder($input: CreateCustomerInput!) {
    setCustomerForOrder(input: $input) {
      ...OrderDetail
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

gql`
  mutation setOrderShippingAddress($input: CreateAddressInput!) {
    setOrderShippingAddress(input: $input) {
      ...OrderDetail
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

gql`
  mutation setOrderBillingAddress($input: CreateAddressInput!) {
    setOrderBillingAddress(input: $input) {
      ...OrderDetail
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;
gql`
  mutation setOrderShippingMethod($shippingMethodId: [ID!]!) {
    setOrderShippingMethod(shippingMethodId: $shippingMethodId) {
      ...OrderDetail
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

gql`
  mutation setOrderCustomFields($input: UpdateOrderInput!) {
    setOrderCustomFields(input: $input) {
      ...OrderDetail
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

gql`
  mutation addPaymentToOrder($input: PaymentInput!) {
    addPaymentToOrder(input: $input) {
      ...OrderDetail
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

gql`
  mutation addItemToOrder(
    $productVariantId: ID!
    $quantity: Int!
    $customFields: OrderLineCustomFieldsInput
  ) {
    addItemToOrder(
      productVariantId: $productVariantId
      quantity: $quantity
      customFields: $customFields
    ) {
      ...OrderDetail
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

gql`
  mutation removeOrderLine($orderLineId: ID!) {
    removeOrderLine(orderLineId: $orderLineId) {
      ...OrderDetail
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

gql`
  mutation adjustOrderLine($orderLineId: ID!, $quantity: Int!) {
    adjustOrderLine(orderLineId: $orderLineId, quantity: $quantity) {
      ...OrderDetail
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

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

gql`
  mutation removeCouponCode($couponCode: String!) {
    removeCouponCode(couponCode: $couponCode) {
      ...OrderDetail
    }
  }
`;

gql`
  fragment OrderDetail on Order {
    __typename
    id
    code
    active
    createdAt
    state
    currencyCode
    totalQuantity
    subTotal
    subTotalWithTax
    taxSummary {
      description
      taxRate
      taxTotal
    }
    shippingWithTax
    totalWithTax
    discounts {
      amount
      type
      description
      adjustmentSource
    }
    promotions {
      id
      name
      description
      enabled
      couponCode
    }
    customer {
      id
      firstName
      lastName
      emailAddress
      phoneNumber
    }
    shippingAddress {
      fullName
      streetLine1
      streetLine2
      company
      city
      province
      postalCode
      countryCode
      phoneNumber
    }
    billingAddress {
      fullName
      streetLine1
      streetLine2
      company
      city
      province
      postalCode
      countryCode
      phoneNumber
    }
    shippingLines {
      shippingMethod {
        id
        name
      }
      priceWithTax
    }
    lines {
      id
      unitPriceWithTax
      linePriceWithTax
      quantity
      featuredAsset {
        id
        preview
      }
      productVariant {
        id
        name
        price
        sku
        featuredAsset {
          id
          preview
        }
        product {
          id
          name
          slug
          featuredAsset {
            id
            preview
          }
        }
      }
    }
    payments {
      id
      state
      method
      amount
      metadata
      transactionId
    }
    couponCodes
  }
`;

gql`
  query activeOrder {
    activeOrder {
      ...OrderDetail
    }
  }
`;

gql`
  query orderByCode($code: String!) {
    orderByCode(code: $code) {
      ...OrderDetail
    }
  }
`;

gql`
  mutation transitionOrderToState($state: String!) {
    transitionOrderToState(state: $state) {
      ...OrderDetail
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

gql`
  query nextOrderStates {
    nextOrderStates
  }
`;

gql`
  query eligibleShippingMethods {
    eligibleShippingMethods {
      id
      name
      description
      metadata
      price
      priceWithTax
    }
  }
`;

gql`
  query activeShippingMethods {
    activeShippingMethods {
      id
      name
      description
      code
    }
  }
`;

const AddItemsToOrderDocument = gql`
  mutation addItemsToOrder($inputs: [AddItemInput!]!) {
    addItemsToOrder(inputs: $inputs) {
      ... on UpdateMultipleOrderItemsResult {
        order {
          ...OrderDetail
        }
        errorResults {
          ... on ErrorResult {
            errorCode
            message
          }
          ... on InsufficientStockError {
            errorCode
            message
            quantityAvailable
          }
          ... on NegativeQuantityError {
            errorCode
            message
          }
          ... on OrderInterceptorError {
            errorCode
            message
            interceptorError
          }
          ... on OrderLimitError {
            errorCode
            message
            maxItems
          }
          ... on OrderModificationError {
            errorCode
            message
          }
        }
      }
    }
  }
`;
