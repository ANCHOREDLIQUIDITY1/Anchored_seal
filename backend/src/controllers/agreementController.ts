import { Request, Response, NextFunction } from 'express';
import { Agreement } from '../models/Agreement';
import { EmailService } from '../services/EmailService';
import { PDFService } from '../services/PDFService';
import AppError from '../utils/AppError';
import { randomUUID } from 'crypto';

// 1. Create a new Agreement
export const createAgreement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, category, description, value, expiresAt, parties, clauses } = req.body;
    const shortId = randomUUID().substring(0, 8);

    const newAgreement = await Agreement.create({
      title,
      shortId,
      category,
      description,
      value,
      expiresAt,
      creator: req.user?._id,
      parties: parties?.map((p: any) => ({
        ...p,
        token: randomUUID()
      })) || [],
      clauses,
      auditTrail: [{
        action: 'CREATED',
        actor: req.user?.email || 'Creator',
        timestamp: new Date()
      }]
    });

    res.status(201).json({ success: true, data: newAgreement });
  } catch (err) {
    next(err);
  }
};

// 2. Get User's Agreements
export const getAgreements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agreements = await Agreement.find({
      $or: [
        { creator: req.user?._id },
        { 'parties.email': req.user?.email }
      ],
      isDeleted: false
    }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: agreements.length, data: agreements });
  } catch (err) {
    next(err);
  }
};

// 3. Get single Agreement
export const getAgreement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agreement = await Agreement.findOne({
      _id: req.params.id,
      isDeleted: false
    }).populate('creator', 'name email avatar');

    if (!agreement) return next(new AppError('Agreement not found', 404));

    res.status(200).json({ success: true, data: agreement });
  } catch (err) {
    next(err);
  }
};

// 4. Update Agreement
export const updateAgreement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agreement = await Agreement.findOne({ _id: req.params.id, creator: req.user?._id });
    
    if (!agreement) return next(new AppError('Agreement not found or unauthorized', 404));
    if (agreement.isLocked) return next(new AppError('Agreement is locked and cannot be edited', 403));

    const updated = await Agreement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// 5. Delete Agreement (Soft Delete)
export const deleteAgreement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agreement = await Agreement.findOne({ _id: req.params.id, creator: req.user?._id });
    if (!agreement) return next(new AppError('Agreement not found or unauthorized', 404));

    agreement.isDeleted = true;
    await agreement.save();

    res.status(204).json({ success: true, data: null });
  } catch (err) {
    next(err);
  }
};

// 6. Send Agreement (Lock and trigger emails)
export const sendAgreement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const agreement = await Agreement.findOne({ _id: req.params.id, creator: req.user?._id });
    
    if (!agreement) return next(new AppError('Agreement not found or unauthorized', 404));
    if (agreement.isLocked) return next(new AppError('Agreement already sent', 400));

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
        await EmailService.sendInvitation(party.email, (agreement._id as any).toString(), party.token);
      }
    }

    res.status(200).json({ success: true, message: 'Agreement sent successfully', data: agreement });
  } catch (err) {
    next(err);
  }
};

// 7. Get Agreement by Token (Public)
export const getAgreementByToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const agreement = await Agreement.findOne({ 'parties.token': token, isDeleted: false });

    if (!agreement) return next(new AppError('Invalid or expired token', 404));

    const party = agreement.parties.find(p => p.token === token);
    
    if (party?.status === 'pending') {
      party.status = 'viewed';
      await agreement.save();
    }

    res.status(200).json({ success: true, data: { agreement, partyId: (party as any)?._id } });
  } catch (err) {
    next(err);
  }
};

// 8. Sign Agreement (Public)
export const signAgreement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;
    const { ipAddress, userAgent } = req.body;

    const agreement = await Agreement.findOne({ 'parties.token': token });
    if (!agreement) return next(new AppError('Invalid token', 404));

    const party = agreement.parties.find(p => p.token === token);
    if (!party) return next(new AppError('Party not found', 404));

    if (party.status === 'signed') return next(new AppError('You have already signed this agreement', 400));

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
      const { hash } = await PDFService.generateAgreementPDF(agreement);
      agreement.pdfHash = hash;
      await agreement.save();
      
      for (const p of agreement.parties) {
         await EmailService.sendCompletion(p.email, (agreement._id as any).toString(), 'link-to-pdf');
      }
    }

    res.status(200).json({ success: true, message: 'Agreement signed successfully' });
  } catch (err) {
    next(err);
  }
};
