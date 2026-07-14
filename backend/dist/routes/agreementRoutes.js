"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const agreementController_1 = require("../controllers/agreementController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Public routes (using unique UUID tokens)
router.get('/sign/:token', agreementController_1.getAgreementByToken);
router.post('/sign/:token', agreementController_1.signAgreement);
// Protected routes
router.use(authMiddleware_1.protect);
router.route('/')
    .get(agreementController_1.getAgreements)
    .post(agreementController_1.createAgreement);
router.route('/:id')
    .get(agreementController_1.getAgreement)
    .put(agreementController_1.updateAgreement)
    .delete(agreementController_1.deleteAgreement);
router.post('/:id/send', agreementController_1.sendAgreement);
exports.default = router;
