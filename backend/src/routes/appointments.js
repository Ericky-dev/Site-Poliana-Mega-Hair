const express = require('express');
const { Op } = require('sequelize');
const { body, validationResult } = require('express-validator');
const { Appointment, Service, Payment, BusinessHours } = require('../models');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');
const { sendWhatsAppNotification } = require('../services/whatsapp');
const { generatePixPayload } = require('../utils/pixGenerator');

const router = express.Router();

// Get available time slots for a date
router.get('/available', async (req, res) => {
  try {
    const { date, service_id } = req.query;

    if (!date) {
      return res.status(400).json({ error: { message: 'Date is required' } });
    }

    const appointmentDate = new Date(date);
    const dayOfWeek = appointmentDate.getDay();

    // Get business hours for this day
    const businessHours = await BusinessHours.findOne({
      where: { day_of_week: dayOfWeek }
    });

    if (!businessHours || !businessHours.is_open) {
      return res.json({ available_slots: [], message: 'Closed on this day' });
    }

    // Get service duration
    let serviceDuration = 60;
    if (service_id) {
      const service = await Service.findByPk(service_id);
      if (service) {
        serviceDuration = service.duration_minutes;
      }
    }

    // Get existing appointments for this date
    const existingAppointments = await Appointment.findAll({
      where: {
        appointment_date: date,
        status: { [Op.notIn]: ['cancelled'] }
      },
      include: [{ model: Service, as: 'service' }]
    });

    // Generate time slots
    const slots = [];
    const openTime = businessHours.open_time.split(':');
    const closeTime = businessHours.close_time.split(':');

    let currentHour = parseInt(openTime[0]);
    let currentMinute = parseInt(openTime[1]);
    const closeHour = parseInt(closeTime[0]);

    while (currentHour < closeHour || (currentHour === closeHour && currentMinute === 0)) {
      const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

      // Check if slot is available
      const isOccupied = existingAppointments.some(apt => {
        const aptTime = apt.appointment_time.substring(0, 5);
        return aptTime === timeStr;
      });

      // Check if it's not in the past (for today)
      const now = new Date();
      const slotDate = new Date(date);
      slotDate.setHours(currentHour, currentMinute, 0);
      const isPast = slotDate < now;

      slots.push({
        time: timeStr,
        available: !isOccupied && !isPast
      });

      // Increment by 30 minutes
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentMinute = 0;
        currentHour++;
      }
    }

    res.json({ available_slots: slots });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ error: { message: 'Error fetching available slots' } });
  }
});

// Create appointment
router.post('/', [
  body('service_id').isInt().withMessage('Service ID is required'),
  body('client_name').trim().notEmpty().withMessage('Client name is required'),
  body('client_phone').trim().notEmpty().withMessage('Client phone is required'),
  body('appointment_date').isDate().withMessage('Valid date is required'),
  body('appointment_time').matches(/^\d{2}:\d{2}$/).withMessage('Valid time is required (HH:MM)')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { service_id, client_name, client_phone, client_email, appointment_date, appointment_time, notes } = req.body;

    // Check if service exists
    const service = await Service.findByPk(service_id);
    if (!service) {
      return res.status(404).json({ error: { message: 'Service not found' } });
    }

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      where: {
        appointment_date,
        appointment_time,
        status: { [Op.notIn]: ['cancelled'] }
      }
    });

    if (existingAppointment) {
      return res.status(400).json({ error: { message: 'This time slot is not available' } });
    }

    // Create appointment
    const appointment = await Appointment.create({
      service_id,
      client_name,
      client_phone,
      client_email,
      appointment_date,
      appointment_time,
      notes,
      status: 'pending'
    });

    // Calculate deposit amount (30%)
    const depositAmount = parseFloat(service.price) * 0.30;

    // Generate PIX code
    const pixCode = generatePixPayload(depositAmount, `Agendamento #${appointment.id}`);

    // Create payment record
    const payment = await Payment.create({
      appointment_id: appointment.id,
      amount: depositAmount,
      pix_code: pixCode,
      status: 'pending'
    });

    // Send WhatsApp notification to salon owner
    try {
      await sendWhatsAppNotification({
        clientName: client_name,
        clientPhone: client_phone,
        serviceName: service.name,
        date: appointment_date,
        time: appointment_time,
        depositAmount,
        appointmentId: appointment.id
      });
    } catch (whatsappError) {
      console.error('WhatsApp notification error:', whatsappError);
      // Don't fail the request if WhatsApp fails
    }

    // Reload with associations
    const fullAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        { model: Service, as: 'service' },
        { model: Payment, as: 'payment' }
      ]
    });

    res.status(201).json({
      message: 'Appointment created successfully',
      appointment: fullAppointment,
      pix: {
        code: pixCode,
        amount: depositAmount
      }
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ error: { message: 'Error creating appointment' } });
  }
});

// Get single appointment
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        { model: Service, as: 'service' },
        { model: Payment, as: 'payment' }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ error: { message: 'Appointment not found' } });
    }

    res.json({ appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: { message: 'Error fetching appointment' } });
  }
});

// Admin: List all appointments
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status;
    if (date) where.appointment_date = date;

    const offset = (page - 1) * limit;

    const { count, rows: appointments } = await Appointment.findAndCountAll({
      where,
      include: [
        { model: Service, as: 'service' },
        { model: Payment, as: 'payment' }
      ],
      order: [['appointment_date', 'DESC'], ['appointment_time', 'ASC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      appointments,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('List appointments error:', error);
    res.status(500).json({ error: { message: 'Error fetching appointments' } });
  }
});

// Admin: Confirm payment
router.patch('/:id/confirm', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [{ model: Payment, as: 'payment' }]
    });

    if (!appointment) {
      return res.status(404).json({ error: { message: 'Appointment not found' } });
    }

    // Update appointment status
    await appointment.update({ status: 'confirmed' });

    // Update payment status
    if (appointment.payment) {
      await appointment.payment.update({
        status: 'paid',
        paid_at: new Date()
      });
    }

    res.json({
      message: 'Payment confirmed successfully',
      appointment
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: { message: 'Error confirming payment' } });
  }
});

// Admin: Cancel appointment
router.patch('/:id/cancel', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [{ model: Payment, as: 'payment' }]
    });

    if (!appointment) {
      return res.status(404).json({ error: { message: 'Appointment not found' } });
    }

    await appointment.update({ status: 'cancelled' });

    if (appointment.payment) {
      await appointment.payment.update({ status: 'cancelled' });
    }

    res.json({
      message: 'Appointment cancelled successfully',
      appointment
    });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: { message: 'Error cancelling appointment' } });
  }
});

// Admin: Complete appointment
router.patch('/:id/complete', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);

    if (!appointment) {
      return res.status(404).json({ error: { message: 'Appointment not found' } });
    }

    await appointment.update({ status: 'completed' });

    res.json({
      message: 'Appointment marked as completed',
      appointment
    });
  } catch (error) {
    console.error('Complete appointment error:', error);
    res.status(500).json({ error: { message: 'Error completing appointment' } });
  }
});

module.exports = router;
