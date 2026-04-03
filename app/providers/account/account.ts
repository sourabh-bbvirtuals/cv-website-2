import gql from 'graphql-tag';
import {
  CreateAddressInput,
  LoginMutation,
  LogoutMutation,
  RegisterCustomerAccountMutation,
  RegisterCustomerAccountMutationVariables,
  RequestPasswordResetMutation,
  ResetPasswordMutation,
  UpdateAddressInput,
  UpdateCustomerInput,
  VerifyCustomerAccountMutation,
} from '~/generated/graphql';
import { QueryOptions, sdk, WithHeaders } from '~/graphqlWrapper';
import { API_URL } from '~/constants';
import { getSessionStorage } from '~/sessions';

export const login = async (
  email: string,
  password: string,
  rememberMe: boolean,
  options: QueryOptions,
): Promise<WithHeaders<LoginMutation['login']>> => {
  return sdk.login({ email, password, rememberMe }, options).then((res) => ({
    ...res.login,
    _headers: res._headers,
  }));
};

export const logout = async (
  options: QueryOptions,
): Promise<WithHeaders<LogoutMutation['logout']>> => {
  return sdk.logout({}, options).then((res) => ({
    ...res.logout,
    _headers: res._headers,
  }));
};

/**
 * Authenticate via Vendure "google" strategy using a Google ID token.
 * This performs a direct GraphQL request and stores the returned vendure-auth-token
 * into the Remix cookie session, mirroring the behavior in graphqlWrapper.
 */
export const authenticateWithGoogle = async (
  token: string,
  rememberMe: boolean,
  options: QueryOptions,
): Promise<
  WithHeaders<{
    __typename: string;
    id?: string;
    identifier?: string;
    errorCode?: string;
    message?: string;
  }>
> => {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');

  // Attach existing guest/session token so Vendure can merge/retain the active order
  try {
    const sessionStorage = await getSessionStorage();
    const session = await sessionStorage.getSession(
      options.request?.headers.get('Cookie'),
    );
    const existingToken = session?.get('authToken');
    if (existingToken) {
      headers.append('Authorization', `Bearer ${existingToken}`);
    }
  } catch {}

  const body = {
    query: `mutation Authenticate($input: AuthenticationInput!, $rememberMe: Boolean) {
      authenticate(input: $input, rememberMe: $rememberMe) {
        __typename
        ... on CurrentUser { id identifier }
        ... on ErrorResult { errorCode message }
      }
    }`,
    variables: { input: { google: { token } }, rememberMe },
  } as const;

  const res = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);

  const vendureToken = res.headers.get('vendure-auth-token');
  const responseHeaders: Record<string, string> = {};
  if (vendureToken) {
    const sessionStorage = await getSessionStorage();
    const session = await sessionStorage.getSession(
      options.request?.headers.get('Cookie'),
    );
    if (session) {
      session.set('authToken', vendureToken);
      responseHeaders['Set-Cookie'] = await sessionStorage.commitSession(
        session,
      );
    }
  }

  const gqlErrorMessage =
    (json as any)?.errors?.[0]?.message ||
    (json as any)?.errors?.[0]?.extensions?.code ||
    null;
  const payload =
    (json as any)?.data?.authenticate ??
    ({
      __typename: 'ErrorResult',
      message:
        gqlErrorMessage || `Authentication failed (status ${res.status})`,
    } as const);

  if (process.env.NODE_ENV !== 'production') {
    if (!res.ok || payload?.__typename !== 'CurrentUser') {
      console.log('Google authenticate failed:', {
        status: res.status,
        payload,
        errors: (json as any)?.errors,
      });
    }
  }
  return { ...(payload || {}), _headers: new Headers(responseHeaders) } as any;
};

export const registerCustomerAccount = async (
  options: QueryOptions,
  variables: RegisterCustomerAccountMutationVariables,
): Promise<
  WithHeaders<RegisterCustomerAccountMutation['registerCustomerAccount']>
> => {
  return sdk.registerCustomerAccount(variables, options).then((res) => ({
    ...res.registerCustomerAccount,
    _headers: res._headers,
  }));
};

export const verifyCustomerAccount = async (
  options: QueryOptions,
  token: string,
  password?: string,
): Promise<
  WithHeaders<VerifyCustomerAccountMutation['verifyCustomerAccount']>
> => {
  return sdk
    .verifyCustomerAccount({ token, password }, options)
    .then((res) => ({
      ...res.verifyCustomerAccount,
      _headers: res._headers,
    }));
};

export async function updateCustomer(
  input: UpdateCustomerInput,
  options: QueryOptions,
) {
  return sdk.updateCustomer({ input }, options);
}

export async function requestUpdateCustomerEmailAddress(
  password: string,
  newEmailAddress: string,
  options: QueryOptions,
) {
  return sdk
    .requestUpdateCustomerEmailAddress({ password, newEmailAddress }, options)
    .then((res) => res.requestUpdateCustomerEmailAddress);
}

export async function updateCustomerEmailAddress(
  token: string,
  options: QueryOptions,
) {
  return sdk
    .updateCustomerEmailAddress({ token }, options)
    .then((res) => res.updateCustomerEmailAddress);
}

