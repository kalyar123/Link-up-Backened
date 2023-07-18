const express = require("express");
const axios = require('axios');
const bodyParser = require('body-parser');

var cookieParser = require('cookie-parser');

const http = require("http");
const { Server } = require("socket.io");
const app = express();
app.use(bodyParser.json());
const server = http.createServer(app);
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
const { addUser , removeUser , getUser , getUsersInRoom } = require('./users.js');

require('dotenv').config();
const mongoose= require ('mongoose');
app.use(express.json());
const cors = require ('cors');
app.use(cors());
// mongodb+srv://adnan:sami@cluster0.nkt4tdl.mongodb.net/?retryWrites=true&w=majority
const mongoURL='mongodb+srv://adnan:sami@cluster0.nkt4tdl.mongodb.net/';
const bcrypt=require("bcryptjs");
const jwt=require('jsonwebtoken');
// const JWT_SECRET='kjsdnjajckjabnasnh23747835834873658()bsafmkjjxkexkwfkweh?[]anic84cjkrjjfexwrwk';
const socketIO = require('socket.io');
const { error } = require("console");
mongoose.connect(mongoURL,{
    useNewUrlParser: true
}).then(()=>{
    console.log("connected to database");
}).catch(e=>console.log(e))

//Model import

require('./userdetail');
require('./memberuserdetail')
require('./adminuserdetail')
require('./funddetail');
require('./message');
require('./Bloodrequest');
require('./donateblood');
require('./newmosque');
require('./maintinance');
require('./needyfund');
require('./memberfunddetail');
require('./memberneedyfund');
require('./memberbloodrequest');
require('./memberblooddonate');
require('./membernewmosque');
require('./membermaintinance');
require('./location');
require('./messageModel');
require('./chatuser');



const userde=mongoose.model('user');
const memberuser=mongoose.model('memberuser');
const adminuser=mongoose.model('adminuser');
const user=mongoose.model('fundusers')
const Message=mongoose.model('Message')
const brequest=mongoose.model('requestblood')
const bdonate=mongoose.model('blooddonate')
const mosque=mongoose.model('newmosque')
const maintinance=mongoose.model('maintinancemosque')
const needyuser=mongoose.model('needyfundusers')
const memberfund=mongoose.model('fundmembers')
const memberneedyfund=mongoose.model('memberneedyfundusers')
const memberbloodrequest=mongoose.model('memberrequestblood')
const memberblooddonate=mongoose.model('memberblooddonate')
const membernewmosque=mongoose.model('membernewmosque')
const membermaintinance=mongoose.model('membermaintinancemosque')
const location=mongoose.model('location')
const messages=mongoose.model('Messages')
const chatuser=mongoose.model('chatuser')



