import { useActiveOrder } from '~/utils/use-active-order';
import { CreateAddressInput, UpdateOrderCustomFieldsInput } from '~/generated/graphql';

export type OutletContext = ReturnType<typeof useActiveOrder>;

export type ShippingFormData = CreateAddressInput;

export type OrderCustomFieldsFormData = UpdateOrderCustomFieldsInput;