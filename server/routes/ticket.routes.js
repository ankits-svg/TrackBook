const express=require('express')
const ticketRouter=express.Router()
require("dotenv").config()
const jwt=require("jsonwebtoken")
const { TicketModel } = require('../models/ticket.model')
const { InvoiceModel } = require('../models/invoice.model')


  
const availableBoogies = [
    { name: 'A-1', seats: [] },
    { name: 'A-2', seats: [] },
    { name: 'B-1', seats: [] },
    { name: 'B-2', seats: [] },
    { name: 'C-1', seats: [] },
    { name: 'C-2', seats: [] },
  ];

  function calculateBerth(seatNumber) {
    if (seatNumber === 1 || seatNumber === 2) {
      return 'Lower';
    } else if (seatNumber === 3 || seatNumber === 4) {
      return 'Middle';
    } else if (seatNumber === 5 || seatNumber === 6) {
      return 'Side';
    }else if (seatNumber === 7 || seatNumber === 8) {
        return 'Upper';
      } else {
      return 'Unknown'; // Handle cases where seat numbers are not 1 to 6
    }
  }
  
  function getAvailableSeat(boogie) {
    const maxSeatsPerBoogie = 8;
  
    if (boogie.seats.length >= maxSeatsPerBoogie) {
      // If all seats are booked in this boogie, move to the next one
      const nextBoogieIndex = availableBoogies.findIndex((b) => b.name === boogie.name) + 1;
      if (nextBoogieIndex >= availableBoogies.length) {
        // All boogies are full
        return null;
      }
      return getAvailableSeat(availableBoogies[nextBoogieIndex]);
    }
  
    let seatNumber;
    let seatFound = false;
  
    while (!seatFound) {
      seatNumber = Math.floor(Math.random() * maxSeatsPerBoogie) + 1;
      if (!boogie.seats.includes(seatNumber)) {
        seatFound = true;
      }
    }
  
    boogie.seats.push(seatNumber);
  
    return {
      boogie: boogie.name,
      seatNumber: seatNumber,
      berth: calculateBerth(seatNumber), // Implement your berth logic here
    };
  }

// Route to book a ticket
ticketRouter.post('/book', async (req, res) => {
    if(!req.headers.authorization){
        res.status(401).send({"msg":"Please login first or may be token is not present"})
    }
    else{
        const token=req.headers.authorization
    console.log("token:",token)
    // console.log("req.user:",req.user)
    const decoded=jwt.verify(token,process.env.JWT_SECRET)
    console.log("decodedIn_Book:",decoded)
    try {
        let availableSeat = null;
    let boogieIndex = 0;

    while (!availableSeat && boogieIndex < availableBoogies.length) {
      availableSeat = getAvailableSeat(availableBoogies[boogieIndex]);
      boogieIndex++;
    }
      // Extract relevant data from the request
      const { first,last,email,sourceStation, destinationStation,berth } = req.body;
      const userId = decoded.userId; // The user ID from the JWT token
        console.log("userId:",userId)
        
      // Perform distance calculation and price logic as needed
      const distance = calculateDistance(sourceStation, destinationStation);
      const price = calculatePrice(distance);
      const tax = calculateTax(distance);
  
      // Create a new ticket
      const newTicket = new TicketModel({
        userId,
        first,
        last,
        email,
        sourceStation,
        destinationStation,
        distance,
        price,
        tax,
      });
      
      if (availableSeat) {
        newTicket.seat = availableSeat;
        newTicket.berth = berth;
        await newTicket.save();
            // Generate an invoice for the booking
            const invoice = new InvoiceModel({
                ticketId: newTicket._id,
                passengerName: `${newTicket.first}${newTicket.last}`,
                passenger_booking_mailId:newTicket.email, // Replace with the actual passenger name
                Source_Station:newTicket.sourceStation,// Add other invoice-related fields
                Destination_Station:newTicket.destinationStation,
                Distance:newTicket.distance,
                Price:newTicket.price,
                Tax:newTicket.tax
            });

            await invoice.save();
        res.status(201).json({ msg: 'Ticket booked successfully', data: {newTicket,date: new Date()}, invoice });
      } else {
        res.status(400).json({ msg: 'No available seats' });
      }
    //   // Save the ticket in the database
    //   await newTicket.save();
  
    //   res.status(201).json({ msg: 'Ticket booked successfully', data: newTicket });
    } catch (error) {
      res.status(500).json({ msg: 'Ticket booking failed', error: error.message });
    }
    }
  });

