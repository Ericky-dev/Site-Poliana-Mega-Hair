const express = require('express');
const { Op } = require('sequelize');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

const router = express.Router();

// Apply auth and admin middleware to all routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Export emails - GET /api/admin/emails/export
router.get('/emails/export', async (req, res) => {
  try {
    const { format = 'json', source = 'all' } = req.query;

    let emails = [];

    if (source === 'users' || source === 'all') {
      const users = await User.findAll({
        where: {
          email: { [Op.ne]: null },
          role: 'client'
        },
        attributes: ['name', 'email', 'phone', 'created_at']
      });
      emails = emails.concat(users.map(u => ({
        name: u.name,
        email: u.email,
        phone: u.phone,
        source: 'registered_user',
        date: u.created_at
      })));
    }

    if (source === 'appointments' || source === 'all') {
      const appointments = await Appointment.findAll({
        where: {
          client_email: { [Op.ne]: null }
        },
        attributes: ['client_name', 'client_email', 'client_phone', 'created_at'],
        group: ['client_email']
      });

      const existingEmails = new Set(emails.map(e => e.email.toLowerCase()));

      appointments.forEach(a => {
        if (a.client_email && !existingEmails.has(a.client_email.toLowerCase())) {
          emails.push({
            name: a.client_name,
            email: a.client_email,
            phone: a.client_phone,
            source: 'appointment',
            date: a.created_at
          });
          existingEmails.add(a.client_email.toLowerCase());
        }
      });
    }

    // Remove duplicates by email
    const uniqueEmails = [...new Map(emails.map(e => [e.email.toLowerCase(), e])).values()];

    if (format === 'csv') {
      const csvHeader = 'Nome,Email,Telefone,Origem,Data\n';
      const csvData = uniqueEmails.map(e =>
        `"${e.name}","${e.email}","${e.phone || ''}","${e.source}","${e.date}"`
      ).join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=emails_poliana_megahair.csv');
      return res.send(csvHeader + csvData);
    }

    res.json({
      total: uniqueEmails.length,
      emails: uniqueEmails
    });
  } catch (error) {
    console.error('Export emails error:', error);
    res.status(500).json({ error: { message: 'Erro ao exportar emails' } });
  }
});

// Get email statistics
router.get('/emails/stats', async (req, res) => {
  try {
    const totalUsers = await User.count({
      where: {
        email: { [Op.ne]: null },
        role: 'client'
      }
    });

    const totalAppointmentEmails = await Appointment.count({
      where: {
        client_email: { [Op.ne]: null }
      },
      distinct: true,
      col: 'client_email'
    });

    res.json({
      registered_users: totalUsers,
      appointment_emails: totalAppointmentEmails,
      estimated_total: totalUsers + totalAppointmentEmails
    });
  } catch (error) {
    console.error('Email stats error:', error);
    res.status(500).json({ error: { message: 'Erro ao obter estatísticas' } });
  }
});

module.exports = router;
