const https = require('https');
const fs = require('fs');

const API_URL = 'https://websiteadmin.appwallah.com/shop-api?vendure-token=shubham-agrawal-classes';

function listFacets() {
  const query = `
    query {
      facets {
        items {
          name
          code
          valueList {
            items {
              name
              code
            }
          }
        }
      }
    }
  `;

  const data = JSON.stringify({ query });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  };

  const req = https.request(API_URL, options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => { responseBody += chunk; });
    res.on('end', () => {
      try {
        const result = JSON.parse(responseBody);
        fs.writeFileSync('c:\\Users\\ROHIT\\Desktop\\innoaft\\shubhamagarwa\\facets.json', JSON.stringify(result.data.facets.items, null, 2));
        console.log('Facets written to facets.json');
      } catch (error) {
        console.error('Error:', error);
      }
    });
  });

  req.on('error', (error) => { console.error('Error:', error); });
  req.write(data);
  req.end();
}

listFacets();
