// Import du contrôleur qui gère la logique métier de l'application
import { controller } from "../controller/abonnement.js";

// Import des modules Express et bodyParser pour la gestion des routes et du corps des requêtes.
import express from "express";
import bodyParser from "body-parser";

// Création d'un routeur Express
export let router = express.Router();

// Configuration du middleware bodyParser pour analyser le corps des requêtes en JSON.
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Route pour récupérer tous les abonnements.
router.get("/get_all_abonnements", async (req, res) => {
  try {
    // Appel de la méthode du contrôleur pour récupérer tout les abonnements.
    const results = await controller.getAllAbonnement();
    res.json(results);
  } catch (error) {
    // En cas d'erreur, loggez l'erreur et envoyez une réponse d'erreur au client.
    console.error("Erreur : " + error.stack);
    res.status(500).send("Erreur lors de la récupération des données.");
  }
});

// Route pour créer un nouvel abonnement.
router.post("/create_abonnement", async (req, res) => {
  try {
    // Extraction des donnés du corps de la requête.
    const {
      nom_abonnement,
      nom_fournisseur,
      montant,
      frequence_prelevement,
      date_echeance,
      date_fin_engagement,
      IsEngagement,
      id_categorie,
    } = req.body;

    // Appel de la méthode du contrôleur pour insérer un nouvel abonnement.
    await controller.insertAbonnement(
      nom_abonnement,
      nom_fournisseur,
      montant,
      frequence_prelevement,
      date_echeance,
      date_fin_engagement,
      IsEngagement,
      id_categorie
    );

    // Réponse réussie si tout se passe bien.
    res.sendStatus(200);
  } catch (error) {
    // En cas d'erreur, loggez l'erreur et envoyez une réponse d'erreur au client
    console.error("Erreur : " + error.stack);
    res.status(500).send("Failed to insert subscription");
  }
});

// Route pour supprimer les abonnements.
router.delete("/delete_abonnement", async (req, res) => {
  try {
    // Récupération du paramètre firm_name du corps de la requête.
    const { nom_abonnement } = req.body;

    // Appel de la méthode du contrôleur pour supprimer l'abonnement par nom_abonnement.
    await controller.deleteAbonnement(nom_abonnement);

    // Réponse  si tout se passe bien.
    res.send("Un abonnement a été supprimé");
  } catch (error) {
    // En cas d'erreur, loggez l'erreur et envoyez une réponse d'erreur au client.
    console.log("Erreur : " + error.stack);
    res.status(500).send("Erreur lors de la suppression de l'abonnement");
  }
});

// Route pour mettre à jour les informations d'un abonnement
router.put("/update_abonnement", async (req, res) => {
  try {
    // Extraire les informations de la requête.
    const {
      current_nom_abonnement,
      new_nom_abonnement,
      new_nom_fournisseur,
      new_montant,
      new_frequence_prelevement,
      new_date_echeance,
      new_date_fin_engagement,
      new_IsEngagement,
      new_id_categorie,
    } = req.body;

    await controller.updateAbonnement(
      current_nom_abonnement,
      new_nom_abonnement,
      new_nom_fournisseur,
      new_montant,
      new_frequence_prelevement,
      new_date_echeance,
      new_date_fin_engagement,
      new_IsEngagement
    );

    res.send("L'abonnement a bien été modifié avec succès");
  } catch (error) {
    console.log(error);
    res.status(500).send("Erreur lors de la modification de l'abonnement");
  }
});

// Route pour récupérer un utilisateur en fonction du nom de l'abonnement (nom_abonnement).
router.get("/get_abonnement_by_nom_abonnement", async (req, res) => {
  try {
    // Récupération du paramètre nom_abonnement de la requête.
    const { nom_abonnement } = req.body;

    // Appel de la méthode du contrôleur pour récupérer l'abonnement par le nom de l'abonnement.

    const abonnement = await controller.getAbonnementByNomAbonnement(
      nom_abonnement
    );
    // Réponse JSON contenant les données de l'abonnement.

    res.json(abonnement);
  } catch (error) {
    // En cas d'erreur, loggez l'erreur et envoyez une réponse d'erreur au client.

    console.error("Erreur : " + error.stack);
    res
      .status(500)
      .send("Erreur lors de la récupération des données de l'abonnement");
  }
});