export async function updateCustomerAddress(
  input: UpdateAddressInput,
  options: QueryOptions,
) {
  return sdk
    .updateCustomerAddress({ input }, options)
    .then((res) => res.updateCustomerAddress);
}

export async function createCustomerAddress(
  input: CreateAddressInput,
  options: QueryOptions,
) {
  return sdk
    .createCustomerAddress({ input }, options)
    .then((res) => res.createCustomerAddress);
}

export async function deleteCustomerAddress(id: string, options: QueryOptions) {
  return sdk
    .deleteCustomerAddress({ id }, options)
    .then((res) => res.deleteCustomerAddress);
}

export async function updateCustomerPassword(
  input: { currentPassword: string; newPassword: string },
  options: QueryOptions,
) {
  return sdk
    .updateCustomerPassword(input, options)
    .then((res) => res.updateCustomerPassword);
}

export async function requestPasswordReset(
  emailAddress: string,
  options: QueryOptions,
): Promise<
  WithHeaders<NonNullable<RequestPasswordResetMutation['requestPasswordReset']>>
> {
  return sdk.requestPasswordReset({ emailAddress }, options).then((res) => {
    if (!res.requestPasswordReset) {
      throw new Error('Request password reset returned null');
    }
    return {
      ...res.requestPasswordReset,
      _headers: res._headers,
    };
  });
}

export async function resetPassword(
  token: string,
  password: string,
  options: QueryOptions,
): Promise<WithHeaders<NonNullable<ResetPasswordMutation['resetPassword']>>> {
  return sdk.resetPassword({ token, password }, options).then((res) => {
    if (!res.resetPassword) {
      throw new Error('Reset password returned null');
    }
    return {
      ...res.resetPassword,
      _headers: res._headers,
    };
  });
}

gql`
  mutation login($email: String!, $password: String!, $rememberMe: Boolean) {
    login(username: $email, password: $password, rememberMe: $rememberMe) {
      __typename
      ... on CurrentUser {
        id
        identifier
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

gql`
  mutation Authenticate($input: AuthenticationInput!, $rememberMe: Boolean) {
    authenticate(input: $input, rememberMe: $rememberMe) {
      __typename
      ... on CurrentUser {
        id
        identifier
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

gql`
  mutation logout {
    logout {
      success
    }
  }
`;

gql`
  mutation registerCustomerAccount($input: RegisterCustomerInput!) {
    registerCustomerAccount(input: $input) {
      __typename
      ... on Success {
        success
      }
      ... on MissingPasswordError {
        errorCode
        message
      }
      ... on NativeAuthStrategyError {
        errorCode
        message
      }
      ... on PasswordValidationError {
        errorCode
        message
        validationErrorMessage
      }
    }
  }
`;

gql`
  mutation verifyCustomerAccount($token: String!, $password: String) {
    verifyCustomerAccount(token: $token, password: $password) {
      __typename
      ... on CurrentUser {
        id
        identifier
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

gql`
  mutation updateCustomer($input: UpdateCustomerInput!) {
    updateCustomer(input: $input) {
      __typename
    }
  }
`;

gql`
  mutation requestUpdateCustomerEmailAddress(
    $password: String!
    $newEmailAddress: String!
  ) {
    requestUpdateCustomerEmailAddress(
      password: $password
      newEmailAddress: $newEmailAddress
    ) {
      __typename
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

gql`
  mutation updateCustomerEmailAddress($token: String!) {
    updateCustomerEmailAddress(token: $token) {
      __typename
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

gql`
  mutation updateCustomerAddress($input: UpdateAddressInput!) {
    updateCustomerAddress(input: $input) {
      id
      fullName
      company
      streetLine1
      streetLine2
      city
      province
      postalCode
      phoneNumber
      defaultShippingAddress
      defaultBillingAddress
      country {
        id
        name
        code
      }
    }
  }
`;

gql`
  mutation createCustomerAddress($input: CreateAddressInput!) {
    createCustomerAddress(input: $input) {
      id
      fullName
      company
      streetLine1
      streetLine2
      city
      province
      postalCode
      phoneNumber
      customFields
      defaultShippingAddress
      defaultBillingAddress
      country {
        id
        name
        code
      }
    }
  }
`;

gql`
  mutation deleteCustomerAddress($id: ID!) {
    deleteCustomerAddress(id: $id) {
      success
    }
  }
`;

gql`
  mutation updateCustomerPassword(
    $currentPassword: String!
    $newPassword: String!
  ) {
    updateCustomerPassword(
      currentPassword: $currentPassword
      newPassword: $newPassword
    ) {
      __typename
      ... on Success {
        success
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

gql`
  mutation requestPasswordReset($emailAddress: String!) {
    requestPasswordReset(emailAddress: $emailAddress) {
      __typename
      ... on Success {
        success
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;

gql`
  mutation resetPassword($token: String!, $password: String!) {
    resetPassword(token: $token, password: $password) {
      __typename
      ... on CurrentUser {
        id
        identifier
      }
      ... on ErrorResult {
        errorCode
        message
      }
    }
  }
`;
