import { useLoaderData, useFetcher, useNavigation } from '@remix-run/react';
import { Addresses, LoadingState } from '~/components/account';
import { getActiveCustomerAddresses } from '~/providers/customer/customer';
import { createCustomerAddress, updateCustomerAddress, deleteCustomerAddress } from '~/providers/account/account';
import { getAvailableCountries } from '~/providers/checkout/checkout';
import { getCollectionBySlug } from '~/providers/collections/collections';
import type { DataFunctionArgs, ActionFunctionArgs } from '@remix-run/server-runtime';
import { json, redirect } from '@remix-run/server-runtime';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get('action');

  try {
    switch (actionType) {
      case 'createAddress': {
        const defaultShipping = formData.get('defaultShippingAddress') === 'true';
        const defaultBilling = formData.get('defaultBillingAddress') === 'true';
        
        // If setting as default, clear other addresses first
        if (defaultShipping || defaultBilling) {
          const currentAddresses = await getActiveCustomerAddresses({ request });
          const allAddresses = currentAddresses?.activeCustomer?.addresses || [];
          
          for (const addr of allAddresses) {
            const needsUpdate = (defaultShipping && addr.defaultShippingAddress) || 
                               (defaultBilling && addr.defaultBillingAddress);
            
            if (needsUpdate) {
              await updateCustomerAddress({
                id: addr.id,
                fullName: addr.fullName,
                streetLine1: addr.streetLine1,
                streetLine2: addr.streetLine2,
                city: addr.city,
                province: addr.province,
                postalCode: addr.postalCode,
                countryCode: addr.country.code,
                phoneNumber: addr.phoneNumber,
                company: addr.company,
                defaultShippingAddress: defaultShipping ? false : addr.defaultShippingAddress,
                defaultBillingAddress: defaultBilling ? false : addr.defaultBillingAddress,
              }, { request });
            }
          }
        }

        const input = {
          fullName: formData.get('fullName') as string,
          streetLine1: formData.get('streetLine1') as string,
          streetLine2: formData.get('streetLine2') as string,
          city: formData.get('city') as string,
          province: formData.get('province') as string,
          postalCode: formData.get('postalCode') as string,
          countryCode: formData.get('countryCode') as string,
          phoneNumber: formData.get('phoneNumber') as string,
          company: formData.get('company') as string,
          defaultShippingAddress: defaultShipping,
          defaultBillingAddress: defaultBilling,
          customFields: {
            emailAddress: formData.get('emailAddress') as string,
          },
        };

        const result = await createCustomerAddress(input, { request });
        
        console.log('Create address result:', JSON.stringify(result, null, 2));
        
        if (result && result.id) {
          return json({ success: true, address: result });
        } else {
          return json({ 
            success: false, 
            error: (result as any)?.message || 'Failed to create address' 
          });
        }
      }

      case 'updateAddress': {
        const addressId = formData.get('id') as string;
        const defaultShipping = formData.get('defaultShippingAddress') === 'true';
        const defaultBilling = formData.get('defaultBillingAddress') === 'true';
        
        // If setting as default, clear other addresses first
        if (defaultShipping || defaultBilling) {
          const currentAddresses = await getActiveCustomerAddresses({ request });
          const allAddresses = currentAddresses?.activeCustomer?.addresses || [];
          
          for (const addr of allAddresses) {
            if (addr.id !== addressId) {
              const needsUpdate = (defaultShipping && addr.defaultShippingAddress) || 
                                 (defaultBilling && addr.defaultBillingAddress);
              
              if (needsUpdate) {
                await updateCustomerAddress({
                  id: addr.id,
                  fullName: addr.fullName,
                  streetLine1: addr.streetLine1,
                  streetLine2: addr.streetLine2,
                  city: addr.city,
                  province: addr.province,
                  postalCode: addr.postalCode,
                  countryCode: addr.country.code,
                  phoneNumber: addr.phoneNumber,
                  company: addr.company,
                  defaultShippingAddress: defaultShipping ? false : addr.defaultShippingAddress,
                  defaultBillingAddress: defaultBilling ? false : addr.defaultBillingAddress,
                }, { request });
              }
            }
          }
        }

        const input = {
          id: addressId,
          fullName: formData.get('fullName') as string,
          streetLine1: formData.get('streetLine1') as string,
          streetLine2: formData.get('streetLine2') as string,
          city: formData.get('city') as string,
          province: formData.get('province') as string,
          postalCode: formData.get('postalCode') as string,
          countryCode: formData.get('countryCode') as string,
          phoneNumber: formData.get('phoneNumber') as string,
          company: formData.get('company') as string,
          defaultShippingAddress: defaultShipping,
          defaultBillingAddress: defaultBilling,
        };

        const result = await updateCustomerAddress(input, { request });
        
        if (result && result.id) {
          return json({ success: true, address: result });
        } else {
          return json({ 
            success: false, 
            error: (result as any)?.message || 'Failed to update address' 
          });
        }
      }

      case 'deleteAddress': {
        const id = formData.get('id') as string;
        
        const result = await deleteCustomerAddress(id, { request });
        
        if (result?.success === true) {
          return json({ success: true });
        } else {
          return json({ 
            success: false, 
            error: (result as any)?.message || 'Failed to delete address' 
          });
        }
      }

      case 'setDefaultShipping': {
        const id = formData.get('id') as string;
        
        // First, get all current addresses
        const currentAddresses = await getActiveCustomerAddresses({ request });
        const address = currentAddresses?.activeCustomer?.addresses?.find(addr => addr.id === id);
        
        if (!address) {
          return json({ 
            success: false, 
            error: 'Address not found' 
          });
        }

        // Clear defaultShippingAddress from all other addresses first
        const allAddresses = currentAddresses?.activeCustomer?.addresses || [];
        for (const addr of allAddresses) {
          if (addr.id !== id && addr.defaultShippingAddress) {
            // Clear the default shipping flag from other addresses
            await updateCustomerAddress({
              id: addr.id,
              fullName: addr.fullName,
              streetLine1: addr.streetLine1,
              streetLine2: addr.streetLine2,
              city: addr.city,
              province: addr.province,
              postalCode: addr.postalCode,
              countryCode: addr.country.code,
              phoneNumber: addr.phoneNumber,
              company: addr.company,
              defaultShippingAddress: false,
              defaultBillingAddress: addr.defaultBillingAddress,
            }, { request });
          }
        }

        // Now set the selected address as default shipping
        const input = {
          id: address.id,
          fullName: address.fullName,
          streetLine1: address.streetLine1,
          streetLine2: address.streetLine2,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode,
          countryCode: address.country.code,
          phoneNumber: address.phoneNumber,
          company: address.company,
          defaultShippingAddress: true,
          defaultBillingAddress: address.defaultBillingAddress,
        };

        const result = await updateCustomerAddress(input, { request });
        
        if (result && result.id) {
          return json({ success: true, address: result });
        } else {
          return json({ 
            success: false, 
            error: (result as any)?.message || 'Failed to set default shipping address' 
          });
        }
      }

      case 'setDefaultBilling': {
        const id = formData.get('id') as string;
        
        // First, get all current addresses
        const currentAddresses = await getActiveCustomerAddresses({ request });
        const address = currentAddresses?.activeCustomer?.addresses?.find(addr => addr.id === id);
        
        if (!address) {
          return json({ 
            success: false, 
            error: 'Address not found' 
          });
        }

        // Clear defaultBillingAddress from all other addresses first
        const allAddresses = currentAddresses?.activeCustomer?.addresses || [];
        for (const addr of allAddresses) {
          if (addr.id !== id && addr.defaultBillingAddress) {
            // Clear the default billing flag from other addresses
            await updateCustomerAddress({
              id: addr.id,
              fullName: addr.fullName,
              streetLine1: addr.streetLine1,
              streetLine2: addr.streetLine2,
              city: addr.city,
              province: addr.province,
              postalCode: addr.postalCode,
              countryCode: addr.country.code,
              phoneNumber: addr.phoneNumber,
              company: addr.company,
              defaultShippingAddress: addr.defaultShippingAddress,
              defaultBillingAddress: false,
            }, { request });
          }
        }

        // Now set the selected address as default billing
        const input = {
          id: address.id,
          fullName: address.fullName,
          streetLine1: address.streetLine1,
          streetLine2: address.streetLine2,
          city: address.city,
          province: address.province,
          postalCode: address.postalCode,
          countryCode: address.country.code,
          phoneNumber: address.phoneNumber,
          company: address.company,
          defaultShippingAddress: address.defaultShippingAddress,
          defaultBillingAddress: true,
          customFields: {
            emailAddress: address?.customFields?.emailAddress || '',
          },
        };

        const result = await updateCustomerAddress(input, { request });
        
        if (result && result.id) {
          return json({ success: true, address: result });
        } else {
          return json({ 
            success: false, 
            error: (result as any)?.message || 'Failed to set default billing address' 
          });
        }
      }

      default:
        return json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Address action error:', error);
    return json({ 
      success: false, 
      error: 'An error occurred while processing your request' 
    });
  }
}

export async function loader({ request }: DataFunctionArgs) {
  try {
    const [customerAddresses, availableCountries] = await Promise.all([
      getActiveCustomerAddresses({ request }).catch(() => null),
      getAvailableCountries({ request }).catch(() => null)
    ]);

    if (!customerAddresses?.activeCustomer) {
      return redirect('/');
    }

    // Fetch states collection
    let statesData = {};
    try {
      const { collection } = await getCollectionBySlug('states', { request });
      if (collection?.customFields?.customData) {
        statesData = JSON.parse(collection.customFields.customData);
      }
    } catch (error) {
      console.error('Error fetching states collection:', error);
    }

    return json({ 
      addresses: customerAddresses.activeCustomer.addresses || [],
      availableCountries: availableCountries?.availableCountries || [],
      statesData
    });
  } catch (error) {
    console.error('Addresses loader error:', error);
    return redirect('/');
  }
}

export default function AddressesPage() {
  const { addresses, availableCountries, statesData } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  // Show loading state while navigating
  if (navigation.state === 'loading') {
    return <LoadingState message="Loading addresses..." />;
  }

  return <Addresses addresses={addresses} availableCountries={availableCountries} statesData={statesData} />;
}