//Routes
app.post('/register', async (req, res) => {
  const { name, email, mosque, password, confirmpassword, phoneno } = req.body;
  if (!name || !email || !password|| !mosque || !confirmpassword || !phoneno) {
    return res.status(422).json({ error: "Please fill all the fields" });
  }

  try {
    const userExist = await userde.findOne({ email: email });
    if (userExist) {
      return res.status(422).json({ error: "Email already exists" });
    }

    if (password !== confirmpassword) {
      return res.status(422).json({ error: "Passwords do not match" });
    }

    const selectedMosque = await location.findOne({ mosquename: mosque }).select('mosquename');
    if (!selectedMosque) {
      return res.status(404).json({ error: "Mosque not found" });
    }

    const user = new userde({ name, email, mosque: selectedMosque.mosquename, password, confirmpassword, phoneno });
    await user.save();

    const token = await user.generateAuthToken();
    res.status(201).json({ message: "User registered successfully", token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});






app.get('/fetchuser', async (req, res) => {
  const { email } = req.query; // Assuming the email is passed as a query parameter

  try {
    const user = await userde.findOne({ email: email });

    console.log("User:", user);

    if (user) {
      res.json({ success: true, user: user });
    } else {
      res.json({ success: false, error: "no user found" });
    }
  } catch (error) {
    res.json({ success: false, error: error });
  }
});





app.post("/logins", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).send({ error: "invalid" });
      }
      const userlogin = await userde.findOne({ email: email });
      if (userlogin) {
        const isMatch = await bcrypt.compare(password, userlogin.password);
        const token = await userlogin.generateAuthToken();

        console.log("token", token);
        res.cookie("jwttoken", "Aqeel", {
          expires: new Date(Date.now() + 25892000000),
          httpOnly: true,
        });
        ///create a cokki4res.cokkie
        if (!isMatch) {
          res.status(422).send({ message: "user error" });
        } else {
        //   res.redirect("/user/email");

          res.send({ meassage: " wellcome user  login sucessfully" });
        
        }
      } else {
        res.status(422).send({ message: "invalid" });
      }
    } catch (err) {
      console.log(err);
    }
  });





  app.post('/member-register', async (req, res) => {
    const { name, email, mosque, accountno, password, confirmpassword, phoneno } = req.body;
    if (!name || !email || !password || !accountno || !mosque || !confirmpassword || !phoneno) {
      return res.status(422).json({ error: "Please fill all the fields" });
    }
  
    try {
      const userExist = await memberuser.findOne({ email: email });
      if (userExist) {
        return res.status(422).json({ error: "Email already exists" });
      }
  
      if (password !== confirmpassword) {
        return res.status(422).json({ error: "Passwords do not match" });
      }
  
      const selectedMosque = await location.findOne({ mosquename: mosque }).select('mosquename');
      if (!selectedMosque) {
        return res.status(404).json({ error: "Mosque not found" });
      }
  
      const user = new memberuser({ name, email, accountno, mosque: selectedMosque.mosquename, password, confirmpassword, phoneno });
      await user.save();
  
      const token = await user.generateAuthToken();
      res.status(201).json({ message: "User registered successfully", token });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Internal server error" });
    }
  });





  app.get('/member-register/mosque/:mosqueId', async (req, res) => {
    const mosqueId = req.params.mosqueId;
  
    try {
      const existingMember = await location.findOne({ mosquename: mosqueId });
      if (existingMember) {
        return res.json({ isRegistered: true });
      }
      res.json({ isRegistered: false });
    } catch (error) {
      console.log('Error occurred while checking mosque registration:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  
  
  
  
  





app.post("/member-logins", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).send({ error: "invalid" });
      }
      const user = await memberuser.findOne({ email: email });
     
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        const token = await user.generateAuthToken();

        console.log("token", token);
        res.cookie("jwttoken", "Aqeel", {
          expires: new Date(Date.now() + 25892000000),
          httpOnly: true,
        });
        ///create a cokki4res.cokkie
        if (!isMatch) {
          res.status(422).send({ message: "user error" });
        } else {
        //   res.redirect("/user/email");

          res.send({ meassage: " wellcome user  login sucessfully" , email: email});
         
        }
      } else {
        res.status(422).send({ message: "invalid" });
      }
    } catch (err) {
      console.log(err);
    }
  });







  app.post('/chat-register', async (req, res,next) => {
     try {
    const { username, email, password } = req.body;
    const usernameCheck = await chatuser.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await chatuser.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await chatuser.create({
      email,
      username,
      password: hashedPassword,
    });
    delete user.password;
    return res.json({ status: true, user });
  } catch (ex) {
    next(ex);
  }
  });






  app.post('/chat-login', async (req, res,next) => {
    try {
      const { username, password } = req.body;
      const user = await chatuser.findOne({ username });
      if (!user)
        return res.json({ msg: "Incorrect Username or Password", status: false });
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid)
        return res.json({ msg: "Incorrect Username or Password", status: false });
      delete user.password;
      return res.json({ status: true, user });
    } catch (ex) {
      next(ex);
    }
 });










  app.get("/allusers/:id", async (req, res,next) => {
    try {
      const users = await chatuser.find({ _id: { $ne: req.params.id } }).select([
        "email",
        "username",
        "_id",
      ]);
      return res.json(users);
    } catch (ex) {
      next(ex);
    }
    
  });





  app.get("/logout/:id", async (req, res,next) => {
    try {
      if (!req.params.id) return res.json({ msg: "User id is required " });
      onlineUsers.delete(req.params.id);
      return res.status(200).send();
    } catch (ex) {
      next(ex);
    }
    
  });





  app.post("/getmsg/", async (req, res,next) => {
    try {
      const { from, to } = req.body;
  
      const messagess = await messages.find({
        users: {
          $all: [from, to],
        },
      }).sort({ updatedAt: 1 });
  
      const projectedMessages = messagess.map((msg) => {
        return {
          fromSelf: msg.sender.toString() === from,
          message: msg.message.text,
        };
      });
      res.json(projectedMessages);
    } catch (ex) {
      next(ex);
    }
    
  });




  app.post("/addmsg/", async (req, res,next) => {
    try {
      const { from, to, message } = req.body;
      const data = await messages.create({
        message: { text: message },
        users: [from, to],
        sender: from,
      });
  
      if (data) return res.json({ msg: "Message added successfully." });
      else return res.json({ msg: "Failed to add message to the database" });
    } catch (ex) {
      next(ex);
    }
  });












  app.get('/member/fetchuser', async (req, res) => {
    const { email } = req.query; // Assuming the email is passed as a query parameter
  
    try {
      const user = await memberuser.findOne({ email: email });
  
      console.log("User:", user);
  
      if (user) {
        res.json({ success: true, user: user });
      } else {
        res.json({ success: false, error: "no user found" });
      }
    } catch (error) {
      res.json({ success: false, error: error });
    }
  });



  
  
  



  app.post('/admin-register', async (req, res) => {
    const { name, email, mosque,accountno, password, confirmpassword } = req.body;
    if (!name || !email || !password || !accountno || !mosque || !confirmpassword) {
        return res.status(422).json({ error: "Please fill all the fields" });
    }

    try {
        const userExist = await adminuser.findOne({ email: email });
        if (userExist) {
            return res.status(422).json({ error: "Email already exists" });
        }

        if (password !== confirmpassword) {
            return res.status(422).json({ error: "Passwords do not match" });
        }

        const user = new adminuser({ name, email, mosque,accountno, password, confirmpassword });
        await user.save();

        const token = await user.generateAuthToken();
        res.status(201).json({ message: "User registered successfully", token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Internal server error" });
    }
});



app.post("/admin-logins", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).send({ error: "invalid" });
      }
      const userlogin = await adminuser.findOne({ email: email });
      if (userlogin) {
        const isMatch = await bcrypt.compare(password, userlogin.password);
        const token = await userlogin.generateAuthToken();

        console.log("token", token);
        res.cookie("jwttoken", "Aqeel", {
          expires: new Date(Date.now() + 25892000000),
          httpOnly: true,
        });
        ///create a cokki4res.cokkie
        if (!isMatch) {
          res.status(422).send({ message: "user error" });
        } else {
        //   res.redirect("/user/email");

          res.send({ meassage: " wellcome user  login sucessfully" });
        }
      } else {
        res.status(422).send({ message: "invalid" });
      }
    } catch (err) {
      console.log(err);
    }
  });




    app.post('/fund',async(req,res)=>{
        const {name,email,mosque,date,receipt,amount,accountno,easypaisano}=req.body;
        try {
           await user.create({
            name,
            email,
            mosque,
            date,
            receipt,
            amount,
            accountno,
            easypaisano
           
           })
           res.status(201).json({ message: "succesfully"})
          
          
        } catch (error) {
            res.send({status:'error'})
        }
        console.log(user)
       
    });
    app.get('/fund/get',(req,res) =>{
        user.find((err,data)=>{
            if(err){
                res.status(500).send(err)
            }else{
                res.status(200).send(data)
            }
        })
    })


    app.post('/needyfund',async(req,res)=>{
      const {name,email,mosque,date,receipt,amount,accountno,easypaisano}=req.body;
      try {
         await needyuser.create({
          name,
          email,
          mosque,
          date,
          receipt,
          amount,
          accountno,
          easypaisano
         
         })
         res.status(201).json({ message: "succesfully"})
        
        
      } catch (error) {
          res.send({status:'error'})
      }
      console.log(needyuser)
     
  });
  app.get('/needyfund/get',(req,res) =>{
    needyuser.find((err,data)=>{
          if(err){
              res.status(500).send(err)
          }else{
              res.status(200).send(data)
          }
      })
  })

  // For member


   app.post('/member/fund',async(req,res)=>{
        const {name,email,mosque,date,receipt,amount,accountno,easypaisano}=req.body;
        try {
           await memberfund.create({
            name,
            email,
            mosque,
            date,
            receipt,
            amount,
            accountno,
            easypaisano
           
           })
           res.status(201).json({ message: "succesfully"})
          
          
        } catch (error) {
            res.send({status:'error'})
        }
       
       
    });
    app.get('/member/fund/get',(req,res) =>{
      memberfund.find((err,data)=>{
            if(err){
                res.status(500).send(err)
            }else{
                res.status(200).send(data)
            }
        })
    })




    app.post('/member/needyfund',async(req,res)=>{
      const {name,email,mosque,date,receipt,amount,accountno,easypaisano}=req.body;
      try {
         await memberneedyfund.create({
          name,
          email,
          mosque,
          date,
          receipt,
          amount,
          accountno,
          easypaisano
         
         })
         res.status(201).json({ message: "succesfully"})
        
        
      } catch (error) {
          res.send({status:'error'})
      }
    
     
  });
  app.get('/member/needyfund/get',(req,res) =>{
    memberneedyfund.find((err,data)=>{
          if(err){
              res.status(500).send(err)
          }else{
              res.status(200).send(data)
          }
      })
  })







    app.post('/member/blood-request',async(req,res)=>{
        const {name,mosque,age,phoneno,blood,unit,email}=req.body;
        try {
           await memberbloodrequest.create({
            name,
            mosque,
            unit,
            phoneno,
            age,
            blood,
            email
            
           })
           res.status(201).json({ message: "succesfully"})
        } catch (error) {
            res.send({status:'error'})
        }
       
       
    });

    app.get('/member/blood-request/get',(req,res) =>{
      memberbloodrequest.find((err,data)=>{
            if(err){
                res.status(500).send(err)
            }else{
                res.status(200).send(data)
            }
        })
    })


    

    app.delete("/member/blood-request/get/:id", async (req, res) => {
     console.log(req.params.id);
     const deletedRecord = await memberbloodrequest.findByIdAndDelete({_id:req.params.id});
     res.send(deletedRecord);
        
      })

