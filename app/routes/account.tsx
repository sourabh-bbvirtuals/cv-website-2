import { useState, useEffect } from 'react';
import {
  NavLink,
  Outlet,
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

  const getSegmentClass = (isActive: boolean) =>
    `flex items-center justify-center gap-2 flex-1 py-2 sm:py-3 rounded-full border text-sm sm:text-base font-geist font-medium transition-all bg-white cursor-pointer ${
      isActive
        ? 'border-[#3A6BFC] text-[#3A6BFC]'
        : 'border-[#0816271A] text-lightgray opacity-80 hover:opacity-100 hover:border-[#3A6BFC]'
    }`;

  const inputClass =
    'w-full bg-white rounded-full px-4 md:px-6 py-2.5 md:py-3.5 border border-[#0816271A] text-lightgray text-sm sm:text-base font-medium outline-none focus:border-[#3A6BFC] focus:ring-1 focus:ring-[#3A6BFC] transition-all';

  return (
    <main className="relative min-h-screen bg-white flex flex-col items-center justify-between p-4 py-6 sm:py-10 xl:py-15 overflow-y-auto mx-auto bg-[url('/assets/images/homepage/hero-bg.png')] bg-no-repeat bg-cover bg-center">
      <a href="/" className="relative max-w-61.25 w-full aspect-245/48">
        <img src="/assets/logo.png" alt="logo" />
      </a>

      <div className="flex flex-col items-center w-full gap-4 sm:gap-6 text-center grow justify-center max-w-150 py-16">
        <div className="flex flex-col items-center mb-2">
          <h1 className="font-geist font-semibold leading-[120%] text-2xl md:text-3xl lg:text-[32px] tracking-[-1%] text-lightgray">
            Create an Account
          </h1>
          <p className="text-lightgray opacity-50 font-geist leading-[120%] text-sm sm:text-base lg:text-xl mt-2 sm:mt-3">
            We'd like to know about your current status
          </p>
        </div>

        <div className="bg-[#FFFFFF33] border border-[#FFFFFF] w-full max-w-120 lg:max-w-150 rounded-[30px] p-5 sm:p-8 text-left z-10 flex flex-col gap-4 sm:gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-lightgray/60 font-medium opacity-70 font-geist text-sm sm:text-xl">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setErrors((p) => ({ ...p, fullName: '' }));
              }}
              className={`${inputClass} ${
                errors.fullName ? 'border-red-500' : ''
              }`}
              placeholder="Write Name here"
            />
            {errors.fullName && (
              <span className="text-red-500 text-sm px-2">
                {errors.fullName}
              </span>
            )}
          </div>

          {!knownEmail && (
            <div className="flex flex-col gap-1.5">
              <label className="text-lightgray/60 font-medium opacity-70 font-geist text-sm sm:text-xl">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="Write Email here"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-lightgray/60 font-medium opacity-70 font-geist text-sm sm:text-xl">
              Date of Birth
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-lightgray/60 font-medium opacity-70 font-geist text-sm sm:text-xl">
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
                  className={getSegmentClass(gender === g)}
                >
                  {g}
                </button>
              ))}
            </div>
            {errors.gender && (
              <span className="text-red-500 text-sm px-2">{errors.gender}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-lightgray/60 font-medium opacity-70 font-geist text-sm sm:text-xl">
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
                  className={getSegmentClass(board === b)}
                >
                  {b === 'CBSE' ? '🏵️ ' : b === 'MH' ? '🏫 ' : '🎓 '}
                  {b}
                </button>
              ))}
            </div>
            {errors.board && (
              <span className="text-red-500 text-sm px-2">{errors.board}</span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-lightgray/60 font-medium opacity-70 font-geist text-sm sm:text-xl">
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
                  className={getSegmentClass(classLevel === c)}
                >
                  {c}
                </button>
              ))}
            </div>
            {errors.classLevel && (
              <span className="text-red-500 text-sm px-2">
                {errors.classLevel}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-lightgray/60 font-medium opacity-70 font-geist text-sm sm:text-xl">
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
                value={phone}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(v);
                  setErrors((p) => ({ ...p, phone: '' }));
                }}
                className="bg-transparent w-full text-lightgray/60 text-sm sm:text-base font-medium border-none outline-none focus:ring-0"
                placeholder="00000-00000"
              />
            </div>
            {errors.phone && (
              <span className="text-red-500 text-sm px-2">{errors.phone}</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="font-geist font-medium text-sm sm:text-base lg:text-lg bg-[#3A6BFC] py-3 md:py-4 min-h-[48px] md:min-h-[56px] text-white flex items-center justify-center w-full rounded-full shadow-[inset_0px_4px_8px_0px_#83A2FFBF,inset_0px_-2px_2px_0px_#0F3FCE] mt-2 transition-all"
          >
            Create an Account
          </button>
        </div>

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

      <div className="w-full text-center mt-auto pt-4">
        <p className="font-geist font-medium text-sm sm:text-xl leading-[120%] text-lightgray opacity-50">
          You Acknowledge that you read, and agree to our
        </p>
        <p className="font-geist font-medium text-sm sm:text-xl leading-[120%] text-lightgray opacity-50 mt-1">
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
