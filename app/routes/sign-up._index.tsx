import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '~/constants';

// Interfaces for Form Data and Errors
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
  phone?: string;
  general?: string;
}

const SignUp: React.FC = () => {
  // State Management
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: '',
    email: '',
    dob: '',
    gender: '',
    board: '',
    studentClass: '',
    phone: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Phone Specific Handler (Numbers only, max 10 digits)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData((prev) => ({ ...prev, phone: value }));
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Custom useMutation-style hook to match requested pattern using Axios
  const useSignupMutation = () => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const mutate = async (data: SignUpFormData) => {
      setIsLoading(true);
      setError(null);

      // Split Full Name into First and Last Name
      const nameParts = data.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      const fullPhone = `+91${data.phone}`;

      const mutation = `
        mutation registerCustomerAccount($input: RegisterCustomerInput!) {
          registerCustomerAccount(input: $input) {
            __typename
            ... on Success {
              success
            }
            ... on ErrorResult {
              errorCode
              message
            }
          }
        }
      `;

      const cleanApiUrl = API_URL.split('?')[0];
      const vendureToken =
        new URL(API_URL, 'http://localhost').searchParams.get(
          'vendure-token',
        ) || 'bb-virtual-commerce';

      try {
        const response = await axios.post(
          cleanApiUrl,
          {
            query: mutation,
            variables: {
              input: {
                emailAddress: data.email,
                firstName: firstName,
                lastName: lastName,
                phoneNumber: fullPhone,
                password: '123456',
                // NOTE: The staging backend does not currently have customFields
                // mapped for RegisterCustomerInput. Sending it causes a BAD_USER_INPUT error.
                /*
                customFields: {
                  dateOfBirth: data.dob,
                  gender: data.gender,
                  board: data.board,
                  studentClass: data.studentClass,
                },
                */
              },
            },
          },
          {
            headers: {
              'vendure-token': vendureToken,
            },
          },
        );

        if (response.data?.errors?.length > 0) {
          console.error('GraphQL Errors:', response.data.errors);
          const errMsg =
            response.data.errors[0]?.message || 'GraphQL error occurred';
          setError(errMsg);
          setIsLoading(false);
          return { success: false, error: errMsg };
        }

        const result = response.data?.data?.registerCustomerAccount;

        if (result?.__typename === 'Success') {
          setIsLoading(false);
          return { success: true };
        } else {
          const errMsg =
            result?.message || 'Registration failed. Please try again.';
          setError(errMsg);
          setIsLoading(false);
          return { success: false, error: errMsg };
        }
      } catch (err: any) {
        const errMsg =
          err.response?.data?.errors?.[0]?.message ||
          'Network error. Please try again.';
        setError(errMsg);
        setIsLoading(false);
        return { success: false, error: errMsg };
      }
    };

    return { mutate, isLoading, error };
  };

  const { mutate, isLoading, error: serverError } = useSignupMutation();

  const handleSelect = (field: keyof SignUpFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Validation & Submit Handler
  const handleSignUp = async () => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (
      !formData.email.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = 'Valid Email is required';
    }
    if (!formData.phone || formData.phone.length !== 10) {
      newErrors.phone = 'Valid 10-digit Phone Number is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const result = await mutate(formData);
    if (result.success) {
      // Success - Redirect to login with success message so they can verify phone there
      window.location.href = '/login?registered=true';
    }
  };

  // Helper for generating dynamic classes for segmented buttons
  const getSegmentClass = (isActive: boolean) =>
    `flex items-center justify-center gap-2 flex-1 py-2 sm:py-3 rounded-full border text-sm sm:text-base font-geist font-medium transition-all bg-white cursor-pointer ${
      isActive
        ? 'border-[#3A6BFC] text-[#3A6BFC]'
        : 'border-[#0816271A] text-lightgray opacity-80 hover:opacity-100 hover:border-[#3A6BFC]'
    }`;

  // Reusable Input Wrapper Class
  const inputClass =
    'w-full bg-white rounded-full px-4 md:px-6 py-2.5 md:py-3.5 border border-[#0816271A] text-lightgray text-sm sm:text-base font-medium outline-none focus:border-[#3A6BFC] focus:ring-1 focus:ring-[#3A6BFC] transition-all';

  return (
    <main className="relative min-h-screen bg-white flex flex-col items-center justify-between p-4 py-6 sm:py-10 xl:py-15 overflow-y-auto mx-auto bg-[url('/assets/images/homepage/hero-bg.png')] bg-no-repeat bg-cover bg-center">
      {/* Top Logo */}
      <a href="/" className="relative max-w-61.25 w-full aspect-245/48">
        <img src="/assets/logo.png" alt="logo" />
      </a>

      {/* Main Form Container */}
      <div className="flex flex-col items-center w-full gap-4 sm:gap-6 text-center grow justify-center max-w-150 py-16">
        {/* Headers */}
        <div className="flex flex-col items-center mb-2">
          <h1 className="font-geist font-semibold leading-[120%] text-2xl md:text-3xl lg:text-[32px] tracking-[-1%] text-lightgray">
            Create an Account
          </h1>
          <p className="text-lightgray opacity-50 font-geist leading-[120%] text-xs sm:text-sm lg:text-base mt-2 sm:mt-3">
            We'd like to know about your current status
          </p>
        </div>

        {/* Form Box */}
        <div className="bg-[#FFFFFF33] border border-[#FFFFFF] w-full max-w-120 lg:max-w-150 rounded-[30px] p-5 sm:p-8 text-left z-10 flex flex-col gap-4 sm:gap-5">
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
              className={`${inputClass} ${
                errors.fullName ? 'border-red-500' : ''
              }`}
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
              className={`${inputClass} ${
                errors.email ? 'border-red-500' : ''
              }`}
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
                🏵️ CBSE
              </button>
              <button
                type="button"
                onClick={() => handleSelect('board', 'MH')}
                className={getSegmentClass(formData.board === 'MH')}
              >
                🏫 MH
              </button>
              <button
                type="button"
                onClick={() => handleSelect('board', 'CUET')}
                className={getSegmentClass(formData.board === 'CUET')}
              >
                🎓 CUET
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

          {/* Phone Number */}
          <div className="flex flex-col gap-1.5">
            <label className="text-lightgray font-medium opacity-70 font-geist text-xs sm:text-sm">
              Phone Number
            </label>
            <div
              className={`flex items-center gap-2 bg-white rounded-full px-4 md:px-6 py-2.5 md:py-3.5 border ${
                errors.phone ? 'border-red-500' : 'border-[#0816271A]'
              } focus-within:border-[#3A6BFC] transition-all`}
            >
              <span className="text-lightgray font-medium font-geist text-sm sm:text-base">
                +91
              </span>
              <input
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                className="bg-transparent w-full text-lightgray text-sm sm:text-base font-medium border-none outline-none focus:ring-0"
                placeholder="00000-00000"
              />
            </div>
            {errors.phone && (
              <span className="text-red-500 text-xs px-2">{errors.phone}</span>
            )}
          </div>

          {/* Server Error Display */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-geist">
              {serverError}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSignUp}
            disabled={isLoading}
            className="font-geist font-medium text-sm sm:text-base lg:text-lg bg-[#3A6BFC] py-3 md:py-4 min-h-[48px] md:min-h-[56px] text-white flex items-center justify-center w-full rounded-full shadow-[inset_0px_4px_8px_0px_#83A2FFBF,inset_0px_-2px_2px_0px_#0F3FCE] mt-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              'Create an Account'
            )}
          </button>
        </div>

        {/* Redirect to Login */}
        <a
          href="/login"
          className="font-geist font-medium text-sm sm:text-base text-[#808591] group mt-2"
        >
          Old User?{' '}
          <span className="text-[#3A6BFC] group-hover:underline transition-all duration-300 ease-in-out">
            Login
          </span>
        </a>
      </div>

      {/* Policy Section (Bottom) */}
      <div className="w-full text-center mt-auto pt-4">
        <p className="font-geist font-medium text-xs sm:text-sm leading-[120%] text-lightgray opacity-50">
          You Acknowledge that you read, and agree to our
        </p>
        <p className="font-geist font-medium text-xs sm:text-sm leading-[120%] text-lightgray opacity-50 mt-1">
          <a
            href="#"
            className="hover:text-[#3A6BFC] hover:opacity-100 transition-all duration-300 ease-in-out underline"
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="#"
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
