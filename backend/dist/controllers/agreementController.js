"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signAgreement = exports.getAgreementByToken = exports.sendAgreement = exports.deleteAgreement = exports.updateAgreement = exports.getAgreement = exports.getAgreements = exports.createAgreement = void 0;
const Agreement_1 = require("../models/Agreement");
const EmailService_1 = require("../services/EmailService");
const PDFService_1 = require("../services/PDFService");
const AppError_1 = __importDefault(require("../utils/AppError"));
const crypto_1 = require("crypto");
// 1. Create a new Agreement
const createAgreement = async (req, res, next) => {
    try {
        const { title, category, parties, clauses } = req.body;
        const shortId = (0, crypto_1.randomUUID)().substring(0, 8);
        const newAgreement = await Agreement_1.Agreement.create({
            title,
            shortId,
            category,
            creator: req.user?._id,
            parties: parties?.map((p) => ({
                ...p,
                token: (0, crypto_1.randomUUID)()
            })) || [],
            clauses
        });
        res.status(201).json({ success: true, data: newAgreement });
    }
    catch (err) {
        next(err);
    }
};
exports.createAgreement = createAgreement;
// 2. Get User's Agreements
const getAgreements = async (req, res, next) => {
    try {
        const agreements = await Agreement_1.Agreement.find({
            $or: [
                { creator: req.user?._id },
                { 'parties.email': req.user?.email }
            ],
            isDeleted: false
        }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: agreements.length, data: agreements });
    }
    catch (err) {
        next(err);
    }
};
exports.getAgreements = getAgreements;
// 3. Get single Agreement
const getAgreement = async (req, res, next) => {
    try {
        const agreement = await Agreement_1.Agreement.findOne({
            _id: req.params.id,
            isDeleted: false
        }).populate('creator', 'name email avatar');
        if (!agreement)
            return next(new AppError_1.default('Agreement not found', 404));
        res.status(200).json({ success: true, data: agreement });
    }
    catch (err) {
        next(err);
    }
};
exports.getAgreement = getAgreement;
// 4. Update Agreement
const updateAgreement = async (req, res, next) => {
    try {
        const agreement = await Agreement_1.Agreement.findOne({ _id: req.params.id, creator: req.user?._id });
        if (!agreement)
            return next(new AppError_1.default('Agreement not found or unauthorized', 404));
        if (agreement.isLocked)
            return next(new AppError_1.default('Agreement is locked and cannot be edited', 403));
        const updated = await Agreement_1.Agreement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: updated });
    }
    catch (err) {
        next(err);
    }
};
exports.updateAgreement = updateAgreement;
// 5. Delete Agreement (Soft Delete)
const deleteAgreement = async (req, res, next) => {
    try {
        const agreement = await Agreement_1.Agreement.findOne({ _id: req.params.id, creator: req.user?._id });
        if (!agreement)
            return next(new AppError_1.default('Agreement not found or unauthorized', 404));
        agreement.isDeleted = true;
        await agreement.save();
        res.status(204).json({ success: true, data: null });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteAgreement = deleteAgreement;
// 6. Send Agreement (Lock and trigger emails)
const sendAgreement = async (req, res, next) => {
    try {
        const agreement = await Agreement_1.Agreement.findOne({ _id: req.params.id, creator: req.user?._id });
        if (!agreement)
            return next(new AppError_1.default('Agreement not found or unauthorized', 404));
        if (agreement.isLocked)
            return next(new AppError_1.default('Agreement already sent', 400));
        agreement.isLocked = true;
        agreement.status = 'pending';
        // Create audit trail event
        agreement.auditTrail.push({
            action: 'SENT',
            actor: req.user?.email || 'Creator',
            timestamp: new Date()
        });
        await agreement.save();
        // Trigger Email Service for parties
        for (const party of agreement.parties) {
            if (party.role !== 'creator') {
                await EmailService_1.EmailService.sendInvitation(party.email, agreement._id.toString(), party.token);
            }
        }
        res.status(200).json({ success: true, message: 'Agreement sent successfully', data: agreement });
    }
    catch (err) {
        next(err);
    }
};
exports.sendAgreement = sendAgreement;
// 7. Get Agreement by Token (Public)
const getAgreementByToken = async (req, res, next) => {
    try {
        const { token } = req.params;
        const agreement = await Agreement_1.Agreement.findOne({ 'parties.token': token, isDeleted: false });
        if (!agreement)
            return next(new AppError_1.default('Invalid or expired token', 404));
        const party = agreement.parties.find(p => p.token === token);
        if (party?.status === 'pending') {
            party.status = 'viewed';
            await agreement.save();
        }
        res.status(200).json({ success: true, data: { agreement, partyId: party?._id } });
    }
    catch (err) {
        next(err);
    }
};
exports.getAgreementByToken = getAgreementByToken;
// 8. Sign Agreement (Public)
const signAgreement = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { ipAddress, userAgent } = req.body;
        const agreement = await Agreement_1.Agreement.findOne({ 'parties.token': token });
        if (!agreement)
            return next(new AppError_1.default('Invalid token', 404));
        const party = agreement.parties.find(p => p.token === token);
        if (!party)
            return next(new AppError_1.default('Party not found', 404));
        if (party.status === 'signed')
            return next(new AppError_1.default('You have already signed this agreement', 400));
        party.status = 'signed';
        party.signedAt = new Date();
        party.ipAddress = ipAddress || req.ip;
        party.userAgent = userAgent || req.headers['user-agent'];
        agreement.auditTrail.push({
            action: 'SIGNED',
            actor: party.email,
            timestamp: new Date()
        });
        await agreement.save(); // This will trigger the state machine hook
        // If fully signed, trigger PDF generation
        if (agreement.status === 'signed') {
            const { hash } = await PDFService_1.PDFService.generateAgreementPDF(agreement);
            agreement.pdfHash = hash;
            await agreement.save();
            for (const p of agreement.parties) {
                await EmailService_1.EmailService.sendCompletion(p.email, agreement._id.toString(), 'link-to-pdf');
            }
        }
        res.status(200).json({ success: true, message: 'Agreement signed successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.signAgreement = signAgreement;
