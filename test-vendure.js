const axios = require('axios');
axios
  .post(
    'https://staging-vendure.bbvirtuals.tech/shop-api?vendure-token=bbv-bb-virtual-commerce-mn1ydkov',
    {
      query: `
    mutation registerCustomerAccount($input: RegisterCustomerInput!) {
      registerCustomerAccount(input: $input) {
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
  `,
      variables: {
        input: {
          emailAddress: 'test7@example.com',
          firstName: 'Test',
          lastName: 'User',
          phoneNumber: '+919416583303',
          password: '123456',
          customFields: {
            dateOfBirth: '2026-03-08',
            gender: 'Male',
            board: 'CBSE',
            studentClass: '11th',
          },
        },
      },
    },
  )
  .then((r) => console.log(JSON.stringify(r.data, null, 2)))
  .catch((e) => console.log(e.response ? e.response.data : e.message));
