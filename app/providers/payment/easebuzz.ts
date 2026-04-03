// Easebuzz Payment Integration
// Documentation: https://docs.easebuzz.in/

export interface EasebuzzConfig {
  key: string;
  salt: string;
  environment: 'sandbox' | 'production';
}

export interface EasebuzzPaymentData {
  txnid: string;
  amount: number;
  productinfo: string;
  firstname: string;
  email: string;
  phone: string;
  surl: string; // Success URL
  furl: string; // Failure URL
  hash: string;
}

export interface EasebuzzResponse {
  status: 'success' | 'failure';
  message: string;
  data?: any;
}

// Easebuzz configuration
const EASEBUZZ_CONFIG: EasebuzzConfig = {
  key: process.env.EASEBUZZ_KEY || '',
  salt: process.env.EASEBUZZ_SALT || '',
  environment:
    (process.env.EASEBUZZ_ENV as 'sandbox' | 'production') || 'sandbox',
};

// Generate hash for Easebuzz
export function generateEasebuzzHash(data: {
  key: string;
  txnid: string;
  amount: number;
  productinfo: string;
  firstname: string;
  email: string;
  salt: string;
}): string {
  const crypto = require('crypto');
  const hashString = `${data.key}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|||||||||||${data.salt}`;
  return crypto.createHash('sha512').update(hashString).digest('hex');
}

// Create Easebuzz payment data
export function createEasebuzzPaymentData(orderData: {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  productInfo: string;
  successUrl: string;
  failureUrl: string;
}): EasebuzzPaymentData {
  if (!EASEBUZZ_CONFIG.key || !EASEBUZZ_CONFIG.salt) {
    throw new Error(
      'Easebuzz is not configured. Set EASEBUZZ_KEY and EASEBUZZ_SALT.',
    );
  }
  const txnid = `TXN_${orderData.orderId}_${Date.now()}`;

  const hashData = {
    key: EASEBUZZ_CONFIG.key,
    txnid,
    amount: orderData.amount,
    productinfo: orderData.productInfo,
    firstname: orderData.customerName,
    email: orderData.customerEmail,
    salt: EASEBUZZ_CONFIG.salt,
  };

  const hash = generateEasebuzzHash(hashData);

  return {
    txnid,
    amount: orderData.amount,
    productinfo: orderData.productInfo,
    firstname: orderData.customerName,
    email: orderData.customerEmail,
    phone: orderData.customerPhone,
    surl: orderData.successUrl,
    furl: orderData.failureUrl,
    hash,
  };
}

// Get Easebuzz payment URL
export function getEasebuzzPaymentUrl(): string {
  const baseUrl =
    EASEBUZZ_CONFIG.environment === 'production'
      ? 'https://pay.easebuzz.in/pay'
      : 'https://testpay.easebuzz.in/pay';

  return baseUrl;
}

// Verify Easebuzz response hash
export function verifyEasebuzzResponse(responseData: {
  status: string;
  txnid: string;
  amount: string;
  productinfo: string;
  firstname: string;
  email: string;
  hash: string;
}): boolean {
  const crypto = require('crypto');
  const hashString = `${EASEBUZZ_CONFIG.salt}|${responseData.status}|||||||||||${responseData.email}|${responseData.firstname}|${responseData.productinfo}|${responseData.amount}|${responseData.txnid}|${EASEBUZZ_CONFIG.key}`;
  const generatedHash = crypto
    .createHash('sha512')
    .update(hashString)
    .digest('hex');

  return generatedHash === responseData.hash;
}

// Process Easebuzz payment
export async function processEasebuzzPayment(
  paymentData: EasebuzzPaymentData,
): Promise<EasebuzzResponse> {
  try {
    // In a real implementation, you would:
    // 1. Create the payment form data
    // 2. Submit to Easebuzz
    // 3. Handle the response

    console.log('Processing Easebuzz payment:', paymentData);

    // For demo purposes, simulate successful payment
    return {
      status: 'success',
      message: 'Payment processed successfully',
      data: {
        txnid: paymentData.txnid,
        amount: paymentData.amount,
        status: 'success',
      },
    };
  } catch (error) {
    console.error('Easebuzz payment error:', error);
    return {
      status: 'failure',
      message: 'Payment processing failed',
    };
  }
}

// Easebuzz payment form component data
export function getEasebuzzFormData(paymentData: EasebuzzPaymentData) {
  return {
    action: getEasebuzzPaymentUrl(),
    method: 'POST',
    fields: {
      key: EASEBUZZ_CONFIG.key,
      txnid: paymentData.txnid,
      amount: paymentData.amount.toString(),
      productinfo: paymentData.productinfo,
      firstname: paymentData.firstname,
      email: paymentData.email,
      phone: paymentData.phone,
      surl: paymentData.surl,
      furl: paymentData.furl,
      hash: paymentData.hash,
      service_provider: 'payu_paisa',
    },
  };
}
