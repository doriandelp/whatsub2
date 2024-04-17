// src/index.js
import express from "express";
import bodyParser from "body-parser";
import { router as userRouter } from "./routes/user.js"; // Assurez-vous que le chemin est correct
import "dotenv/config"; // Cela va charger les variables d'environnement

const app = express();
const PORT = process.env.WHATSUB_PORT || 3000;

app.use(bodyParser.json());
app.use("/users", userRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
