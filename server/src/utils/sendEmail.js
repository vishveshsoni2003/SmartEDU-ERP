import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.mailtrap.io",
        port: process.env.SMTP_PORT || 2525,
        auth: {
            user: process.env.SMTP_EMAIL || "testuser",
            pass: process.env.SMTP_PASSWORD || "testpass",
        },
    });

    const message = {
        from: `${process.env.FROM_NAME || "Attendax ERP"} <${process.env.FROM_EMAIL || "noreply@attendax.com"}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    const info = await transporter.sendMail(message);
    console.log("Message sent: %s", info.messageId);
};

export default sendEmail;
