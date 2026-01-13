const User = require('./User');
const Service = require('./Service');
const Appointment = require('./Appointment');
const Payment = require('./Payment');
const BusinessHours = require('./BusinessHours');

// Define associations
User.hasMany(Appointment, { foreignKey: 'user_id', as: 'appointments' });
Appointment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Service.hasMany(Appointment, { foreignKey: 'service_id', as: 'appointments' });
Appointment.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });

Appointment.hasOne(Payment, { foreignKey: 'appointment_id', as: 'payment' });
Payment.belongsTo(Appointment, { foreignKey: 'appointment_id', as: 'appointment' });

module.exports = {
  User,
  Service,
  Appointment,
  Payment,
  BusinessHours
};
