import express from "express";

// Import du contrôleur qui gère la logique métier de l'application
import { controller } from "../controller/ajoute.js";

// Import des modules Express et bodyParser pour la gestion des routes et du corps des requêtes.
import bodyParser from "body-parser";

// Création d'un routeur Express
export let router = express.Router();

// Configuration du middleware bodyParser pour analyser le corps des requêtes en JSON.
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Route pour récupérer tous les abonnements.
router.get("/get_all_ajoute", async (req, res) => {
  try {
    // Appel de la méthode du contrôleur pour récupérer tout les abonnements.
    const results = await controller.getAllAjoute();
    res.json(results);
  } catch (error) {
    // En cas d'erreur, loggez l'erreur et envoyez une réponse d'erreur au client.
    console.error("Erreur : " + error.stack);
    res.status(500).send("Erreur lors de la récupération des données.");
  }
});
