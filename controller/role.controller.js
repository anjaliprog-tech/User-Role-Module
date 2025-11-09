const Role = require("../models/role");
const User = require("../models/user");
exports.createRole = async (req, res) => {
  try {
    const { name, accessModules = [], active = true } = req.body;

    //check with this name role exist or not
    const exists = await Role.exists({ name });
    if (exists)
      return res
        .status(400)
        .json({ success: false, message: "Role already exists" });
    const role = await Role.create({ name, accessModules, active });
    res.status(201).json({ success: true, data: role });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getRoles = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req?.body;
    const where = req?.body?.search
      ? { name: { $regex: search, $options: "i" } }
      : {};
    const skip = (page - 1) * limit;
    const roles = await Role.find(where)
      .skip(skip)
      .limit(parseInt(limit, 10))
      .sort({ createdAt: -1 });

    const total = await Role.countDocuments(where);
    res.json({ success: true, data: roles, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req?.params?.id);
    if (!role)
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    res.json({ success: true, data: role });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const updates = req?.body;

    const exists = await Role.exists({ name: updates?.name, _id: { $ne: req?.params?.id } });

    if(exists)
      return res
        .status(400)
        .json({ success: false, message: "Role with this name already exists" });
  
    const role = await Role.findByIdAndUpdate(req?.params?.id, updates, {
      new: true,
    });
    if (!role)
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    res.json({ success: true, data: role });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { id } = req?.params;
    const exists = await User.exists({ role: id });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete — role is assigned to users",
      });
    }
    const role = await Role.findByIdAndDelete(id);
    if (!role)
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    res.json({ success: true, message: "Role deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// Add unique value to accessModules
exports.addAccessModule = async (req, res) => {
  try {
    const { module } = req?.body;
    if (!module)
      return res
        .status(400)
        .json({ success: false, message: "module required" });

    const role = await Role.findByIdAndUpdate(
      req?.params?.id,
      { $addToSet: { accessModules: module } },
      { new: true }
    );
    if (!role)
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });
    res.json({ success: true, data: role });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Remove one value from accessModules
exports.removeAccessModule = async (req, res) => {
  try {
    const { module } = req?.body;
    if (!module)
      return res
        .status(400)
        .json({ success: false, message: "module required" });
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { $pull: { accessModules: module } },
      { new: true }
    );
    if (!role)
      return res
        .status(404)
        .json({ success: false, message: "Role not found" });

    res.json({ success: true, data: role });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
