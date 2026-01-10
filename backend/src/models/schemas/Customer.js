const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
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
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    trim: true,
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
customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ first_name: 1, last_name: 1 });

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