// Route to cancel a ticket
ticketRouter.post('/cancel/:ticketId', async (req, res) => {
    if(!req.headers.authorization){
        res.status(401).send({"msg":"Please login first or may be token is not present"})
    }
    else{
        const token=req.headers.authorization
    console.log("token:",token)
    // console.log("req.user:",req.user)
    const decoded=jwt.verify(token,process.env.JWT_SECRET)
    console.log("decodedIn_Book:",decoded)
    
    try {
      const ticketId = req.params.ticketId;
      const userId = decoded.userId; // The user ID from the JWT token
  
      // Check if the ticket exists and belongs to the logged-in user
      const ticket = await TicketModel.findOne({ _id: ticketId, userId });
        console.log("ticket:",ticket)
      if (!ticket) {
        return res.status(404).json({ msg: 'Ticket not found or not authorized to cancel' });
      }
  
      // Mark the ticket as cancelled
      ticket.isCancelled = true;
      await ticket.save();
  
      // Calculate and return the refunded amount
      const refundedAmount = calculateRefund(ticket.price, ticket.tax);
  
      res.status(200).json({ msg: 'Ticket canceled successfully', refundedAmount,berth: ticket.berth });
    } catch (error) {
      res.status(500).json({ msg: 'Ticket cancellation failed', error: error.message });
    }
}
  });


ticketRouter.get("/mytickets",async(req,res)=>{
    if(!req.headers.authorization){
        res.status(401).send({"msg":"Please login first or may be token is not present"})
    }
    else{
        const token=req.headers.authorization
    console.log("token:",token)
    // console.log("req.user:",req.user)
    const decoded=jwt.verify(token,process.env.JWT_SECRET)
    console.log("decodedIn_Book:",decoded)
    if(!token){
        console.log("msg:","please login first!!!")
        res.status(400).send({"msg":"please login first!!!"})
    }
    else{
        
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        console.log("decoded:",decoded)
        try {
            if(decoded.userId){
                const ticket=await TicketModel.find({userId:decoded.userId, isCancelled: false})
                res.status(200).send({"msg":'User tickets retrieved successfully',"data":ticket})
            }else{
                res.status(400).send({"msg":'Not retrieve', error: error.message})
            }
        } catch (error) {
            res.status(401).send({"msg":'Failed to retrieve user tickets', error: error.message})
        }
    }
} 
})

//seat availablity
// ticketRouter.get('/seats-availability', (req, res) => {
//     // Return the seat availability data as JSON
//     res.status(200).json({"msg":"seat availability"});
//   });
  

module.exports={
    ticketRouter
}

// Helper functions for calculations
function calculateDistance(sourceStation, destinationStation) {
    // Your distance calculation logic here
    // For demonstration purposes, we'll assume a fixed distance of 100 miles for this example.
    const distance = 100;
    return distance;
  }
  
  function calculatePrice(distance) {
    // Your price calculation logic here
    // For this example, we'll assume a fixed price per mile, e.g., $0.10 per mile.
    const price = distance * 0.10;
    return price;
  }
  
  function calculateTax(distance) {
    // Your tax calculation logic here
    // For this example, we'll assume a fixed tax rate of 5%.
    const taxRate = 0.05;
    const tax = calculatePrice(distance) * taxRate;
    return tax;
  }
  
  function calculateRefund(price, tax) {
    // Your refund calculation logic here
    // For this example, we'll assume a refund of 80% of the ticket price, excluding tax.
    const refundPercentage = 0.80;
    const refundAmount = (price - tax) * refundPercentage;
    return refundAmount;
  }
  