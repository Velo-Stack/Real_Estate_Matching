const axios = require("axios");

const API_URL = "http://localhost:5000/api";

async function runTests() {
  console.log("--- STARTING DYNAMIC PERMISSIONS TESTS ---");
  let adminToken, brokerToken;

  try {
    // 1. Login as Admin
    console.log("\n[1] Logging in as Admin...");
    const adminLogin = await axios.post(`${API_URL}/auth/login`, {
      email: "admin@example.com",
      password: "password123",
    });
    adminToken = adminLogin.data.token;
    console.log("✅ Admin Login Successful");

    // 2. Set Default Role Permissions for BROKER
    console.log(
      "\n[2] Setting default role permissions for BROKER (VIEW_OFFERS only)...",
    );
    await axios.put(
      `${API_URL}/roles/BROKER/permissions`,
      {
        permissions: ["VIEW_OFFERS"],
      },
      { headers: { Authorization: `Bearer ${adminToken}` } },
    );
    console.log("✅ Set BROKER default permissions");

    // 3. Login as Broker
    console.log(
      "\n[3] Logging in as Broker (should get default permissions)...",
    );
    const brokerLogin = await axios.post(`${API_URL}/auth/login`, {
      email: "broker@example.com",
      password: "password123",
    });
    brokerToken = brokerLogin.data.token;
    console.log(
      "✅ Broker JWT Permissions:",
      jwtDecode(brokerToken).permissions,
    );

    // 4. Broker tries to View Offers (Should Succeed)
    console.log("\n[4] Broker viewing offers...");
    const viewOffersRes = await axios.get(`${API_URL}/offers`, {
      headers: { Authorization: `Bearer ${brokerToken}` },
    });
    console.log(
      `✅ Viewed Offers. Found ${viewOffersRes.data.offers.length} offers.`,
    );

    // 5. Broker tries to Create Offer (Should Fail)
    console.log(
      "\n[5] Broker attempting to create an offer (expected to fail)...",
    );
    try {
      await axios.post(
        `${API_URL}/offers`,
        {
          type: "LAND",
          usage: "RESIDENTIAL",
          areaFrom: 100,
          areaTo: 200,
          priceFrom: 1000,
          priceTo: 2000,
          exclusivity: "EXCLUSIVE",
        },
        { headers: { Authorization: `Bearer ${brokerToken}` } },
      );
      console.log("❌ UNEXPECTED SUCCESS - Should have failed!");
    } catch (err) {
      console.log(
        `✅ Expected Failure: [${err.response.status}] ${err.response.data.message}`,
      );
    }

    // 6. Admin overrides Broker user to add CREATE_OFFERS
    console.log(
      "\n[6] Admin overriding this specific broker to allow CREATE_OFFERS...",
    );
    await axios.put(
      `${API_URL}/users/${brokerLogin.data.user.id}/permissions`,
      {
        permissions: ["VIEW_OFFERS", "CREATE_OFFERS"],
      },
      { headers: { Authorization: `Bearer ${adminToken}` } },
    );
    console.log("✅ Admin added custom permissions for user");

    // 7. Broker must login again to update JWT
    console.log("\n[7] Broker logging in again to refresh JWT...");
    const newBrokerLogin = await axios.post(`${API_URL}/auth/login`, {
      email: "broker@example.com",
      password: "password123",
    });
    brokerToken = newBrokerLogin.data.token;
    console.log(
      "✅ Broker New JWT Permissions:",
      jwtDecode(brokerToken).permissions,
    );

    // 8. Broker tries to Create Offer (Should Succeed)
    console.log(
      "\n[8] Broker attempting to create an offer again (expected to succeed)...",
    );
    const createOfferRes = await axios.post(
      `${API_URL}/offers`,
      {
        type: "LAND",
        usage: "RESIDENTIAL",
        areaFrom: 100,
        areaTo: 200,
        priceFrom: 1000,
        priceTo: 2000,
        exclusivity: "NON_EXCLUSIVE",
        createdById: brokerLogin.data.user.id,
      },
      { headers: { Authorization: `Bearer ${brokerToken}` } },
    );
    console.log(`✅ Offer Created Successfully! ID: ${createOfferRes.data.id}`);

    console.log("\n--- ALL TESTS PASSED SUCCESSFULLY ---");
  } catch (error) {
    console.error("\n❌ TEST FAILED");
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } else {
      console.error(error);
    }
  }
}

function jwtDecode(token) {
  return JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
}

runTests();
