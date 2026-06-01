const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./db');
const User = require('../models/User');
const Task = require('../models/Task');

dotenv.config();

const seedUsers = [
  {
    name: 'Demo User',
    email: 'user@primetrade.ai',
    password: 'User@12345',
    role: 'user',
  },
  {
    name: 'Demo Admin',
    email: 'admin@primetrade.ai',
    password: 'Admin@12345',
    role: 'admin',
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    await Task.deleteMany({});
    await User.deleteMany({});

    const createdUsers = await User.create(seedUsers);
    const standardUser = createdUsers.find((user) => user.role === 'user');
    const adminUser = createdUsers.find((user) => user.role === 'admin');

    await Task.create([
      {
        title: 'Review protected dashboard',
        description: 'Seeded task owned by the standard user.',
        status: 'pending',
        createdBy: standardUser._id,
      },
      {
        title: 'Audit RBAC behavior',
        description: 'Seeded task owned by the admin account.',
        status: 'in-progress',
        createdBy: adminUser._id,
      },
    ]);

    console.log('Database seeded successfully.');
    console.log('');
    console.log('Standard user credentials');
    console.log('Email: user@primetrade.ai');
    console.log('Password: User@12345');
    console.log('');
    console.log('Admin credentials');
    console.log('Email: admin@primetrade.ai');
    console.log('Password: Admin@12345');
  } catch (error) {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedDatabase();
