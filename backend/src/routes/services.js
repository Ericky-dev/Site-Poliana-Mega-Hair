const express = require('express');
const { Service } = require('../models');
const authMiddleware = require('../middlewares/auth');
const adminMiddleware = require('../middlewares/admin');

const router = express.Router();

// Get all active services
router.get('/', async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { is_active: true },
      order: [['name', 'ASC']]
    });

    // Add deposit amount to each service
    const servicesWithDeposit = services.map(service => ({
      ...service.toJSON(),
      deposit_amount: service.getDepositAmount()
    }));

    res.json({ services: servicesWithDeposit });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: { message: 'Error fetching services' } });
  }
});

// Get single service
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({ error: { message: 'Service not found' } });
    }

    res.json({
      service: {
        ...service.toJSON(),
        deposit_amount: service.getDepositAmount()
      }
    });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: { message: 'Error fetching service' } });
  }
});

// Admin: Create service
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { name, description, price, duration_minutes } = req.body;

    const service = await Service.create({
      name,
      description,
      price,
      duration_minutes: duration_minutes || 60
    });

    res.status(201).json({
      message: 'Service created successfully',
      service: {
        ...service.toJSON(),
        deposit_amount: service.getDepositAmount()
      }
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: { message: 'Error creating service' } });
  }
});

// Admin: Update service
router.put('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({ error: { message: 'Service not found' } });
    }

    const { name, description, price, duration_minutes, is_active } = req.body;

    await service.update({
      name: name ?? service.name,
      description: description ?? service.description,
      price: price ?? service.price,
      duration_minutes: duration_minutes ?? service.duration_minutes,
      is_active: is_active ?? service.is_active
    });

    res.json({
      message: 'Service updated successfully',
      service: {
        ...service.toJSON(),
        deposit_amount: service.getDepositAmount()
      }
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: { message: 'Error updating service' } });
  }
});

// Admin: Delete service
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);

    if (!service) {
      return res.status(404).json({ error: { message: 'Service not found' } });
    }

    // Soft delete - just mark as inactive
    await service.update({ is_active: false });

    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: { message: 'Error deleting service' } });
  }
});

module.exports = router;