// for user


app.post('/blood-request',async(req,res)=>{
  const {name,mosque,age,phoneno,blood,unit,email}=req.body;
  try {
     await brequest.create({
      name,
      mosque,
      unit,
      phoneno,
      age,
      blood,
      email
      
     })
     res.status(201).json({ message: "succesfully"})
  } catch (error) {
      res.send({status:'error'})
  }
  console.log(brequest);
 
});

app.get('/blood-request/get',(req,res) =>{
  brequest.find((err,data)=>{
      if(err){
          res.status(500).send(err)
      }else{
          res.status(200).send(data)
      }
  })
})




app.delete("/blood-request/get/:id", async (req, res) => {
console.log(req.params.id);
const deletedRecord = await brequest.findByIdAndDelete({_id:req.params.id});
res.send(deletedRecord);
  
})


   
    
    
      
    
    
    


    app.post('/blood-donate',async(req,res)=>{
        const {name,mosque,disease,age,phoneno,unit,blood,email}=req.body;
        try {
           await bdonate.create({
            name,
            mosque,
            disease,
            age,
            phoneno,
            unit,
            blood,
            email
            
           })
           res.status(201).json({ message: "succesfully"})
        } catch (error) {
            res.send({status:'error'})
        }
        console.log(bdonate);
       
    });

    app.get('/blood-donate/get',(req,res) =>{
        bdonate.find((err,data)=>{
            if(err){
                res.status(500).send(err)
            }else{
                res.status(200).send(data)
            }
        })
    })


    app.delete("/blood-donate/get/:id", async (req, res) => {
      console.log(req.params.id);
      const deletedRecord = await brequest.findByIdAndDelete({_id:req.params.id});
      res.send(deletedRecord);
         
       })


      //  for member



      app.post('/member/blood-donate',async(req,res)=>{
        const {name,mosque,disease,age,phoneno,unit,blood,email}=req.body;
        try {
           await memberblooddonate.create({
            name,
            mosque,
            disease,
            age,
            phoneno,
            unit,
            blood,
            email
            
           })
           res.status(201).json({ message: "succesfully"})
        } catch (error) {
            res.send({status:'error'})
        }
        
       
    });

    app.get('/member/blood-donate/get',(req,res) =>{
      memberblooddonate.find((err,data)=>{
            if(err){
                res.status(500).send(err)
            }else{
                res.status(200).send(data)
            }
        })
    })


    app.delete("/member/blood-donate/get/:id", async (req, res) => {
      console.log(req.params.id);
      const deletedRecord = await memberblooddonate.findByIdAndDelete({_id:req.params.id});
      res.send(deletedRecord);
         
       })





    app.post('/newmosque',async(req,res)=>{
        const {name,phoneno,date,amount,reason,email}=req.body;
        try {
           await mosque.create({
            name,
            date,
            phoneno,
            amount,
            reason,
            email
            
           })
           res.status(201).json({ message: "succesfully"})
        } catch (error) {
            res.send({status:'error'})
        }
        console.log(mosque);
       
    });

    app.get('/newmosque/get',(req,res) =>{
        mosque.find((err,data)=>{
            if(err){
                res.status(500).send(err)
            }else{
                res.status(200).send(data)
            }
        })
    })



    app.post('/maintinance',async(req,res)=>{
        const {name,phoneno,date,amount,reason,email}=req.body;
        try {
           await maintinance.create({
            name,
            date,
            phoneno,
            amount,
            reason,
            email
            
           })
           res.status(201).json({ message: "succesfully"})
        } catch (error) {
            res.send({status:'error'})
        }
        console.log(maintinance);
       
    });

    app.get('/maintinance/get',(req,res) =>{
        maintinance.find((err,data)=>{
            if(err){
                res.status(500).send(err)
            }else{
                res.status(200).send(data)
            }
        })
    })




    // for member


    app.post('/member/newmosque',async(req,res)=>{
      const {name,phoneno,date,amount,reason,email}=req.body;
      try {
         await membernewmosque.create({
          name,
          date,
          phoneno,
          amount,
          reason,
          email
          
         })
         res.status(201).json({ message: "succesfully"})
      } catch (error) {
          res.send({status:'error'})
      }
      
     
  });

  app.get('/member/newmosque/get',(req,res) =>{
    membernewmosque.find((err,data)=>{
          if(err){
              res.status(500).send(err)
          }else{
              res.status(200).send(data)
          }
      })
  })



  app.post('/member/maintinance',async(req,res)=>{
      const {name,phoneno,date,amount,reason,email}=req.body;
      try {
         await membermaintinance.create({
          name,
          date,
          phoneno,
          amount,
          reason,
          email
          
         })
         res.status(201).json({ message: "succesfully"})
      } catch (error) {
          res.send({status:'error'})
      }
      
     
  });

  app.get('/member/maintinance/get',(req,res) =>{
    membermaintinance.find((err,data)=>{
          if(err){
              res.status(500).send(err)
          }else{
              res.status(200).send(data)
          }
      })
  })


    

    
    
   


