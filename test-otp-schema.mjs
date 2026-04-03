import axios from 'axios';

axios.post('https://staging-vendure.bbvirtuals.tech/shop-api?vendure-token=bbv-bb-virtual-commerce-mn1ydkov', {
  query: `
    {
      __schema {
        mutationType {
          fields {
            name
            args {
              name
              type {
                name
                kind
              }
            }
          }
        }
      }
    }
  `
}).then(r => {
  const mutations = r.data.data.__schema.mutationType.fields;
  const authMutations = mutations.filter(m => m.name.toLowerCase().includes('otp') || m.name.toLowerCase().includes('auth') || m.name.toLowerCase().includes('phone'));
  console.log("Found matching mutations:", JSON.stringify(authMutations, null, 2));
}).catch(e => {
  console.log("Error:", e.message);
});
