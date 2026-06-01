const dotenv = require('dotenv');
const connectDB = require('./src/config/db');

dotenv.config();

const app = require('./src/app');

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  await connectDB();

  server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

// Fail fast on startup errors such as an invalid MongoDB URI.
startServer().catch((error) => {
  console.error(`Unable to start server: ${error.message}`);
  process.exit(1);
});

// Gracefully close the HTTP server on unexpected promise failures.
process.on('unhandledRejection', (error) => {
  console.error(`Unhandled rejection: ${error.message}`);

  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
