// Runs before every test file. The app module reads these at import time and
// refuses to start without the JWT secret — tests provide a throwaway secret.
process.env.SECRET = "test-secret";
process.env.ADMIN_BOOTSTRAP_KEY = "test-bootstrap-key";
process.env.MONGO_URI = "mongodb://localhost:27017/quickwish-test";
process.env.NODE_ENV = "test";
process.env.QUICKWISH_UPI_ID = "9009917146@ptyes";
process.env.QUICKWISH_UPI_NAME = "QuickWish";
