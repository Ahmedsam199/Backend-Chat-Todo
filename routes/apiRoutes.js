const express = require("express");
const router = express.Router();
const db = require("../models");

// get all todos
router.get("/all", (req, res) => {
  db.Todo.findAll().then((todos) => res.send(todos));
});
//all ctask

// add to cTask
router.post("/newC", (req, res) => {
  db.Ctask.create({
    task: req.body.task,
    UserID: req.body.UserID,
  }).then((submitedTodo) => res.send(submitedTodo));
});
// get single todo by id
router.get("/find/:id", (req, res) => {
  db.Todo.findAll({
    where: {
      id: req.params.id,
    },
  }).then((todo) => res.send(todo));
});

// post new todo
router.post("/new", (req, res) => {
  db.Todo.create({
    task: req.body.task,
    UserID: req.body.UserID,
    Body:req.body.body
  }).then((submitedTodo) => res.send(submitedTodo));
});
// post new user
router.post("/newuser", (req, res) => {
  db.Users.create({
    User: req.body.User,
  }).then((submitedUser) => res.send(submitedUser));
});
router.post("/newuser1", (req, res) => {
  db.User2.create({
    name: req.body.User,
    isAdmin:req.body.isAdmin
  }).then((submitedUser) => res.send(submitedUser));
});


// delete todo
router.delete("/delete/:id", (req, res) => {
  db.Todo.destroy({
    where: {
      id: req.params.id,
    },
  }).then(() => res.send("success"));
});

//d c
router.delete("/deleteC/:id", (req, res) => {
  db.Ctask.destroy({
    where: {
      id: req.params.id,
    },
  }).then(() => res.send("success"));
});

// edit a todo
router.put("/edit/:id", (req, res) => {
  db.Todo.update(
    {
      task: req.body.task,
    },
    {
      where: { id: req.params.id },
    }
  ).then(() => res.send("success"));
});
router.put("/edit2/:id", (req, res) => {POST;
  db.Todo.update(
    {
      task: req.body.task,
    },
    {
      where: { id: req.params.id },
    }
  ).then(() => res.send("success"));
});
router.post("/userlogin", (req, res) => {
  const user = db.Users.findOne({
    where: {
      User: req.body.User,
    },
  }).then((user) => {
    if (user.length) {
      res.status(404).json({ error: "User does not exist" });
    } else {
      res.send(user);
    }
  });
});


// Add User To The Chanell

module.exports = router;
