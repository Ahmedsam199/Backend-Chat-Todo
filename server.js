const jwt_decode = require("jwt-decode");
require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const app = express();
const db = require("./models");
const PORT = process.env.PORT || 8000;
const http = require("http");
const { Server } = require("socket.io");
const fs =require ('fs')
const { Op } = require("sequelize");
const cors = require("cors");
var admin = require("firebase-admin");
const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use("/Images", express.static("./Images"));
var serviceAccount = require("./react-acfd3-firebase-adminsdk-w27jk-dec66583a8.json");
let Users = [];
const server = http.createServer(app);
if (process.env.NODE_ENV==="production"){
  app.use(express.static("build"));
  app.get('*',(req,res)=>{
    req.sendFile(path.resolve(__dirname,"build","index.html"))
  })
}
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

app.use(cors()); // Use this after the variable declaration
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const apiRoutes = require("./routes/apiRoutes");
const res = require("express/lib/response");
const { default: axios } = require("axios");
app.use("/api", apiRoutes);
app.post("/test", (req, res) => {
  var token = req.headers["authorization"];
  var decoded = jwt_decode(token);

  res.send(decoded);
  res.end();
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  const user = { name: username };
  let payload = { id: req.body.id, name: username };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET);
  res.json({ accessToken: accessToken });
});
app.post("/loginAdmin", (req, res) => {
  db.User2.findAll({
    where: {
      name: req.body.User,
    },
  }).then((resp) => {
    let payload = { id: resp[0].id, name: resp[0].name };

    const accessToken = jwt.sign(payload, "process.env.ACCESS_TOKEN_SECRET");
    res.send({ accessToken: accessToken, resp: resp });
  }).catch((err)=>{
    console.log(err);
  });
});

app.get("/all", (req, res) => {
  var token = req.headers["authorization"];
  var decoded = jwt_decode(token);

  db.Todo.findAll({
    where: {
      UserID: decoded.id,
    },
    attributes: ["id", "task", "Body"],
  }).then((todo) => res.send(todo));
});
app.get("/allc", (req, res) => {
  var token = req.headers["authorization"];
  var decoded = jwt_decode(token);

  db.Ctask.findAll({
    where: {
      UserID: decoded.id,
    },
    attributes: ["id", "task"],
  }).then((Ctask) => res.send(Ctask));
});

// Add new User To the Group + Is he Admin?
app.post("/newGuser", (req, res) => {
  db.User2.create({
    name: req.body.User,
    isAdmin: req.body.isAdmin,
    firebase_Token: req.body.fire_Token,
  }).then((submitedUser) => res.send(submitedUser));
});
// Here Only Admin Can Create Group
app.post("/createnewg", (req, res) => {
  db.User2.findAll({
    where: {
      name: req.body.User,
      isAdmin: true,
    },
  }).then((res1) => {
    if (!res1.length == []) {
      db.Groups.create({
        GroupName: req.body.gname,
      }).then((res1) => res.send(res1));
    } else {
      res.status(406).send("This User Is not Belong Here AS a Admin");
    }
  });
});
//Admin Will Add User To The Group
app.post("/AddUserToG", (req, res) => {
  try {
    req.body.data.forEach((x) => {
      db.UserGroup.create({
        GroupId: req.body.Gid,
        User2Id: x,
      });
    });
    res.send("Done");
  } catch (error) {
    res.status(400).send("User Not Found Or Already exist");
  }
});
//Get All The Users
app.get("/GetAllUseres", (req, res) => {
  db.User2.findAll().then((Users) => res.send(Users));
});

// Get All The Names Of The Groups
app.post("/GetAllGnames", (req, res) => {
  let data = [];
  var token = req.headers["authorization"];
  var decoded = jwt_decode(token);


  db.UserGroup.findAll({
    where: {
      User2Id: decoded.id,
    },
  }).then((Group) => {
    Group.forEach((x) => {
      data.push(x.GroupId);
    });
    db.Groups.findAll({
      where: {
        id: data,
      },
    }).then((resp) => {
      res.send(resp);
    });
  });
});
//
app.post("/GetAllUnames", (req, res) => {
 
 
let data=[]

  db.UserGroup.findAll({
    where: {
      GroupId: req.body.room,
    },
  }).then((Group) => {
    Group.forEach((x) => {
      data.push(x.User2Id);
    });
    db.User2.findAll({
      raw:true,
      where: {
        id: data,
      },
    }).then((resp) => {
      res.send(resp);
    });
  });
});

