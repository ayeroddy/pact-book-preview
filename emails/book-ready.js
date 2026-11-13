// "Your book is ready" delivery email — sent by pact-funnel-api on the order-complete
// event (Stripe checkout.session.completed), NOT from thank-you.html, so it goes out
// even if the buyer closes the tab. Replaces the on-page access card removed from
// thank-you.html (Nov 2026).
//
// Usage inside the worker's checkout-completed handler:
//   import { bookReadyEmail } from './book-ready.js';
//   const { subject, html, text } = bookReadyEmail({ sid: session.id, firstName });
//   await <existing CRM send function used by /relink>(email, subject, html, text);
//
// libraryUrl uses the same auto-login the thank-you button used: members.html?sid=<checkout
// session id>, which members.html trades for a token via POST /auth/token.
// "Find my book" goes to access.html, exactly like the old on-page button.

const SITE = 'https://book.parentingadultstoday.com';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function bookReadyEmail({ sid, firstName = '' } = {}) {
  if (!sid) throw new Error('bookReadyEmail: sid (checkout session id) is required');
  const libraryUrl = `${SITE}/members.html?sid=${encodeURIComponent(sid)}`;
  const findUrl = `${SITE}/access.html`;
  const hi = firstName ? `Hi ${esc(firstName)},` : 'Hello,';

  const subject = 'Your book is ready — tap to open it';

  const html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting"><meta name="color-scheme" content="light only">
<title>${subject}</title>
<style>
  @media only screen and (max-width:600px){
    .container{width:100% !important}
    .px{padding-left:20px !important;padding-right:20px !important}
    .h1{font-size:30px !important}
    .btn a{font-size:21px !important;padding:20px 16px !important}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#faf7f1;">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">Tap the gold button to start reading. There is nothing to download.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#faf7f1;">
<tr><td align="center" style="padding:28px 12px;">
  <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
    <tr><td align="center" style="padding:0 0 20px 0;">
      <img src="${SITE}/assets/pact-logo-email.png" width="160" alt="Parenting Adult Children Today" style="display:block;width:160px;max-width:160px;height:auto;border:0;">
    </td></tr>
    <tr><td class="px" style="background-color:#ffffff;border:1px solid #eae4d8;border-radius:16px;padding:36px 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr><td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:18px;line-height:1.6;color:#2e2740;padding:0 0 10px 0;">${hi}</td></tr>
        <tr><td class="h1" style="font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:1.2;color:#381876;font-weight:bold;padding:0 0 16px 0;">Your book is ready.</td></tr>
        <tr><td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:19px;line-height:1.6;color:#2e2740;padding:0 0 26px 0;">Thank you for your order. Tap the gold button below to open your book. It works on any phone, tablet or computer.</td></tr>
        <tr><td align="center" style="padding:0 0 26px 0;">
          <table role="presentation" class="btn" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td align="center" bgcolor="#C9A227" style="border-radius:14px;background-color:#C9A227;">
              <a href="${libraryUrl}" target="_blank" style="display:block;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:23px;line-height:1.25;font-weight:800;color:#33270a;text-decoration:none;padding:22px 20px;border-radius:14px;">&#128073; Tap here to open your book</a>
            </td></tr></table>
        </td></tr>
        <tr><td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:19px;line-height:1.6;color:#2e2740;padding:0 0 26px 0;"><b>There is nothing to download.</b> Your book opens right on your screen when you tap the gold button. Keep this email so you can come back to your book any time.</td></tr>
        <tr><td style="border-top:1px solid #eae4d8;padding:24px 0 0 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="font-family:Georgia,'Times New Roman',serif;font-size:22px;line-height:1.3;color:#381876;font-weight:bold;padding:0 0 10px 0;">Button not working?</td></tr>
            <tr><td style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:18px;line-height:1.6;color:#2e2740;padding:0 0 18px 0;">Tap below and we will find your book for you.</td></tr>
            <tr><td align="center" style="padding:0 0 8px 0;">
              <table role="presentation" class="btn" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
                <td align="center" bgcolor="#C9A227" style="border-radius:14px;background-color:#C9A227;">
                  <a href="${findUrl}" target="_blank" style="display:block;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:21px;line-height:1.25;font-weight:800;color:#33270a;text-decoration:none;padding:18px 20px;border-radius:14px;">Find my book</a>
                </td></tr></table>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
    <tr><td class="px" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:17px;line-height:1.6;color:#2e2740;padding:24px 40px 8px 40px;" align="center"><b>Need help?</b> Email <a href="mailto:info@parentingadultchildrentoday.com" style="color:#381876;text-decoration:underline;">info@parentingadultchildrentoday.com</a>. A real person will help you today.</td></tr>
  </table>
</td></tr>
</table>
</body></html>`;

  const text = `${firstName ? `Hi ${firstName},` : 'Hello,'}

Your book is ready.

Thank you for your order. Open your book here (works on any phone, tablet or computer):
${libraryUrl}

There is nothing to download. Your book opens right on your screen. Keep this email so you can come back to your book any time.

Link not working? We will find your book for you:
${findUrl}

Need help? Email info@parentingadultchildrentoday.com. A real person will help you today.`;

  return { subject, html, text };
}
