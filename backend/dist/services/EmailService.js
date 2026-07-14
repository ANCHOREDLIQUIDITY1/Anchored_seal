"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
class EmailService {
    static async sendInvitation(email, agreementId, token) {
        console.log(`[EmailService] Sending invite to ${email} for agreement ${agreementId} with token ${token}`);
        // TODO: Implement actual Nodemailer logic
    }
    static async sendCompletion(email, agreementId, pdfLink) {
        console.log(`[EmailService] Sending completion to ${email} with PDF ${pdfLink}`);
        // TODO: Implement actual Nodemailer logic
    }
}
exports.EmailService = EmailService;
