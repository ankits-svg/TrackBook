const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  passengerName: { type: String, required: true },
  
  
}, {
  timestamps: true,
  versionKey: false
});

const InvoiceModel = mongoose.model('invoice', invoiceSchema);

module.exports = {
  InvoiceModel
};
