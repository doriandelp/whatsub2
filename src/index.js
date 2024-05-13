// src/index.js
import express from "express";
import bodyParser from "body-parser";
import { router as userRouter } from "./routes/user.js"; // Assurez-vous que le chemin est correct
import { router as abonnementRouter } from "./routes/abonnement.js"; // Importez le routeur d'abonnement
import { router as categorieRouter } from "./routes/categorie.js"; // Importez le routeur d'abonnement
import "dotenv/config"; // Cela va charger les variables d'environnement

const app = express();
const PORT = process.env.WHATSUB_PORT || 3000;

app.use(bodyParser.json());
app.use("/users", userRouter);
app.use("/abonnement", abonnementRouter);
app.use("/categorie", categorieRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
