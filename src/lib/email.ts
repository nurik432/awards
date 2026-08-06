// Mock Email Service for MVP
export async function sendEmail(to: string, subject: string, text: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.log('--- EMAIL MOCK ---');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Content:', text);
    console.log('------------------');
    return true;
  }
  // TODO: Setup nodemailer when SMTP is provided
  // ...
  return true;
}
