const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail({ to, subject, html }) {
    try {
      const info = await this.transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'WorkLink AI'}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
      return info;
    } catch (error) {
      console.error('Email send error:', error);
      throw new Error('Failed to send email notification');
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(user, token) {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-bottom: 1px solid #e2e8f0;">
          <h1 style="color: #D4AF37; margin: 0;">WorkLink AI</h1>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #1e293b; margin-top: 0;">Verify your email address</h2>
          <p style="color: #64748B; line-height: 1.6;">Welcome to WorkLink AI! Please verify your email address to activate your account and start using our services.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationUrl}" style="background-color: #D4AF37; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Verify Email Address</a>
          </div>
          <p style="color: #94a3b8; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </div>
    `;
    return this.sendEmail({ to: user.email, subject: 'Verify your WorkLink AI account', html });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetUrl) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-bottom: 1px solid #e2e8f0;">
          <h1 style="color: #D4AF37; margin: 0;">WorkLink AI</h1>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #1e293b; margin-top: 0;">Reset your password</h2>
          <p style="color: #64748B; line-height: 1.6;">You requested to reset your password. Click the button below to set a new password for your account.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" style="background-color: #D4AF37; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="color: #64748B; line-height: 1.6;">This link will expire in 1 hour.</p>
          <p style="color: #94a3b8; font-size: 12px;">If you didn't request a password reset, please ignore this email.</p>
        </div>
      </div>
    `;
    return this.sendEmail({ to: user.email, subject: 'Password Reset - WorkLink AI', html });
  }

  /**
   * Send worker approval/rejection email
   */
  async sendWorkerApprovalEmail(worker, approved) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-bottom: 1px solid #e2e8f0;">
          <h1 style="color: #D4AF37; margin: 0;">WorkLink AI</h1>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #1e293b; margin-top: 0;">${approved ? 'Application Approved!' : 'Application Update'}</h2>
          <p style="color: #64748B; line-height: 1.6;">Hello ${worker.name},</p>
          <p style="color: #64748B; line-height: 1.6;">
            ${approved
              ? 'Congratulations! Your application to join WorkLink AI has been approved. You can now login to your dashboard and start accepting service bookings.'
              : `Thank you for your interest in joining WorkLink AI. Unfortunately, your application has been rejected at this time for the following reason: ${worker.rejectionReason}`}
          </p>
          ${approved ? `
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.CLIENT_URL}/login" style="background-color: #D4AF37; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Go to Dashboard</a>
          </div>` : ''}
        </div>
      </div>
    `;
    return this.sendEmail({ to: worker.email, subject: `Application ${approved ? 'Approved' : 'Rejected'} - WorkLink AI`, html });
  }

  /**
   * Send booking notification
   */
  async sendBookingNotification(booking, recipientEmail, recipientName, status) {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #f8fafc; padding: 24px; text-align: center; border-bottom: 1px solid #e2e8f0;">
          <h1 style="color: #D4AF37; margin: 0;">WorkLink AI</h1>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #1e293b; margin-top: 0;">Booking Update</h2>
          <p style="color: #64748B; line-height: 1.6;">Hello ${recipientName},</p>
          <p style="color: #64748B; line-height: 1.6;">Your booking #${booking._id.toString().slice(-6)} status has been updated to: <strong style="text-transform: uppercase;">${status.replace(/_/g, ' ')}</strong></p>
          <div style="margin: 24px 0; padding: 16px; background-color: #f8fafc; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #64748B;"><strong>Service:</strong> ${booking.description.slice(0, 50)}...</p>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #64748B;"><strong>Date:</strong> ${new Date(booking.scheduledDate).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    `;
    return this.sendEmail({ to: recipientEmail, subject: `Booking Update - WorkLink AI`, html });
  }
}

module.exports = new EmailService();
