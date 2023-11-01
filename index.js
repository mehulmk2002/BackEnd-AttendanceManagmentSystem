const express =require('express')
const app=express()
const dotenv = require("dotenv");
var mysql = require('mysql2');
const bodyParser=require('body-parser');
const cors=require('cors')

app.use(cors());
app.use(express.json())
app.use(bodyParser.urlencoded({extended:true}));

dotenv.config();
const AttendanceRout=require('./routes/Attendance')

const adminLoginRout=require("./routes/AdminLogin")

var con = require("./dbconnection");

app.use('/attendance',AttendanceRout)
app.use('/adminLogin',adminLoginRout)
//Database Connection
app.listen(process.env.PORT,()=>{
    console.log("Server is running on",process.env.PORT)
})