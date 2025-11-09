const { mongoose } = require("mongoose");

const RoleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    accessModules: { type: [String], default: [] },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const Role = mongoose.model("Role", RoleSchema);
module.exports = Role;
