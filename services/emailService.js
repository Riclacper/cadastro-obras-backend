const { Resend } = require('resend');

exports.enviarEmail = async (to, subject, html, attachments = []) => {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) {
    throw new Error('Envio de e-mail não configurado. Defina RESEND_API_KEY e EMAIL_FROM no .env.');
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: [to],
    subject,
    html,
    attachments
  });

  if (error) throw new Error(error.message || 'O Resend recusou o envio do e-mail.');
};
