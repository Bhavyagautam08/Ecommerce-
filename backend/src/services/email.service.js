import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: 'gmail', // You can change this if using SendGrid, etc.
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

export const sendEmail = async (to, subject, htmlContent) => {
    try {
        const mailOptions = {
            from: `"Maren Fashion" <${process.env.SMTP_EMAIL}>`,
            to,
            subject,
            html: htmlContent
        };

        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        console.error("Error sending email: ", error);
        throw new Error("Could not send email.");
    }
};
