const cron = require('node-cron');
const { Op } = require('sequelize');
const { Appointment, Service } = require('../models');
const { sendDayBeforeReminder, sendHourBeforeReminder } = require('./whatsapp');

/**
 * Get appointments for tomorrow that need day-before reminders
 */
async function getAppointmentsForTomorrow() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().split('T')[0];

  try {
    const appointments = await Appointment.findAll({
      where: {
        appointment_date: tomorrowDate,
        status: {
          [Op.in]: ['confirmed', 'pending']
        }
      },
      include: [
        { model: Service, as: 'service' }
      ]
    });

    return appointments;
  } catch (error) {
    console.error('Error fetching tomorrow appointments:', error);
    return [];
  }
}

/**
 * Get appointments for the next hour
 */
async function getAppointmentsNextHour() {
  const now = new Date();
  const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);

  const today = now.toISOString().split('T')[0];
  const targetHour = inOneHour.getHours().toString().padStart(2, '0');
  const targetMinute = inOneHour.getMinutes().toString().padStart(2, '0');
  const targetTime = `${targetHour}:${targetMinute}:00`;

  // Get appointments within a 5-minute window around the target time
  const startTime = `${targetHour}:${Math.max(0, parseInt(targetMinute) - 2).toString().padStart(2, '0')}:00`;
  const endTime = `${targetHour}:${Math.min(59, parseInt(targetMinute) + 2).toString().padStart(2, '0')}:00`;

  try {
    const appointments = await Appointment.findAll({
      where: {
        appointment_date: today,
        appointment_time: {
          [Op.between]: [startTime, endTime]
        },
        status: {
          [Op.in]: ['confirmed', 'pending']
        }
      },
      include: [
        { model: Service, as: 'service' }
      ]
    });

    return appointments;
  } catch (error) {
    console.error('Error fetching next hour appointments:', error);
    return [];
  }
}

/**
 * Send day-before reminders
 */
async function sendDayReminders() {
  console.log('[Reminder] Checking for day-before reminders...');

  const appointments = await getAppointmentsForTomorrow();

  for (const appointment of appointments) {
    try {
      await sendDayBeforeReminder({
        clientPhone: appointment.client_phone,
        clientName: appointment.client_name,
        serviceName: appointment.service?.name || 'Serviço',
        date: appointment.appointment_date,
        time: appointment.appointment_time,
        appointmentId: appointment.id
      });

      console.log(`[Reminder] Day-before sent to ${appointment.client_name}`);
    } catch (error) {
      console.error(`[Reminder] Failed to send day-before to ${appointment.client_name}:`, error.message);
    }
  }

  console.log(`[Reminder] Day-before reminders completed: ${appointments.length} sent`);
}

/**
 * Send hour-before reminders
 */
async function sendHourReminders() {
  console.log('[Reminder] Checking for hour-before reminders...');

  const appointments = await getAppointmentsNextHour();

  for (const appointment of appointments) {
    try {
      await sendHourBeforeReminder({
        clientPhone: appointment.client_phone,
        clientName: appointment.client_name,
        serviceName: appointment.service?.name || 'Serviço',
        time: appointment.appointment_time,
        appointmentId: appointment.id
      });

      console.log(`[Reminder] Hour-before sent to ${appointment.client_name}`);
    } catch (error) {
      console.error(`[Reminder] Failed to send hour-before to ${appointment.client_name}:`, error.message);
    }
  }

  console.log(`[Reminder] Hour-before reminders completed: ${appointments.length} sent`);
}

/**
 * Initialize the reminder scheduler
 */
function initializeReminderScheduler() {
  console.log('[Reminder] Initializing reminder scheduler...');

  // Send day-before reminders every day at 18:00 (6 PM)
  cron.schedule('0 18 * * *', () => {
    console.log('[Reminder] Running day-before reminder job');
    sendDayReminders();
  }, {
    timezone: 'America/Sao_Paulo'
  });

  // Check for hour-before reminders every 5 minutes
  cron.schedule('*/5 * * * *', () => {
    sendHourReminders();
  }, {
    timezone: 'America/Sao_Paulo'
  });

  console.log('[Reminder] Scheduler initialized:');
  console.log('  - Day-before reminders: Daily at 18:00');
  console.log('  - Hour-before reminders: Every 5 minutes');
}

module.exports = {
  initializeReminderScheduler,
  sendDayReminders,
  sendHourReminders
};
