const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config();

const list = async () => {
  try {
    await connectDB();
    const users = await User.find().select('name email role createdAt').lean();
    console.log(JSON.stringify(users, null, 2));
  } catch (err) {
    console.error('Error listing users:', err.message);
    process.exitCode = 2;
  } finally {
    process.exit();
  }
};

list();
