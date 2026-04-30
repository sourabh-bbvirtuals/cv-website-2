import { useState } from 'react';
import { useOutletContext } from '@remix-run/react';

interface UserProfileData {
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

interface OutletContextType {
  userData: UserProfileData;
  setUserData: React.Dispatch<React.SetStateAction<UserProfileData>>;
}

const STORAGE_KEY = 'bb_user_profile';

function persistProfile(data: UserProfileData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

const EditIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </svg>
);

const displayValue = (val: string, fallback = '—') => val || fallback;

export default function ProfileTab() {
  const { userData, setUserData } = useOutletContext<OutletContextType>();
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [isEditingPreference, setIsEditingPreference] =
    useState<boolean>(false);

  const handleProfileSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const updated = {
      ...userData,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      dob: formData.get('dob') as string,
      gender: formData.get('gender') as string,
      address: formData.get('address') as string,
      state: formData.get('state') as string,
      city: formData.get('city') as string,
      pincode: formData.get('pincode') as string,
    };
    setUserData(updated);
    persistProfile(updated);
    setIsEditingProfile(false);
  };

  const handlePreferenceSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const updated = {
      ...userData,
      board: formData.get('board') as string,
      classLevel: formData.get('classLevel') as string,
    };
    setUserData(updated);
    persistProfile(updated);
    setIsEditingPreference(false);
  };

  const displayValue = (val: string, fallback = '—') => val || fallback;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-3 xl:gap-5">
      {/* LEFT COLUMN: My Profile */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-lg sm:rounded-3xl border border-gray-100 shadow-sm p-3 sm:p-4 xl:p-9">
          <div className="flex justify-between items-center mb-4 sm:mb-5 xl:mb-7.5">
            <h2 className="text-xl xl:text-2xl font-bold text-lightgray">
              My Profile
            </h2>
            {!isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center gap-1 xl:gap-2 px-3 xl:px-4 py-1 xl:py-2 rounded-full border border-[#3A6BFC33] text-[#3A6BFC] text-sm xl:text-base leading-[120%] font-medium hover:bg-blue-50 transition"
              >
                <EditIcon /> Edit
              </button>
            )}
          </div>

          {!isEditingProfile ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 xl:gap-y-9 gap-x-4 xl:gap-x-8">
              <div>
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                  First Name
                </p>
                <p className="font-medium text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] mt-1 sm:mt-2 xl:mt-3">
                  {displayValue(userData.firstName)}
                </p>
              </div>
              <div>
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                  Last Name
                </p>
                <p className="font-medium text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] mt-1 sm:mt-2 xl:mt-3">
                  {displayValue(userData.lastName)}
                </p>
              </div>
              <div>
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                  Email Address
                </p>
                <p className="font-medium text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] mt-1 sm:mt-2 xl:mt-3">
                  {displayValue(userData.email)}
                </p>
              </div>
              <div>
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                  Phone Number
                </p>
                <p className="font-medium text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] mt-1 sm:mt-2 xl:mt-3">
                  {displayValue(userData.phone)}
                </p>
              </div>
              <div>
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                  Date of Birth
                </p>
                <p className="font-medium text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] mt-1 sm:mt-2 xl:mt-3">
                  {displayValue(userData.dob)}
                </p>
              </div>
              <div>
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                  Gender
                </p>
                <p className="font-medium text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] mt-1 sm:mt-2 xl:mt-3">
                  {displayValue(userData.gender)}
                </p>
              </div>
              {userData.address && (
                <div className="sm:col-span-2">
                  <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                    Address
                  </p>
                  <p className="font-medium text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] mt-1 sm:mt-2 xl:mt-3">
                    {userData.address}
                  </p>
                </div>
              )}
              {userData.state && (
                <div>
                  <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                    State
                  </p>
                  <p className="font-medium text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] mt-1 sm:mt-2 xl:mt-3">
                    {userData.state}
                  </p>
                </div>
              )}
              {userData.city && (
                <div>
                  <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                    City
                  </p>
                  <p className="font-medium text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] mt-1 sm:mt-2 xl:mt-3">
                    {userData.city}
                  </p>
                </div>
              )}
              {userData.pincode && (
                <div>
                  <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                    Pincode
                  </p>
                  <p className="font-medium text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] mt-1 sm:mt-2 xl:mt-3">
                    {userData.pincode}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleProfileSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 xl:gap-x-8 gap-y-4 xl:gap-y-9">
                <div className="flex flex-col gap-2 xl:gap-3">
                  <label className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    defaultValue={userData.firstName}
                    required
                    className="px-4 xl:px-6 py-2 xl:py-3.5 rounded-full border border-[#0816271A] focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
                <div className="flex flex-col gap-2 xl:gap-3">
                  <label className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    defaultValue={userData.lastName}
                    className="px-4 xl:px-6 py-2 xl:py-3.5 rounded-full border border-[#0816271A] focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
                <div className="flex flex-col gap-2 xl:gap-3">
                  <label className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={userData.email}
                    className="px-4 xl:px-6 py-2 xl:py-3.5 rounded-full border border-[#0816271A] focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
                <div className="flex flex-col gap-2 xl:gap-3">
                  <label className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                    Phone Number
                  </label>
                  <input
                    type="number"
                    name="phone"
                    defaultValue={userData.phone}
                    required
                    className="px-4 xl:px-6 py-2 xl:py-3.5 rounded-full border border-[#0816271A] focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
                <div className="flex flex-col gap-2 xl:gap-3">
                  <label className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    defaultValue={userData.dob}
                    className="px-4 xl:px-6 py-2 xl:py-3.5 rounded-full border border-[#0816271A] focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-gray-700"
                  />
                </div>
                <div className="flex flex-col gap-2 xl:gap-3">
                  <label className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                    Gender
                  </label>
                  <select
                    name="gender"
                    defaultValue={userData.gender}
                    className="px-4 xl:px-6 py-2 xl:py-3.5 rounded-full border border-[#0816271A] focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white appearance-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={userData.address}
                    className="px-4 xl:px-6 py-2 xl:py-3.5 rounded-full border border-[#0816271A] focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
                <div className="flex flex-col gap-2 xl:gap-3">
                  <label className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    defaultValue={userData.state}
                    className="px-4 xl:px-6 py-2 xl:py-3.5 rounded-full border border-[#0816271A] focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
                <div className="flex flex-col gap-2 xl:gap-3">
                  <label className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    defaultValue={userData.city}
                    className="px-4 xl:px-6 py-2 xl:py-3.5 rounded-full border border-[#0816271A] focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
                <div className="flex flex-col gap-2 xl:gap-3">
                  <label className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                    Pincode
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    defaultValue={userData.pincode}
                    className="px-4 xl:px-6 py-2 xl:py-3.5 rounded-full border border-[#0816271A] focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-6 py-2.5 text-gray-600 rounded-full font-medium hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Preferences & Courses */}
      <div className="space-y-4 sm:space-y-6 lg:col-span-1">
        <div className="bg-white rounded-lg sm:rounded-3xl border border-gray-100 shadow-sm p-3 sm:p-4 xl:p-9">
          <div className="flex justify-between items-center mb-4 sm:mb-5 xl:mb-7.5">
            <h2 className="text-xl xl:text-2xl font-bold text-lightgray">
              My Preference
            </h2>
            {!isEditingPreference && (
              <button
                onClick={() => setIsEditingPreference(true)}
                className="flex items-center gap-1 xl:gap-2 px-3 xl:px-4 py-1 xl:py-2 rounded-full border border-[#3A6BFC33] text-[#3A6BFC] text-sm xl:text-base leading-[120%] font-medium hover:bg-blue-50 transition"
              >
                <EditIcon /> Edit
              </button>
            )}
          </div>

          {!isEditingPreference ? (
            <div className="space-y-4 xl:space-y-7.5">
              <div>
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                  Class
                </p>
                <p className="font-medium text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] mt-1 sm:mt-2 xl:mt-3">
                  {displayValue(userData.classLevel)}
                </p>
              </div>
              <div>
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                  Board
                </p>
                <p className="font-medium text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] mt-1 sm:mt-2 xl:mt-3">
                  {displayValue(userData.board)}
                </p>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handlePreferenceSubmit}>
              <div className="flex flex-col gap-2 xl:gap-3">
                <label className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                  Board
                </label>
                <select
                  name="board"
                  defaultValue={userData.board}
                  className="px-4 xl:px-6 py-2 xl:py-3.5 rounded-full border border-[#0816271A] focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white appearance-none"
                >
                  <option value="CBSE">CBSE</option>
                  <option value="MH">MH</option>
                  <option value="CUET">CUET</option>
                </select>
              </div>
              <div className="flex flex-col gap-2 xl:gap-3">
                <label className="text-sm sm:text-base lg:text-lg xl:text-xl text-lightgray leading-[120%] font-medium opacity-50">
                  Class
                </label>
                <select
                  name="classLevel"
                  defaultValue={userData.classLevel}
                  className="px-4 xl:px-6 py-2 xl:py-3.5 rounded-full border border-[#0816271A] focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white appearance-none"
                >
                  <option value="11th">11th</option>
                  <option value="12th">12th</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white text-sm rounded-full font-medium hover:bg-blue-700 transition"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingPreference(false)}
                  className="px-5 py-2 text-gray-600 text-sm rounded-full font-medium hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
