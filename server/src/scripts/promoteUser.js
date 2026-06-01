const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config();

const email = process.argv[2];

if (!email) {
  console.error('Usage: node src/scripts/promoteUser.js <email>');
  process.exit(1);
}

const promote = async () => {
  try {
    await connectDB();

    const user = await User.findOne({ email: String(email).toLowerCase() });

    if (!user) {
      console.error('User not found:', email);
      process.exitCode = 2;
      return;
    }

    user.role = 'admin';
    await user.save();

    console.log(`Promoted ${user.email} to admin.`);
    console.log('User id:', user._id.toString());
  } catch (err) {
    console.error('Promotion failed:', err.message);
    process.exitCode = 3;
  } finally {
    process.exit();
  }
};

promote();
