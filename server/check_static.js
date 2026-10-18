const axios = require('axios');

async function check() {
    try {
        console.log('--- Testing CSS ---');
        const cssRes = await axios.get('http://localhost:3000/css/custom.css');
        console.log('Status:', cssRes.status);
        console.log('Content-Type:', cssRes.headers['content-type']);
        console.log('Size:', cssRes.data.length);

        console.log('\n--- Testing JS ---');
        const jsRes = await axios.get('http://localhost:3000/js/auth.js');
        console.log('Status:', jsRes.status);
        console.log('Content-Type:', jsRes.headers['content-type']);

        console.log('\n--- Testing API ---');
        const apiRes = await axios.get('http://localhost:3000/api/categories');
        console.log('Status:', apiRes.status);

    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Response Status:', err.response.status);
            console.error('Response Data:', err.response.data);
        }
    }
}

check();
