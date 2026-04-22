const { createClient } = require('next-sanity');

const client = createClient({
  projectId: '2tdmkpky',
  dataset: 'test',
  apiVersion: '2024-11-14',
  useCdn: false,
  token: 'sk61ZIXXfNUGrOMp9w0sDDZ3bB57Jor7EIXbW67YMp4VV2mj1Y1SQhQolqMabQSWF3C5v8aYTtjhn8JG14RXpk5mm7JlHdlyMOfyjwr7VvasgJtYzzb5JS3KHtk3syitfUjYq1JmtlgdzTpcUiaFfdCPVWcDQIUb5iEnQ11wRJzlU4K2yXRH'
});

client.fetch('*[_id == "k27n1AQuIbSr5iozFz7EE4"][0]{ _id, name }')
  .then(result => {
    if (result) {
      console.log('Product found:', result);
    } else {
      console.log('Product NOT found');
    }
  })
  .catch(err => console.error('Error:', err.message));
