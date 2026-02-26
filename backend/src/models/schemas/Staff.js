const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
    trim: true,
  },
  last_name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ['stylist', 'manager', 'receptionist', 'other'],
    default: 'stylist',
  },
  specialties: {
    type: [String],
    default: [],
  },
  hire_date: {
    type: Date,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  notes: {
    type: String,
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

// Indexes for faster searches
staffSchema.index({ email: 1 });
staffSchema.index({ phone: 1 });
staffSchema.index({ first_name: 1, last_name: 1 });
staffSchema.index({ is_active: 1 });
staffSchema.index({ role: 1 });

const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;
