import { useEffect, useRef, useState } from 'react';
import {
  MetaFunction,
  useFetcher,
  useSearchParams,
} from '@remix-run/react';
import type { ActionFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { API_URL } from '~/constants';

export const meta: MetaFunction = () => {
  return [
    { title: 'Sign In - Commerce Virtuals' },
    {
      name: 'description',
      content:
        'Sign in to your Commerce Virtuals account to access your courses and study materials.',
    },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const phone = formData.get('phone') as string;

  if (!phone || phone.length < 12) {
    return json({ error: 'Valid phone number is required' }, { status: 400 });
  }

  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation RequestOtp($identifier: String!, $method: OtpMethod!) {
            requestOtp(identifier: $identifier, method: $method) {
              success
              expiresAt
              errorCode
              errorMessage
              retryAfterSeconds
            }
          }
        `,
        variables: { identifier: phone, method: 'PHONE' },
      }),
    });

    const result = await resp.json();

    if (result?.errors?.length) {
      return json(
        { error: result.errors[0].message || 'Failed to send OTP.' },
        { status: 400 },
      );
    }

    const data = result?.data?.requestOtp;
    if (data?.success) {
      return json({ ok: true });
    }

    return json(
      {
        error: data?.errorMessage || 'Failed to send OTP.',
        retryAfterSeconds: data?.retryAfterSeconds,
      },
      { status: 400 },
    );
  } catch {
    return json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 });
  }
}

const OTP_RESEND_COOLDOWN_SEC = 60;

export default function SignInPage() {
  const [searchParams] = useSearchParams();
  const errorCode = searchParams.get('error');
  const isRegisteredSuccess = searchParams.get('registered') === 'true';

  const [otpStep, setOtpStep] = useState<0 | 1>(0);
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const phoneOtpFetcher = useFetcher<{ ok?: boolean; error?: string }>();
  const phoneOtpBusy = phoneOtpFetcher.state !== 'idle';

  const verifyOtpFetcher = useFetcher<{ error?: string }>();
  const verifyOtpBusy = verifyOtpFetcher.state !== 'idle';
  const [otpError, setOtpError] = useState<string | null>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const sendPhoneOtp = () => {
    if (phoneNumber.length !== 10) return;
    setPhoneError(null);
    const fullPhone = `+91${phoneNumber}`;
    phoneOtpFetcher.submit(
      { phone: fullPhone },
      { method: 'POST', action: '/sign-in' },
    );
  };

  useEffect(() => {
    if (phoneOtpFetcher.state !== 'idle' || !phoneOtpFetcher.data) return;
    const d = phoneOtpFetcher.data;
    if (d.ok) {
      setOtpStep(1);
      setOtp(['', '', '', '', '', '']);
      setResendCooldown(OTP_RESEND_COOLDOWN_SEC);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } else if (d.error) {
      setPhoneError(d.error);
    }
  }, [phoneOtpFetcher.state, phoneOtpFetcher.data]);

  const redirectTo = searchParams.get('redirectTo') || '/';

  const verifyPhoneOtp = () => {
    const otpValue = otp.join('');
    if (otpValue.length < 6) return;
    setOtpError(null);
    const fullPhone = `+91${phoneNumber}`;
    verifyOtpFetcher.submit(
      { phone: fullPhone, otp: otpValue, redirectTo },
      { method: 'POST', action: '/login' },
    );
  };

  useEffect(() => {
    if (verifyOtpFetcher.state !== 'idle' || !verifyOtpFetcher.data) return;
    const d = verifyOtpFetcher.data;
    if (d.error) {
      setOtpError(d.error);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [verifyOtpFetcher.state, verifyOtpFetcher.data]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(
      () => setResendCooldown((c) => Math.max(0, c - 1)),
      1000,
    );
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const googleErrorMessage =
    errorCode === 'google_not_configured'
      ? 'Google login is not configured yet.'
      : errorCode === 'google_state_invalid'
      ? 'Google login verification failed. Please try again.'
      : errorCode === 'google_token_failed'
      ? 'Unable to obtain Google token. Please try again.'
      : errorCode === 'google_auth_failed'
      ? 'Google login was rejected by the auth server.'
      : null;

  const errorMessage = otpError || phoneError || googleErrorMessage;

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

  return (
    <div className="relative min-h-screen flex flex-col mx-auto">
      {/* ===================== */}
      {/* TOP SECTION */}
      {/* ===================== */}
      <div
        className={`w-full flex flex-col items-center bg-[url('/assets/images/homepage/hero-bg.png')] bg-no-repeat bg-cover bg-center h-full`}
      >
        {' '}
        {/* Top Logo */}
        <a href="/" className="relative max-w-61.25 mt-16 w-full aspect-245/48">
          <img src="/assets/logo.png" alt="logo" />
        </a>
        {/* Main Content */}
        <div className="w-full max-w-120 lg:max-w-150 text-center z-10 flex flex-col items-center gap-[30px] mt-">
          {/* Title */}

          <div className="bg-[#FFFFFF33] border border-[#FFFFFF] w-full max-w-120 lg:max-w-150 rounded-[30px] p-6 sm:p-10 text-center z-10 flex flex-col items-center gap-5 sm:gap-7 grow justify-center my-16">
            {isRegisteredSuccess && (
              <div className="bg-green-50/80 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm font-medium w-full animate-in fade-in slide-in-from-top-2 duration-300">
                Account created successfully! Please login to continue.
              </div>
            )}

            <div className="flex flex-col items-center">
              <h1 className="font-geist font-semibold leading-[120%] text-2xl md:text-3xl lg:text-[36px] tracking-[-1%] text-lightgray">
                {otpStep === 0 ? 'Welcome Back' : 'Verify OTP'}
              </h1>
              <p className="text-lightgray opacity-50 font-geist leading-[120%] text-sm sm:text-lg lg:text-xl mt-3 sm:mt-4">
                {otpStep === 0
                  ? 'Sign in or create your account to continue'
                  : `Enter the code sent to +91 ${phoneNumber}`}
              </p>
            </div>

            {errorMessage && (
              <div className="bg-red-50/80 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium w-full">
                {errorMessage}
              </div>
            )}

            {resendCooldown > 0 && otpStep === 1 && (
              <div className="bg-amber-50/80 border border-amber-200 text-amber-700 px-4 py-3 rounded-2xl text-sm font-medium w-full">
                You can request a new OTP in{' '}
                <span className="font-semibold tabular-nums">
                  {resendCooldown}
                </span>
                s
              </div>
            )}

            {otpStep === 0 && (
              <div className="w-full flex flex-col gap-4">
                <form
                  className="w-full flex flex-col gap-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendPhoneOtp();
                  }}
                >
                  <div className="flex flex-col items-start gap-2 w-full text-left">
                    <label className="text-lightgray font-medium opacity-50 font-geist leading-[120%] text-base sm:text-lg lg:text-xl ml-4">
                      Phone Number
                    </label>
                    <div className="flex items-center w-full gap-2 bg-white rounded-full px-4 md:px-6 py-2.5 md:py-4.5 border border-[#0816271A] focus-within:border-[#3A6BFC] focus-within:ring-1 focus-within:ring-[#3A6BFC] transition-all">
                      <span className="text-lightgray font-medium font-geist text-base sm:text-lg lg:text-xl">
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="00000-00000"
                        className="bg-transparent w-full text-lightgray text-base sm:text-lg lg:text-xl font-medium font-geist border-none outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={phoneOtpBusy || phoneNumber.length !== 10}
                    className="font-geist font-medium text-base sm:text-lg lg:text-xl bg-[#3A6BFC] py-3 md:py-4.5 min-h-[44px] md:min-h-[52px] lg:min-h-[64px] text-white flex items-center justify-center w-full rounded-full shadow-[inset_0px_4px_8px_0px_#83A2FFBF,inset_0px_-2px_2px_0px_#0F3FCE] transition-all disabled:opacity-60"
                  >
                    {phoneOtpBusy ? 'Sending...' : 'Send OTP'}
                  </button>
                </form>
              </div>
            )}

            {otpStep === 1 && (
              <div className="w-full flex flex-col gap-6">
                <div
                  className="flex items-center justify-center gap-2 sm:gap-3 mb-2"
                  onPaste={handleOtpPaste}
                >
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      ref={(el) => {
                        otpRefs.current[index] = el;
                      }}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-full bg-white border shadow-sm text-center text-lg sm:text-xl font-geist font-medium text-lightgray outline-none focus:border-[#3A6BFC] focus:ring-1 focus:ring-[#3A6BFC] transition-all border-[#0816271A]"
                    />
                  ))}
                </div>

                <button
                  onClick={verifyPhoneOtp}
                  disabled={otp.join('').length < 6 || verifyOtpBusy}
                  className="font-geist font-medium text-base sm:text-lg lg:text-xl bg-[#3A6BFC] py-3 md:py-4.5 min-h-[44px] md:min-h-[52px] lg:min-h-[64px] text-white flex items-center justify-center w-full rounded-full shadow-[inset_0px_4px_8px_0px_#83A2FFBF,inset_0px_-2px_2px_0px_#0F3FCE] transition-all disabled:opacity-60"
                >
                  {verifyOtpBusy ? 'Verifying...' : 'Verify & Continue'}
                </button>

                <div className="flex flex-col items-center gap-3">
                  <button
                    onClick={() => {
                      setOtpStep(0);
                      setOtp(['', '', '', '', '', '']);
                    }}
                    className="font-geist font-medium text-[#3A6BFC] text-sm sm:text-base lg:text-lg hover:underline transition-all"
                  >
                    Change Number
                  </button>
                  <button
                    onClick={sendPhoneOtp}
                    disabled={phoneOtpBusy || resendCooldown > 0}
                    className="font-geist font-medium text-[#808591] text-sm sm:text-base hover:text-[#3A6BFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {phoneOtpBusy
                      ? 'Sending...'
                      : resendCooldown > 0
                      ? `Resend OTP in ${resendCooldown}s`
                      : 'Resend OTP'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===================== */}
      {/* BOTTOM SECTION (FIXED FOOTER) */}
      {/* ===================== */}
      <div className="mt-8 w-full text-center">
        <p className="font-geist font-medium text-sm sm:text-lg lg:text-xl text-lightgray opacity-50">
          You acknowledge that you read, and agree to our
        </p>

        <div className="flex justify-center gap-1">
          <a href="/terms-and-conditions" className="underline opacity-50 hover:text-[#3A6BFC]">
            Terms of Service
          </a>
          <span className="opacity-50">and</span>
          <a href="/privacy-and-terms" className="underline opacity-50 hover:text-[#3A6BFC]">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
