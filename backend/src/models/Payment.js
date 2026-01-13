const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  appointment_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  pix_code: {
    type: DataTypes.TEXT
  },
  pix_qrcode: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'cancelled', 'refunded'),
    defaultValue: 'pending'
  },
  paid_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'payments'
});

module.exports = Payment;
