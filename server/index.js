const express=require('express');
const { UserModel } = require('./models/user.model');
const { connection } = require('./config/db');
const { userRouter } = require('./routes/user.routes');
const { ticketRouter } = require('./routes/ticket.routes');
const { requireAuth } = require('./middleware/auth.middleware');
const { router } = require('./routes/pdf.routes');
const { invoiceRouter } = require('./routes/invoice.routes');
const app=express()
require("dotenv").config()
const port=process.env.PORT || 5000;
app.use(express.json())
app.get('/',()=>{
    console.log('Hello world and ankit also')
})


app.use("/auth",userRouter)
app.use(requireAuth)
app.use("/ticket",ticketRouter)
// app.use(requireAuth)
app.use("/invoice",invoiceRouter)
app.use("/pdf",router)

app.listen(port,async()=>{
    try {
        await connection()
        console.log(`Server is connected with Mongodb database with port ${port}`)
    } catch (error) {
        console.log(`Server is not connected to Mongodb`)
    }
    console.log(`Server is running at ${port}`)
})