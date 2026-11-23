const axios = require('axios');

/**
 * Verification script for OrphionMC 403 Custom Page
 * Run this while the server is running on PORT 3000
 */
async function verify403() {
    const baseUrl = 'http://localhost:3000';

    console.log("--- Starting Verification ---");

    try {
        // 1. Test Static Protected Route (HTML)
        console.log("\n[TEST 1] Accessing protected HTML page without login...");
        const res1 = await axios.get(`${baseUrl}/staff_dashboard.html`, { validateStatus: false });
        console.log(`Status: ${res1.status}`);
        console.log(`Redirected to Login? ${res1.data.includes('login') ? 'YES' : 'NO'}`);

        // 2. Test API Protected Route (JSON)
        console.log("\n[TEST 2] Accessing protected API endpoint without login...");
        const res2 = await axios.get(`${baseUrl}/api/staff/stats`, { validateStatus: false });
        console.log(`Status: ${res2.status}`);
        console.log(`JSON Response:`, res2.data);

        console.log("\n[!] NOTE: To test the actual 403 (logged in but unauthorized), manual browser verification is required or session simulation via cookies.");

        console.log("\n--- Verification logic check complete ---");
    } catch (error) {
        console.error("Verification failed:", error.message);
    }
}

// verify403(); // Uncomment to run if needed
console.log("Verification script ready. Ensure server is running.");
