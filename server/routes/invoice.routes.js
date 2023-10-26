const express=require("express")
const invoiceRouter=express.Router()
const jwt=require("jsonwebtoken");
const { InvoiceModel } = require("../models/invoice.model");
// Route to retrieve and display invoices
invoiceRouter.get('/my-invoices', async (req, res) => {
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
      const userId = decoded.userId; // The user ID from the JWT token
      
      // Find all invoices related to the user's booked tickets
      const invoices = await InvoiceModel.find({userId}).populate('ticketId');
      
      res.status(200).json({ msg: 'User invoices retrieved successfully', data: invoices });
    } catch (error) {
      res.status(500).json({ msg: 'Failed to retrieve user invoices', error: error.message });
    }
}
  });

  module.exports={
    invoiceRouter
  }
  