const url =
  'http://localhost:3000/shop-api?vendure-token=bbv-bb-virtual-commerce-mn1ydkov';
const query = {
  query: `
    query {
      __type(name: "ProductVariantCustomFields") {
        fields {
          name
        }
      }
    }
  `,
};

fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(query),
})
  .then((r) => r.json())
  .then((j) => console.log(JSON.stringify(j, null, 2)))
  .catch((e) => console.error(e));
