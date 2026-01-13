const express = require('express');
const { Payment, Appointment, Service } = require('../models');
const { generatePixPayload } = require('../utils/pixGenerator');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

const router = express.Router();

// Generate PIX for an appointment
router.post('/pix', async (req, res) => {
  try {
    const { appointment_id } = req.body;

    const appointment = await Appointment.findByPk(appointment_id, {
      include: [
        { model: Service, as: 'service' },
        { model: Payment, as: 'payment' }
      ]
    });

    if (!appointment) {
      return res.status(404).json({ error: { message: 'Appointment not found' } });
    }

    // If payment already exists, return it
    if (appointment.payment) {
      return res.json({
        payment: appointment.payment,
        pix: {
          code: appointment.payment.pix_code,
          amount: parseFloat(appointment.payment.amount)
        }
      });
    }

    // Calculate deposit (30%)
    const depositAmount = parseFloat(appointment.service.price) * 0.30;

    // Generate PIX code
    const pixCode = generatePixPayload(depositAmount, `Agendamento #${appointment.id}`);

    // Create payment record
    const payment = await Payment.create({
      appointment_id: appointment.id,
      amount: depositAmount,
      pix_code: pixCode,
      status: 'pending'
    });

    res.json({
      payment,
      pix: {
        code: pixCode,
        amount: depositAmount
      }
    });
  } catch (error) {
    console.error('Generate PIX error:', error);
    res.status(500).json({ error: { message: 'Error generating PIX code' } });
  }
});

// Get payment status
router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id, {
      include: [{
        model: Appointment,
        as: 'appointment',
        include: [{ model: Service, as: 'service' }]
      }]
    });

    if (!payment) {
      return res.status(404).json({ error: { message: 'Payment not found' } });
    }

    res.json({ payment });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: { message: 'Error fetching payment' } });
  }
});

// Admin: List all payments
router.get('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const where = {};
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const { count, rows: payments } = await Payment.findAndCountAll({
      where,
      include: [{
        model: Appointment,
        as: 'appointment',
        include: [{ model: Service, as: 'service' }]
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      payments,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('List payments error:', error);
    res.status(500).json({ error: { message: 'Error fetching payments' } });
  }
});

module.exports = router;
