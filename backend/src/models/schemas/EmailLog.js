const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  recipient_email: {
    type: String,
    required: true,
  },
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
  },
  appointment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  email_type: {
    type: String,
    required: true,
    enum: ['confirmation', 'reminder', 'invoice', 'other'],
  },
  subject: {
    type: String,
  },
  sent_at: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['sent', 'failed'],
    default: 'sent',
  },
  error_message: {
    type: String,
  },
}, {
  timestamps: false,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for queries
emailLogSchema.index({ customer_id: 1 });
emailLogSchema.index({ appointment_id: 1 });
emailLogSchema.index({ sent_at: 1 });

const EmailLog = mongoose.model('EmailLog', emailLogSchema);

module.exports = EmailLog;
