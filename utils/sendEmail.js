const nodemailer = require('nodemailer');

const sendEmail = async (to, type, userName, otp = null, notes = null) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const emailTemplates = {
      approve: {
        subject: 'Account Approved',
        text: `Hello ${userName},\n\nYour account has been approved! You can now log in.\n\nRegards,\nSupport Team`,
        html: `<p>Hello ${userName},</p><p>Your account has been <strong>approved</strong>! You can now log in.</p><p>Regards,<br>Support Team</p>`,
      },
      reject: {
        subject: 'Account Rejected',
        text: `Hello ${userName},\n\nYour account registration has been rejected by the admin.\n\nRegards,\nSupport Team`,
        html: `<p>Hello ${userName},</p><p>Your account registration has been <strong>rejected</strong> by the admin.</p><p>Regards,<br>Support Team</p>`,
      },
      otp: {
        subject: 'OTP for Signup',
        text: `Hello ${userName},\n\nYour Sign Up OTP code is: ${otp}. It is valid for 10 minutes.\n\nRegards,\nSupport Team`,
        html: `<p>Hello ${userName},</p><p>Your Sign Up OTP code is: <strong>${otp}</strong>. It is valid for 10 minutes.</p><p>Regards,<br>Support Team</p>`,
      },
      otpResend: {
        subject: 'OTP for Resend Request',
        text: `Hello ${userName},\n\nYour OTP code is: ${otp}. It is valid for 10 minutes.\n\nRegards,\nSupport Team`,
        html: `<p>Hello ${userName},</p><p>Your OTP code is: <strong>${otp}</strong>. It is valid for 10 minutes.</p><p>Regards,<br>Support Team</p>`,
      },
      otpLogin: {
        subject: 'Login OTP',
        text: `Hello ${userName},\n\nYour Login OTP code is: ${otp}. It is valid for 10 minutes.\n\nRegards,\nSupport Team`,
        html: `<p>Hello ${userName},</p><p>Your Login OTP code is: <strong>${otp}</strong>. It is valid for 10 minutes.</p><p>Regards,<br>Support Team</p>`,
      },
      otpForgotPassword: {
        subject: 'OTP to update password',
        text: `Hello ${userName},\n\nYour OTP code is: ${otp}. It is valid for 10 minutes.\n\nRegards,\nSupport Team`,
        html: `<p>Hello ${userName},</p><p>Your OTP code is: <strong>${otp}</strong>. It is valid for 10 minutes.</p><p>Regards,<br>Support Team</p>`,
      },
      formApproved: ({ userName, notes }) => ({
        subject: 'Course Advising Form Approved',
        text: `Hello ${userName},\n\nYour submitted course advising form has been approved by the administrator.\n\nAdmin Notes: ${notes}\n\nYou may proceed with registration.\n\nRegards,\nAdvising Team`,
        html: `<p>Hello ${userName},</p>
               <p>Your submitted <strong>course advising form</strong> has been <strong>approved</strong> by the administrator.</p>
               <p><strong>Admin Notes:</strong> ${notes}</p>
               <p>You may proceed with registration.</p>
               <p>Regards,<br>Advising Team</p>`,
      }),
      formRejected: ({ userName, notes }) => ({
        subject: 'Course Advising Form Rejected',
        text: `Hello ${userName},\n\nYour course advising form has been rejected.\n\nAdmin Notes: ${notes}\n\nPlease review and resubmit if necessary.\n\nRegards,\nAdvising Team`,
        html: `<p>Hello ${userName},</p>
               <p>Your <strong>course advising form</strong> has been <strong>rejected</strong>.</p>
               <p><strong>Admin Notes:</strong> ${notes}</p>
               <p>Please review and resubmit if necessary.</p>
               <p>Regards,<br>Advising Team</p>`,
      }),
    };

    if (!emailTemplates[type]) {
      throw new Error('Invalid email type');
    }

    // Handle both function and static object templates
    const template =
      typeof emailTemplates[type] === 'function'
        ? emailTemplates[type]({ userName, notes })
        : emailTemplates[type];

    const mailOptions = {
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to,
      subject: template.subject,
      text: template.text,
      html: template.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;
