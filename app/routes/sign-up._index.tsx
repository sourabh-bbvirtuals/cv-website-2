import React, { useState } from 'react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData, useNavigation } from '@remix-run/react';
import { getActiveCustomerDetails } from '~/providers/customer/customer';
import { updateCustomer } from '~/providers/account/account';

const BB_SERVER_URL = process.env.BB_SERVER_URL ?? 'http://localhost:3001';
const BUSINESS_VERTICAL_ID = process.env.BUSINESS_VERTICAL_ID ?? '';

const CLEAR_PROFILE_COOKIE =
  'bb-profile-incomplete=; Path=/; Max-Age=0; SameSite=Lax';

export async function loader({ request }: LoaderFunctionArgs) {
  let phone = '';
  try {
    const customer = await getActiveCustomerDetails({ request });
    const c = customer?.activeCustomer;
    if (c?.phoneNumber) {
      phone = c.phoneNumber.replace(/^\+91/, '');
    }
    if (!phone && c?.emailAddress?.endsWith('@bbvirtuals.tech')) {
      phone = c.emailAddress.replace('@bbvirtuals.tech', '').replace(/^\+?91/, '');
    }
  } catch {}
  return json({ phone });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const fullName = (formData.get('fullName') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();

  if (!fullName) {
    return json({ error: 'Full Name is required' }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'Valid email is required' }, { status: 400 });
  }

  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  const phone = (formData.get('phone') as string) || '';
  const dob = (formData.get('dob') as string) || '';
  const gender = (formData.get('gender') as string) || '';

  console.log('[sign-up] updateCustomer input:', { firstName, lastName, phoneNumber: phone, dob, gender });

  try {
    const updateResult = await updateCustomer(
      {
        firstName,
        lastName,
        phoneNumber: phone,
        customFields: {
          dateOfBirth: dob || null,
          gender: gender || null,
          board: ((formData.get('board') as string) || '') || null,
          studentClass: ((formData.get('studentClass') as string) || '') || null,
          contactEmail: email || null,
        },
      },
      { request },
    );
    console.log('[sign-up] updateCustomer result:', JSON.stringify(updateResult));
  } catch (err) {
    console.error('updateCustomer threw:', err);
    return json(
      { error: 'Failed to update profile. Please try again.' },
      { status: 500 },
    );
  }

  try {
    const verify = await getActiveCustomerDetails({ request });
    const c = verify?.activeCustomer;
    if (c && c.firstName !== firstName) {
      console.error(
        `updateCustomer did NOT persist. Expected firstName="${firstName}", got "${c?.firstName}"`,
      );
      return json(
        { error: 'Profile update did not save. Please try again.' },
        { status: 500 },
      );
    }
  } catch (verifyErr) {
    console.error('Failed to verify customer update:', verifyErr);
  }

  try {
    const details = await getActiveCustomerDetails({ request });
    const c = details?.activeCustomer;
    if (c?.id) {
      fetch(`${BB_SERVER_URL}/webhooks/vendure/customer-onboarded`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendureCustomerId: String(c.id),
          businessVerticalId: BUSINESS_VERTICAL_ID,
          name: fullName,
          phone,
          email,
          board: (formData.get('board') as string) || '',
          studentClass: (formData.get('studentClass') as string) || '',
        }),
      }).catch((err) => console.error('[sign-up] lead enrich failed:', err));
    }
  } catch (enrichErr) {
    console.error('[sign-up] lead enrich error:', enrichErr);
  }

  const board = (formData.get('board') as string) || '';
  const studentClass = (formData.get('studentClass') as string) || '';

  const headers = new Headers();
  headers.append('Set-Cookie', CLEAR_PROFILE_COOKIE);
  if (board) {
    headers.append(
      'Set-Cookie',
      `bb-user-board=${encodeURIComponent(board)}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`,
    );
  }
  if (studentClass) {
    headers.append(
      'Set-Cookie',
      `bb-user-class=${encodeURIComponent(studentClass.replace(/\D/g, ''))}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`,
    );
  }
  return redirect('/', { headers });
}

interface SignUpFormData {
  fullName: string;
  email: string;
  dob: string;
  gender: 'Male' | 'Female' | '';
  board: 'CBSE' | 'MH' | 'CUET' | '';
  studentClass: '11th' | '12th' | '';
  phone: string;
}

interface FormErrors {
  fullName?: string;
  email?: string;
}