//     const io = new Server(server, {
//         cors: {
//           origin: "*",
//           methods: ["GET", "POST"],
//         },
//       });
      
   

// let xyz ;
//     io.on('connect', (socket) => {
//         socket.on('join', ({ name, room }, callback) => {
//           const { error, user } = addUser({ id: socket.id, name, room });
      
//           if(error) return callback(error);
      
//           socket.join(user.room);
//           xyz=user.room;
//           console.log("adnan",xyz);
//       console.log("name",user.name);
//           socket.emit('message', { user: 'admin', text: `${user.name}, welcome to room ${user.room}.`});

//           socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined!` });
//           socket.to(socket.id).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });
      
//           callback();
//         });
      
//         socket.on('sendMessage', (message, callback) => {
//           io.to(xyz).emit('message', { user: user.name, text: message });
      
//           callback();
//         });
      
//         socket.on('disconnect', () => {
//           const user = removeUser(socket.id);
      
//           if(user) {
//             io.to(user.room).emit('message', { user: 'Admin', text: `${user.name} has left.` });
//             io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
//           }
//         })
//       });







    const io = new Server(server, {
        cors: {
          origin: "*",
          methods: ["GET", "POST"],
        },
      });

        global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});












      
      




      




      app.post('/api/quran/paraNumber', async (req, res) => {
        try {
          const config = {
            method: 'get',
            url: 'https://api.quran.com/api/v4/quran/verses/uthmani_simple',
            headers: {}
          };
          
          const response = await axios.request(config);
          console.log(response.data);
      
          res.json(response.data);
        } catch (error) {
          console.log(error);
          res.json({ error: 'An error occurred' });
        }
      });





      
    




