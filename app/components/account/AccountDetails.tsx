import { useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import { Edit2Icon } from 'lucide-react';

interface AccountDetailsProps {
  customer: any;
}

export function AccountDetails({ customer }: AccountDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    email: customer?.emailAddress || '',
    phone: customer?.phoneNumber || '',
    title: customer?.title || '',
    icaiRegistrationNumber: customer?.customFields?.icaiRegistrationNumber || '',
    gstin: customer?.customFields?.gstin || '',
  });
  const fetcher = useFetcher();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setMessage(null); // Clear any existing messages when toggling edit mode
  };

  const saveChanges = () => {
    const form = new FormData();
    form.append('action', 'updateCustomer');
    form.append('firstName', formData.firstName);
    form.append('lastName', formData.lastName);
    form.append('phoneNumber', formData.phone);
    form.append('title', formData.title);
    form.append('icaiRegistrationNumber', formData.icaiRegistrationNumber);
    form.append('gstin', formData.gstin);

    fetcher.submit(form, { method: 'POST' });
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setMessage(null); // Clear any existing messages when canceling
    // Reset form data to original values
    setFormData({
      firstName: customer?.firstName || '',
      lastName: customer?.lastName || '',
      email: customer?.emailAddress || '',
      phone: customer?.phoneNumber || '',
      title: customer?.title || '',
      icaiRegistrationNumber: customer?.customFields?.icaiRegistrationNumber || '',
      gstin: customer?.customFields?.gstin || '',
    });
  };

  // Handle fetcher response
  useEffect(() => {
    if (fetcher.data) {
      const data = fetcher.data as any;
      if (data.success) {
        setMessage({
          type: 'success',
          text: 'Account details updated successfully!',
        });
        setIsEditing(false);
        // Auto-dismiss success message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to update account details',
        });
      }
    }
  }, [fetcher.data]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Account Details
          </h2>
          {!isEditing && (
            <button
              onClick={toggleEdit}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              <Edit2Icon className="w-4 h-4" />
              Edit
            </button>
          )}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <select
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select Title</option>
              <option value="Mr">Mr</option>
              <option value="Mrs">Mrs</option>
              <option value="Ms">Ms</option>
              <option value="Dr">Dr</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="flex gap-3">
              <input
                type="email"
                value={formData.email}
                disabled
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
              <button
                type="button"
                onClick={() =>
                  setMessage({
                    type: 'error',
                    text: 'Change email functionality is not yet implemented',
                  })
                }
                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg border border-blue-200 transition-colors"
              >
                Change
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ICAI Registration Number
            </label>
            <input
              type="tel"
              value={formData.icaiRegistrationNumber}
              onChange={(e) => handleInputChange('icaiRegistrationNumber', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GSTIN
            </label>
            <input
              type="text"
              value={formData.gstin}
              onChange={(e) => handleInputChange('gstin', e.target.value)}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 disabled:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder=""
            />
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={saveChanges}
              disabled={fetcher.state !== 'idle'}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fetcher.state !== 'idle' ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={cancelEdit}
              disabled={fetcher.state !== 'idle'}
              className="px-4 py-2 text-gray-600 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
