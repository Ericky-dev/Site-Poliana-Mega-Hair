const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BusinessHours = sequelize.define('BusinessHours', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  day_of_week: {
    type: DataTypes.TINYINT,
    allowNull: false,
    unique: true,
    validate: {
      min: 0,
      max: 6
    }
  },
  open_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  close_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  is_open: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'business_hours',
  timestamps: false
});

// Helper to get day name
BusinessHours.getDayName = function(dayOfWeek) {
  const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return days[dayOfWeek];
};

module.exports = BusinessHours;
