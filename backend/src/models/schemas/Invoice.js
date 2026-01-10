const mongoose = require('mongoose');

const invoiceLineItemSchema = new mongoose.Schema({
  service_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
  },
  description: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  unit_price: {
    type: Number,
    required: true,
    min: 0,
  },
  total_price: {
    type: Number,
    required: true,
    min: 0,
  },
}, { _id: true });

const invoiceSchema = new mongoose.Schema({
  invoice_number: {
    type: String,
    required: true,
    unique: true,
  },
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  appointment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  issue_date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  due_date: {
    type: Date,
  },
  line_items: [invoiceLineItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  tax: {
    type: Number,
    default: 0,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
  payment_status: {
    type: String,
    enum: ['unpaid', 'paid', 'partially_paid'],
    default: 'unpaid',
  },
  paid_amount: {
    type: Number,
    default: 0,
    min: 0,
  },
  payment_date: {
    type: Date,
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

// Indexes for performance
invoiceSchema.index({ customer_id: 1 });
invoiceSchema.index({ payment_status: 1 });
invoiceSchema.index({ issue_date: 1 });
invoiceSchema.index({ invoice_number: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
