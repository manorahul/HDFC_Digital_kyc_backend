// index.js
import dotenv from "dotenv";              // <- loads .env immediately
import express from "express";
import bodyParser from "body-parser";
// import { fileURLToPath } from 'url';
import cors from "cors";


// import routerFactory from "./routes/routes.js";
import aadhaarRoutes from "./routes/aadhaar.js";
import client from "./config/redis.js"; // config will use process.env now
// import Connection from './db/db.js';
// import kycRoutes from './routes/kycRoutes.js';

// import adminAuthRoutes from "./routes/adminAuthRoutes.js";
// import adminKycRoutes from "./routes/adminKycRoutes.js";
// // import kycRoutes from './routes/kyc.js';

const app = express();
const PORT = process.env.PORT || 3000;


dotenv.config();
// app.use(cors());

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // routerFactory is a function that returns an express.Router configured with the passed client
// app.use("/", routerFactory(client));
// app.use("/aadhaar", aadhaarRoutes);
// app.use("/uploads", express.static("uploads"));
// app.use("/kyc", kycRoutes);

// app.use("/admin/auth", adminAuthRoutes);
// app.use("/admin/kyc", adminKycRoutes);



// await Connection(process.env.DB_URI);


app.get("/", (req, res) => {
  res.send("Hello, World!");
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
