import express from "express";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();
const port = 4000;
const privateKey="ehmedoglan"

app.use(express.json());
app.use(cors())

const Userschema = new Schema({
  username: String,
  password: String,
  role: { type: String, default: "user" },
});

const Users = mongoose.model("Users", Userschema);

app.get("/users", async (req, res) => {
  const data = await Users.find({});
  res.send(data);
});

app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Users.findById(id).exec();
    res.send(data);
  } catch (error) {
    res.status(200).send(error);
  }
});

app.post("/register", async (req, res) => {
  try {
    const userExist=await Users.findOne({ username: req.body.username})
    if (userExist) {
      return res.status(200).send("Already have User")
  }
    const hashPassword = await bcrypt.hash(req.body.password, 10);
    const data = new Users({
      username: req.body.username,
      password: hashPassword
    });
    const token = jwt.sign({ userId:data._id ,username: data.username, role: data.role }, privateKey, {expiresIn:"1h"});
    res.send(token)
    await data.save();
  } catch (error) {
    res.status(200).send(error.message);
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Users.findByIdAndDelete(id).exec();
    res.status(200).send("Deleted User");
  } catch (error) {
    res.status(200).send(error);
  }
});

app.post("/login", async (req, res) => {
    try {
        const {username, password} = req.body
        const userExist=await Users.findOne({ username: username})
        console.log(userExist);
        if (!userExist || !(await bcrypt.compare(password, userExist.password))) {
            return res.status(404).send("Wrong User")
        }
        const token = jwt.sign({ userId:req.body._id ,username: req.body.username, role: userExist.role }, privateKey, {expiresIn:"1h"});
        res.send(token)
    } catch (error) {
      res.status(404).send(error);
    }
  });


mongoose
  .connect("mongodb+srv://AliIsmayil:ali123@cluster0.tzldidp.mongodb.net/ ")
  .then(() => console.log("Connected!"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
