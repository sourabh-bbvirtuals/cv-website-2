import { useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import { EyeIcon, EyeOffIcon, XIcon } from 'lucide-react';

interface SecurityProps {
  customer: any;
  actionData?: {
    success?: boolean;
    error?: string;
    message?: string;
  };
}

export function Security({ customer, actionData }: SecurityProps) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [emailForm, setEmailForm] = useState({
    newEmail: '',
    password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
    emailPassword: false
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [emailModalMessage, setEmailModalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const logoutFetcher = useFetcher();
  const passwordFetcher = useFetcher();
  const emailFetcher = useFetcher();

  // Handle action data responses
  useEffect(() => {
    if (actionData) {
      if (actionData.success && actionData.message) {
        setMessage({ type: 'success', text: actionData.message });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        // Auto-dismiss success message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else if (actionData.error) {
        setMessage({ type: 'error', text: actionData.error });
      }
    }
  }, [actionData]);

  // Handle password fetcher responses
  useEffect(() => {
    if (passwordFetcher.data) {
      const data = passwordFetcher.data as any;
      if (data.success) {
        setMessage({ type: 'success', text: data.message || 'Password updated successfully!' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        // Auto-dismiss success message after 3 seconds
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to update password' });
      }
    }
  }, [passwordFetcher.data]);

  // Handle email fetcher responses
  useEffect(() => {
    if (emailFetcher.data) {
      const data = emailFetcher.data as any;
      if (data.newEmailAddress) {
        // Show success message in modal first, then close modal and show on main page
        setEmailModalMessage({ 
          type: 'success', 
          text: `Email change request sent to ${data.newEmailAddress}. Please check your email to confirm the change.` 
        });
        setEmailForm({ newEmail: '', password: '' });
        
        // Close modal and show message on main page after 2 seconds
        setTimeout(() => {
          setShowEmailModal(false);
          setEmailModalMessage(null);
          setMessage({ 
            type: 'success', 
            text: `Email change request sent to ${data.newEmailAddress}. Please check your email to confirm the change.` 
          });
          // Auto-dismiss main page message after 5 seconds
          setTimeout(() => setMessage(null), 5000);
        }, 2000);
      } else if (data.error) {
        setEmailModalMessage({ type: 'error', text: data.error });
      }
    }
  }, [emailFetcher.data]);

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailChange = (field: string, value: string) => {
    setEmailForm(prev => ({ ...prev, [field]: value }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm' | 'emailPassword') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const changePassword = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Please fill in all password fields' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters long' });
      return;
    }
    
    // Clear any existing messages
    setMessage(null);
    
    // Submit password change form
    const form = new FormData();
    form.append('action', 'changePassword');
    form.append('currentPassword', currentPassword);
    form.append('newPassword', newPassword);
    form.append('confirmPassword', confirmPassword);
    
    passwordFetcher.submit(form, { method: 'post' });
  };

  const changeEmail = () => {
    const { newEmail, password } = emailForm;
    
    if (!newEmail || !password) {
      setEmailModalMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }
    
    if (!newEmail.includes('@')) {
      setEmailModalMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }
    
    if (newEmail === customer?.emailAddress) {
      setEmailModalMessage({ type: 'error', text: 'New email must be different from current email' });
      return;
    }
    
    // Clear any existing messages
    setEmailModalMessage(null);
    
    // Submit email change form
    const form = new FormData();
    form.append('action', 'changeEmail');
    form.append('newEmail', newEmail);
    form.append('password', password);
    
    emailFetcher.submit(form, { method: 'post' });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Password & Security</h2>
      </div>
      
      {/* Message Display */}
      {message && (
        <div className={`mx-6 mt-4 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-3 ${
                message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
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
      
      <div className="p-6 space-y-8">
        {/* Change Password */}
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-4">Change Password</h3>
          <form className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordForm.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.current ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.new ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.confirm ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={changePassword}
              disabled={passwordFetcher.state !== 'idle'}
              className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordFetcher.state !== 'idle' ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-base font-medium text-gray-900 mb-4">Email Address</h3>
          <div className="flex items-center justify-between max-w-md">
            <div>
              <p className="text-sm text-gray-900">{customer?.emailAddress || 'No email address'}</p>
              <p className="text-xs text-gray-600 mt-1">Your current email address</p>
            </div>
            <button
              onClick={() => setShowEmailModal(true)}
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg border border-blue-200 transition-colors"
            >
              Change Email
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <h3 className="text-base font-medium text-gray-900 mb-4">Account Actions</h3>
          <div className="flex items-center justify-between max-w-md">
            <div>
              <p className="text-sm text-gray-900">Sign out of your account</p>
              <p className="text-xs text-gray-600 mt-1">You can sign back in anytime</p>
            </div>
            <logoutFetcher.Form method="post">
              <input type="hidden" name="action" value="logout" />
              <button
                type="submit"
                disabled={logoutFetcher.state !== 'idle'}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200 transition-colors disabled:opacity-50"
              >
                {logoutFetcher.state !== 'idle' ? 'Signing out...' : 'Sign Out'}
              </button>
            </logoutFetcher.Form>
          </div>
        </div>
      </div>

      {/* Email Change Modal */}
      {showEmailModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEmailModal(false);
              setEmailForm({ newEmail: '', password: '' });
              setEmailModalMessage(null);
            }
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Change Email Address</h3>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailForm({ newEmail: '', password: '' });
                  setEmailModalMessage(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Enter your new email address and current password. A verification email will be sent to your new address.
              </p>
              
              {/* Modal Error/Success Message */}
              {emailModalMessage && (
                <div className={`p-4 rounded-lg ${
                  emailModalMessage.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        emailModalMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      <span className="text-sm font-medium">{emailModalMessage.text}</span>
                    </div>
                    <button
                      onClick={() => setEmailModalMessage(null)}
                      className={`ml-4 text-sm font-medium hover:opacity-75 transition-opacity ${
                        emailModalMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Email Address</label>
                <input
                  type="email"
                  value={emailForm.newEmail}
                  onChange={(e) => handleEmailChange('newEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter new email address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPasswords.emailPassword ? "text" : "password"}
                    value={emailForm.password}
                    onChange={(e) => handleEmailChange('password', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('emailPassword')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.emailPassword ? (
                      <EyeOffIcon className="w-4 h-4" />
                    ) : (
                      <EyeIcon className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    setEmailForm({ newEmail: '', password: '' });
                    setEmailModalMessage(null);
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={changeEmail}
                  disabled={emailFetcher.state !== 'idle'}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {emailFetcher.state !== 'idle' ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
