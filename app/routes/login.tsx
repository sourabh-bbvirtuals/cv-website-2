import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useFetcher, useNavigate, useSearchParams } from '@remix-run/react';
import { ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { API_URL } from '~/constants';
import { sdk } from '~/graphqlWrapper';
import { getActiveCustomerDetails } from '~/providers/customer/customer';

const PROFILE_INCOMPLETE_COOKIE =
  'bb-profile-incomplete=1; Path=/; Max-Age=86400; SameSite=Lax';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const phone = formData.get('phone') as string;
  const otp = formData.get('otp') as string;
  const name = (formData.get('name') as string) || '';
  const email = (formData.get('email') as string) || '';
  const redirectTo = (formData.get('redirectTo') as string) || '/';

  try {
    const result = await sdk.Authenticate(
      {
        input: {
          otp: {
            identifier: phone,
            otp,
          },
        } as any,
      },
      { request },
    );

    if (
      result.authenticate?.__typename === 'CurrentUser' ||
      (result.authenticate as any)?.id
    ) {
      const headers = new Headers();
      result._headers.forEach((value, key) => {
        headers.append(key, value);
      });

      const setCookieHeader = headers.get('Set-Cookie') || '';
      const newSessionCookie = setCookieHeader.split(';')[0] || '';

      const oldCookies = (request.headers.get('Cookie') || '')
        .split(';')
        .map((c) => c.trim())
        .filter((c) => !c.startsWith('__session='))
        .join('; ');
      const mergedCookie = oldCookies
        ? `${oldCookies}; ${newSessionCookie}`
        : newSessionCookie;

      const authedRequest = new Request(request.url, {
        headers: { Cookie: mergedCookie },
      });

      try {
        const customer = await getActiveCustomerDetails({
          request: authedRequest,
        });
        const c = customer?.activeCustomer;
        console.log(
          '[login] activeCustomer after auth:',
          c?.id,
          c?.firstName,
          c?.lastName,
        );

        // ─── UPDATE PROFILE WITH REGISTRATION DATA ────────────────────────
        // If name or email provided during OTP verification (from RegisterPopup)
        // and customer profile is incomplete, update it
        if ((name || email) && c) {
          try {
            const { updateCustomer } = await import(
              '~/providers/account/account'
            );
            const updatePayload: any = {};

            // Split name into first and last name
            if (name && (!c.firstName || c.firstName === 'BB Virtual')) {
              const nameParts = name.trim().split(/\s+/);
              updatePayload.firstName = nameParts[0];
              updatePayload.lastName = nameParts.slice(1).join(' ') || '';
            }

            // Update email if not set
            if (email && !c.emailAddress) {
              updatePayload.emailAddress = email;
            }

            // Update phone if not set
            if (phone && !c.phoneNumber) {
              updatePayload.phoneNumber = phone;
            }

            if (Object.keys(updatePayload).length > 0) {
              await updateCustomer(updatePayload, { request: authedRequest });
              console.log(
                '[login] Updated customer profile with registration data:',
                updatePayload,
              );
            }
          } catch (e) {
            console.error('[login] failed to update customer profile:', e);
          }
        }

        // Update phone number if not already set
        if (c && !c.phoneNumber && phone) {
          try {
            const { updateCustomer } = await import(
              '~/providers/account/account'
            );
            await updateCustomer(
              { phoneNumber: phone },
              { request: authedRequest },
            );
          } catch (e) {
            console.error('[login] failed to set phoneNumber:', e);
          }
        }

        const isIncomplete = !c || !c.firstName || c.firstName === 'BB Virtual';

        if (isIncomplete) {
          headers.append('Set-Cookie', PROFILE_INCOMPLETE_COOKIE);
          return redirect('/sign-up', { headers });
        }

        const userBoard = (c as any).customFields?.board;
        const userClass = (c as any).customFields?.studentClass;
        if (userBoard) {
          headers.append(
            'Set-Cookie',
            `bb-user-board=${encodeURIComponent(userBoard)}; Path=/; Max-Age=${
              60 * 60 * 24 * 365
            }; SameSite=Lax`,
          );
        }
        if (userClass) {
          headers.append(
            'Set-Cookie',
            `bb-user-class=${encodeURIComponent(
              String(userClass).replace(/\D/g, ''),
            )}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`,
          );
        }
      } catch (e) {
        console.error('[login] getActiveCustomerDetails failed:', e);
        headers.append('Set-Cookie', PROFILE_INCOMPLETE_COOKIE);
        return redirect('/sign-up', { headers });
      }

      return redirect(redirectTo, { headers });
    }

    return json(
      {
        error:
          (result.authenticate as any)?.message ||
          'Invalid OTP. Please try again.',
      },
      { status: 400 },
    );
  } catch (err: any) {
    return json(
      { error: 'Verification failed. Please try again.' },
      { status: 500 },
    );
  }
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [searchParams] = useSearchParams();
  const isRegisteredSuccess = searchParams.get('registered') === 'true';
  const cleanApiUrl = API_URL.split('?')[0];
  const vendureToken =
    new URL(API_URL, 'http://localhost').searchParams.get('vendure-token') ||
    'bb-virtual-commerce';

  // Component States
  const [step, setStep] = useState<'login' | 'otp'>('login');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string>('');
  const [serverError, setServerError] = useState<string>('');

  // Reference for OTP input fields to handle auto-focus
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update serverError from fetcher data
  useEffect(() => {
    if ((fetcher.data as any)?.error) {
      setServerError((fetcher.data as any).error);
      setIsLoading(false);
    }
  }, [fetcher.data]);

  // --- PHONE VALIDATION & HANDLERS ---
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only numeric values and restrict to a maximum of 10 digits
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(value);

    // Clear phone error while the user is typing
    if (phoneError) setPhoneError('');
    if (serverError) setServerError('');
  };

  const handleSignIn = async () => {
    if (!phoneNumber) {
      setPhoneError('Phone number is required');
      return;
    }
    if (phoneNumber.length !== 10) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }

    setIsLoading(true);
    setServerError('');

    try {
      // GraphQL mutation to request OTP
      const fullPhone = `+91${phoneNumber}`;
      const query = `
        mutation RequestOtp($phone: String!) {
          requestOtp(phone: $phone)
        }
      `;

      const response = await axios.post(
        cleanApiUrl,
        {
          query,
          variables: { phone: fullPhone },
        },
        {
          headers: {
            'vendure-token': vendureToken,
          },
        },
      );

      if (response.data?.data?.requestOtp) {
        setStep('otp');
        setOtpError('');
        setOtp(['', '', '', '', '', '']);
      } else {
        const errorMsg =
          response.data?.errors?.[0]?.message ||
          'Failed to send OTP. Please try again.';
        setServerError(errorMsg);
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        'Something went wrong. Please try again.';
      setServerError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- OTP VALIDATION & HANDLERS ---
  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 1);
    if (!cleanValue && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);

    if (otpError) setOtpError('');
    if (serverError) setServerError('');

    if (cleanValue !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
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

  const handleOtpSubmit = async () => {
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      setOtpError('Please enter all 6 digits of the OTP');
      return;
    }

    setIsLoading(true);
    setServerError('');

    const fullPhone = `+91${phoneNumber}`;
    fetcher.submit({ phone: fullPhone, otp: otpValue }, { method: 'POST' });
  };

  const handleChangeNumber = () => {
    setStep('login');
    setOtp(['', '', '', '', '', '']);
    setOtpError('');
    setServerError('');
  };

  return (
    <>
      <div className="relative min-h-screen flex flex-col mx-auto">
        {/* ===================== */}
        {/* TOP SECTION */}
        {/* ===================== */}
        <div
          className={`w-full flex flex-col items-center bg-[url('/assets/images/homepage/hero-bg.png')] bg-no-repeat bg-cover bg-center ${
            step === 'login' ? 'h-[510px]' : 'h-[560px]'
          }`}
        >
          {' '}
          {/* Top Logo */}
          <a
            href="/"
            className="relative max-w-61.25 mt-16 w-full aspect-245/48"
          >
            <img src="/assets/logo.png" alt="logo" />
          </a>
          {/* Main Content */}
          <div className="w-full max-w-120 lg:max-w-150 text-center z-10 flex flex-col items-center gap-[30px] mt-24">
            {/* Title */}
            <div className="flex flex-col items-center">
              {step === 'login' && (
                <h1 className="font-geist font-semibold leading-[120%] text-2xl md:text-3xl lg:text-[36px] tracking-[-1%] text-lightgray">
                  Welcome Back
                </h1>
              )}
              {step === 'otp' && (
                <h1 className="font-geist font-semibold leading-[120%] text-2xl md:text-3xl tracking-[-1%] text-lightgray">
                  Enter the code sent to <br />
                  +91 {phoneNumber}
                </h1>
              )}

              <p className="text-lightgray opacity-50 font-geist leading-[120%] text-sm sm:text-lg lg:text-xl mt-3 sm:mt-4">
                {step === 'login' &&
                  'Please Login to Continue with Commerce Virtuals'}
              </p>
              {step === 'otp' && (
                <button
                  onClick={handleChangeNumber}
                  className="text-[#3A6BFC] text-lg font-medium hover:underline"
                >
                  Change Number
                </button>
              )}
            </div>

            {/* ===================== */}
            {/* CARD */}
            {/* ===================== */}
            <div className="flex flex-col items-center w-full p-6 sm:p-[30px] gap-[30px] bg-[#FFFFFF33] rounded-[30px] border border-[#FFFFFF]">
              {/* --- LOGIN STEP --- */}
              {step === 'login' && (
                <div className="w-full flex flex-col gap-4">
                  {/* PHONE */}
                  <div className="flex flex-col items-start gap-3 w-full text-left">
                    <label className="text-lightgray font-medium opacity-50 font-geist leading-[120%] text-base sm:text-lg lg:text-xl">
                      Phone Number
                    </label>

                    <div
                      className={`flex items-center w-full gap-2 bg-white rounded-full px-4 md:px-6 py-2.5 md:py-4.5 border ${
                        phoneError ? 'border-red-500' : 'border-[#0816271A]'
                      }`}
                    >
                      <span className="text-lightgray font-medium font-geist text-base sm:text-lg lg:text-xl">
                        +91
                      </span>

                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        className="bg-transparent w-full text-lightgray placeholder:text-lightgray/30 text-base sm:text-lg lg:text-xl font-medium border-none outline-none"
                        placeholder="00000-00000"
                      />
                    </div>

                    {phoneError && (
                      <span className="text-red-500 text-xs px-4">
                        {phoneError}
                      </span>
                    )}
                  </div>

                  {serverError && (
                    <p className="text-red-500 text-xs sm:text-sm text-center">
                      {serverError}
                    </p>
                  )}

                  <button
                    onClick={handleSignIn}
                    disabled={isLoading}
                    className="font-geist font-medium text-base sm:text-lg lg:text-xl bg-[#3A6BFC] py-3 md:py-4.5 min-h-[44px] md:min-h-[52px] text-white flex items-center justify-center w-full rounded-full shadow-[inset_0px_4px_8px_0px_#83A2FFBF,inset_0px_-2px_2px_0px_#0F3FCE] mt-2"
                  >
                    {isLoading ? 'Sending...' : 'Sign In'}
                  </button>
                </div>
              )}

              {/* --- OTP STEP --- */}
              {step === 'otp' && (
                <div className="w-full flex flex-col gap-6">
                  <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={digit}
                        ref={(el) => {
                          otpRefs.current[index] = el;
                        }}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-white border border-lightgray/15 text-center text-lg font-medium text-lightgray outline-none focus:border-[#3A6BFC]"
                      />
                    ))}
                  </div>

                  <p className="text-[#08162780]">
                    Resend code in <span className="font-medium">00:59</span>
                  </p>

                  {(otpError || serverError) && (
                    <p className="text-red-500 text-xs sm:text-sm">
                      {otpError || serverError}
                    </p>
                  )}

                  {/* <button
                    onClick={handleOtpSubmit}
                    disabled={isLoading}
                    className="bg-[#3A6BFC] py-3 text-white rounded-full"
                  >
                    {isLoading ? 'Verifying...' : 'Submit'}
                  </button> */}
                  <button
                    onClick={handleOtpSubmit}
                    disabled={isLoading}
                    className="font-geist font-medium text-base sm:text-lg lg:text-xl bg-[#3A6BFC] py-3 md:py-4.5 min-h-[44px] md:min-h-[52px] text-white flex items-center justify-center w-full rounded-full shadow-[inset_0px_4px_8px_0px_#83A2FFBF,inset_0px_-2px_2px_0px_#0F3FCE] mt-2"
                  >
                    {isLoading ? 'Verifying...' : 'Submit'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===================== */}
        {/* BOTTOM SECTION (FIXED FOOTER) */}
        {/* ===================== */}
        <div className="mt-auto w-full text-center py-6">
          <p className="font-geist font-medium text-sm sm:text-lg lg:text-xl text-lightgray opacity-50">
            You acknowledge that you read, and agree to our
          </p>

          <div className="flex justify-center gap-1">
            <a href="#" className="underline opacity-50 hover:text-[#3A6BFC]">
              Terms of Service
            </a>
            <span className="opacity-50">and</span>
            <a href="#" className="underline opacity-50 hover:text-[#3A6BFC]">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