app.get('/api/prayer-timings/:year/:month', async (req, res) => {
  const { year, month,address } = req.params;
  // const city = 'sargodha'; // Replace with the desired city name

  try {
    // Make an HTTP GET request to the Aladhan API
    const response = await axios.get(`http://api.aladhan.com/v1/calendarByCity/${year}/${month}?city=${address}}&method=2`);
    const data = response.data.data;
    const prayerTimings = data.map(day => ({
      date: day.date.readable,
      fajr: day.timings.Fajr,
      sunrise: day.timings.Sunrise,
      dhuhr: day.timings.Dhuhr,
      asr: day.timings.Asr,
      maghrib: day.timings.Maghrib,
      isha: day.timings.Isha,
    }));

    res.json(prayerTimings);
  } catch (error) {
    console.error('Error fetching prayer timings:', error);
    res.status(500).json({ error: 'Failed to fetch prayer timings' });
  }
});



    





app.post('/location',async(req,res)=>{
  const {mosquename,longitude,latitude}=req.body;
  try {
     await location.create({
      mosquename,longitude,latitude
      
     })
     res.status(201).json({ message: "succesfully"})
  } catch (error) {
      res.send({status:'error'})
  }
 
});

app.get('/location/get',(req,res) =>{
  location.find((err,data)=>{
      if(err){
          res.status(500).send(err)
      }else{
          res.status(200).send(data)
      }
  })
})





      
    
      
  
    
//Server

server.listen(9000,()=>{
    console.log("Server started");
});



