// Import du contrôleur qui gère la logique métier de l'application
import { controller } from "../controller/categorie.js";

// Import des modules Express et bodyParser pour la gestion des routes et du corps des requêtes.
import express from "express";
import bodyParser from "body-parser";

// Création d'un routeur Express
export let router = express.Router();

// Configuration du middleware bodyParser pour analyser le corps des requêtes en JSON.
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Route pour récupérer tous les abonnements.
router.get("/get_all_categorie", async (req, res) => {
  try {
    // Appel de la méthode du contrôleur pour récupérer tout les utilisateurs
    const results = await controller.getAllCategorie();
    res.json(results);
  } catch (error) {
    // En cas d'erreur, loggez l'erreur et envoyez une réponse d'erreur au client.
    console.error("Erreur : " + error.stack);
    res.status(500).send("Erreur lors de la récupération des données.");
  }
});

// Route pour créer un nouvel utilisateur.
router.post("/create_categorie", async (req, res) => {
  try {
    // Extraction des donnés du corps de la requête.
    const { nom, couleur } = req.body;

    // Appel de la méthode du contrôleur pour insérer un nouvel utilisateur.
    await controller.insertCategorie(nom, couleur);

    // Réponse réussie si tout se passe bien.
    res.sendStatus(200);
  } catch (error) {
    // En cas d'erreur, loggez l'erreur et envoyez une réponse d'erreur au client
    console.error("Erreur : " + error.stack);
    res.status(500).send("Failed to insert categorie");
  }
});

// Route pour supprimer tou utilisateur
router.delete("/delete_categorie", async (req, res) => {
  try {
    // Récupération du paramètre firm_name du corps de la requête.
    const { nom } = req.body;

    // Appel de la méthode du contrôleur pour supprimer l'utilisateur.
    await controller.deleteCategorie(nom);

    // Réponse  si tout se passe bien.
    res.send("La catégorie a bien été supprimé");
  } catch (error) {
    // En cas d'erreur, loggez l'erreur et envoyez une réponse d'erreur au client.
    console.log("Erreur : " + error.stack);
    res.status(500).send("Erreur lors de la suppression de l'utilisateur");
  }
});

// Route pour mettre à jour les informations d'un utilisateur
router.put("/update_categorie", async (req, res) => {
  try {
    // Extraire les informations de la requête.
    const { nom } = req.body;
    const { new_nom, new_couleur } = req.body;

    await controller.updateCategorie(new_nom, new_couleur);

    res.send("La catégorie a bien été modifié avec succès");
  } catch (error) {
    console.log(error);
    res.status(500).send("Erreur lors de la modification de la catégorie");
  }
});

// Route pour récupérer un utilisateur en fonction du nom de l'entreprise (firm_name).
router.get("/get_categorie_by_nom", async (req, res) => {
  try {
    // Récupération du paramètre firm_name de la requête.
    const { nom } = req.body;

    // Appel de la méthode du contrôleur pour récupérer l'utilisateur par le nom de l'entreprise.

    const categorie = await controller.getCategorieByNom(nom);
    // Réponse JSON contenant les données de l'utilisateur.

    res.json(categorie);
  } catch (error) {
    // En cas d'erreur, loggez l'erreur et envoyez une réponse d'erreur au client.

    console.error("Erreur : " + error.stack);
    res
      .status(500)
      .send("Erreur lors de la récupération des données de l'utilisateur");
  }
});
