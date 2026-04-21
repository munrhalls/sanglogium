const apiKey = 'AIzaSyDSYZeJMFcpyVoVzDjx9fFbwv-FnjI8dFI';
const validationURL = `https://addressvalidation.googleapis.com/v1:validateAddress?key=${apiKey}`;

const validationRequestBody = {
  address: {
    regionCode: 'PL',
    locality: 'Wrocław',
    postalCode: '53-234',
    addressLines: ['Grabiszyńska 104'],
  },
};

console.log('Testing Google Maps Address Validation API...');
console.log('API Key:', apiKey);
console.log('API Key length:', apiKey.length);
console.log('Request URL:', validationURL);
console.log('Request body:', JSON.stringify(validationRequestBody, null, 2));

try {
  const response = await fetch(validationURL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(validationRequestBody),
  });

  console.log('Response status:', response.status);
  console.log('Response status text:', response.statusText);

  const responseText = await response.text();
  console.log('Response body:', responseText);

  if (response.ok) {
    const data = JSON.parse(responseText);
    console.log('Success! Parsed response:', JSON.stringify(data, null, 2));
  } else {
    console.error('API call failed with status:', response.status);
    console.error('Error details:', responseText);
  }
} catch (error) {
  console.error('Request failed:', error.message);
  console.error('Error details:', error);
}
