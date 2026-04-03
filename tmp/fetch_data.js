const API_URL =
  'https://staging-vendure.bbvirtuals.tech/shop-api?vendure-token=bbv-bb-virtual-commerce-mn1ydkov';

const query = `
  query products($options: ProductListOptions) {
    products(options: $options) {
      items {
        id
        name
        customFields {
          customData
        }
      }
    }
  }
`;

async function main() {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const result = await response.json();
  const valid = result.data.products.items.filter(
    (i) => i.customFields.customData,
  );
  console.log(JSON.stringify(valid, null, 2));
}

main();
