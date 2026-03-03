import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import passport from "passport"
import session from "express-session"
import cors from 'cors';
import http from 'http';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

import AuthRoute from './Routes/AuthRoute.js'
import PostRoutes from './Routes/PostRoute.js'
import UserRoute from './Routes/UserRoute.js'
import RoomRoute from './Routes/RoomRoute.js'
import RoommateRoute from './Routes/RoommateRoute.js'
import ServerMsgRoute from './Routes/ServerMsgRoute.js'

//import  } from './Middlewares/CORS_Protection.js'
import { verifyJWT_withuserId, verifyJWTForGetRequest } from './Middlewares/verifyJWT.js';

import "./Controllers/Auth.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// if(process.env.NODE_ENV === "production") {
//   console.log(
//     "%cDear Developer,\n" +
//     "Thanks for stopping by the console log. If you've stumbled upon any bugs, please report them at %chttps://sdeysocial.canny.io/issue%c. Together, let's keep this code shipshape for our fellow VITians.\n" +
//     "Best Regards,\n" +
//     "MFC VIT Team\n\n"+
//     "    .---.\n" +
//     "   |o_o |\n" +
//     "   |:_/ |\n" +
//     "  //   \\ \\\n" +
//     " (|     | )\n" +
//     "/'\_   _/`\\\n" +
//     " \___)=(___/",
//     "color: yellow; font-weight: bold;",
//     "color: yellow; text-decoration: underline;",
//     "color: yellow; font-weight: bold;",
//   );

//   console.log = () => {}
//   console.error = () => {}
//   console.debug = () => {}
// }

// Routes
const app = express();
// const server = http.createServer(app)


// Middleware
app.use(express.json())
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
// app.use(cors({
//   origin:  "*", // Your frontend URL
//   credentials: true, // Allows cookies if needed
//   methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
//   allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
// }));
app.use(cors());


mongoose
  .connect(process.env.MONGO_DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    console.log("DB Connected Successfully")
  )
  .catch((error) => console.log(error));

  // Static Route
  // app.set("views", __dirname + "/views");
  // app.set("view engine", "ejs");
  // app.use(express.static(__dirname + "/public"));
  app.get('/', (req, res) => {
    return res.json("Backend Server By TechTeamMFC");
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true, 
        maxAge: 1000 * 60 * 60,
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // usage of routes
  app.use('/auth', AuthRoute)
  app.use('/user', verifyJWTForGetRequest, UserRoute)
  app.use('/room', verifyJWTForGetRequest, RoomRoute)
  app.use('/roommate', verifyJWTForGetRequest, RoommateRoute)
  app.use('/server-messages', ServerMsgRoute)
  app.use('/post',PostRoutes)

  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });

  export default app;
