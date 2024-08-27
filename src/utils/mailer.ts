import nodemailer from 'nodemailer';

interface MailOptions {
    to: string;
    subject: string;
    text: string;
    html?: string;
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }
})

export const sendEmail = async (options: MailOptions) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html
        });
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email', error);
    }
}