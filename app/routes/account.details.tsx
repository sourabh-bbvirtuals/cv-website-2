import { useLoaderData, useNavigation } from '@remix-run/react';
import { AccountDetails, LoadingState } from '~/components/account';
import { getActiveCustomerDetails } from '~/providers/customer/customer';
import { updateCustomer } from '~/providers/account/account';
import type {
  DataFunctionArgs,
  ActionFunctionArgs,
} from '@remix-run/server-runtime';
import { json, redirect } from '@remix-run/server-runtime';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const actionType = formData.get('action');

  if (actionType === 'updateCustomer') {
    const input = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      phoneNumber: formData.get('phoneNumber') as string,
      title: formData.get('title') as string,
      customFields: {
        icaiRegistrationNumber: formData.get(
          'icaiRegistrationNumber',
        ) as string,
        gstin: formData.get('gstin') as string,
        dateOfBirth: (formData.get('dateOfBirth') as string) || null,
        gender: (formData.get('gender') as string) || null,
        board: (formData.get('board') as string) || null,
        studentClass: (formData.get('studentClass') as string) || null,
        contactEmail: (formData.get('contactEmail') as string) || null,
      },
    };

    const result = await updateCustomer(input, { request });

    if (result.updateCustomer) {
      return json({ success: true, customer: result.updateCustomer });
    } else {
      return json({
        success: false,
        error: 'Failed to update customer details',
      });
    }
  }

  return json({ error: 'Invalid action' }, { status: 400 });
}

export async function loader({ request }: DataFunctionArgs) {
  try {
    const customerDetails = await getActiveCustomerDetails({ request });

    if (!customerDetails?.activeCustomer) {
      return redirect('/');
    }

    return json({
      customer: customerDetails.activeCustomer,
    });
  } catch (error) {
    console.error('Account details loader error:', error);
    return redirect('/');
  }
}

export default function AccountDetailsPage() {
  const { customer } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  // Show loading state while navigating
  if (navigation.state === 'loading') {
    return <LoadingState message="Loading account details..." />;
  }

  return <AccountDetails customer={customer} />;
}
