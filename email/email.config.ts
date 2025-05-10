import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

// Interface for email options
export interface EmailOptions {
    to: string | string[];
    subject: string;
    text: string;
    html: string;
    from?: string;
}

export const formatDate = (date: Date) =>
    date.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });

export const loadHtmlTemplate = (
    fileName: string,
    replacements: Record<string, string>,
): string => {
    try {
        const filePath = path.join(__dirname, 'content', fileName);
        let html = fs.readFileSync(filePath, 'utf-8');
        for (const [key, value] of Object.entries(replacements)) {
            html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
        }
        return html;
    } catch (error: any) {
        throw new Error(`Failed to load HTML template ${fileName}: ${error.message}`);
    }
};

// Initialize transporter once for reuse
export const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER as string,
        pass: process.env.EMAIL_PASS as string,
    },
});
