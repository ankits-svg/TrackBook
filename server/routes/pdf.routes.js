const express = require("express");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const { TicketModel } = require("../models/ticket.model");
const router = express.Router();

// Route to generate a PDF invoice
router.get("/generate-invoice/:ticketId", async (req, res) => {
  try {
    const ticketId = req.params.ticketId;

    const ticketData = await TicketModel.findById(ticketId);

    if (!ticketData) {
      return res.status(404).json({ error: "Ticket not found" });
    }
    // Create a new PDF document
    const doc = new PDFDocument();

    // Pipe the PDF to a writable stream
    const pdfStream = fs.createWriteStream("invoice.pdf");
    doc.pipe(pdfStream);

    // PDF content and formatting
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor("blue")
      .text("\nInvoice for Ticket Booking", { align: "center" })
      .moveDown(2);
    doc
      .fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("green")
      .text("Passenger Name:", { continued: true })
      .font("Helvetica")
      .fillColor("black")
      .text(` ${ticketData.first} ${ticketData.last}`);
    doc
      .font("Helvetica-Bold")
      .fillColor("green")
      .text("Source Station:", { continued: true })
      .font("Helvetica")
      .fillColor("black")
      .text(` ${ticketData.sourceStation}`);
    doc
      .font("Helvetica-Bold")
      .fillColor("green")
      .text("Destination Station:", { continued: true })
      .font("Helvetica")
      .fillColor("black")
      .text(` ${ticketData.destinationStation}`);
    doc
      .font("Helvetica-Bold")
      .fillColor("green")
      .text("Price:", { continued: true })
      .font("Helvetica")
      .fillColor("black")
      .text(` $${ticketData.price.toFixed(2)}`);
    doc
      .font("Helvetica-Bold")
      .fillColor("green")
      .text("Tax:", { continued: true })
      .font("Helvetica")
      .fillColor("black")
      .text(` $${ticketData.tax.toFixed(2)}`);
    doc
      .font("Helvetica-Bold")
      .fillColor("green")
      .text("Seat Information:", { continued: true })
      .font("Helvetica")
      .fillColor("black")
      .text(
        ` Boogie ${ticketData.seat.boogie}, Seat ${ticketData.seat.seatNumber}`
      );
    doc
      .font("Helvetica-Bold")
      .fillColor("green")
      .text("Berth:", { continued: true })
      .font("Helvetica")
      .fillColor("black")
      .text(` ${ticketData.berth}`);
    doc
      .font("Helvetica-Bold")
      .fillColor("green")
      .text("Distance:", { continued: true })
      .font("Helvetica")
      .fillColor("black")
      .text(` ${ticketData.distance} km`);

    // Border design
    doc.lineWidth(2);
    doc.rect(50, 80, 500, 240).stroke();
    doc.lineWidth(1);
    // doc.rect(50, 80, 500, 20).fill("yellow");
    doc.rect(50, 300, 500, 20).fill("yellow");

    // Center the content
    const textWidth = doc.widthOfString("Invoice for Ticket Booking");
    doc.x = 300 - textWidth / 2;

    // Create a line to separate title and content
    doc.moveTo(50, 110).lineTo(550, 110).stroke();

    // End the PDF document
    doc.end();

    // Send the generated PDF to the client
    pdfStream.on("finish", () => {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=invoice.pdf");
      const file = fs.createReadStream("invoice.pdf");
      file.pipe(res);
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({ error: "Failed to generate the PDF invoice" });
  }
});

module.exports = { router };
