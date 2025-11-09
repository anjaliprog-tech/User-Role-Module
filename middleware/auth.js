const jwt = require("jsonwebtoken");
const User = require("../models/user");
const JWT_SECRET = process.env.JWT_SECRET;

exports.authMiddleware = async (req, res, next) => {
  try {
    const authToken = req.headers.authorization;
    if (!authToken || !authToken.startsWith("Bearer "))
      return res.status(401).json({ success: false, message: "Unauthorized" });

    const token = authToken.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded?.id).select("-password");
    if (!user)
      return res.status(401).json({ success: false, message: "Unauthorized" });
    req.user = user;
    next();
  } catch (err) {
    res
      .status(401)
      .json({ success: false, message: "Unauthorized - " + err.message });
  }
};
