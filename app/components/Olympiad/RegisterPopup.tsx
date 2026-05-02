import React, { useState, useRef, useEffect } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { useFetcher, useLocation } from '@remix-run/react';
import {
  AppStoreButton,
  GooglePlayButton,
} from '../base/buttons/app-store-buttons';
import { PLATFORMS } from '~/routes/download';
import { ActiveCustomerQuery } from '~/generated/graphql';

interface RegisterPopupProps {
  customer: ActiveCustomerQuery | null | undefined; // You can replace 'any' with the actual type of your customer data
  isOpen: boolean;
  onClose: () => void;
  onRegistrationComplete?: () => void;
  autoCloseDelay?: number; // in milliseconds, default: 3000
  productVariantId?: string | null; // Product variant ID for adding to cart
  isAlreadyRegistered?: boolean; // When true, popup opens directly on completion/success screen
}

export default function RegisterPopup({
  customer,
  isOpen,
  onClose,
  onRegistrationComplete,
  autoCloseDelay = 3000,
  productVariantId,
  isAlreadyRegistered = false,
}: RegisterPopupProps) {
  // TESTING: Check environment variable or prop for OTP bypass
  const skipOtp = false;

  // Log OTP bypass status in development
  useEffect(() => {
    if (skipOtp) {
      console.warn(
        '[TESTING] OTP bypass enabled - using test mode (skipOtp: environment=%s, prop=%s)',
      );
    }
  }, [skipOtp]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const [currentStep, setCurrentStep] = useState<'form' | 'otp' | 'completion'>(
    isAlreadyRegistered ? 'completion' : 'form',
  );

  // If the popup is opened for an already-registered user, jump straight to
  // the completion/success screen so they can see the confirmation & app links.
  useEffect(() => {
    if (isOpen && isAlreadyRegistered) {
      setCurrentStep('completion');
    }
  }, [isOpen, isAlreadyRegistered]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [resendCooldown, setResendCooldown] = useState(0);

  const location = useLocation();

  const appStoreLink =
    PLATFORMS.find((platform) => platform.name === 'iOS')?.href ?? '#';
  const playStoreLink =
    PLATFORMS.find((platform) => platform.name === 'Android')?.href ?? '#';

  const phoneOtpFetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const phoneOtpBusy = phoneOtpFetcher.state !== 'idle';

  const loginVerifyFetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const verifyOtpBusy = loginVerifyFetcher.state !== 'idle';

  // NEW: Register fetcher (creates customer account for new users)
  const registerFetcher = useFetcher<{
    success?: boolean;
    error?: string;
    customer?: any;
  }>();
  const isRegistering = registerFetcher.state !== 'idle';

  // Cart submission fetcher
  const cartFetcher = useFetcher<{ order?: any; error?: string }>();
  const isSubmittingCart = cartFetcher.state !== 'idle';

  // Customer update fetcher (for new user registration)
  const customerUpdateFetcher = useFetcher<{
    success?: boolean;
    error?: string;
  }>();
  const isUpdatingCustomer = customerUpdateFetcher.state !== 'idle';

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [otpError, setOtpError] = useState<string | null>(null);
  const [cartError, setCartError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Pre-fill form if customer exists
  useEffect(() => {
    if (isOpen && customer?.activeCustomer) {
      const { firstName, lastName, customFields, phoneNumber } =
        customer.activeCustomer;
      setFormData({
        name: `${firstName} ${lastName}`.trim(),
        email: customFields?.contactEmail || '',
        phone: phoneNumber?.replace(/\D/g, '').slice(-10) || '',
      });
    }
  }, [isOpen, customer?.activeCustomer]);

  const normalizePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith('91'))
      return `+91${digits.slice(2)}`;
    if (digits.length === 11 && digits.startsWith('0'))
      return `+91${digits.slice(1)}`;
    return `+91${digits.slice(-10)}`;
  };

  const getRawPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
    if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
    return digits.slice(-10);
  };

  const validateForm = () => {
    const newErrors = { name: '', email: '', phone: '' };
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Submit product to cart
  const submitToCart = () => {
    if (!productVariantId) {
      setCartError('Product information not available');
      return;
    }

    setCartError(null);
    cartFetcher.submit(
      { variantId: productVariantId, quantity: '1' },
      { method: 'post', action: '/api/enroll' },
    );
  };

  // NEW: Submit product for free enrollment (skips cart/checkout)
  // Supports both authenticated users (no email needed) and guest users (email required)
  const submitToFreeEnrollment = (guestEmail?: string) => {
    if (!productVariantId) {
      setCartError('Product information not available');
      return;
    }

    setCartError(null);

    const formData: Record<string, string> = {
      variantId: productVariantId,
      quantity: '1',
    };

    // If guest email is provided, include it for guest enrollment
    if (guestEmail) {
      formData.customerEmail = guestEmail;
    }

    cartFetcher.submit(formData, {
      method: 'post',
      action: '/api/enroll-free',
    });
  };

  // NEW: Update customer profile with name, email, phone from registration form
  const updateCustomerProfile = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      console.log('[RegisterPopup] Missing form data for customer update');
      return;
    }

    setUpdateError(null);
    const nameParts = formData.name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const logPrefix = skipOtp ? '[TESTING]' : '[RegisterPopup]';
    console.log(`${logPrefix} Updating customer profile:`, {
      firstName,
      lastName,
      phone: formData.phone,
      email: formData.email,
      otpSkipped: skipOtp,
    });

    const rawPhone = getRawPhone(formData.phone);
    console.log('[RegisterPopup] updateCustomerProfile rawPhone:', rawPhone);
    customerUpdateFetcher.submit(
      {
        fullName: formData.name,
        email: formData.email,
        phone: rawPhone,
      },
      { method: 'post', action: '/sign-up' },
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    // Clear enrollment error if user is editing email field
    if (name === 'email' && cartError) {
      setCartError(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }

    // If customer is logged in, submit directly to free enrollment
    if (customer?.activeCustomer) {
      submitToFreeEnrollment();
      return;
    }

    // TESTING: Skip OTP verification if flag is enabled
    if (skipOtp) {
      console.log(
        '[TESTING] Skipping OTP - going directly to free enrollment (bypassing profile update for new user)',
      );
      // For new users, don't call /sign-up - go directly to free enrollment
      // Backend will handle customer creation
      handleProfileUpdateIfNeeded();
      return;
    }

    // Normal flow: Send OTP for non-logged-in users
    sendPhoneOtp();
  };

  const sendPhoneOtp = () => {
    if (formData.phone.length !== 10) return;
    setOtpError(null);
    const normalizedPhone = normalizePhone(formData.phone);
    console.log('[RegisterPopup] sendPhoneOtp', {
      rawPhone: formData.phone,
      normalizedPhone,
    });
    phoneOtpFetcher.submit(
      { phone: normalizedPhone },
      { method: 'POST', action: '/sign-in' },
    );
  };

  useEffect(() => {
    if (phoneOtpFetcher.state !== 'idle' || !phoneOtpFetcher.data) return;
    const d = phoneOtpFetcher.data;
    if (d.ok) {
      setCurrentStep('otp');
      setOtp(['', '', '', '', '', '']);
      setResendCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } else if (d.error) {
      setOtpError(d.error);
    }
  }, [phoneOtpFetcher.state, phoneOtpFetcher.data]);

  // Handle cart submission response (for logged-in users in Case 1)
  useEffect(() => {
    if (cartFetcher.state !== 'idle' || !cartFetcher.data) return;
    const d = cartFetcher.data;
    if (d.error) {
      console.error('[RegisterPopup] Enrollment error:', d.error);

      // Check if it's a duplicate enrollment error
      if (d.error.includes('already enrolled')) {
        setCartError('You have already enrolled in this course.');
        // Stay on form step to allow retry with different email
      } else {
        setCartError(d.error);
        // Stay on current step for other errors
      }
    } else if (d.order) {
      // Cart added successfully, move to completion
      setCartError(null);
      setCurrentStep('completion');
      onRegistrationComplete?.();
    }
  }, [cartFetcher.state, cartFetcher.data, onRegistrationComplete]);

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // For logged-in users, go directly to completion
    if (customer?.activeCustomer) {
      setCurrentStep('completion');
      return;
    }

    verifyPhoneOtp();
  };

  const verifyPhoneOtp = () => {
    const otpValue = otp.join('');
    if (otpValue.length < 6) return;
    setOtpError(null);

    const fullPhone = `+91${formData.phone}`;
    console.log('[RegisterPopup] verifyPhoneOtp submit', {
      phone: fullPhone,
      otp: otpValue,
      name: formData.name.trim(),
      email: formData.email.trim(),
    });
    loginVerifyFetcher.submit(
      {
        phone: fullPhone,
        otp: otpValue,
        name: formData.name.trim(),
        email: formData.email.trim(),
        redirectTo: location.pathname + (location.search || '') || '/',
        embedRegistration: 'true',
      },
      { method: 'POST', action: '/login' },
    );
  };

  useEffect(() => {
    if (currentStep !== 'otp') return;
    if (loginVerifyFetcher.state !== 'idle' || !loginVerifyFetcher.data) {
      return;
    }
    const d = loginVerifyFetcher.data;
    if ('error' in d && d.error) {
      setOtpError(d.error);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
      return;
    }
    if (d.ok === true) {
      console.log('[RegisterPopup] OTP verified');
      submitToFreeEnrollment();
    }
  }, [currentStep, loginVerifyFetcher.state, loginVerifyFetcher.data]);

  // Handle customer update response (after OTP verification for free products)
  useEffect(() => {
    if (customerUpdateFetcher.state !== 'idle' || !customerUpdateFetcher.data)
      return;
    const d = customerUpdateFetcher.data;

    if (d.error) {
      // Log error but don't block - free enrollment should proceed anyway
      console.error('[RegisterPopup] Customer update failed:', d.error);
      setUpdateError(d.error);
      // Still proceed with free enrollment after a short delay
      setTimeout(() => {
        console.log(
          '[RegisterPopup] Customer update failed, proceeding with free enrollment anyway',
        );
        submitToFreeEnrollment();
      }, 500);
    } else {
      // Customer updated successfully, proceed with free enrollment
      console.log(
        '[RegisterPopup] Customer profile updated successfully, proceeding with free enrollment',
      );
      submitToFreeEnrollment();
    }
  }, [customerUpdateFetcher.state, customerUpdateFetcher.data]);

  // Handle customer registration response (for new users)
  useEffect(() => {
    if (registerFetcher.state !== 'idle' || !registerFetcher.data) return;
    const d = registerFetcher.data;

    if (d.error) {
      console.error('[RegisterPopup] Registration failed:', d.error);
      setUpdateError(d.error);
      // Could retry or show error to user
    } else if (d.success && d.customer) {
      // Registration successful - customer created in Vendure (NOT logged in)
      // Now use the email to link the order during free enrollment
      const { email } = d.customer;
      console.log(
        '[RegisterPopup] Customer registration successful, proceeding with free enrollment using email:',
        email,
      );
      // Pass email to free enrollment so order is linked to this customer
      submitToFreeEnrollment(email);
    }
  }, [registerFetcher.state, registerFetcher.data]);

  // Update customer info if user is authenticated, otherwise register first (new user)
  const handleProfileUpdateIfNeeded = () => {
    // Only update profile if customer is already authenticated
    if (customer?.activeCustomer) {
      console.log(
        '[RegisterPopup] User authenticated, updating profile via /sign-up',
      );
      updateCustomerProfile();
    } else {
      // User is NOT authenticated - register first (new user)
      // Step 1: Call /api/register to create customer and get auth token
      // Step 2: /api/register's useEffect will then call submitToFreeEnrollment
      console.log(
        '[RegisterPopup] User not authenticated, registering new customer...',
      );
      registerNewCustomer();
    }
  };

  // NEW: Register new customer (for unauthenticated users)
  const registerNewCustomer = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      console.log('[RegisterPopup] Missing form data for registration');
      setUpdateError('Please fill in all fields');
      return;
    }

    setUpdateError(null);
    console.log(
      '[RegisterPopup] Calling /api/register to create customer account...',
    );

    registerFetcher.submit(
      {
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone,
      },
      { method: 'post', action: '/api/register' },
    );
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 1);
    if (!cleanValue && value !== '') return;

    if (otpError) setOtpError(null);

    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);

    if (cleanValue !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (index === 5 && cleanValue !== '') {
      const fullOtp = [...newOtp];
      if (fullOtp.every((d) => d !== '')) {
        setTimeout(() => verifyPhoneOtp(), 100);
      }
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || '';
    }
    setOtp(newOtp);
    const focusIdx = Math.min(pasted.length, 5);
    otpRefs.current[focusIdx]?.focus();
  };

  const handleChangeNumber = () => {
    setCurrentStep('form');
    setOtp(['', '', '', '', '', '']);
    setOtpError(null);
    setErrors({ name: '', email: '', phone: '' });
    setResendCooldown(0);
  };

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(
      () => setResendCooldown((c) => Math.max(0, c - 1)),
      1000,
    );
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleResendCode = () => {
    sendPhoneOtp();
  };

  const handleClosePopup = () => {
    // Reset everything
    setFormData({ name: '', email: '', phone: '' });
    setOtp(['', '', '', '', '', '']);
    setErrors({ name: '', email: '', phone: '' });
    setOtpError(null);
    setCartError(null);
    setUpdateError(null);
    setCurrentStep('form');
    setResendCooldown(0);
    onClose();
  };

  // Check if customer is logged in
  const isLoggedIn = !!customer?.activeCustomer;

  if (!isOpen) return null;

  if (currentStep === 'completion') {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-[9999] p-4"
        onClick={handleClosePopup}
      >
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-[808px]  w-full min-h-[520px] overflow-hidden flex"
          onClick={(e) => e.stopPropagation()}
        >
          {/* left col */}
          <div className="flex flex-col gap-6 w-full max-w-md flex-1 items-center justify-center p-6">
            {/* Success Icon */}
            <div className="flex items-center justify-center">
              <div className="w-[96px] h-[96px] p-4 bg-[#0BAF7E]/10 rounded-full flex items-center justify-center">
                <div className="w-[64px] h-[64px] bg-[#0BAF7E] rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Success/Error Message */}
            {cartError && cartError.includes('Already Enrolled') ? (
              <div className="flex flex-col items-center gap-3 w-full">
                {/* Already Enrolled Alert */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded w-full">
                  <p className="text-blue-700 font-semibold text-sm">
                    ✓ Already Enrolled!
                  </p>
                  <p className="text-blue-600 text-xs mt-1">
                    Check your email for course access details.
                  </p>
                </div>

                {/* Retry Option */}
                <button
                  onClick={() => {
                    setCartError(null);
                    setCurrentStep('form');
                    setFormData({ name: '', email: '', phone: '' });
                  }}
                  className="text-blue-600 hover:text-blue-700 underline text-sm mt-2"
                >
                  Try with a different email →
                </button>
              </div>
            ) : cartError ? (
              <div className="flex flex-col items-center gap-3 w-full">
                {/* Generic Error Alert */}
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded w-full">
                  <p className="text-red-700 font-semibold text-sm">
                    Enrollment Error
                  </p>
                  <p className="text-red-600 text-xs mt-1">{cartError}</p>
                </div>

                {/* Retry Option */}
                <button
                  onClick={() => {
                    setCartError(null);
                    setCurrentStep('form');
                  }}
                  className="text-red-600 hover:text-red-700 underline text-sm mt-2"
                >
                  Try again →
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <h2 className="text-2xl font-semibold leading-[120%] text-[#081627]">
                  {isAlreadyRegistered ? "You're already in!" : "You're in!"}
                </h2>

                <p className="text-[#081627]/50 leading-[150%] text-[17px] text-center">
                  {isAlreadyRegistered
                    ? 'You have already registered for the CUET All India Commerce Olympiad 2026.'
                    : "You've successfully registered for the CUET All India Commerce Olympiad 2026."}
                  <br />
                  <br />
                  Competition is exclusively available on mobile app, please
                  download app to play.
                </p>
              </div>
            )}
            {/* Buttons */}
            <div className="flex items-center gap-2">
              <AppStoreButton
                href={appStoreLink}
                size="lg"
                className="w-full"
              />
              <GooglePlayButton
                href={playStoreLink}
                size="lg"
                className="w-full"
              />
            </div>
          </div>
          {/* right image */}
          <div className="hidden md:flex w-[380px] h-[520px] ml-auto shrink-0">
            <img
              src="/assets/images/olympiad/RegistrationComplete.png"
              alt="Registration Success"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) return null;

  if (currentStep === 'form') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
        <div
          className="bg-white flex items-center justify-between flex-col gap-5 rounded-3xl shadow-2xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-between w-full">
                <h2 className="text-2xl font-semibold text-[#081627]">
                  Register for CUET All India Commerce Olympiad 2026
                </h2>
                <button
                  onClick={() => {
                    setFormData({ name: '', email: '', phone: '' });
                    setErrors({ name: '', email: '', phone: '' });
                    setCurrentStep('form');
                    setResendCooldown(0);
                    onClose();
                  }}
                  className="text-[#081627]/50 hover:text-[#081627] transition-colors p-1 flex-shrink-0"
                  aria-label="Close"
                >
                  <X size={24} />
                </button>
              </div>

              <p className="text-[#081627]/50 leading-[150%]">
                {isLoggedIn
                  ? 'Your details are pre-filled from your account'
                  : 'Enter your details to get started — takes less than a minute'}
              </p>
            </div>
            {/* Error Alert */}
            {cartError && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-700 text-sm font-medium">{cartError}</p>
              </div>
            )}
            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name Field */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="name"
                  className="font-medium leading-[120%] text-[#081627]/50 text-sm"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  readOnly={isLoggedIn}
                  placeholder="Write Name here"
                  className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    isLoggedIn ? 'bg-gray-50 cursor-not-allowed' : ''
                  } ${
                    errors.name
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-[#081627]/10 focus:ring-[#3A6BFC]'
                  }`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="font-medium leading-[120%] text-[#081627]/50 text-sm"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  readOnly={isLoggedIn}
                  placeholder="Write Email here"
                  className={`w-full px-4 py-3 border rounded-full focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    isLoggedIn ? 'bg-gray-50 cursor-not-allowed' : ''
                  } ${
                    errors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-[#081627]/10 focus:ring-[#3A6BFC]'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="phone"
                  className="font-medium leading-[120%] text-[#081627]/50 text-sm"
                >
                  Phone Number
                </label>
                <div
                  className={`flex items-center px-4 py-3 border rounded-full focus-within:ring-2 focus-within:border-transparent transition-all ${
                    errors.phone
                      ? 'border-red-500 focus-within:ring-red-500'
                      : 'border-[#081627]/10 focus-within:ring-[#3A6BFC]'
                  }`}
                >
                  <span className="text-[#081627] font-medium mr-2">+91</span>
                  <input
                    type="number"
                    id="phone"
                    min={0}
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    maxLength={10}
                    placeholder="Enter phone number"
                    className="flex-1 outline-none bg-transparent [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-xs">{errors.phone}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={phoneOtpBusy || isSubmittingCart || isRegistering}
                className="primary-btn font-medium leading-[120%] py-4 w-full disabled:opacity-60"
              >
                {isRegistering
                  ? 'Logging...'
                  : isSubmittingCart
                  ? 'Enrolling...'
                  : phoneOtpBusy
                  ? 'Sending...'
                  : isLoggedIn
                  ? 'Register for Olympiad'
                  : 'Send OTP'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // OTP Verification Step
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
      <div
        className="bg-white flex items-center justify-between flex-col gap-5 rounded-3xl shadow-2xl max-w-md w-full p-6 min-h-[520px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-5 w-full flex-1">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-2xl font-semibold text-[#081627]">
                Enter the code sent to <br /> (+91) {formData.phone.slice(0, 3)}
                -{formData.phone.slice(3, 7)}-{formData.phone.slice(7)}
              </h2>
              <button
                onClick={handleClosePopup}
                className="text-[#081627]/50 hover:text-[#081627] transition-colors p-1 flex-shrink-0"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* OTP Form */}
          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4">
            {/* OTP Input Field */}
            <div
              className="flex items-center justify-center gap-2 sm:gap-1 mb-2"
              onPaste={handleOtpPaste}
            >
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={otp[index] || ''}
                  ref={(el) => {
                    otpRefs.current[index] = el;
                  }}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full border text-center text-lg sm:text-xl font-geist font-medium text-lightgray outline-none focus:ring-1 transition-all ${
                    otpError
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-[#0816271A] focus:border-[#3A6BFC] focus:ring-[#3A6BFC]'
                  }`}
                />
              ))}
            </div>

            {/* OTP Error Message */}
            {otpError && (
              <p className="text-red-500 text-xs text-center">{otpError}</p>
            )}

            <p className="text-[#081627]/50 leading-[120%]">
              {resendCooldown > 0 ? (
                <>
                  Resend Code in{' '}
                  <span className="font-medium"> {resendCooldown}s</span>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="underline text-[#081627] font-medium hover:text-[#081627]/70 transition-colors"
                >
                  Resend Code
                </button>
              )}
            </p>
          </form>
        </div>

        {/* Buttons at Bottom */}
        <div className="flex flex-col gap-3 w-full">
          {/* Verify Button */}
          <button
            onClick={handleOtpSubmit}
            disabled={
              (!isLoggedIn && otp.join('').length < 6) || isSubmittingCart
            }
            className="primary-btn font-medium leading-[120%] py-4 w-full disabled:opacity-60"
          >
            {isSubmittingCart
              ? 'Enrolling...'
              : verifyOtpBusy
              ? 'Registering...'
              : isLoggedIn
              ? 'Register for Olympiad'
              : 'Verify OTP'}
          </button>

          {/* Change Number Button */}
          <button
            type="button"
            onClick={handleChangeNumber}
            disabled={isSubmittingCart}
            className="font-medium leading-[120%] py-3 w-full border border-[#3A6BFC] text-[#3A6BFC] rounded-full hover:bg-[#3A6BFC]/5 transition-all disabled:opacity-60"
          >
            Change Number
          </button>
        </div>
      </div>
    </div>
  );
}