app.post("/PostMessage", (req, res) => {
  let data = [];
  name=req.body.Name
  db.msgs
    .create({
      message: req.body.msg,
      author: name,
      room: req.body.room,
      time: req.body.time,
    })
    .then((resp) => {
      res.send(resp);
      db.UserGroup.findAll({
        raw: true,
        where: {
          GroupId: req.body.room,
        },
      }).then((resp) => {
        resp.forEach((x) => {
          data.push(x.User2Id);
        });
      
        db.User2.findAll({
          raw: true,
          where: {
            id: data,
          },
        }).then((resp) => {
          resp.forEach((x) => {
            if (!x.firebase_Token) {
            } else {
              data.push(x.firebase_Token);
             
              sendnot(data, name,req.body.room);
            }
          });
        });
      });
    });
});
//Private MEssages

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: "1000000" },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif|json|csv|mp4|mp3|pdf|wav|sound|mpeg|audio|upl/;
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));

    if (mimeType && extname) {
      return cb(null, true);
    }
    cb("Give proper files formate to upload");
  },
}).single("image");
app.use("/Images", express.static("./Images")); 
// /////////////////////////////////////////////////////
app.post("/addimage", upload,(req, res) => {
 let data = [];
 name = req.body.Name;
 db.PrivateMsg.create({
   message: req.body.msg,
   author: name,
   room: req.body.room,
   to: req.body.to,
   time: req.body.time,
   image:req.file.path
 }).then((resp) => {
   res.send(resp);
   db.User2.findAll({
     raw: true,
     where: {
       name: [`${req.body.to}`],
     },
   }).then((resp) => {
     console.log(resp);
     resp.forEach((x) => {
       if (!x.firebase_Token) {
       } else {
         data.push(x.firebase_Token);

         sendnot(data, name, req.body.room);
       }
     });
   });
 });
});
////////
app.post("/PostAudio", upload, (req, res) => {
  let data = [];
  name = req.body.Name;
  db.PrivateMsg.create({
    message: req.body.msg,
    author: name,
    room: req.body.room,
    to: req.body.to,
    time: req.body.time,
    audio: req.file.path,
  }).then((resp) => {
    res.send(resp);
    db.User2.findAll({
      raw: true,
      where: {
        name: [`${req.body.to}`],
      },
    }).then((resp) => {
      console.log(resp);
      resp.forEach((x) => {
        if (!x.firebase_Token) {
        } else {
          data.push(x.firebase_Token);

          sendnot(data, name, req.body.room);
        }
      });
    });
  });
});
/////


app.use(express.static("public")); // for serving the HTML file

app.post("/api/test", function (req, res) {
  let value3 = Math.floor(Math.random() * 10000000000000);
  let path=`./Images/${value3}.mp3`

 var buf = new Buffer(req.body.blob, 'base64'); // decode

   fs.writeFile(path, buf, function (err) {
  
  
    
     if (err) {
       console.log("err", err);
     } else {
      
  db.PrivateMsg.create({
    message: "",
    author: req.body.name,
    room: req.body.room,
    to: req.body.to,
    time: req.body.time,
    audio: `Images/${value3}.mp3`,
  }).then((resp) => {
    res.send(resp)
  });
     }
   }); 
 

});

/////
app.post('/PostVideo',upload,(req,res)=>{
   let data = [];
   name = req.body.Name;
   db.PrivateMsg.create({
     message: req.body.msg,
     author: name,
     room: req.body.room,
     to: req.body.to,
     time: req.body.time,
     video: req.file.path,
   }).then((resp) => {
     res.send(resp);
     db.User2.findAll({
       raw: true,
       where: {
         name: [`${req.body.to}`],
       },
     }).then((resp) => {
       console.log(resp);
       resp.forEach((x) => {
         if (!x.firebase_Token) {
         } else {
           data.push(x.firebase_Token);

           sendnot(data, name, req.body.room);
         }
       });
     });
   });
})
///
app.post("/Postfile", upload, (req, res) => {
  let data = [];
  name = req.body.Name;
  db.PrivateMsg.create({
    message: req.body.msg,
    author: name,
    room: req.body.room,
    to: req.body.to,
    time: req.body.time,
    file: req.file.path,
  }).then((resp) => {
    res.send(resp);
    db.User2.findAll({
      raw: true,
      where: {
        name: [`${req.body.to}`],
      },
    }).then((resp) => {
      console.log(resp);
      resp.forEach((x) => {
        if (!x.firebase_Token) {
        } else {
          data.push(x.firebase_Token);

          sendnot(data, name, req.body.room);
        }
      });
    });
  });
});
// /////////////////////////////////////////////////////
app.post("/PPostMessage", (req, res) => {
  let data = [];
  name = req.body.Name;
  db.PrivateMsg.create({
    message: req.body.msg,
    author: name,
    room: req.body.room,
    to: req.body.to,
    time: req.body.time,
    
  }).then((resp) => {
    res.send(resp);
    db.User2.findAll({
      raw: true,
      where: {
        name: [`${req.body.to}`],
      },
    }).then((resp) => {
      console.log(resp);
      resp.forEach((x) => {
        if (!x.firebase_Token) {
        } else {
          data.push(x.firebase_Token);

          sendnot(data, name, req.body.room);
        }
      });
    });
  });
});


