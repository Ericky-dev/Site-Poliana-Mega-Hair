const { client } = require('../config/twilio');

/**
 * Send WhatsApp notification to salon owner about new appointment
 */
async function sendWhatsAppNotification({ clientName, clientPhone, serviceName, date, time, depositAmount, appointmentId }) {
  if (!client) {
    console.log('Twilio not configured - skipping WhatsApp notification');
    return null;
  }

  const ownerPhone = process.env.SALON_OWNER_PHONE;
  const fromPhone = process.env.TWILIO_WHATSAPP_FROM;

  if (!ownerPhone || !fromPhone) {
    console.log('WhatsApp phones not configured - skipping notification');
    return null;
  }

  // Format date for display
  const formattedDate = new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const message = `🌸 *Novo Agendamento - Poliana MegaHair*

*Cliente:* ${clientName}
*Telefone:* ${clientPhone}
*Serviço:* ${serviceName}
*Data:* ${formattedDate}
*Horário:* ${time}

*Sinal a receber:* R$ ${depositAmount.toFixed(2)}
*ID do Agendamento:* #${appointmentId}

_Status: Aguardando pagamento do sinal_

Acesse o painel administrativo para confirmar o pagamento.`;

  try {
    const response = await client.messages.create({
      body: message,
      from: fromPhone,
      to: ownerPhone
    });

    console.log('WhatsApp notification sent:', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    throw error;
  }
}

/**
 * Send confirmation message to client
 */
async function sendClientConfirmation({ clientPhone, serviceName, date, time, appointmentId }) {
  if (!client) {
    console.log('Twilio not configured - skipping client notification');
    return null;
  }

  const fromPhone = process.env.TWILIO_WHATSAPP_FROM;

  if (!fromPhone) {
    console.log('WhatsApp from phone not configured');
    return null;
  }

  // Format client phone for WhatsApp
  const toPhone = clientPhone.startsWith('whatsapp:') ? clientPhone : `whatsapp:${clientPhone}`;

  const formattedDate = new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const message = `🌸 *Poliana MegaHair - Confirmação de Agendamento*

Seu agendamento foi confirmado!

*Serviço:* ${serviceName}
*Data:* ${formattedDate}
*Horário:* ${time}

*ID:* #${appointmentId}

Obrigada pela preferência!
_Não é só beleza, é transformação_ ✨`;

  try {
    const response = await client.messages.create({
      body: message,
      from: fromPhone,
      to: toPhone
    });

    console.log('Client confirmation sent:', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending client confirmation:', error);
    throw error;
  }
}

/**
 * Send reminder to client 1 day before appointment
 */
async function sendDayBeforeReminder({ clientPhone, clientName, serviceName, date, time, appointmentId }) {
  if (!client) {
    console.log('Twilio not configured - skipping reminder');
    return null;
  }

  const fromPhone = process.env.TWILIO_WHATSAPP_FROM;
  if (!fromPhone) {
    console.log('WhatsApp from phone not configured');
    return null;
  }

  const toPhone = clientPhone.startsWith('whatsapp:') ? clientPhone : `whatsapp:${clientPhone}`;

  const formattedDate = new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  const message = `🌸 *Poliana MegaHair - Lembrete*

Olá ${clientName}! 👋

Lembramos que você tem um agendamento *amanhã*:

*Serviço:* ${serviceName}
*Data:* ${formattedDate}
*Horário:* ${time}

Contamos com sua presença!
_Não é só beleza, é transformação_ ✨`;

  try {
    const response = await client.messages.create({
      body: message,
      from: fromPhone,
      to: toPhone
    });

    console.log('Day before reminder sent:', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending day before reminder:', error);
    throw error;
  }
}

/**
 * Send reminder to client 1 hour before appointment
 */
async function sendHourBeforeReminder({ clientPhone, clientName, serviceName, time, appointmentId }) {
  if (!client) {
    console.log('Twilio not configured - skipping reminder');
    return null;
  }

  const fromPhone = process.env.TWILIO_WHATSAPP_FROM;
  if (!fromPhone) {
    console.log('WhatsApp from phone not configured');
    return null;
  }

  const toPhone = clientPhone.startsWith('whatsapp:') ? clientPhone : `whatsapp:${clientPhone}`;

  const message = `🌸 *Poliana MegaHair - Lembrete*

Olá ${clientName}! ⏰

Seu horário é *daqui a 1 hora*!

*Serviço:* ${serviceName}
*Horário:* ${time}

Estamos te esperando!
_Não é só beleza, é transformação_ ✨`;

  try {
    const response = await client.messages.create({
      body: message,
      from: fromPhone,
      to: toPhone
    });

    console.log('Hour before reminder sent:', response.sid);
    return response;
  } catch (error) {
    console.error('Error sending hour before reminder:', error);
    throw error;
  }
}

module.exports = {
  sendWhatsAppNotification,
  sendClientConfirmation,
  sendDayBeforeReminder,
  sendHourBeforeReminder
};
