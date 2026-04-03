# Payment Setup Checklist

Use this checklist before enabling payments in production.

## 1) Environment variables

Set these in your runtime environment (or `.env` for local dev):

- `SESSION_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `BRAINTREE_CLIENT_TOKEN`
- `BRAINTREE_MERCHANT_ID`
- `BRAINTREE_PUBLIC_KEY`
- `BRAINTREE_PRIVATE_KEY`
- `EASEBUZZ_KEY`
- `EASEBUZZ_SALT`
- `EASEBUZZ_ENV` (`sandbox` or `production`)

## 2) Vendure payment methods

- Ensure the required payment methods exist and are enabled in Vendure.
- Verify `eligiblePaymentMethods` returns expected methods for the active order.
- Verify each method is enabled for the correct sales channel.

## 3) Storefront runtime safety checks (already implemented)

- Methods are filtered by config at loader level:
  - `easebuzz` requires `EASEBUZZ_KEY` + `EASEBUZZ_SALT`
  - `razorpay` requires `RAZORPAY_KEY_ID`
  - `stripe` requires `STRIPE_PUBLISHABLE_KEY`
  - `braintree` requires `BRAINTREE_CLIENT_TOKEN`
- Unconfigured method selection is blocked in payment submit handler.
- Easebuzz helper throws early if key/salt are missing.

## 4) Security checklist

- Never hardcode live keys in frontend code.
- Rotate keys if they were ever committed.
- Use webhook signature verification in backend for each gateway.
- Keep `.env` out of git (`.gitignore`).

## 5) Basic test plan

1. Add product to cart.
2. Reach `/checkout2/payment`.
3. Confirm only configured payment methods are visible.
4. Complete one success flow per enabled method.
5. Confirm failure/cancel flow redirects to confirmation with error.

