fetch(
  'https://staging-vendure.bbvirtuals.tech/shop-api?vendure-token=bbv-bb-virtual-commerce-mn1ydkov',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: `
  query homePageParent {
    collection(slug: "home-page") {
      id
      children { id name slug customFields { customData } }
    }
  }`,
    }),
  },
)
  .then((r) => r.json())
  .then((r) => console.log(JSON.stringify(r, null, 2)));
