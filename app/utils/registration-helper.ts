import { RegisterCustomerAccountMutationVariables } from '~/generated/graphql';

const EMAIL_REGEX = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

export type RegisterValidationErrors = {
  form?: string;
  email?: string;
  password?: string;
  repeatPassword?: string;
};

export const validateRegistrationForm = (
  formData: FormData,
): RegisterValidationErrors => {
  const errors: RegisterValidationErrors = {};
  const email = formData.get('email');
  const password = formData.get('password');
  const repeatPassword = formData.get('repeatPassword');

  if (!email || typeof email !== 'string' || !email.match(EMAIL_REGEX)) {
    errors.email = 'A valid e-mail address is required.';
  }
  
  // Enhanced password validation
  if (!password || typeof password !== 'string') {
    errors.password = 'Password is required.';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters long.';
  } else if (!/(?=.*[a-z])/.test(password)) {
    errors.password = 'Password must contain at least one lowercase letter.';
  } else if (!/(?=.*[A-Z])/.test(password)) {
    errors.password = 'Password must contain at least one uppercase letter.';
  } else if (!/(?=.*\d)/.test(password)) {
    errors.password = 'Password must contain at least one number.';
  } else if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.password = 'Password must contain at least one special character (@$!%*?&).';
  }
  
  if (!repeatPassword || typeof repeatPassword !== 'string') {
    errors.repeatPassword = 'Please repeat password!';
  }
  if (repeatPassword !== password) {
    errors.repeatPassword = 'Passwords do not match!';
  }

  console.log(errors);
  return errors;
};

export const extractRegistrationFormValues = (
  formData: FormData,
): RegisterCustomerAccountMutationVariables => {
  const input: RegisterCustomerAccountMutationVariables['input'] = {
    emailAddress: formData.get('email') as string,
    firstName: (formData.get('firstName') as string) || void 0,
    lastName: (formData.get('lastName') as string) || void 0,
    password: formData.get('password') as string,
  };

  return { input };
};
