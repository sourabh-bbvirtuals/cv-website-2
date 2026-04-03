import fs from 'fs';
const res = await fetch('https://websiteadmin.appwallah.com/shop-api', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'vendure-token': 'shubham-agrawal-classes',
  },
  body: JSON.stringify({
    query: '{ collection(slug: "notes") { customFields { customData } } }',
  }),
});
const data = await res.json();
fs.writeFileSync(
  'test_notes.json',
  data?.data?.collection?.customFields?.customData || '[]',
);
