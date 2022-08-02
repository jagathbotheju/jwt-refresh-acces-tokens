const router = require("express").Router();
const controller = require("../controllers/user");
const protect = require("../middleware/authMiddleware");

router.post("/register", controller.registerUser);
router.post("/login", controller.loginUser);
router.get("/logout", controller.handleLogout);
router.get("/get-user", protect, controller.getUser);
router.get("/refresh-token", controller.handleRefreshToken);

module.exports = router;
