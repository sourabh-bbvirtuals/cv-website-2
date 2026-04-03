import { useLoaderData, useNavigation, useActionData } from '@remix-run/react';
import { Security, LoadingState } from '~/components/account';
import { getActiveCustomerDetails, updateCustomerPassword } from '~/providers/customer/customer';
import { logout, requestUpdateCustomerEmailAddress } from '~/providers/account/account';
import type { DataFunctionArgs, ActionFunctionArgs } from '@remix-run/server-runtime';
import { json, redirect } from '@remix-run/server-runtime';

export async function loader({ request }: DataFunctionArgs) {
  try {
    const customerDetails = await getActiveCustomerDetails({ request });
    
    if (!customerDetails?.activeCustomer) {
      return redirect('/');
    }

    return json({ 
      customer: customerDetails.activeCustomer
    });
  } catch (error) {
    console.error('Security loader error:', error);
    return redirect('/');
  }
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const actionType = formData.get('action') as string;

    switch (actionType) {
      case 'logout': {
        // Handle logout directly
        const result = await logout({ request });
        return redirect('/', { headers: result._headers });
      }
      
      case 'changePassword': {
        const currentPassword = formData.get('currentPassword') as string;
        const newPassword = formData.get('newPassword') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        // Validate passwords
        if (!currentPassword || !newPassword || !confirmPassword) {
          return json({ 
            success: false, 
            error: 'All password fields are required' 
          }, { status: 400 });
        }

        if (newPassword !== confirmPassword) {
          return json({ 
            success: false, 
            error: 'New passwords do not match' 
          }, { status: 400 });
        }

        if (newPassword.length < 6) {
          return json({ 
            success: false, 
            error: 'New password must be at least 6 characters long' 
          }, { status: 400 });
        }

        try {
          // Update customer password
          const result = await updateCustomerPassword(currentPassword, newPassword, { request });
          if (result.updateCustomerPassword.__typename === 'Success') {
            return json({ 
              success: true, 
              message: 'Password updated successfully' 
            });
          } else {
            return json({ 
              success: false, 
              error: result.updateCustomerPassword.message || 'Failed to update password' 
            }, { status: 400 });
          }
        } catch (error) {
          console.error('Password update error:', error);
          return json({ 
            success: false, 
            error: 'Failed to update password. Please try again.' 
          }, { status: 500 });
        }
      }

      case 'changeEmail': {
        const newEmail = formData.get('newEmail') as string;
        const password = formData.get('password') as string;

        // Validate inputs
        if (!newEmail || !password) {
          return json({ 
            success: false, 
            error: 'Email and password are required' 
          }, { status: 400 });
        }

        // Basic email validation
        if (!newEmail.includes('@') || !newEmail.includes('.')) {
          return json({ 
            success: false, 
            error: 'Please enter a valid email address' 
          }, { status: 400 });
        }

        try {
          // Request email change
          const result = await requestUpdateCustomerEmailAddress(password, newEmail, { request });
          
          if (result.__typename === 'Success') {
            return json({ 
              success: true, 
              newEmailAddress: newEmail,
              message: 'Email change request sent successfully' 
            });
          } else {
            return json({ 
              success: false, 
              error: result.message || 'Failed to send email change request' 
            }, { status: 400 });
          }
        } catch (error) {
          console.error('Email change request error:', error);
          return json({ 
            success: false, 
            error: 'Failed to send email change request. Please try again.' 
          }, { status: 500 });
        }
      }

      default:
        return json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Security action error:', error);
    return json({ 
      success: false, 
      error: 'An unexpected error occurred' 
    }, { status: 500 });
  }
}

export default function SecurityPage() {
  const { customer } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  // Show loading state while navigating
  if (navigation.state === 'loading') {
    return <LoadingState message="Loading security settings..." />;
  }

  return <Security customer={customer} actionData={actionData} />;
}