const SignUp: React.FC = () => {
  const { phone: prefillPhone } = useLoaderData<typeof loader>();
  const actionData = useActionData<{ error?: string }>();
  const navigation = useNavigation();

  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: '',
    email: '',
    dob: '',
    gender: '',
    board: '',
    studentClass: '',
    phone: prefillPhone || '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const isSubmitting = navigation.state !== 'idle';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelect = (field: keyof SignUpFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = 'Valid Email is required';
    }
    if (Object.keys(newErrors).length > 0) {
      e.preventDefault();
      setErrors(newErrors);
      return;
    }

    try {
      localStorage.setItem(
        'bb_user_profile',
        JSON.stringify({
          board: formData.board,
          classLevel: formData.studentClass,
          dob: formData.dob,
          gender: formData.gender,
          email: formData.email.trim(),
        }),
      );
    } catch {}
  };

  const getSegmentClass = (isActive: boolean) =>
    `flex items-center justify-center gap-2 flex-1 py-2 sm:py-3 rounded-full border text-sm sm:text-base font-geist font-medium transition-all bg-white cursor-pointer ${
      isActive
        ? 'border-[#3A6BFC] text-[#3A6BFC]'
        : 'border-[#0816271A] text-lightgray opacity-80 hover:opacity-100 hover:border-[#3A6BFC]'
    }`;

  const inputClass =
    'w-full bg-white rounded-full px-4 md:px-6 py-2.5 md:py-3.5 border border-[#0816271A] text-lightgray text-sm sm:text-base font-medium outline-none focus:border-[#3A6BFC] focus:ring-1 focus:ring-[#3A6BFC] transition-all';

  const serverError = actionData?.error;

  return (
    <main className="relative min-h-screen bg-white flex flex-col items-center justify-between p-4 py-6 sm:py-10 xl:py-15 overflow-y-auto mx-auto bg-[url('/assets/images/homepage/hero-bg.png')] bg-no-repeat bg-cover bg-center">
      <a href="/" className="relative max-w-61.25 w-full aspect-245/48">
        <img src="/assets/logo.png" alt="logo" />
      </a>

      <div className="flex flex-col items-center w-full gap-4 sm:gap-6 text-center grow justify-center max-w-150 py-16">
        <div className="flex flex-col items-center mb-2">
          <h1 className="font-geist font-semibold leading-[120%] text-2xl md:text-3xl lg:text-[32px] tracking-[-1%] text-lightgray">
            Complete Your Profile
          </h1>
          <p className="text-lightgray opacity-50 font-geist leading-[120%] text-xs sm:text-sm lg:text-base mt-2 sm:mt-3">
            We'd like to know about your current status
          </p>
        </div>

        <Form
          method="POST"
          onSubmit={handleSignUp}
          className="bg-[#FFFFFF33] border border-[#FFFFFF] w-full max-w-120 lg:max-w-150 rounded-[30px] p-5 sm:p-8 text-left z-10 flex flex-col gap-4 sm:gap-5"
        >
          <input
            type="hidden"
            name="phone"
            value={formData.phone ? `+91${formData.phone.replace(/\D/g, '')}` : ''}
          />
          <input type="hidden" name="gender" value={formData.gender} />
          <input type="hidden" name="board" value={formData.board} />
          <input type="hidden" name="studentClass" value={formData.studentClass} />
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-lightgray font-medium opacity-70 font-geist text-xs sm:text-sm">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className={`${inputClass} ${errors.fullName ? 'border-red-500' : ''}`}
              placeholder="Write Name here"
            />
            {errors.fullName && (
              <span className="text-red-500 text-xs px-2">
                {errors.fullName}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-lightgray font-medium opacity-70 font-geist text-xs sm:text-sm">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`${inputClass} ${errors.email ? 'border-red-500' : ''}`}
              placeholder="Write Email here"
            />
            {errors.email && (
              <span className="text-red-500 text-xs px-2">{errors.email}</span>
            )}
          </div>

          {/* Date of Birth */}
          <div className="flex flex-col gap-1.5">
            <label className="text-lightgray font-medium opacity-70 font-geist text-xs sm:text-sm">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              className={inputClass}
            />
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-1.5">
            <label className="text-lightgray font-medium opacity-70 font-geist text-xs sm:text-sm">
              Gender
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleSelect('gender', 'Male')}
                className={getSegmentClass(formData.gender === 'Male')}
              >
                Male
              </button>
              <button
                type="button"
                onClick={() => handleSelect('gender', 'Female')}
                className={getSegmentClass(formData.gender === 'Female')}
              >
                Female
              </button>
            </div>
          </div>

          {/* Board */}
          <div className="flex flex-col gap-1.5">
            <label className="text-lightgray font-medium opacity-70 font-geist text-xs sm:text-sm">
              Which Board?
            </label>
            <div className="flex gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => handleSelect('board', 'CBSE')}
                className={getSegmentClass(formData.board === 'CBSE')}
              >
                CBSE
              </button>
              <button
                type="button"
                onClick={() => handleSelect('board', 'MH')}
                className={getSegmentClass(formData.board === 'MH')}
              >
                MH
              </button>
              <button
                type="button"
                onClick={() => handleSelect('board', 'CUET')}
                className={getSegmentClass(formData.board === 'CUET')}
              >
                CUET
              </button>
            </div>
          </div>

          {/* Class */}
          <div className="flex flex-col gap-1.5">
            <label className="text-lightgray font-medium opacity-70 font-geist text-xs sm:text-sm">
              Which Class Are You In?
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleSelect('studentClass', '11th')}
                className={getSegmentClass(formData.studentClass === '11th')}
              >
                11th
              </button>
              <button
                type="button"
                onClick={() => handleSelect('studentClass', '12th')}
                className={getSegmentClass(formData.studentClass === '12th')}
              >
                12th
              </button>
            </div>
          </div>

          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-geist">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="font-geist font-medium text-sm sm:text-base lg:text-lg bg-[#3A6BFC] py-3 md:py-4 min-h-[48px] md:min-h-[56px] text-white flex items-center justify-center w-full rounded-full shadow-[inset_0px_4px_8px_0px_#83A2FFBF,inset_0px_-2px_2px_0px_#0F3FCE] mt-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              'Save & Continue'
            )}
          </button>
        </Form>
      </div>

      <div className="w-full text-center mt-auto pt-4">
        <p className="font-geist font-medium text-xs sm:text-sm leading-[120%] text-lightgray opacity-50">
          You Acknowledge that you read, and agree to our
        </p>
        <p className="font-geist font-medium text-xs sm:text-sm leading-[120%] text-lightgray opacity-50 mt-1">
          <a
            href="/terms-and-conditions"
            className="hover:text-[#3A6BFC] hover:opacity-100 transition-all duration-300 ease-in-out underline"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="/privacy-and-terms"
            className="hover:text-[#3A6BFC] hover:opacity-100 transition-all duration-300 ease-in-out underline"
          >
            Privacy Policy
          </a>
        </p>
      </div>
    </main>
  );
};

export default SignUp;
