const mongoose=require('mongoose')

const ticketSchema=mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sourceStation: { type: String, required: true },
    destinationStation: { type: String, required: true },
    distance: { type: Number, required: true },
    price: { type: Number, required: true },
    tax: { type: Number, required: true },
    isCancelled: { type: Boolean, default: false },
  berth: {
    type: String, // Store the berth information as a string ('Lower', 'Middle', 'Side', etc.)
    required: true,
  },
  seat: {
    boogie: {
      type: String,
      required: true,
    },
    seatNumber: {
      type: Number,
      required: true,
    },
  },
  // Add user information fields
  first: String,
  last: String,
  email: String,
},{
    timestamps: true,
    versionKey:false
})

const TicketModel=mongoose.model('ticket',ticketSchema)

module.exports={
    TicketModel
}