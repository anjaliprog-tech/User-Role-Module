const { Router } = require("express");
const router = new Router();
const {
  createRole,
  updateRole,
  getRoleById,
  getRoles,
  deleteRole,
  removeAccessModule,
  updateAccessModules,
  addAccessModule
} = require("../controller/role.controller");

router.post("/list", getRoles);
router.post("/add", createRole);
router.get("/:id", getRoleById);
router.put("/update/:id", updateRole);
router.delete("/:id", deleteRole);
router.post("/add-module/:id", addAccessModule);
router.post("/remove-module/:id", removeAccessModule);

module.exports = router;
