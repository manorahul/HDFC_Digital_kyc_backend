// index.js
import 'dotenv/config';               // <- loads .env immediately
import express from "express";
import bodyParser from "body-parser";

import routerFactory from "./routes/routes.js";
import aadhaarRoutes from "./routes/aadhaar.js";
import client from "./config/redis.js"; // config will use process.env now

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// routerFactory is a function that returns an express.Router configured with the passed client
app.use("/", routerFactory(client));
app.use("/aadhaar", aadhaarRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
