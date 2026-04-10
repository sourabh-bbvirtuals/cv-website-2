import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  useFetcher,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import { ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { API_URL } from '~/constants';
import { sdk } from '~/graphqlWrapper';

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const phone = formData.get('phone') as string;
  const otp = formData.get('otp') as string;

  try {
    const result = await sdk.Authenticate(
      {
        input: {
          phone: {
            phone,
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
      return redirect('/', {
        headers: result._headers,
      });
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
    <main className="relative min-h-screen bg-white flex flex-col items-center justify-between p-4 py-6 sm:py-10 xl:py-15 overflow-y-auto mx-auto bg-[url('/assets/images/homepage/hero-bg.png')] bg-no-repeat bg-cover bg-center">
      {/* Top Logo */}
      <a href="/" className="relative max-w-61.25 w-full aspect-245/48">
        <img src="/assets/logo.png" alt="logo" />
      </a>

      {/* Main Content Card */}
      <div className="bg-[#FFFFFF33] border border-[#FFFFFF] w-full max-w-120 lg:max-w-150 rounded-[30px] p-6 sm:p-10 text-center z-10 flex flex-col items-center gap-6 sm:gap-8 grow justify-center my-16">
        {/* Registration Success Message */}
        {isRegisteredSuccess && (
          <div className="bg-green-50/80 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm font-medium w-full animate-in fade-in slide-in-from-top-2 duration-300 mb-2">
            Account created successfully! Please login to continue.
          </div>
        )}

        <div className="flex flex-col items-center">
          <h1 className="font-geist font-semibold leading-[120%] text-2xl md:text-3xl lg:text-[36px] tracking-[-1%] text-lightgray">
            {step === 'login' ? 'Welcome Back' : 'Verify OTP'}
          </h1>
          <p className="text-lightgray opacity-50 font-geist leading-[120%] text-sm sm:text-lg lg:text-xl mt-3 sm:mt-4">
            {step === 'login'
              ? 'Please Login to Continue with Commerce Virtual'
              : `Enter the code sent to +91 ${phoneNumber}`}
          </p>
        </div>

        {/* --- PHONE LOGIC --- */}
        {step === 'login' && (
          <div className="w-full flex flex-col gap-4">
            <div className="flex flex-col items-start gap-2 w-full text-left">
              <label className="text-lightgray font-medium opacity-50 font-geist leading-[120%] text-base sm:text-lg lg:text-xl ml-4">
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
                  className="bg-transparent w-full text-lightgray text-base sm:text-lg lg:text-xl font-medium border-none outline-none focus:ring-0"
                  placeholder="00000-00000"
                />
              </div>
              {phoneError && (
                <span className="text-red-500 text-xs px-4">{phoneError}</span>
              )}
            </div>

            {serverError && (
              <p className="text-red-500 text-xs sm:text-sm font-geist text-center -mt-2">
                {serverError}
              </p>
            )}

            <button
              onClick={handleSignIn}
              disabled={isLoading}
              className="font-geist font-medium text-base sm:text-lg lg:text-xl bg-[#3A6BFC] py-3 md:py-4.5 min-h-[44px] md:min-h-[52px] lg:min-h-[64px] text-white flex items-center justify-center w-full rounded-full shadow-[inset_0px_4px_8px_0px_#83A2FFBF,inset_0px_-2px_2px_0px_#0F3FCE] mt-2 transition-all"
            >
              {isLoading ? 'Sending...' : 'Sign In'}
            </button>

          </div>
        )}

        {/* --- OTP LOGIC --- */}
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
                  className={`w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-white border shadow-sm text-center text-lg sm:text-xl font-geist font-medium text-lightgray outline-none focus:border-[#3A6BFC] focus:ring-1 focus:ring-[#3A6BFC] transition-all ${
                    otpError ? 'border-red-500' : 'border-[#0816271A]'
                  }`}
                />
              ))}
            </div>

            {(otpError || serverError) && (
              <p className="text-red-500 text-xs sm:text-sm font-geist mb-2">
                {otpError || serverError}
              </p>
            )}

            <button
              onClick={handleOtpSubmit}
              disabled={isLoading}
              className="font-geist font-medium text-base sm:text-lg lg:text-xl bg-[#3A6BFC] py-3 md:py-4.5 min-h-[44px] md:min-h-[52px] lg:min-h-[64px] text-white flex items-center justify-center w-full rounded-full shadow-[inset_0px_4px_8px_0px_#83A2FFBF,inset_0px_-2px_2px_0px_#0F3FCE]"
            >
              {isLoading ? 'Verifying...' : 'Submit'}
            </button>

            <button
              onClick={handleChangeNumber}
              className="font-geist font-medium text-[#3A6BFC] text-sm sm:text-base lg:text-lg hover:underline transition-all"
            >
              Change Number
            </button>
          </div>
        )}
      </div>

      {/* Policy Section (Bottom) */}
      <div className="w-full text-center py-6">
        <p className="font-geist font-medium text-sm sm:text-lg lg:text-xl leading-[120%] text-lightgray opacity-50">
          You Acknowledge that you read, and agree to our
        </p>
        <div className="flex justify-center gap-1">
          <a
            href="#"
            className="font-geist font-medium text-sm sm:text-lg lg:text-xl text-lightgray opacity-50 hover:text-[#3A6BFC] underline"
          >
            Terms of Service
          </a>
          <span className="opacity-50 text-lightgray">and</span>
          <a
            href="#"
            className="font-geist font-medium text-sm sm:text-lg lg:text-xl text-lightgray opacity-50 hover:text-[#3A6BFC] underline"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </main>
  );
};

export default Login;
