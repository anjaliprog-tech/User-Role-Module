const express = require("express");

const userRoutes = require("./user.route");
const roleRoutes = require("./role.route");
let router = express.Router();

router.use("/user", userRoutes);
router.use("/role", roleRoutes);

module.exports = router;
