const dotenv = require('dotenv');
// use global fetch (Node 18+)
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config();

const run = async () => {
  try {
    // quick check DB connectivity
    await connectDB();

    // Use seeded admin if present
    const admin = await User.findOne({ role: 'admin' }).lean();
    if (!admin) {
      console.error('No admin user found. Run seed or promote a user first.');
      process.exit(2);
    }

    const email = admin.email;
    console.log('Found admin:', email);

    // We assume seeded admin password is Admin@12345 (seed.js)
    const password = 'Admin@12345';

    const base = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}/api/v1`;

    // login using fetch
    const loginResp = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!loginResp.ok) {
      const errBody = await loginResp.text();
      throw new Error(`Login failed: ${loginResp.status} ${errBody}`);
    }

    const loginJson = await loginResp.json();
    const token = loginJson.token;
    console.log('Login token received (truncated):', token ? token.slice(0, 20) + '...' : 'none');

    // call admin overview
    const overviewResp = await fetch(`${base}/admin/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!overviewResp.ok) {
      const errBody = await overviewResp.text();
      throw new Error(`Overview request failed: ${overviewResp.status} ${errBody}`);
    }

    const overviewJson = await overviewResp.json();
    console.log('Admin overview response:');
    console.log(JSON.stringify(overviewJson, null, 2));
  } catch (err) {
    if (err.response) {
      console.error('Request failed:', err.response.status, err.response.data);
    } else {
      console.error('Error:', err.message);
    }
    process.exitCode = 3;
  } finally {
    process.exit();
  }
};

run();
