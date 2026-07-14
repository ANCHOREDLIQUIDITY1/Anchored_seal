export class EmailService {
  static async sendInvitation(email: string, agreementId: string, token: string): Promise<void> {
    console.log(`[EmailService] Sending invite to ${email} for agreement ${agreementId} with token ${token}`);
    // TODO: Implement actual Nodemailer logic
  }

  static async sendCompletion(email: string, agreementId: string, pdfLink: string): Promise<void> {
    console.log(`[EmailService] Sending completion to ${email} with PDF ${pdfLink}`);
    // TODO: Implement actual Nodemailer logic
  }
}
