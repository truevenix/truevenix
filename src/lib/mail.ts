import nodemailer from "nodemailer";

interface MailOptions {
  to: string;
  subject: string;
  body: string;
}

const domain = process.env.NEXT_PUBLIC_APP_URL;
const BRAND = "#B45309"; // truevenix orange

// ─── Layout ───────────────────────────────────────────────────────────────────
function wrap(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>truevenix</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f5f5f5; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1a1a1a; -webkit-font-smoothing: antialiased; }
    .wrapper { padding: 40px 16px; background: #f5f5f5; }
    .container { max-width: 520px; margin: 0 auto; }
    .header { background: ${BRAND}; padding: 24px 32px; border-radius: 6px 6px 0 0; }
    .brand { font-size: 20px; font-weight: 700; color: #fff; letter-spacing: 0.04em; }
    .card { background: #fff; padding: 36px 32px; border: 1px solid #e5e5e5; border-top: none; border-bottom: none; }
    .footer { background: #1a1a1a; padding: 20px 32px; border-radius: 0 0 6px 6px; text-align: center; }
    .footer-text { font-size: 11px; color: rgba(255,255,255,0.4); line-height: 1.6; }
    .footer-text a { color: rgba(255,255,255,0.55); text-decoration: none; }

    .tag { display: inline-block; font-size: 10px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: ${BRAND}; margin-bottom: 10px; }
    .heading { font-size: 22px; font-weight: 700; color: #111; margin-bottom: 16px; line-height: 1.3; }
    .body-text { font-size: 14px; line-height: 1.7; color: #555; margin-bottom: 24px; }

    .otp-box { background: #fdf2f2; border: 1.5px dashed ${BRAND}; border-radius: 6px; text-align: center; padding: 24px 32px; margin: 24px 0; }
    .otp-code { font-size: 40px; font-weight: 700; letter-spacing: 0.2em; color: ${BRAND}; font-variant-numeric: tabular-nums; }
    .otp-note { font-size: 12px; color: #888; margin-top: 8px; }

    .cta-wrap { text-align: center; margin: 24px 0; }
    .cta-btn { display: inline-block; background: ${BRAND}; color: #fff !important; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; padding: 13px 32px; border-radius: 5px; }
    .cta-link { font-size: 11px; color: #999; margin-top: 12px; word-break: break-all; }
    .cta-link a { color: ${BRAND}; }

    .note { background: #fdf2f2; border-left: 3px solid ${BRAND}; padding: 12px 16px; border-radius: 0 4px 4px 0; margin-top: 20px; font-size: 12px; color: #666; line-height: 1.6; }
    .note strong { color: ${BRAND}; }

    .data-card { border: 1px solid #e8e8e8; border-radius: 6px; overflow: hidden; margin: 20px 0; }
    .data-card-title { background: ${BRAND}; color: #fff; font-size: 10px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; padding: 7px 16px; }
    .data-row { display: flex; justify-content: space-between; align-items: flex-start; padding: 10px 16px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
    .data-row:last-child { border-bottom: none; }
    .data-label { color: #999; flex-shrink: 0; padding-right: 12px; }
    .data-value { color: #222; font-weight: 500; text-align: right; word-break: break-word; }

    .items-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .items-table thead tr { background: #fdf2f2; }
    .items-table thead th { padding: 8px 12px; text-align: left; font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: ${BRAND}; }
    .items-table thead th:last-child { text-align: right; }
    .items-table tbody tr { border-bottom: 1px solid #f0f0f0; }
    .items-table tbody tr:last-child { border-bottom: none; }
    .items-table tbody td { padding: 10px 12px; color: #333; }
    .items-table tbody td:last-child { text-align: right; font-weight: 600; white-space: nowrap; }
    .item-meta { font-size: 11px; color: #999; margin-top: 2px; }
    .total-row { background: ${BRAND}; }
    .total-row td { padding: 11px 12px !important; color: #fff !important; font-weight: 600 !important; }

    .badge { display: inline-block; font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; border-radius: 99px; background: #fde8e8; color: ${BRAND}; }

    @media (max-width: 480px) {
      .card { padding: 24px 20px; }
      .header { padding: 20px; }
      .footer { padding: 16px 20px; }
      .heading { font-size: 20px; }
      .otp-code { font-size: 32px; }
      .data-row { flex-direction: column; gap: 4px; }
      .data-value { text-align: left; }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="brand">truevenix</div>
      </div>
      <div class="card">${content}</div>
      <div class="footer">
        <p class="footer-text">
          Sent by truevenix. If you didn't request this, ignore this email.<br/>
          <a href="${domain}">${domain}</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>`.trim();
}

// ─── Small building blocks ─────────────────────────────────────────────────
function row(label: string, value: string): string {
  return `<div class="data-row"><span class="data-label">${label}</span><span class="data-value">${value}</span></div>`;
}

function dataCard(title: string, rows: string): string {
  return `<div class="data-card"><div class="data-card-title">${title}</div>${rows}</div>`;
}

function badge(text: string, style?: string): string {
  return `<span class="badge"${style ? ` style="${style}"` : ""}>${text}</span>`;
}

function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en")}`;
}

// "Africa/Abuja" is not a valid IANA timezone — Lagos is the correct identifier
// for WAT (UTC+1) and works across all Node.js ICU builds.
function formatTimeNow(): string {
  return new Date().toLocaleString("en", {
    timeZone: "Africa/Lagos",
    dateStyle: "full",
    timeStyle: "short",
  });
}

function itemsTable(items: OrderItem[], totalAmount: number): string {
  const itemRows = items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 12px;">
        <div>${item.name}</div>
        ${item.variant ? `<div class="item-meta">${item.variant}</div>` : ""}
      </td>
      <td style="padding:10px 12px;text-align:center;color:#666;">${item.quantity}</td>
      <td style="padding:10px 12px;color:#666;white-space:nowrap;">${formatNaira(item.price)}</td>
      <td style="padding:10px 12px;text-align:right;font-weight:600;white-space:nowrap;color:${BRAND};">${formatNaira(item.subtotal)}</td>
    </tr>
  `
    )
    .join("");

  return `
    <div class="data-card">
      <div class="data-card-title">Items</div>
      <div style="overflow-x:auto;">
        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th style="text-align:center">Qty</th>
              <th>Unit Price</th>
              <th style="text-align:right">Subtotal</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="3" style="padding:11px 12px;font-size:13px;">Total</td>
              <td style="padding:11px 12px;text-align:right;font-size:17px;font-weight:700;">
                ${formatNaira(totalAmount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;
}

function customerCard(
  customerName: string,
  customerEmail?: string | null,
  customerPhone?: string | null
): string {
  return dataCard(
    "Customer",
    row("Name", customerName) +
      (customerEmail ? row("Email", `<span style="word-break:break-all">${customerEmail}</span>`) : "") +
      (customerPhone ? row("Phone", customerPhone) : "")
  );
}

// ─── Two-Factor Auth ──────────────────────────────────────────────────────────
function twoFactorBody(token: string): string {
  return wrap(`
    <div class="tag">Security</div>
    <div class="heading">Your verification code</div>
    <p class="body-text">Enter this one-time code to complete your sign-in. It expires shortly.</p>
    <div class="otp-box">
      <div class="otp-code">${token}</div>
      <div class="otp-note">Expires in <strong>10 minutes</strong></div>
    </div>
    <div class="note"><strong>Never share this code.</strong> truevenix will never ask for it by phone or email.</div>
  `);
}

// ─── Password Reset ───────────────────────────────────────────────────────────
function passwordResetBody(resetLink: string): string {
  return wrap(`
    <div class="tag">Account</div>
    <div class="heading">Reset your password</div>
    <p class="body-text">We received a request to reset your truevenix password. Click below to choose a new one. If you didn't request this, ignore this email.</p>
    <div class="cta-wrap">
      <a href="${resetLink}" class="cta-btn">Reset Password</a>
      <div class="cta-link">Or copy this link:<br/><a href="${resetLink}">${resetLink}</a></div>
    </div>
    <div class="note"><strong>This link expires in 1 hour</strong> and can only be used once.</div>
  `);
}

// ─── Email Verification ───────────────────────────────────────────────────────
function emailVerificationBody(confirmLink: string): string {
  return wrap(`
    <div class="tag">Welcome</div>
    <div class="heading">Verify your email</div>
    <p class="body-text">Thanks for signing up. Click below to verify your email address and activate your account.</p>
    <div class="cta-wrap">
      <a href="${confirmLink}" class="cta-btn">Verify Email</a>
      <div class="cta-link">Or copy this link:<br/><a href="${confirmLink}">${confirmLink}</a></div>
    </div>
    <div class="note"><strong>This link expires in 24 hours.</strong></div>
  `);
}

// ─── Order Types ──────────────────────────────────────────────────────────────
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  variant?: string;
}

export interface OrderEmailParams {
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  orderReference: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentReference?: string | null;
}

// ─── Shared order-email builder ───────────────────────────────────────────────
type OrderStage = "paid" | "created";

function buildOrderEmail(
  params: OrderEmailParams,
  variant: "customer" | "admin",
  stage: OrderStage
): string {
  const {
    customerName,
    customerEmail,
    customerPhone,
    orderReference,
    items,
    totalAmount,
    paymentMethod,
    paymentReference,
  } = params;

  const copy =
    stage === "paid"
      ? {
          heading: "Order Confirmed",
          intro:
            variant === "customer"
              ? `Hi <strong>${customerName}</strong>, your payment was received and your order is confirmed.`
              : `A new order has been placed and payment confirmed.`,
          statusBadge: badge("✓ Paid"),
          paymentBadge: badge("✓ Paid"),
        }
      : {
          heading: "Order Received — Awaiting Payment",
          intro:
            variant === "customer"
              ? `Hi <strong>${customerName}</strong>, your order has been received. Complete your payment to confirm it.`
              : `A new order has been placed and is awaiting payment confirmation.`,
          statusBadge: badge("⏳ Awaiting Payment", "background:#fff8e1;color:#b45309;"),
          paymentBadge: badge("⏳ Pending", "background:#fff8e1;color:#b45309;"),
        };

  const footerNote =
    variant === "customer"
      ? `Questions? Email <a href="mailto:support@truevenix.com" style="color:${BRAND}">support@truevenix.com</a>.`
      : `Log in to the admin panel to ${stage === "paid" ? "manage" : "monitor"} this order.`;

  return wrap(`
    <div class="tag">Order</div>
    <div class="heading">${copy.heading}</div>
    <p class="body-text">${copy.intro}</p>

    ${customerCard(customerName, customerEmail, customerPhone)}

    ${dataCard(
      "Order Details",
      row("Reference", `<code style="font-family:monospace;color:${BRAND}">${orderReference}</code>`) +
        row("Placed At", formatTimeNow()) +
        (stage === "created" ? row("Status", copy.statusBadge) : "")
    )}

    ${itemsTable(items, totalAmount)}

    ${dataCard(
      "Payment",
      row("Method", `<span style="text-transform:capitalize">${paymentMethod}</span>`) +
        row("Status", copy.paymentBadge) +
        (paymentReference
          ? row("Reference", `<code style="font-family:monospace;font-size:12px;word-break:break-all">${paymentReference}</code>`)
          : "")
    )}

    <div class="note">${footerNote}</div>
  `);
}

// ─── Recipient helpers ────────────────────────────────────────────────────────
function adminRecipients(extra: string[]): string[] {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
  return [adminEmail, ...extra].filter(Boolean) as string[];
}

const DEFAULT_ADMIN_EXTRAS = ["support@truevenix.com"];

// ─── Public Send Functions ────────────────────────────────────────────────────
export async function sendTwoFactorTokenEmail(email: string, token: string) {
  return sendMail({
    to: email,
    subject: "Your truevenix verification code",
    body: twoFactorBody(token),
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${domain}/auth/new-password?token=${token}`;
  return sendMail({
    to: email,
    subject: "Reset your truevenix password",
    body: passwordResetBody(resetLink),
  });
}

export async function sendMobileVerificationCodeEmail(email: string, code: string) {
  return sendMail({
    to: email,
    subject: "Verify your email — truevenix",
    body: twoFactorBody(code),
  });
}

export async function sendMobilePasswordResetCodeEmail(email: string, code: string) {
  return sendMail({
    to: email,
    subject: "Your truevenix password reset code",
    body: twoFactorBody(code),
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const confirmLink = `${domain}/auth/email-verification?token=${token}`;
  return sendMail({
    to: email,
    subject: "Verify your email — truevenix",
    body: emailVerificationBody(confirmLink),
  });
}

// ─── Order Confirmed (Paid) ───────────────────────────────────────────────────
export async function sendCustomerOrderConfirmation(params: OrderEmailParams) {
  if (!params.customerEmail) {
    console.warn("[mail] sendCustomerOrderConfirmation: no customerEmail — skipping");
    return;
  }
  console.log("[mail] sendCustomerOrderConfirmation →", params.customerEmail, params.orderReference);
  return sendMail({
    to: params.customerEmail,
    subject: `Order Confirmed — #${params.orderReference}`,
    body: buildOrderEmail(params, "customer", "paid"),
  });
}

export async function sendAdminOrderNotification(params: OrderEmailParams) {
  const recipients = adminRecipients([...DEFAULT_ADMIN_EXTRAS, "psalmKenneth1987@gmail.com"]);
  if (recipients.length === 0) {
    console.warn("[mail] sendAdminOrderNotification: no recipients configured — skipping");
    return;
  }
  console.log("[mail] sendAdminOrderNotification →", recipients.join(", "));
  return sendMail({
    to: recipients.join(","),
    subject: `New Order — ${params.customerName} · #${params.orderReference}`,
    body: buildOrderEmail(params, "admin", "paid"),
  });
}

// ─── Order Created (Awaiting Payment) ────────────────────────────────────────
export async function sendCustomerOrderCreatedEmail(params: OrderEmailParams) {
  if (!params.customerEmail) {
    console.warn("[mail] sendCustomerOrderCreatedEmail: no customerEmail — skipping");
    return;
  }
  console.log("[mail] sendCustomerOrderCreatedEmail →", params.customerEmail, params.orderReference);
  return sendMail({
    to: params.customerEmail,
    subject: `Order Received — #${params.orderReference}`,
    body: buildOrderEmail(params, "customer", "created"),
  });
}

export async function sendAdminOrderCreatedNotification(params: OrderEmailParams) {
  const recipients = adminRecipients(DEFAULT_ADMIN_EXTRAS);
  if (recipients.length === 0) {
    console.warn("[mail] sendAdminOrderCreatedNotification: no recipients configured — skipping");
    return;
  }
  console.log("[mail] sendAdminOrderCreatedNotification →", recipients.join(", "));
  return sendMail({
    to: recipients.join(","),
    subject: `New Order (Awaiting Payment) — ${params.customerName} · #${params.orderReference}`,
    body: buildOrderEmail(params, "admin", "created"),
  });
}

// ─── Batch senders ────────────────────────────────────────────────────────────
// Runs both tasks in parallel. Each failure is logged individually so you can
// see exactly which leg (customer vs admin) failed and why. The error is then
// re-thrown so the caller knows something went wrong.
async function runSettled(label: string, tasks: Promise<unknown>[]) {
  const results = await Promise.allSettled(tasks);

  const failures = results.filter((r): r is PromiseRejectedResult => r.status === "rejected");

  if (failures.length > 0) {
    failures.forEach((f, i) =>
      console.error(`[mail] ${label} — task ${i} failed:`, f.reason)
    );
    throw new Error(`${label}: ${failures.length}/${results.length} email(s) failed to send`);
  }

  console.log(`[mail] ${label} — all ${results.length} email(s) sent successfully`);
}

export async function sendOrderCreatedEmails(params: OrderEmailParams) {
  await runSettled("sendOrderCreatedEmails", [
    sendCustomerOrderCreatedEmail(params),
    sendAdminOrderCreatedNotification(params),
  ]);
}

export async function sendOrderEmails(params: OrderEmailParams) {
  await runSettled("sendOrderEmails", [
    sendCustomerOrderConfirmation(params),
    sendAdminOrderNotification(params),
  ]);
}

// ─── Core Mailer ──────────────────────────────────────────────────────────────
async function sendMail({ to, subject, body }: MailOptions) {
  const { SMTP_PASSWORD, SMTP_EMAIL } = process.env;

  if (!SMTP_EMAIL || !SMTP_PASSWORD) {
    const msg = "[mail] Missing SMTP_EMAIL or SMTP_PASSWORD env vars — cannot send mail";
    console.error(msg, { to, subject });
    throw new Error(msg);
  }

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: { user: SMTP_EMAIL, pass: SMTP_PASSWORD },
  });

  try {
    await transport.verify();
  } catch (error) {
    console.error("[mail] transport.verify() failed — Gmail requires an App Password:", {
      to,
      subject,
      error,
    });
    throw error;
  }

  try {
    const result = await transport.sendMail({
      from: `"truevenix" <${SMTP_EMAIL}>`,
      to,
      subject,
      html: body,
    });
    console.log("[mail] Email sent:", { to, subject, messageId: result.messageId });
    return result;
  } catch (error) {
    console.error("[mail] transport.sendMail() failed:", { to, subject, error });
    throw error;
  }
}