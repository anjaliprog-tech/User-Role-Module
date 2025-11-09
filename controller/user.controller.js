const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Role = require("../models/role");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRES_IN = "1d";

exports.signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName = "",
      username,
      email,
      password,
      role: roleId,
    } = req.body;
    if (!firstName || !username || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const existing = await User.findOne({ $or: [{ email }, { username }] });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      password: hashed,
      role: roleId,
    });

    console.log(JWT_SECRET);
    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRES_IN,
    });
    res.status(201).json({ data: user, token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password)
      return res.status(400).json({ message: "Missing credentials" });

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    }).populate("role");

    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const passMatched = await bcrypt.compare(password, user.password);

    if (!passMatched)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRES_IN,
    });

    //delete password from response
    const userObj = user.toObject();
    delete userObj.password;
    res.json({ data: userObj, token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List users with search. Populate role but select only name and accessModules
exports.getUsersList = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req?.body;
    const skip = (page - 1) * parseInt(limit, 10);

    const or = [];
    if (search) {
      const r = { $regex: search, $options: "i" };
      or.push({ username: r }, { email: r }, { firstName: r }, { lastName: r });
    }
    const query = or.length ? { $or: or } : {};

    const users = await User.find(query)
      .skip(skip)
      .limit(parseInt(limit, 10))
      .sort({ createdAt: -1 })
      .select("-password")
      .populate({ path: "role", select: "name accessModules" });

    const total = await User.countDocuments(query);
    res.json({ data: users, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req?.params?.id)
      .select("-password")
      .populate({ path: "role", select: "name accessModules" });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const updates = req?.body;
    if (updates?.password)
      updates.password = await bcrypt.hash(updates?.password, 10);

    const exists = await User.exists({
      $or: [{ email: updates?.email }, { username: updates?.username }],
      _id: { $ne: req?.params?.id },
    });
    if (exists)
      return res
        .status(400)
        .json({ success: false, message: "User with this email already exists" });
        
    const user = await User.findByIdAndUpdate(req?.params?.id, updates, {
      new: true,
    }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkUserAccess = async (req, res) => {
  try {
    const { userId } = req?.params;
    const { module } = req?.body;
    if (!module)
      return res
        .status(400)
        .json({ success: false, message: "module required" });
    const user = await User.findById(userId).populate("role");
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    const role = user.role;
    const hasAccess =
      role &&
      Array.isArray(role.accessModules) &&
      role.accessModules.includes(module);
    res.json({ success: true, hasAccess });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.bulkUpdateSame = async (req, res) => {
  try {
    const { filter = {}, update = {}, options = {} } = req.body;
    if (!update || Object.keys(update).length === 0)
      return res
        .status(400)
        .json({ success: false, message: "Payload to update record required" });

    const allowedFields = [
      "firstName",
      "lastName",
      "email",
      "mobile",
      "role",
      "active",
    ];
    const updateData = {};

    for (let key of allowedFields) {
      if (update[key] !== undefined) {
        updateData[key] = update[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields to update",
      });
    }

    const result = await User.updateMany(filter, { $set: updateData }, options);
    res.json({ success: true, result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update many users with different data
exports.bulkUpdateDifferent = async (req, res) => {
  try {
    const payloadUpdate = req?.body;
    if (!Array.isArray(payloadUpdate) || payloadUpdate?.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "Payload required for users update" });

    const bulkOps = payloadUpdate.map((o) => ({
      updateOne: {
        filter: o.filter,
        update: o.update,
      },
    }));

    const result = await User.bulkWrite(bulkOps, { ordered: false });
    res.status(200).json({ success: true, result });
  } catch (error) {

    // Duplicate email error handling
    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate email found",
        detail: error.keyValue,   
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
