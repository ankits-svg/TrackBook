const express=require('express');
const { UserModel } = require('../models/user.model');
const bcrypt = require('bcrypt');
const saltRounds = 3;
const userRouter=express.Router();
const jwt = require('jsonwebtoken');
//Register
userRouter.post("/register",async(req,res)=>{
    const {first,last,email,password,place,age}=req.body;
    // console.log(req.body)
    try {
        const existing=await UserModel.findOne({email:email})
        if (existing) {
            res.status(400).send({ "msg": "User with this email already exists" });
        }
        else{
            bcrypt.hash(password, saltRounds, async(err, hash)=>{
                // Store hash in your password DB.
                const user=new UserModel({first:first,last:last,email:email,password:hash,place:place,age:age})
                await user.save()
                res.status(200).send({"msg":"Register Successfully!!","data":req.body})
            });
        }
        
    } catch (error) {
        res.status(400).send({'msg':error.message})
    }
})

//Login
userRouter.post("/login",async(req,res)=>{
    const {email,password}=req.body;
    try {
        const user=await UserModel.findOne({email:email})
        if(user){
            console.log("user:",user)
            bcrypt.compare(password, user.password, async(err, result)=>{
                // result == true
                if(result){
                    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
                        expiresIn: '1h', // Token expiration time
                      });
                    res.status(200).send({"msg":"Login Successfully!!","data":user,'token':token})
                }else{
                    res.status(401).send({"msg":'Wrong Password!'})
                }
            });
            
        }else{
            res.status(404).send({"msg":'User not found'})
        }
    } catch (error) {
        res.status(400).send({msg: 'Login error', error: error.message})
    }
})

module.exports={
    userRouter
}