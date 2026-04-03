import { useState, useEffect } from 'react';
import {
  NavLink,
  Outlet,
  Link,
  useOutletContext,
  useRouteLoaderData,
} from '@remix-run/react';
import Layout from '~/components/Layout';
import type { RootLoaderData } from '~/root';

export interface UserProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  classLevel: string;
  board: string;
}

export interface OutletContextType {
  userData: UserProfileData;
  setUserData: React.Dispatch<React.SetStateAction<UserProfileData>>;
}

const STORAGE_KEY = 'bb_user_profile';

function getStoredProfile(): UserProfileData | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

function storeProfile(data: UserProfileData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

const emptyProfile: UserProfileData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dob: '',
  gender: '',
  address: '',
  state: '',
  city: '',
  pincode: '',
  classLevel: '',
  board: '',
};

function isProfileComplete(data: UserProfileData): boolean {
  return !!(
    data.firstName &&
    data.phone &&
    data.gender &&
    data.board &&
    data.classLevel
  );
}

function CalendarIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="opacity-50"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

interface ActiveCustomerInfo {
  firstName?: string;
  lastName?: string;
  emailAddress?: string;
  phoneNumber?: string;
}

function OnboardingForm({
  onComplete,
  activeCustomer,
}: {
  onComplete: (data: UserProfileData) => void;
  activeCustomer?: ActiveCustomerInfo | null;
}) {
  const knownName = [activeCustomer?.firstName, activeCustomer?.lastName]
    .filter(Boolean)
    .join(' ');
  const knownEmail = activeCustomer?.emailAddress || '';
  const knownPhone = activeCustomer?.phoneNumber?.replace(/^\+91\s?/, '') || '';

  const [fullName, setFullName] = useState(knownName);
  const [email, setEmail] = useState(knownEmail);
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [board, setBoard] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [phone, setPhone] = useState(knownPhone);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = 'Name is required';
    if (!phone.trim()) newErrors.phone = 'Phone number is required';
    else if (phone.replace(/\D/g, '').length !== 10)
      newErrors.phone = 'Enter a valid 10-digit number';
    if (!gender) newErrors.gender = 'Please select your gender';
    if (!board) newErrors.board = 'Please select your board';
    if (!classLevel) newErrors.classLevel = 'Please select your class';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const parts = fullName.trim().split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';

    const profileData: UserProfileData = {
      firstName,
      lastName,
      email: email.trim(),
      phone: `+91 ${phone.replace(/\D/g, '')}`,
      dob,
      gender,
      address: '',
      state: '',
      city: '',
      pincode: '',
      classLevel,
      board,
    };
    onComplete(profileData);
  };

  const toggleClass = (base: string, isActive: boolean) =>
    `${base} ${
      isActive
        ? 'outline-2 outline-[#3A6BFC] text-slate-900'
        : 'outline-1 outline-slate-900/10 text-slate-900'
    }`;

  return (
    <main className="relative min-h-screen bg-white flex flex-col items-center justify-between p-4 py-6 sm:py-10 xl:py-15 overflow-y-auto mx-auto bg-[url('/assets/images/homepage/hero-bg.png')] bg-no-repeat bg-cover bg-center">
      {/* Logo */}
      <a
        href="/"
        className="relative max-w-61.25 w-full aspect-245/48 shrink-0"
      >
        <img src="/assets/logo.png" alt="logo" />
      </a>

      {/* Form Card */}
      <div className="w-full max-w-[600px] flex flex-col items-center gap-5 sm:gap-7 my-8 sm:my-12 grow justify-center">
        <div className="text-center space-y-3 sm:space-y-4">
          <h1 className="text-slate-900 text-2xl sm:text-3xl lg:text-4xl font-semibold font-geist leading-tight">
            Create an Account
          </h1>
          <p className="text-slate-900/50 text-sm sm:text-lg lg:text-xl font-normal font-geist leading-snug">
            We'd like to know about your current status
          </p>
        </div>

        <div className="self-stretch p-5 sm:p-7 bg-white/20 rounded-2xl sm:rounded-[30px] outline outline-1 outline-white flex flex-col gap-5 sm:gap-7 backdrop-blur-sm">
          {/* Full Name */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <label className="text-slate-900/50 text-base sm:text-xl font-medium font-geist leading-snug">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setErrors((p) => ({ ...p, fullName: '' }));
              }}
              placeholder="Write Name here"
              className={`h-12 sm:h-14 px-5 sm:px-6 bg-white rounded-full outline outline-1 outline-offset-[-1px] text-base sm:text-xl font-medium font-geist focus:outline-2 focus:outline-[#3A6BFC] transition-all ${
                errors.fullName ? 'outline-red-400' : 'outline-slate-900/10'
              }`}
            />
            {errors.fullName && (
              <span className="text-red-500 text-xs sm:text-sm px-2">
                {errors.fullName}
              </span>
            )}
          </div>

          {/* Email — hidden if already known from login */}
          {!knownEmail && (
            <div className="flex flex-col gap-2 sm:gap-3">
              <label className="text-slate-900/50 text-base sm:text-xl font-medium font-geist leading-snug">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Write Email here"
                className="h-12 sm:h-14 px-5 sm:px-6 bg-white rounded-full outline outline-1 outline-offset-[-1px] outline-slate-900/10 text-base sm:text-xl font-medium font-geist focus:outline-2 focus:outline-[#3A6BFC] transition-all"
              />
            </div>
          )}

          {/* Date of Birth */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <label className="text-slate-900/50 text-base sm:text-xl font-medium font-geist leading-snug">
              Date of Birth
            </label>
            <div className="relative">
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="h-12 sm:h-14 px-5 sm:px-6 bg-white rounded-full outline outline-1 outline-offset-[-1px] outline-slate-900/10 text-base sm:text-xl font-medium font-geist w-full focus:outline-2 focus:outline-[#3A6BFC] transition-all appearance-none"
              />
              <div className="absolute right-5 sm:right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                <CalendarIcon />
              </div>
            </div>
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <label className="text-slate-900/50 text-base sm:text-xl font-medium font-geist leading-snug">
              Gender
            </label>
            <div className="flex gap-3">
              {['Male', 'Female'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    setGender(g);
                    setErrors((p) => ({ ...p, gender: '' }));
                  }}
                  className={toggleClass(
                    'flex-1 h-12 sm:h-14 rounded-full bg-white outline outline-offset-[-1px] text-center text-base sm:text-xl font-medium font-geist cursor-pointer transition-all hover:bg-blue-50/50',
                    gender === g,
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
            {errors.gender && (
              <span className="text-red-500 text-xs sm:text-sm px-2">
                {errors.gender}
              </span>
            )}
          </div>

          {/* Board */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <label className="text-slate-900/50 text-base sm:text-xl font-medium font-geist leading-snug">
              Which Board?
            </label>
            <div className="flex gap-2 sm:gap-3">
              {['CBSE', 'MH', 'CUET'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    setBoard(b);
                    setErrors((p) => ({ ...p, board: '' }));
                  }}
                  className={toggleClass(
                    'flex-1 h-12 sm:h-14 rounded-full bg-white outline outline-offset-[-1px] text-center text-base sm:text-xl font-medium font-geist cursor-pointer transition-all hover:bg-blue-50/50',
                    board === b,
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
            {errors.board && (
              <span className="text-red-500 text-xs sm:text-sm px-2">
                {errors.board}
              </span>
            )}
          </div>

          {/* Class */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <label className="text-slate-900/50 text-base sm:text-xl font-medium font-geist leading-snug">
              Which Class Are You In?
            </label>
            <div className="flex gap-3">
              {['11th', '12th'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setClassLevel(c);
                    setErrors((p) => ({ ...p, classLevel: '' }));
                  }}
                  className={toggleClass(
                    'flex-1 h-12 sm:h-14 rounded-full bg-white outline outline-offset-[-1px] text-center text-base sm:text-xl font-medium font-geist cursor-pointer transition-all hover:bg-blue-50/50',
                    classLevel === c,
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            {errors.classLevel && (
              <span className="text-red-500 text-xs sm:text-sm px-2">
                {errors.classLevel}
              </span>
            )}
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <label className="text-slate-900/50 text-base sm:text-xl font-medium font-geist leading-snug">
              Phone Number
            </label>
            <div
              className={`h-12 sm:h-14 px-5 sm:px-6 bg-white rounded-full outline outline-1 outline-offset-[-1px] flex items-center gap-2 ${
                errors.phone ? 'outline-red-400' : 'outline-slate-900/10'
              }`}
            >
              <span className="text-slate-900 text-base sm:text-xl font-medium font-geist shrink-0">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(v);
                  setErrors((p) => ({ ...p, phone: '' }));
                }}
                placeholder="00000-00000"
                className="flex-1 bg-transparent text-base sm:text-xl font-medium font-geist outline-none border-none"
              />
            </div>
            {errors.phone && (
              <span className="text-red-500 text-xs sm:text-sm px-2">
                {errors.phone}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="h-14 sm:h-16 bg-[#3A6BFC] rounded-full shadow-[inset_0px_4px_8px_0px_rgba(131,162,255,0.75),inset_0px_-2px_2px_0px_rgba(15,63,206,1)] flex justify-center items-center cursor-pointer hover:brightness-110 transition-all"
          >
            <span className="text-white text-base sm:text-xl font-medium font-geist">
              Create an Account
            </span>
          </button>
        </div>

        {/* Login Link */}
        <p className="font-geist font-medium text-base sm:text-xl leading-snug text-slate-900/50">
          Old User?{' '}
          <Link
            to="/login"
            className="text-[#3A6BFC] hover:underline transition-all"
          >
            Login
          </Link>
        </p>
      </div>

      {/* Terms */}
      <div className="w-full text-center py-4 sm:py-6 shrink-0">
        <p className="font-geist font-medium text-sm sm:text-lg lg:text-xl leading-snug text-slate-900/50">
          You Acknowledge that you read, and agree to our
        </p>
        <div className="flex justify-center gap-1">
          <a
            href="#"
            className="font-geist font-medium text-sm sm:text-lg lg:text-xl text-slate-900/50 hover:text-[#3A6BFC] underline"
          >
            Terms of Service
          </a>
          <span className="text-slate-900/50 text-sm sm:text-lg lg:text-xl">
            and
          </span>
          <a
            href="#"
            className="font-geist font-medium text-sm sm:text-lg lg:text-xl text-slate-900/50 hover:text-[#3A6BFC] underline"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </main>
  );
}

export default function AccountLayout() {
  const rootData = useRouteLoaderData('root') as RootLoaderData | undefined;
  const activeCustomer = rootData?.activeCustomer?.activeCustomer;

  const [userData, setUserData] = useState<UserProfileData>(emptyProfile);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    const stored = getStoredProfile();
    if (stored) {
      setUserData(stored);
    }
    setProfileLoaded(true);
  }, []);

  useEffect(() => {
    if (profileLoaded && isProfileComplete(userData)) {
      storeProfile(userData);
    }
  }, [userData, profileLoaded]);

  const handleOnboardingComplete = (data: UserProfileData) => {
    storeProfile(data);
    setUserData(data);
  };

  if (!profileLoaded || !isProfileComplete(userData)) {
    return (
      <OnboardingForm
        onComplete={handleOnboardingComplete}
        activeCustomer={activeCustomer}
      />
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#FFFDFD] pb-8 sm:pb-12 lg:pb-28">
        <div className="absolute h-62.5 md:h-84 lg:h-100 bg-[#FFF8F9] border-b border-[#0816271A] w-full"></div>
        <div className="custom-container relative z-10 top-0">
          {/* User Info Banner */}
          <div className="pt-40 md:pt-56 lg:pt-62">
            <div className="rounded-lg sm:rounded-3xl border border-[#0816271A] shadow-sm p-4 sm:p-6 lg:p-9 mb-4 sm:mb-6 xl:mb-16 pb-0!">
              <h1 className="text-2xl sm:text-3xl lg:text-[36px] leading-[120%] font-bold text-lightgray">
                {userData.firstName} {userData.lastName}
              </h1>
              <p className="text-lightgray text-base sm:text-lg lg:text-xl leading-[120%] mt-2 sm:mt-3">
                {userData.email || userData.phone}
              </p>

              {/* Tabs Navigation */}
              <div className="mt-3 lg:mt-9 flex items-center gap-6 sm:gap-8 border-b border-[#0816271A]">
                <NavLink
                  to="/account"
                  end
                  className={({ isActive }) =>
                    `py-4 lg:py-6 max-lg:pb-3 text-base md:text-xl -mb-0.5 font-semibold transition-colors border-b-3 ${
                      isActive
                        ? 'text-[#3A6BFC] border-[#3A6BFC]'
                        : 'text-gray-500 hover:text-gray-800 border-transparent'
                    }`
                  }
                >
                  My Profile
                </NavLink>
                <NavLink
                  to="/account/orders"
                  className={({ isActive }) =>
                    `py-4 lg:py-6 max-lg:pb-3 text-base md:text-xl -mb-0.5 font-semibold transition-colors border-b-3 ${
                      isActive
                        ? 'text-[#3A6BFC] border-[#3A6BFC]'
                        : 'text-gray-500 hover:text-gray-800 border-transparent'
                    }`
                  }
                >
                  Order History
                </NavLink>
              </div>
            </div>
          </div>
          <Outlet
            context={{ userData, setUserData } satisfies OutletContextType}
          />
        </div>
      </div>
    </Layout>
  );
}
