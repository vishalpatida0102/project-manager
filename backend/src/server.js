require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 API ready on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Fatal: failed to start server', err);
    process.exit(1);
  }
})();

process.on('unhandledRejection', (reason) => {
  // eslint-disable-next-line no-console
  console.error('UnhandledRejection:', reason);
});
