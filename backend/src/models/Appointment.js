const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  service_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  client_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  client_phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  client_email: {
    type: DataTypes.STRING(255),
    validate: {
      isEmail: true
    }
  },
  appointment_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  appointment_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
    defaultValue: 'pending'
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'appointments'
});

module.exports = Appointment;
