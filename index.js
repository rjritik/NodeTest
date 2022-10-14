import express, { urlencoded } from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.json());
app.use(urlencoded());
app.use(cors());

const encrpt = (password) => {
  const salt = bcrypt.genSaltSync(10);
  let hashed = bcrypt.hashSync(password, salt);
  return hashed;
};
mongoose.connect("mongodb://localhost:27017/myloginRegisterDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = mongoose.Schema({
  email: String,
  password: String,
});
const postSchema = mongoose.Schema({
  title: String,
  Body: String,
  CreatedBy: String,
  Status: String,
  latitude: String,
  longitude: String,
});

const User = new mongoose.model("User", userSchema);
const Data = new mongoose.model("Data", postSchema);

//for register
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  try {
    User.findOne({ email: email }, (err, user) => {
      if (user) {
        res.send({ message: "User already register" });
      } else {
        const pass = encrpt(password);
        User.create(
          {
            email,
            password: pass,
          },
          (err, item) => {
            if (err || !item) {
              res.send({
                code: 404,
                data: "Encounter error while creating user!",
              });
            }
            res.send({ code: 200, data: item });
            return;
          }
        );
      }
    });
  } catch (e) {
    res.send({ error: e.message });
  }
});

//for login of user
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  try {
    User.findOne({ email: email }, (err, user) => {
      if (user) {
        const validPassword = bcrypt.compareSync(password, user.password);
        if (validPassword) {
          var token = jwt.sign({ id: user.id }, "bezkoder-secret-key", {
            expiresIn: 86400,
          });
          res.send({ message: "Login Successfully", user: user, token: token });
        } else {
          res.send({ message: "Invalid password" });
        }
      } else {
        res.send({ message: "User not found" });
      }
    });
  } catch (e) {
    res.send({ error: e.message });
  }
});

//create a post with the fields given below
app.post("/CreatePost", async (req, res) => {
  const { title, Body, CreatedBy, Status, latitude, longitude } = req.body;

  try {
    Data.create(
      {
        title,
        Body,
        CreatedBy,
        Status,
        latitude,
        longitude,
      },
      (err, item) => {
        if (err || !item) {
          res.send({ code: 404, data: "Encounter error while creating user!" });
        }
        res.send({ code: 200, data: item });
        return;
      }
    );
  } catch (e) {
    res.send({ error: e.message });
  }
});

// get all posts
app.get("/getPosts", async (req, res) => {
  try {
    let allPosts = await Data.find({});
    return res.status(200).json(allPosts);
  } catch (e) {
    res.send({ error: e.message });
  }
});

//for updating posts by id
app.post("/updatePost/:id", (req, res) => {
  const { title, Body, CreatedBy, Status, latitude, longitude } = req.body;

  try {
    Data.update(
      {
        title,
        Body,
        CreatedBy,
        Status,
        latitude,
        longitude,
      },
      (err, item) => {
        if (err || !item) {
          res.send({ code: 404, data: "Encounter error while creating user!" });
        }
        res.send({ code: 200, data: item });
        return;
      }
    );
  } catch (e) {
    res.send({ error: e.message });
  }
});

//for  deleting the post  by id
app.post("/deletePost/:id", (req, res) => {
  try {
    Data.deleteOne({ _id: req.params.id }).then(() => {
      res.send({ message: "Deleted Successfull" });
    });
  } catch (e) {
    res.send({ error: e.message });
  }
});

//get posts data by geoloctaion
app.get("/getPostsByGeolocation", async (req, res) => {
  const { latitude, longitude } = req.body;
  try {
    let allPosts = await Data.find({ latitude, longitude });
    return res.status(200).json(allPosts);
  } catch (e) {
    res.send({ error: e.message });
  }
});

//for getting status
//Status for active :"Active" and for InActive:"InActive"
app.get("/getStatus", async (req, res) => {
  try {
    let activePosts = await Data.find({ Status: "Active" });
    let InActivePosts = await Data.find({ Status: "InActive" });
    return res.send({
      activePosts: activePosts.length,
      InActivePosts: InActivePosts.length,
    });
  } catch (e) {
    res.send({ error: e.message });
  }
});

app.listen(9002, () => {
  console.log("Server Started ");
});