//

app.post("/getAllMsg", (req, res) => {
  const room = req.body.room;
  db.msgs
    .findAll({
      where: {
        room: room,
      },
    })
    .then((resp) => res.send(resp));
});

app.post("/getAllPMsg", (req, res) => {
  const from = req.body.from;
  const room=req.body.room
  const to=req.body.to
  db.PrivateMsg.findAll({
    where: {
      [Op.or]: [
        {
          [Op.and]: [{ author: to }, { to: from }, ],
        },
        {
          [Op.and]: [{ author: from }, { to: to }, { isDeleted: 0 }],
        },
      ],
    },
  }).then((resp) => res.send(resp));
});
app.post("/setFireToken", (req, res) => {
  var token = req.headers["authorization"];
  var decoded = jwt_decode(token);
  db.User2.update(
    {
      firebase_Token: req.body.token,
    },
    {
      where: { id: decoded.id },
    }
  ).then(() => res.send("success"));
});

function authenticateToken(req, res, next) {
  const authHeader = req.headers["Authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log(err);
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
app.post("/editmsg", (req, res) => {
  db.msgs
    .update(
      {
        message: req.body.newM,
      },
      {
        where: { id: req.body.id },
      }
    )
    .then(() => res.send("success"));
});
app.post("/editPmsg", (req, res) => {
  db.PrivateMsg.update(
    {
      message: req.body.newM,
    },
    {
      where: { id: req.body.id },
    }
  ).then(() => res.send("success"));
});
app.get('/allStuNames',(req,res)=>{
  db.User2.findAll({
    where:{
      isAdmin:0
    }
  }).then((resp)=>{
    res.send(resp)
  })
})
app.post('/AddDegree',(req,res)=>{
  db.User2.update(
    {
      Degree: req.body.Degree,
    },
    {
      where: { name: req.body.name },
    }
  ).then(() => res.send("success"));
})

app.get('/groupName',(req,res)=>{
  db.Groups.findAll().then((resp)=>{
    res.send(resp)
  })
})
//send notification
const sendnot = (token, name,room) => {
  if (!admin.apps.length) {
    const firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  var registrationToken = `${token}`;
  var payload = {
    notification: {
      title: "Message",
      body: `${name} Sent A Message to ${room}`,
    },
  };

  admin
    .messaging()
    .sendToDevice(registrationToken, payload)
    .then(function (response) {
      console.log("Successfully sent message:", response);
    })
    .catch(function (error) {
      console.log("Error sending message:", error);
    });
};
app.post("/DeleteFromme", (req, res) => {
  db.PrivateMsg.update(
    {
      isDeleted: req.body.isit,
    },
    {
      where: { id: req.body.id },
    }
  ).then(() => res.send("success"));
});
//Socket.io 

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  socket.on("join_room", (data) => {
    socket.join(data.room)
    console.log(`User with ID: ${socket.id} joined room: ${data.room}`);
    let datas =  {name: data.name, id: socket.id} ;
    Users.push(datas);
    
    socket.emit("receive_on", Users);
    console.log(Users);
  });
  //Private Join
    socket.on("join_room", (data) => {
      socket.join(data.room);
      console.log(`User with ID: ${socket.id} joined room: ${data.room}`);
      let datas = { name: data.name, id: socket.id };
      Users.push(datas);

      socket.emit("receive_on", Users);
      console.log(Users);
    });
  
  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
    
    socket.to(data.author).emit("receive_message",data);
    console.log(data)
  })
    socket.on("sendP_message", (data) => {
      socket.to(data.room).emit("receiveP_message", data);

      socket.to(data.author).emit("receiveP_message", data);
      console.log(data);
    });
  socket.on("Delete_Message", (data) => {
    const id = data.x;
    const newM = data.messageList.filter((y) => y.id != id);
    socket.to(data.i).emit("recivenewM", newM)
    
    app.post("/deletemsg", (req, res) => {
      db.msgs
        .destroy({
          where: {
            id: req.body.id,
          },
        })
        .then(() => res.send("succes"));
    });
  });
  app.post("/deletePmsg", (req, res) => {
    db.PrivateMsg
      .destroy({
        where: {
          id: req.body.id,
        },
      })
      .then(() => res.send("succes"));
  });
  socket.on("UpdateM", (data) => {
    const data2 = data.messageList;

    const IDD = (element) => element.id == data.x;
    const newmsg = data.newm;
    const index = data2.findIndex(IDD);
    data.messageList[index].message = newmsg;
    const room = data.messageList[index].room;
   
    socket.to(room).emit("recivenewMm", data2);
  });
  socket.on("disconnect", (data) => {
     Users = Users.filter((y) => y.id != socket.id);
    socket.emit("newOn", Users);
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});



db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`listening on: http://localhost:${PORT}`);
  });
});