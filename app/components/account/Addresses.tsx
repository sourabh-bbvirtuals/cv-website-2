import { useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import {
  PlusIcon,
  MapPinIcon,
  MoreVerticalIcon,
  Edit2Icon,
  TruckIcon,
  CreditCardIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';

interface AddressesProps {
  addresses: any[];
  availableCountries: any[];
  statesData: any;
}

export function Addresses({
  addresses,
  availableCountries,
  statesData,
}: AddressesProps) {
  const [localAddresses, setLocalAddresses] = useState(addresses);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [showMenu, setShowMenu] = useState<number | null>(null);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [newAddressForm, setNewAddressForm] = useState({
    fullName: '',
    company: '',
    streetLine1: '',
    streetLine2: '',
    city: '',
    province: '',
    postalCode: '',
    countryCode:
      availableCountries.find((c) => c.name === 'India')?.code || 'IN',
    phoneNumber: '',
    emailAddress: '',
    defaultShippingAddress: false,
    defaultBillingAddress: false,
  });
  const fetcher = useFetcher();

  // Helper function to get states for selected country
  const getStatesForCountry = (countryCode: string) => {
    if (!statesData || !countryCode) return [];

    // Handle different country code formats (IN, india, etc.)
    const normalizedCountryCode = countryCode.toLowerCase();
    const statesDataObj = statesData as Record<string, any>;
    const countryKey = Object.keys(statesDataObj).find(
      (key) =>
        key.toLowerCase() === normalizedCountryCode ||
        key.toLowerCase() === normalizedCountryCode.toLowerCase(),
    );

    if (countryKey && statesDataObj[countryKey]) {
      const countryStates = statesDataObj[countryKey];

      const rawStates = Array.isArray(countryStates)
        ? countryStates
        : countryStates && typeof countryStates === 'object'
        ? Object.values(countryStates)
        : [];

      const normalizeState = (s: any) => {
        if (s == null) return null;
        if (typeof s === 'string') {
          return { name: s, code: s, enabled: undefined };
        }
        if (typeof s === 'object') {
          const name =
            s.name ?? s.stateName ?? s.label ?? s.value ?? s.province ?? '';
          const code =
            s.code ?? s.stateCode ?? s.abbreviation ?? s.shortCode ?? name;
          return { name, code, enabled: s.enabled };
        }
        return null;
      };

      return rawStates
        .map(normalizeState)
        .filter(
          (s: any) =>
            s && typeof s.name === 'string' && s.name.trim().length > 0,
        )
        .filter((s: any) =>
          typeof s.enabled === 'boolean' ? s.enabled : true,
        );
    }

    // Fallback: if no states found, return empty array
    console.log(
      'No states found for country:',
      countryCode,
      'Available keys:',
      Object.keys(statesDataObj),
    );
    return [];
  };

  const toggleMenu = (id: number) => {
    setShowMenu(showMenu === id ? null : id);
  };

  const deleteAddress = (id: string) => {
    setMessage(null); // Clear any existing messages
    setMessage({ type: 'success', text: 'Deleting address...' });
    const form = new FormData();
    form.append('action', 'deleteAddress');
    form.append('id', id);
    fetcher.submit(form, { method: 'POST' });
    setShowMenu(null);
  };

  const editAddress = (address: any) => {
    setEditingAddress(address);
    setNewAddressForm({
      fullName: address.fullName || '',
      company: address.company || '',
      streetLine1: address.streetLine1 || '',
      streetLine2: address.streetLine2 || '',
      city: address.city || '',
      province: address.province || '',
      postalCode: address.postalCode || '',
      countryCode:
        address.country?.code ||
        availableCountries.find((c) => c.name === 'India')?.code ||
        'IN',
      phoneNumber: address.phoneNumber || '',
      emailAddress: address.customFields?.emailAddress || '',
      defaultShippingAddress: address.defaultShippingAddress || false,
      defaultBillingAddress: address.defaultBillingAddress || false,
    });
    setShowEditForm(true);
    setShowMenu(null);
  };

  const setDefaultShipping = (id: string) => {
    setMessage(null);
    setMessage({
      type: 'success',
      text: 'Setting as default shipping address...',
    });

    // Optimistically update local state to clear other shipping defaults
    setLocalAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        defaultShippingAddress: addr.id === id ? true : false,
      })),
    );

    const form = new FormData();
    form.append('action', 'setDefaultShipping');
    form.append('id', id);
    fetcher.submit(form, { method: 'POST' });
    setShowMenu(null);
  };

  const setDefaultBilling = (id: string) => {
    setMessage(null);
    setMessage({
      type: 'success',
      text: 'Setting as default billing address...',
    });

    // Optimistically update local state to clear other billing defaults
    setLocalAddresses((prev) =>
      prev.map((addr) => ({
        ...addr,
        defaultBillingAddress: addr.id === id ? true : false,
      })),
    );

    const form = new FormData();
    form.append('action', 'setDefaultBilling');
    form.append('id', id);
    fetcher.submit(form, { method: 'POST' });
    setShowMenu(null);
  };

  const handleAddAddress = () => {
    setMessage(null); // Clear any existing messages
    const form = new FormData();
    form.append('action', 'createAddress');
    Object.entries(newAddressForm).forEach(([key, value]) => {
      form.append(key, value.toString());
    });
    fetcher.submit(form, { method: 'POST' });
  };

  const handleEditAddress = () => {
    setMessage(null); // Clear any existing messages
    const form = new FormData();
    form.append('action', 'updateAddress');
    form.append('id', editingAddress.id);
    Object.entries(newAddressForm).forEach(([key, value]) => {
      form.append(key, value.toString());
    });
    fetcher.submit(form, { method: 'POST' });
  };

  const closeAddForm = () => {
    setShowAddForm(false);
    setMessage(null); // Clear any existing messages
  };

  const closeEditForm = () => {
    setShowEditForm(false);
    setEditingAddress(null);
    setMessage(null); // Clear any existing messages
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    let processedValue = value;
    if (field === 'city' && typeof value === 'string') {
      processedValue = value.replace(/[^a-zA-Z\s]/g, '');
    }
    setNewAddressForm((prev) => {
      const updated = { ...prev, [field]: processedValue };

      // Clear province when country changes
      if (field === 'countryCode') {
        updated.province = '';
      }

      return updated;
    });
  };

  // Handle fetcher response
  useEffect(() => {
    if (fetcher.data) {
      const data = fetcher.data as any;
      if (data.success) {
        if (data.address) {
          // Address was created/updated - update local state
          console.log(
            'Updating address:',
            data.address.id,
            'Current addresses:',
            localAddresses.length,
          );
          setLocalAddresses((prev) => {
            // Check if address already exists (for updates)
            const exists = prev.some((addr) => addr.id === data.address.id);
            console.log('Address exists:', exists);

            if (exists) {
              // Update existing address and handle default flag changes
              return prev.map((addr) => {
                if (addr.id === data.address.id) {
                  // Update the modified address
                  console.log('Updating address with new data:', data.address);
                  return data.address;
                } else {
                  // For other addresses, check if they need default flags cleared
                  // This handles the case where setting one address as default clears others
                  const updatedAddr = { ...addr };
                  let needsUpdate = false;

                  // If the updated address is now default shipping, clear other shipping defaults
                  if (
                    data.address.defaultShippingAddress &&
                    addr.defaultShippingAddress
                  ) {
                    console.log(
                      `Clearing default shipping from address ${addr.id} because ${data.address.id} is now default shipping`,
                    );
                    updatedAddr.defaultShippingAddress = false;
                    needsUpdate = true;
                  }

                  // If the updated address is now default billing, clear other billing defaults
                  if (
                    data.address.defaultBillingAddress &&
                    addr.defaultBillingAddress
                  ) {
                    console.log(
                      `Clearing default billing from address ${addr.id} because ${data.address.id} is now default billing`,
                    );
                    updatedAddr.defaultBillingAddress = false;
                    needsUpdate = true;
                  }

                  if (needsUpdate) {
                    console.log(
                      'Updated address after clearing defaults:',
                      updatedAddr,
                    );
                  }

                  return updatedAddr;
                }
              });
            } else {
              // Add new address
              return [...prev, data.address];
            }
          });
          // Determine if this is a create or update operation
          const isUpdate = localAddresses.some(
            (addr) => addr.id === data.address.id,
          );
          setMessage({
            type: 'success',
            text: isUpdate
              ? 'Address updated successfully!'
              : 'Address added successfully!',
          });
        } else {
          // Address was deleted - refresh page
          window.location.reload();
        }

        // Auto-dismiss success message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        // Show error message
        setMessage({ type: 'error', text: data.error || 'Operation failed' });
      }

      // Always close the forms and reset them after any operation
      setShowAddForm(false);
      setShowEditForm(false);
      setEditingAddress(null);
      setNewAddressForm({
        fullName: '',
        company: '',
        streetLine1: '',
        streetLine2: '',
        city: '',
        province: '',
        postalCode: '',
        countryCode:
          availableCountries.find((c) => c.name === 'India')?.code || 'IN',
        phoneNumber: '',
        emailAddress: '',
        defaultShippingAddress: false,
        defaultBillingAddress: false,
      });
    }
  }, [fetcher.data]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Addresses</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Add New Address
          </button>
        </div>
      </div>

      {/* Message Display */}
      {message && (
        <div
          className={`mx-6 mt-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-3 ${
                  message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}
              ></div>
              <span className="text-sm font-medium">{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className={`ml-4 text-sm font-medium hover:opacity-75 transition-opacity ${
                message.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="p-6">
        {localAddresses.length === 0 ? (
          <div className="text-center py-8">
            <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No addresses saved
            </h3>
            <p className="text-gray-600">
              You haven't saved any addresses yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {localAddresses.map((address) => (
              <div
                key={address.id}
                className="border border-gray-200 rounded-lg p-4 relative"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {address.company || 'Address'}
                    </h3>
                    <div className="flex gap-2 mt-1">
                      {address.defaultShippingAddress && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                          Default Shipping
                        </span>
                      )}
                      {address.defaultBillingAddress && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Default Billing
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => toggleMenu(address.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <MoreVerticalIcon className="w-4 h-4" />
                    </button>
                    {showMenu === address.id && (
                      <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => editAddress(address)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Edit2Icon className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => setDefaultShipping(address.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <TruckIcon className="w-3 h-3" />
                          Set as Default Shipping
                        </button>
                        <button
                          onClick={() => setDefaultBilling(address.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <CreditCardIcon className="w-3 h-3" />
                          Set as Default Billing
                        </button>
                        <button
                          onClick={() => deleteAddress(address.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2Icon className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p>{address.fullName}</p>
                  <p>{address.streetLine1}</p>
                  {address.streetLine2 && <p>{address.streetLine2}</p>}
                  <p>
                    {address.city}, {address.province} {address.postalCode}
                  </p>
                  <p>{address.country?.name}</p>
                  {address.phoneNumber && (
                    <p className="mt-2">{address.phoneNumber}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Address Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add New Address
                </h3>
                <button
                  onClick={closeAddForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name - Required */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={newAddressForm.fullName}
                      onChange={(e) =>
                        handleInputChange('fullName', e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>

                  {/* Company - Optional */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company (Optional)
                    </label>
                    <input
                      type="text"
                      value={newAddressForm.company}
                      onChange={(e) =>
                        handleInputChange('company', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Company name (optional)"
                    />
                  </div>

                  {/* Phone Number - Required */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={newAddressForm.phoneNumber}
                      onChange={(e) =>
                        handleInputChange('phoneNumber', e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="9876543210"
                      pattern="[6-9][0-9]{9}"
                      maxLength={10}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter 10-digit mobile number starting with 6, 7, 8, or 9
                    </p>
                  </div>

                  {/* Email Address - Required */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={newAddressForm.emailAddress}
                      onChange={(e) =>
                        handleInputChange('emailAddress', e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="example@email.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email for order notifications and updates
                    </p>
                  </div>

                  {/* Street Address Line 1 - Required */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      value={newAddressForm.streetLine1}
                      onChange={(e) =>
                        handleInputChange('streetLine1', e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Street address, P.O. box, company name, c/o"
                    />
                  </div>

                  {/* Street Address Line 2 - Optional */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      value={newAddressForm.streetLine2}
                      onChange={(e) =>
                        handleInputChange('streetLine2', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Apartment, suite, unit, building, floor, etc."
                    />
                  </div>

                  {/* City - Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={newAddressForm.city}
                      onChange={(e) =>
                        handleInputChange('city', e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="City"
                    />
                  </div>

                  {/* State/Province - Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province *
                    </label>
                    <select
                      value={newAddressForm.province}
                      onChange={(e) =>
                        handleInputChange('province', e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select State</option>
                      {getStatesForCountry(newAddressForm.countryCode).map(
                        (state: any) => (
                          <option key={state.code} value={state.name}>
                            {state.name}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  {/* Postal Code - Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP/Postal Code *
                    </label>
                    <input
                      type="text"
                      value={newAddressForm.postalCode}
                      onChange={(e) =>
                        handleInputChange('postalCode', e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="PIN code"
                    />
                  </div>

                  {/* Country - Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <select
                      value={newAddressForm.countryCode}
                      onChange={(e) =>
                        handleInputChange('countryCode', e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {availableCountries.map((country) => (
                        <option key={country.id} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAddressForm.defaultShippingAddress}
                      onChange={(e) =>
                        handleInputChange(
                          'defaultShippingAddress',
                          e.target.checked,
                        )
                      }
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Set as default shipping address
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAddressForm.defaultBillingAddress}
                      onChange={(e) =>
                        handleInputChange(
                          'defaultBillingAddress',
                          e.target.checked,
                        )
                      }
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Set as default billing address
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleAddAddress}
                    disabled={fetcher.state !== 'idle'}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {fetcher.state !== 'idle' ? 'Saving...' : 'Save Address'}
                  </button>
                  <button
                    type="button"
                    onClick={closeAddForm}
                    disabled={fetcher.state !== 'idle'}
                    className="px-4 py-2 text-gray-600 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Address Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Edit Address
                </h3>
                <button
                  onClick={closeEditForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name - Required */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={newAddressForm.fullName}
                      onChange={(e) =>
                        handleInputChange('fullName', e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter full name"
                    />
                  </div>

                  {/* Company - Optional */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company (Optional)
                    </label>
                    <input
                      type="text"
                      value={newAddressForm.company}
                      onChange={(e) =>
                        handleInputChange('company', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Company name (optional)"
                    />
                  </div>

                  {/* Phone Number - Required */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={newAddressForm.phoneNumber}
                      onChange={(e) =>
                        handleInputChange('phoneNumber', e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="9876543210"
                      pattern="[6-9][0-9]{9}"
                      maxLength={10}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter 10-digit mobile number starting with 6, 7, 8, or 9
                    </p>
                  </div>

                  {/* Email Address - Required */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={newAddressForm.emailAddress}
                      onChange={(e) =>
                        handleInputChange('emailAddress', e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="example@email.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Email for order notifications and updates
                    </p>
                  </div>

                  {/* Street Address Line 1 - Required */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      value={newAddressForm.streetLine1}
                      onChange={(e) =>
                        handleInputChange('streetLine1', e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Street address, P.O. box, company name, c/o"
                    />
                  </div>

                  {/* Street Address Line 2 - Optional */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      value={newAddressForm.streetLine2}
                      onChange={(e) =>
                        handleInputChange('streetLine2', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Apartment, suite, unit, building, floor, etc."
                    />
                  </div>

                  {/* City - Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={newAddressForm.city}
                      onChange={(e) =>
                        handleInputChange('city', e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="City"
                    />
                  </div>

                  {/* State/Province - Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State/Province *
                    </label>
                    <select
                      value={newAddressForm.province}
                      onChange={(e) =>
                        handleInputChange('province', e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select State</option>
                      {getStatesForCountry(newAddressForm.countryCode).map(
                        (state: any) => (
                          <option key={state.code} value={state.name}>
                            {state.name}
                          </option>
                        ),
                      )}
                    </select>
                  </div>

                  {/* Postal Code - Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP/Postal Code *
                    </label>
                    <input
                      type="text"
                      value={newAddressForm.postalCode}
                      onChange={(e) =>
                        handleInputChange('postalCode', e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="PIN code"
                    />
                  </div>

                  {/* Country - Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country *
                    </label>
                    <select
                      value={newAddressForm.countryCode}
                      onChange={(e) =>
                        handleInputChange('countryCode', e.target.value)
                      }
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {availableCountries.map((country) => (
                        <option key={country.id} value={country.code}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAddressForm.defaultShippingAddress}
                      onChange={(e) =>
                        handleInputChange(
                          'defaultShippingAddress',
                          e.target.checked,
                        )
                      }
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Set as default shipping address
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAddressForm.defaultBillingAddress}
                      onChange={(e) =>
                        handleInputChange(
                          'defaultBillingAddress',
                          e.target.checked,
                        )
                      }
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Set as default billing address
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleEditAddress}
                    disabled={fetcher.state !== 'idle'}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {fetcher.state !== 'idle'
                      ? 'Updating...'
                      : 'Update Address'}
                  </button>
                  <button
                    type="button"
                    onClick={closeEditForm}
                    disabled={fetcher.state !== 'idle'}
                    className="px-4 py-2 text-gray-600 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
