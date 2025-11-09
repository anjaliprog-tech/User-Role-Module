const { Router } = require("express");
const router = new Router();
const { signup, login, getUsersList, getUserById, updateUser, deleteUser, checkUserAccess, bulkUpdateSame, bulkUpdateDifferent } = require("../controller/user.controller");
const { authMiddleware } = require("../middleware/auth");

router.post("/sign-up", signup);
router.post("/login",  login);

router.post('/list', authMiddleware, getUsersList);
router.get('/:id', authMiddleware, getUserById);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

router.post('/:userId/check-access', authMiddleware, checkUserAccess);

router.put('/bulk/update-same', authMiddleware, bulkUpdateSame);
router.put('/bulk/update-different', authMiddleware, bulkUpdateDifferent);

module.exports = router;
