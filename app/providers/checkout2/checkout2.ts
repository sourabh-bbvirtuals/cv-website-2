// --- Interfaces ---

export interface CheckoutAnnouncement {
  text: string;
  variant: 'info' | 'warning' | 'success';
  icon: string;
}

export interface CheckoutHeader {
  logo: {
    src: string;
    alt: string;
  };
  navigation: Array<{
    label: string;
    href: string;
  }>;
  cartCount: number;
}

export interface ShippingAddress {
  name: string;
  address1: string;
  address2: string;
  mobile: string;
  altMobile: string;
  email: string;
  pincode: string;
  city: string;
  state: string;
}

export interface BillingAddress {
  company: string;
  gst: string;
  name: string;
  address1: string;
  address2: string;
  mobile: string;
  altMobile: string;
  email: string;
  pincode: string;
  city: string;
  state: string;
}

export interface CheckoutFormData {
  shipping: ShippingAddress;
  billing: BillingAddress;
  landmark: string;
  paymentMethod: string;
  preferences: {
    saveInfo: boolean;
    acceptTerms: boolean;
  };
}

export interface CheckoutPolicies {
  disclaimer: string;
  purchasePolicy: string;
  refundPolicy: string;
}

export interface CheckoutData {
  announcement: CheckoutAnnouncement;
  header: CheckoutHeader;
  formData: CheckoutFormData;
  states: string[];
  paymentMethods: string[];
  policies: CheckoutPolicies;
}

// --- Form Validation ---

export interface ValidationError {
  field: string;
  message: string;
}

export function validateShippingAddress(shipping: ShippingAddress): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!shipping.name.trim()) {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  if (!shipping.address1.trim()) {
    errors.push({ field: 'address1', message: 'Address is required' });
  }

  if (!shipping.mobile.trim()) {
    errors.push({ field: 'mobile', message: 'Mobile number is required' });
  } else if (!/^\d{10}$/.test(shipping.mobile.replace(/\s+/g, ''))) {
    errors.push({ field: 'mobile', message: 'Please enter a valid 10-digit mobile number' });
  }

  if (!shipping.email.trim()) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) {
    errors.push({ field: 'email', message: 'Please enter a valid email address' });
  }

  if (!shipping.pincode.trim()) {
    errors.push({ field: 'pincode', message: 'Pincode is required' });
  } else if (!/^\d{6}$/.test(shipping.pincode)) {
    errors.push({ field: 'pincode', message: 'Please enter a valid 6-digit pincode' });
  }

  if (!shipping.city.trim()) {
    errors.push({ field: 'city', message: 'City is required' });
  }

  if (!shipping.state.trim()) {
    errors.push({ field: 'state', message: 'State is required' });
  }

  return errors;
}

export function validateBillingAddress(billing: BillingAddress, useShipping: boolean): ValidationError[] {
  if (useShipping) {
    return []; // Skip validation if using shipping address
  }

  const errors: ValidationError[] = [];

  if (!billing.name.trim()) {
    errors.push({ field: 'billing_name', message: 'Billing name is required' });
  }

  if (!billing.address1.trim()) {
    errors.push({ field: 'billing_address1', message: 'Billing address is required' });
  }

  if (!billing.mobile.trim()) {
    errors.push({ field: 'billing_mobile', message: 'Billing mobile number is required' });
  } else if (!/^\d{10}$/.test(billing.mobile.replace(/\s+/g, ''))) {
    errors.push({ field: 'billing_mobile', message: 'Please enter a valid 10-digit mobile number' });
  }

  if (!billing.email.trim()) {
    errors.push({ field: 'billing_email', message: 'Billing email is required' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billing.email)) {
    errors.push({ field: 'billing_email', message: 'Please enter a valid email address' });
  }

  if (!billing.pincode.trim()) {
    errors.push({ field: 'billing_pincode', message: 'Billing pincode is required' });
  } else if (!/^\d{6}$/.test(billing.pincode)) {
    errors.push({ field: 'billing_pincode', message: 'Please enter a valid 6-digit pincode' });
  }

  if (!billing.city.trim()) {
    errors.push({ field: 'billing_city', message: 'Billing city is required' });
  }

  if (!billing.state.trim()) {
    errors.push({ field: 'billing_state', message: 'Billing state is required' });
  }

  return errors;
}

export function validateFormData(formData: CheckoutFormData, useShipping: boolean): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate shipping address
  errors.push(...validateShippingAddress(formData.shipping));

  // Validate billing address if not using shipping
  errors.push(...validateBillingAddress(formData.billing, useShipping));

  // Validate preferences
  if (!formData.preferences.acceptTerms) {
    errors.push({ field: 'acceptTerms', message: 'You must accept the terms and conditions' });
  }

  return errors;
}

// --- Utility Functions ---

export function copyShippingToBilling(shipping: ShippingAddress): BillingAddress {
  return {
    company: '',
    gst: '',
    name: shipping.name,
    address1: shipping.address1,
    address2: shipping.address2,
    mobile: shipping.mobile,
    altMobile: shipping.altMobile,
    email: shipping.email,
    pincode: shipping.pincode,
    city: shipping.city,
    state: shipping.state,
  };
}

export async function submitCheckoutForm(formData: CheckoutFormData): Promise<{ success: boolean; message: string }> {
  try {
    // Simulate API call
    console.log('Submitting checkout form:', formData);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate success
    return {
      success: true,
      message: 'Order submitted successfully! You will be redirected to payment.',
    };
  } catch (error) {
    console.error('Error submitting checkout form:', error);
    return {
      success: false,
      message: 'There was an error submitting your order. Please try again.',
    };
  }
}
