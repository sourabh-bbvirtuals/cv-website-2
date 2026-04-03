const axios = require('axios');

axios.post('https://staging-vendure.bbvirtuals.tech/shop-api?vendure-token=bbv-bb-virtual-commerce-mn1ydkov', {
  query: `
    {
      __type(name: "AuthenticationInput") {
        inputFields {
          name
          type {
            name
            kind
            ofType {
              name
            }
          }
        }
      }
    }
  `
}).then(r => console.log(JSON.stringify(r.data, null, 2))).catch(e => console.log(e));
