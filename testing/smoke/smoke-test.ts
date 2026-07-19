import axios from "axios";

const API_URL = "http://localhost:8080/api";

const testUser = {
  name: "Chaos Tester",
  email: `chaos_${Date.now()}@test.com`,
  phone: "9999999999",
  password: "SecurePassword123!"
};

let userToken = "";

async function runSmokeTests() {
  console.log("==================================================");
  console.log("🚀 STARTING AUTOMATED LEVEL -10 SMOKE TEST SUITE");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, errorMsg: string) => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.log(`❌ FAIL: ${testName} - ${errorMsg}`);
      failed++;
    }
  };

  try {
    // 1. REGISTER NEW USER
    const registerRes = await axios.post(`${API_URL}/auth/register`, testUser);
    assert(registerRes.status === 201, "API: User Registration", "Failed to register");
    userToken = registerRes.data.data.token;

    // 2. NEGATIVE TEST: REGISTER SAME USER (Should Fail)
    try {
      await axios.post(`${API_URL}/auth/register`, testUser);
      assert(false, "API: Duplicate Registration Protection", "Allowed duplicate email");
    } catch (err: any) {
      assert(err.response?.status === 400, "API: Duplicate Registration Protection", "Did not return 400 Bad Request");
    }

    // 3. LOGIN - CORRECT CREDENTIALS
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    assert(loginRes.status === 200, "API: User Login (Valid)", "Failed to login");

    // 4. NEGATIVE TEST: LOGIN - WRONG CREDENTIALS
    try {
      await axios.post(`${API_URL}/auth/login`, {
        email: testUser.email,
        password: "WrongPassword123"
      });
      assert(false, "API: Login Protection (Invalid Password)", "Allowed invalid login");
    } catch (err: any) {
      assert(err.response?.status === 401, "API: Login Protection (Invalid Password)", "Did not return 401 Unauthorized");
    }

    // 5. SECURITY TEST: RBAC - CUSTOMER TRYING TO ACCESS ADMIN ROUTE
    try {
      await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      assert(false, "SECURITY: RBAC Admin Route Protection", "Customer was allowed to view all users");
    } catch (err: any) {
      assert(
        err.response?.status === 403 || err.response?.status === 404, 
        "SECURITY: RBAC Admin Route Protection", 
        `Expected 403 Forbidden, got ${err.response?.status}`
      );
    }

  } catch (error: any) {
    console.error("Critical Test Failure:", error.response?.data || error.message);
  }

  console.log("\n==================================================");
  console.log(`📊 TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
  console.log("==================================================");
}

runSmokeTests();
