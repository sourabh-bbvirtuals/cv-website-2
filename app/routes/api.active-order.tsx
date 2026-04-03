import {
  addItemToOrder,
  adjustOrderLine,
  getActiveOrder,
  removeOrderLine,
  setCustomerForOrder,
  setOrderCustomFields,
  setOrderShippingAddress,
  setOrderShippingMethod,
} from '~/providers/orders/order';
import { DataFunctionArgs, json } from '@remix-run/server-runtime';
import {
  CreateAddressInput,
  CreateCustomerInput,
  ErrorCode,
  ErrorResult,
  OrderDetailFragment,
  UpdateOrderCustomFieldsInput,
} from '~/generated/graphql';
import { getSessionStorage } from '~/sessions';
import { shippingFormDataIsValid } from '~/utils/validation';
import { addPaymentToOrder } from '~/providers/checkout/checkout';

export type CartLoaderData = Awaited<ReturnType<typeof loader>>;

export async function loader({ request }: DataFunctionArgs) {
  try {
    return {
      activeOrder: await getActiveOrder({ request }),
    };
  } catch (e) {
    console.warn(
      '⚠️ Active order fetch failed (staging schema mismatch):',
      (e as Error).message,
    );
    return { activeOrder: null };
  }
}

export async function action({ request, params }: DataFunctionArgs) {
  const body = await request.formData();
  const formAction = body.get('action');
  let activeOrder: OrderDetailFragment | undefined = undefined;
  let error: ErrorResult = {
    errorCode: ErrorCode.NoActiveOrderError,
    message: '',
  };
  switch (formAction) {
    case 'setCheckoutShipping':
      if (shippingFormDataIsValid(body)) {
        const shippingFormData = Object.fromEntries<any>(
          body.entries(),
        ) as CreateAddressInput;
        const result = await setOrderShippingAddress(
          {
            city: shippingFormData.city,
            company: shippingFormData.company,
            countryCode: shippingFormData.countryCode,
            customFields: shippingFormData.customFields,
            fullName: shippingFormData.fullName,
            phoneNumber: shippingFormData.phoneNumber,
            postalCode: shippingFormData.postalCode,
            province: shippingFormData.province,
            streetLine1: shippingFormData.streetLine1,
            streetLine2: shippingFormData.streetLine2,
          },
          { request },
        );
        if (result.setOrderShippingAddress.__typename === 'Order') {
          activeOrder = result.setOrderShippingAddress;
        } else {
          error = result.setOrderShippingAddress;
        }
      }
      break;
    case 'setOrderCustomFields': {
      const orderCustomFields = Object.fromEntries<any>(
        body.entries(),
      ) as UpdateOrderCustomFieldsInput;
      const result = await setOrderCustomFields(
        {
          customFields: {
            additionalInformation: orderCustomFields.additionalInformation,
            attemptMonth: orderCustomFields.attemptMonth,
            attemptYear: orderCustomFields.attemptYear,
            examLevel: orderCustomFields.examLevel,
          },
        },
        { request },
      );
      if (result.setOrderCustomFields.__typename === 'Order') {
        activeOrder = result.setOrderCustomFields;
      } else {
        error = result.setOrderCustomFields;
      }
      break;
    }
    case 'setOrderCustomer': {
      const customerData = Object.fromEntries<any>(
        body.entries(),
      ) as CreateCustomerInput;
      const result = await setCustomerForOrder(
        {
          emailAddress: customerData.emailAddress,
          firstName: customerData.firstName,
          lastName: customerData.lastName,
          customFields: {
            icaiRegistrationNumber:
              body.get('icaiRegistrationNumber')?.toString() || '',
            gstin: body.get('gstin')?.toString() || '',
          },
        },
        { request },
      );
      if (result.setCustomerForOrder.__typename === 'Order') {
        activeOrder = result.setCustomerForOrder;
      } else {
        error = result.setCustomerForOrder;
      }
      break;
    }
    case 'setShippingMethod': {
      const shippingMethodId = body.get('shippingMethodId');
      if (typeof shippingMethodId === 'string') {
        const result = await setOrderShippingMethod(shippingMethodId, {
          request,
        });
        if (result.setOrderShippingMethod.__typename === 'Order') {
          activeOrder = result.setOrderShippingMethod;
        } else {
          error = result.setOrderShippingMethod;
        }
      }
      break;
    }
    case 'removeItem': {
      const lineId = body.get('lineId');
      const result = await removeOrderLine(lineId?.toString() ?? '', {
        request,
      });
      if (result.removeOrderLine.__typename === 'Order') {
        activeOrder = result.removeOrderLine;
      } else {
        error = result.removeOrderLine;
      }
      break;
    }
    case 'adjustItem': {
      const lineId = body.get('lineId');
      const quantity = body.get('quantity');
      if (lineId && quantity != null) {
        const result = await adjustOrderLine(lineId?.toString(), +quantity, {
          request,
        });
        if (result.adjustOrderLine.__typename === 'Order') {
          activeOrder = result.adjustOrderLine;
        } else {
          error = result.adjustOrderLine;
        }
      }
      break;
    }
    case 'addItemToOrder': {
      const variantId = body.get('variantId')?.toString();
      const quantity = Number(body.get('quantity')?.toString() ?? 1);
      if (!variantId || !(quantity > 0)) {
        throw new Error(
          `Invalid input: variantId ${variantId}, quantity ${quantity}`,
        );
      }
      const result = await addItemToOrder(variantId, quantity, {
        request,
      });
      if (result.addItemToOrder.__typename === 'Order') {
        activeOrder = result.addItemToOrder;
      } else {
        error = result.addItemToOrder;
      }
      break;
    }
    case 'addPaymentToOrder': {
      const paymentMethodCode = body.get('paymentMethodCode')?.toString();
      const orderCode = body.get('orderCode')?.toString();
      const amount = body.get('amount')?.toString();
      const description = body.get('description')?.toString();
      const name = body.get('name')?.toString();
      const email = body.get('email')?.toString();
      if (!paymentMethodCode) {
        throw new Error('No payment method provided');
      }

      // Call your Vendure provider to add payment
      const result = await addPaymentToOrder(
        {
          method: paymentMethodCode,
          metadata: {
            orderCode,
            amount,
            description,
            name,
            email,
          },
        },
        { request },
      );
      console.log('Easebuzz txnId result:', JSON.stringify(result));
      if (result.addPaymentToOrder.__typename === 'Order') {
        activeOrder = result.addPaymentToOrder;
      } else {
        error = result.addPaymentToOrder;
      }
      break;
    }
    default:
    // Don't do anything
  }
  let headers: ResponseInit['headers'] = {};
  const sessionStorage = await getSessionStorage();
  const session = await sessionStorage.getSession(
    request?.headers.get('Cookie'),
  );
  session.flash('activeOrderError', error);
  headers = {
    'Set-Cookie': await sessionStorage.commitSession(session),
  };

  let fallbackOrder = activeOrder;
  if (!fallbackOrder) {
    try {
      fallbackOrder = await getActiveOrder({ request });
    } catch (e) {
      console.warn(
        '⚠️ Fallback active order fetch failed:',
        (e as Error).message,
      );
    }
  }

  return json(
    { activeOrder: fallbackOrder || null },
    {
      headers,
    },
  );
}
