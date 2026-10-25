const nodemailer = require("nodemailer");
const config = require("../config");

const isConfigured = () => Boolean(config.smtp.host && config.smtp.user && config.smtp.pass);

let transporter = null;
function getTransporter() {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: config.smtp.host,
            port: config.smtp.port,
            // 465 is implicit TLS; other ports (587) upgrade with STARTTLS
            secure: config.smtp.port === 465,
            auth: { user: config.smtp.user, pass: config.smtp.pass },
        });
    }
    return transporter;
}

const escapeHtml = (text) =>
    String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Sends the reset link. Without SMTP settings (local development) the link
// is printed to the server console instead, so the flow can still be used.
async function sendPasswordResetEmail({ to, name, resetUrl, ttlMinutes }) {
    if (!isConfigured()) {
        console.warn(`[mail] SMTP not configured; password reset link for ${to}: ${resetUrl}`);
        return;
    }

    const greeting = name ? `Hi ${name},` : "Hi,";
    await getTransporter().sendMail({
        from: config.smtp.from,
        to,
        subject: "Reset your Travel Story password",
        text: [
            greeting,
            "",
            "We received a request to reset your Travel Story password.",
            `Open this link to choose a new one (it expires in ${ttlMinutes} minutes):`,
            resetUrl,
            "",
            "If you didn't ask for this, you can ignore this email; your password won't change.",
        ].join("\n"),
        html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;color:#0f172a">
                <h2 style="color:#05B6D3">Travel Story</h2>
                <p>${escapeHtml(greeting)}</p>
                <p>We received a request to reset your Travel Story password.</p>
                <p style="margin:28px 0">
                    <a href="${escapeHtml(resetUrl)}"
                       style="background:#05B6D3;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">
                        Reset password
                    </a>
                </p>
                <p style="font-size:13px;color:#64748b">This link expires in ${ttlMinutes} minutes. If you didn't ask for this,
                you can ignore this email; your password won't change.</p>
            </div>`,
    });
}

// Checks the SMTP login without sending anything.
async function verifyConnection() {
    if (!isConfigured()) return false;
    await getTransporter().verify();
    return true;
}

module.exports = { sendPasswordResetEmail, verifyConnection, isConfigured };
