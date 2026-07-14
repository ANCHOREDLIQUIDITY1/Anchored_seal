"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agreement = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const crypto_1 = require("crypto");
const partySchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ['creator', 'signer', 'witness', 'viewer'], required: true },
    status: { type: String, enum: ['pending', 'viewed', 'accepted', 'rejected', 'signed'], required: true, default: 'pending' },
    token: { type: String, required: true, default: () => (0, crypto_1.randomUUID)() },
    signedAt: { type: Date },
    ipAddress: { type: String },
    userAgent: { type: String },
    rejectNote: { type: String }
});
const agreementSchema = new mongoose_1.Schema({
    title: { type: String, required: true, maxlength: 200 },
    shortId: { type: String, required: true, unique: true },
    category: {
        type: String,
        enum: ['Business Partnership', 'Freelance Contract', 'Loan Agreement', 'NDA', 'Personal Agreement', 'Custom Agreement'],
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'partially_signed', 'signed', 'rejected', 'expired', 'cancelled'],
        required: true,
        default: 'draft'
    },
    creator: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    parties: { type: [partySchema], required: true },
    clauses: [{ order: Number, title: String, content: String }],
    comments: [{ user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }, text: String, createdAt: { type: Date, default: Date.now } }],
    auditTrail: [{ action: String, actor: String, timestamp: { type: Date, default: Date.now }, details: String }],
    isLocked: { type: Boolean, default: false },
    expiresAt: { type: Date },
    pdfHash: { type: String },
    isDeleted: { type: Boolean, default: false },
    completedAt: { type: Date }
}, { timestamps: true });
// State Machine logic
agreementSchema.pre('save', function (next) {
    if (this.isModified('parties') && this.status !== 'cancelled' && this.status !== 'expired') {
        // If sent (not draft)
        if (this.status !== 'draft') {
            const allSigners = this.parties.filter(p => p.role === 'signer' || p.role === 'creator');
            const hasRejected = this.parties.some(p => p.status === 'rejected');
            const signedCount = allSigners.filter(p => p.status === 'signed').length;
            if (hasRejected) {
                this.status = 'rejected';
            }
            else if (signedCount === allSigners.length && allSigners.length > 0) {
                this.status = 'signed';
                if (!this.completedAt)
                    this.completedAt = new Date();
            }
            else if (signedCount > 0) {
                this.status = 'partially_signed';
            }
        }
    }
    if (this.expiresAt && new Date() > this.expiresAt) {
        this.status = 'expired';
    }
    next();
});
exports.Agreement = mongoose_1.default.model('Agreement', agreementSchema);
