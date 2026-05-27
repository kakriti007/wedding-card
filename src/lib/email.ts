import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendMagicLinkEmail(email: string, url: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          padding: 40px;
          text-align: center;
        }
        .content {
          background: white;
          border-radius: 8px;
          padding: 30px;
          margin-top: 20px;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 15px 40px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .footer {
          color: white;
          margin-top: 20px;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 style="color: white; margin: 0;">🎉 Wedding Invitation Admin</h1>
        <div class="content">
          <h2 style="color: #667eea;">Sign in to your account</h2>
          <p>Click the button below to securely sign in to your wedding invitation admin panel.</p>
          <a href="${url}" class="button">Sign In</a>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            This link will expire in 24 hours. If you didn't request this email, you can safely ignore it.
          </p>
        </div>
        <div class="footer">
          <p>Wedding Invitation System © ${new Date().getFullYear()}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Sign in to Wedding Invitation Admin",
    html: htmlContent,
  });
}

export async function sendRSVPNotification(rsvpData: {
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  numberOfGuests: number;
  attending: boolean;
  customAnswer?: string;
  message?: string;
  dietaryRestrictions?: string;
  cardTitle: string;
}) {
  const notificationEmails = process.env.RSVP_NOTIFICATION_EMAILS?.split(",").map(email => email.trim()) || [];

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          border-radius: 10px;
          padding: 40px;
        }
        .content {
          background: white;
          border-radius: 8px;
          padding: 30px;
        }
        .field {
          margin: 15px 0;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 5px;
        }
        .label {
          font-weight: bold;
          color: #667eea;
        }
        .status {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-weight: bold;
          margin: 10px 0;
        }
        .attending {
          background: #d4edda;
          color: #155724;
        }
        .not-attending {
          background: #f8d7da;
          color: #721c24;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="content">
          <h1 style="color: #667eea; margin-top: 0;">🎊 New RSVP Response!</h1>
          <h3>${rsvpData.cardTitle}</h3>

          <div class="status ${rsvpData.attending ? 'attending' : 'not-attending'}">
            ${rsvpData.attending ? '✓ ATTENDING' : '✗ NOT ATTENDING'}
          </div>

          <div class="field">
            <span class="label">Guest Name:</span><br/>
            ${rsvpData.guestName}
          </div>

          <div class="field">
            <span class="label">Email:</span><br/>
            ${rsvpData.guestEmail}
          </div>

          ${rsvpData.guestPhone ? `
          <div class="field">
            <span class="label">Phone:</span><br/>
            ${rsvpData.guestPhone}
          </div>
          ` : ''}

          <div class="field">
            <span class="label">Number of Guests:</span><br/>
            ${rsvpData.numberOfGuests}
          </div>

          ${rsvpData.customAnswer ? `
          <div class="field">
            <span class="label">Custom Question Response:</span><br/>
            ${rsvpData.customAnswer}
          </div>
          ` : ''}

          ${rsvpData.dietaryRestrictions ? `
          <div class="field">
            <span class="label">Dietary Restrictions:</span><br/>
            ${rsvpData.dietaryRestrictions}
          </div>
          ` : ''}

          ${rsvpData.message ? `
          <div class="field">
            <span class="label">Message:</span><br/>
            ${rsvpData.message}
          </div>
          ` : ''}

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Received at: ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: notificationEmails,
    subject: `New RSVP: ${rsvpData.guestName} - ${rsvpData.attending ? 'Attending' : 'Not Attending'}`,
    html: htmlContent,
  });
}
