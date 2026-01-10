const mongoose = require('mongoose');

const appointmentServiceSchema = new mongoose.Schema({
  service_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  price_at_time: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: false });

const appointmentSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  appointment_date: {
    type: Date,
    required: true,
  },
  duration_minutes: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled',
  },
  services: [appointmentServiceSchema],
  notes: {
    type: String,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance
appointmentSchema.index({ customer_id: 1 });
appointmentSchema.index({ appointment_date: 1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
