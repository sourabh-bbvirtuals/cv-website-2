// Test: Introspect what auth strategies Vendure supports
// and what Client ID it expects
const res = await fetch('https://websiteadmin.appwallah.com/shop-api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'vendure-token': 'shubham-agrawal-classes',
  },
  body: JSON.stringify({
    query: `query {
      authenticationStrategies {
        code
        __typename
      }
    }`,
  }),
});
const data = await res.json();
console.log('Auth strategies supported by Vendure:');
console.log(JSON.stringify(data, null, 2));
