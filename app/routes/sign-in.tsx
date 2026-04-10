import { useEffect, useRef, useState } from 'react';
import {
  MetaFunction,
  useFetcher,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';

export const meta: MetaFunction = () => {
  return [
    { title: 'Sign In - Commerce Virtual' },
    {
      name: 'description',
      content:
        'Sign in to your Commerce Virtual account to access your courses and study materials.',
    },
  ];
};

const OTP_RESEND_COOLDOWN_SEC = 60;

function parseWaitSecondsFromMessage(message: string): number {
  const m = message.match(/(\d+)\s*seconds?/i);
  if (!m) return 0;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export default function SignInPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const errorCode = searchParams.get('error');
  const redirectTo = searchParams.get('redirectTo') || '/account';
  const prefilledIdentifier = searchParams.get('identifier') || '';
  const isRegisteredSuccess = searchParams.get('registered') === 'true';
  const authHref = `/auth/google?redirectTo=${encodeURIComponent(redirectTo)}`;

  const [otpStep, setOtpStep] = useState<0 | 1>(0);
  const [identifier, setIdentifier] = useState(prefilledIdentifier);
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const requestFetcher = useFetcher<{
    ok?: boolean;
    error?: string;
    code?: string;
    retryAfterSeconds?: number;
  }>();
  const verifyFetcher = useFetcher<{
    ok?: boolean;
    redirectTo?: string;
    error?: string;
    code?: string;
  }>();

  const otpRequestSubmittingRef = useRef(false);

  useEffect(() => {
    const d = verifyFetcher.data;
    if (
      d &&
      typeof d === 'object' &&
      d.ok === true &&
      typeof d.redirectTo === 'string'
    ) {
      navigate(d.redirectTo, { replace: true });
    }
  }, [verifyFetcher.data, navigate]);

  useEffect(() => {
    if (requestFetcher.state === 'submitting') {
      otpRequestSubmittingRef.current = true;
    }
    if (requestFetcher.state === 'idle' && otpRequestSubmittingRef.current) {
      otpRequestSubmittingRef.current = false;
      const d = requestFetcher.data;
      if (d?.ok) {
        setOtpStep(1);
        setOtp(['', '', '', '', '', '']);
        setResendCooldown(OTP_RESEND_COOLDOWN_SEC);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else if (d?.code === 'OTP_COOLDOWN') {
        const s =
          typeof d.retryAfterSeconds === 'number'
            ? d.retryAfterSeconds
            : parseWaitSecondsFromMessage(d.error ?? '');
        if (s > 0) setResendCooldown(s);
      }
    }
  }, [requestFetcher.state, requestFetcher.data]);

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

  const requestError =
    typeof requestFetcher.data?.error === 'string'
      ? requestFetcher.data.error
      : null;
  const hideRequestErrorForCooldown =
    requestFetcher.data?.code === 'OTP_COOLDOWN' && resendCooldown > 0;
  const verifyError =
    typeof verifyFetcher.data?.error === 'string'
      ? verifyFetcher.data.error
      : null;

  const errorMessage =
    verifyError ||
    (hideRequestErrorForCooldown ? null : requestError) ||
    googleErrorMessage;

  const otpRequestBusy = requestFetcher.state !== 'idle';
  const canSendOtp = !otpRequestBusy && resendCooldown <= 0;

  const sendOtp = () => {
    if (!canSendOtp) return;
    requestFetcher.submit(
      { method: 'email', identifier: identifier.trim() },
      {
        method: 'POST',
        action: '/auth/otp-request',
        encType: 'application/json',
      },
    );
  };

  const verifyOtp = () => {
    const otpValue = otp.join('');
    if (otpValue.length < 6) return;
    verifyFetcher.submit(
      { otp: otpValue, redirectTo },
      {
        method: 'POST',
        action: '/auth/otp-verify',
        encType: 'application/json',
      },
    );
  };

  const handleOtpChange = (index: number, value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 1);
    if (!cleanValue && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = cleanValue;
    setOtp(newOtp);

    if (cleanValue !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (index === 5 && cleanValue !== '') {
      const fullOtp = [...newOtp];
      if (fullOtp.every((d) => d !== '')) {
        setTimeout(() => verifyOtp(), 100);
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
    <main className="relative min-h-screen bg-white flex flex-col items-center justify-between p-4 py-6 sm:py-10 xl:py-15 overflow-y-auto mx-auto bg-[url('/assets/images/homepage/hero-bg.png')] bg-no-repeat bg-cover bg-center">
      <a href="/" className="relative max-w-61.25 w-full aspect-245/48">
        <img src="/assets/logo.png" alt="logo" />
      </a>

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
              : `Enter the code sent to ${identifier}`}
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
            <span className="font-semibold tabular-nums">{resendCooldown}</span>
            s
          </div>
        )}

        {otpStep === 0 && (
          <div className="w-full flex flex-col gap-4">
            <a
              href={authHref}
              className="font-geist font-medium text-base sm:text-lg lg:text-xl bg-white py-3 md:py-4.5 min-h-[44px] md:min-h-[52px] lg:min-h-[64px] text-lightgray flex items-center justify-center gap-3 w-full rounded-full border border-[#0816271A] hover:bg-gray-50 transition-all"
            >
              <svg
                className="size-5 sm:size-6"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.3h6.46a5.52 5.52 0 01-2.4 3.62v3h3.88c2.27-2.09 3.55-5.16 3.55-8.65z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.88-3c-1.08.72-2.46 1.16-4.05 1.16-3.11 0-5.74-2.1-6.68-4.93H1.3v3.09A12 12 0 0012 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.32 14.32A7.22 7.22 0 014.94 12c0-.8.14-1.58.38-2.32V6.59H1.3A12 12 0 000 12c0 1.93.46 3.76 1.3 5.41l4.02-3.09z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.76 0 3.35.61 4.6 1.8l3.45-3.45C17.94 1.14 15.24 0 12 0A12 12 0 001.3 6.59l4.02 3.09c.94-2.83 3.57-4.93 6.68-4.93z"
                />
              </svg>
              Continue with Google
            </a>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-lightgray/20" />
              <p className="font-geist text-sm text-lightgray opacity-50">
                or continue with email
              </p>
              <div className="h-px flex-1 bg-lightgray/20" />
            </div>

            <form
              className="w-full flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                sendOtp();
              }}
            >
              <div className="flex flex-col items-start gap-2 w-full text-left">
                <label className="text-lightgray font-medium opacity-50 font-geist leading-[120%] text-base sm:text-lg lg:text-xl ml-4">
                  Email Address
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white rounded-full px-4 md:px-6 py-2.5 md:py-4.5 border border-[#0816271A] text-lightgray text-base sm:text-lg lg:text-xl font-medium font-geist outline-none focus:border-[#3A6BFC] focus:ring-1 focus:ring-[#3A6BFC] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={!canSendOtp}
                className="font-geist font-medium text-base sm:text-lg lg:text-xl bg-[#3A6BFC] py-3 md:py-4.5 min-h-[44px] md:min-h-[52px] lg:min-h-[64px] text-white flex items-center justify-center w-full rounded-full shadow-[inset_0px_4px_8px_0px_#83A2FFBF,inset_0px_-2px_2px_0px_#0F3FCE] transition-all disabled:opacity-60"
              >
                {otpRequestBusy
                  ? 'Sending...'
                  : resendCooldown > 0
                  ? `Wait ${resendCooldown}s`
                  : 'Send OTP'}
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
              onClick={verifyOtp}
              disabled={
                verifyFetcher.state !== 'idle' || otp.join('').length < 6
              }
              className="font-geist font-medium text-base sm:text-lg lg:text-xl bg-[#3A6BFC] py-3 md:py-4.5 min-h-[44px] md:min-h-[52px] lg:min-h-[64px] text-white flex items-center justify-center w-full rounded-full shadow-[inset_0px_4px_8px_0px_#83A2FFBF,inset_0px_-2px_2px_0px_#0F3FCE] transition-all disabled:opacity-60"
            >
              {verifyFetcher.state !== 'idle'
                ? 'Verifying...'
                : 'Verify & Continue'}
            </button>

            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => {
                  setOtpStep(0);
                  setOtp(['', '', '', '', '', '']);
                }}
                className="font-geist font-medium text-[#3A6BFC] text-sm sm:text-base lg:text-lg hover:underline transition-all"
              >
                Change Email
              </button>
              <button
                onClick={sendOtp}
                disabled={!canSendOtp}
                className="font-geist font-medium text-[#808591] text-sm sm:text-base hover:text-[#3A6BFC] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {otpRequestBusy
                  ? 'Sending...'
                  : resendCooldown > 0
                  ? `Resend OTP in ${resendCooldown}s`
                  : 'Resend OTP'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full text-center py-6">
        <p className="font-geist font-medium text-sm sm:text-lg lg:text-xl leading-[120%] text-lightgray opacity-50">
          You acknowledge that you read, and agree to our
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
}
