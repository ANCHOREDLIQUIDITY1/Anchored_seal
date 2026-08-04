"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// All routes require authentication
router.use(authMiddleware_1.protect);
router.get('/me', userController_1.getMe);
router.patch('/me', userController_1.updateProfile);
router.patch('/me/password', userController_1.updatePassword);
router.patch('/me/notifications', userController_1.updateNotifications);
exports.default = router;
