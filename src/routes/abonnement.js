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

    // Vérification que tous les champs requis sont fournis et valides
    if (!nom_abonnement || typeof nom_abonnement !== "string") {
      return res.status(400).json({
        success: false,
        message:
          "Le nom de l'abonnement est requis et doit être une chaîne de caractères.",
      });
    }

    if (!nom_fournisseur || typeof nom_fournisseur !== "string") {
      return res.status(400).json({
        success: false,
        message:
          "Le nom du fournisseur est requis et doit être une chaîne de caractères.",
      });
    }

    if (typeof montant !== "number") {
      return res.status(400).json({
        success: false,
        message: "Le montant est requis et doit être un nombre.",
      });
    }

    if (typeof frequence_prelevement !== "number") {
      return res.status(400).json({
        success: false,
        message:
          "La fréquence de prélèvement est requise et doit être un nombre.",
      });
    }

    if (!date_echeance || isNaN(new Date(date_echeance).getTime())) {
      return res.status(400).json({
        success: false,
        message: "La date d'échéance est requise et doit être une date valide.",
      });
    }

    if (
      !date_fin_engagement ||
      isNaN(new Date(date_fin_engagement).getTime())
    ) {
      return res.status(400).json({
        success: false,
        message:
          "La date de fin d'engagement est requise et doit être une date valide.",
      });
    }

    if (typeof IsEngagement !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "L'engagement est requis et doit être un booléen.",
      });
    }

    if (typeof id_categorie !== "number") {
      return res.status(400).json({
        success: false,
        message: "L'ID de catégorie est requis et doit être un nombre.",
      });
    }

    // Appel de la méthode du contrôleur pour insérer un nouvel abonnement.
    await controller.insertAbonnement(
      nom_abonnement,
      nom_fournisseur,
      montant,
      frequence_prelevement,
      new Date(date_echeance),
      new Date(date_fin_engagement),
      IsEngagement,
      id_categorie
    );
    // Réponse réussie si tout se passe bien.
    res
      .status(200)
      .json({ success: true, message: "Abonnement créé avec succès." });
  } catch (error) {
    // En cas d'erreur, loggez l'erreur et envoyez une réponse d'erreur au client
    console.error("Erreur : " + error.stack);
    res.status(500).json({
      success: false,
      message: "Échec de la création de l'abonnement.",
    });
  }
});

// Route pour supprimer les abonnements.
router.delete("/delete_abonnement", async (req, res) => {
  try {
    // Récupération du paramètre firm_name du corps de la requête.
    const { nom_abonnement } = req.body;

    // Vérification des types des données.
    if (typeof nom_abonnement != "string") {
      res.sendStatus(400); // Bad Request
      return;
    }

    // Vérification que le nom est fourni
    if (!nom_abonnement) {
      return res.status(400).json({
        success: false,
        message: "Le nom de l'abonnement est requis.",
      });
    }

    // Appel de la méthode du contrôleur pour supprimer l'abonnement par nom_abonnement.
    const result = await controller.deleteAbonnement(nom_abonnement);

    // Vérifier si la suppression a réussi
    if (result) {
      return res
        .status(200)
        .json({ success: true, message: "Abonnement supprimé avec succès." });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Abonnement non trouvé." });
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'abonnement:", error);
    res.status(500).json({
      success: false,
      message:
        "Une erreur est survenue lors de la suppression de l'abonnement.",
    });
  }
});

// Route pour mettre à jour les informations d'un abonnement
router.put("/update_abonnement", async (req, res) => {
  try {
    // Extraire les informations de la requête.
    const {
      current_nom_abonnement,
      nom_abonnement,
      nom_fournisseur,
      montant,
      frequence_prelevement,
      date_echeance,
      date_fin_engagement,
      IsEngagement,
      id_categorie,
    } = req.body;

    // Vérification que current_nom_abonnement est fourni
    if (!current_nom_abonnement && typeof id_categorie !== "number") {
      return res.status(400).json({
        success: false,
        message: "Le nom actuel de l'abonnement est requis.",
      });
    }

    // Vérification des champs s'ils sont fournis (l'update peut ne pas tous les avoir)
    if (nom_abonnement && typeof nom_abonnement !== "string") {
      return res.status(400).json({
        success: false,
        message:
          "Le nouveau nom de l'abonnement doit être une chaîne de caractères.",
      });
    }

    if (nom_fournisseur && typeof nom_fournisseur !== "string") {
      return res.status(400).json({
        success: false,
        message: "Le nom du fournisseur doit être une chaîne de caractères.",
      });
    }

    if (montant && typeof montant !== "number") {
      return res.status(400).json({
        success: false,
        message: "Le montant doit être un nombre.",
      });
    }

    if (frequence_prelevement && typeof frequence_prelevement !== "number") {
      return res.status(400).json({
        success: false,
        message: "La fréquence de prélèvement doit être un nombre.",
      });
    }

    if (date_echeance && isNaN(new Date(date_echeance).getTime())) {
      return res.status(400).json({
        success: false,
        message: "La date d'échéance doit être une date valide.",
      });
    }

    if (date_fin_engagement && isNaN(new Date(date_fin_engagement).getTime())) {
      return res.status(400).json({
        success: false,
        message: "La date de fin d'engagement doit être une date valide.",
      });
    }

    if (IsEngagement !== undefined && typeof IsEngagement !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "L'engagement doit être un booléen.",
      });
    }

    if (id_categorie && typeof id_categorie !== "number") {
      return res.status(400).json({
        success: false,
        message: "L'ID de catégorie doit être un nombre.",
      });
    }

    const result = await controller.updateAbonnement(
      current_nom_abonnement,
      nom_abonnement,
      nom_fournisseur,
      montant,
      frequence_prelevement,
      date_echeance ? new Date(date_echeance) : undefined,
      date_fin_engagement ? new Date(date_fin_engagement) : undefined,
      IsEngagement,
      id_categorie
    );
    if (result) {
      res
        .status(200)
        .json({ success: true, message: "Abonnement mis à jour avec succès." });
    } else {
      res.status(404).json({
        success: false,
        message: "L'abonnement n'a pas été mis à jour.",
      });
    }
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la mise à jour de l'abonnement:",
      error
    );
    res.status(500).json({
      success: false,
      message:
        "Une erreur est survenue lors de la mise à jour de l'abonnement.",
    });
  }
});

// Route pour récupérer un utilisateur en fonction du nom de l'abonnement (nom_abonnement).
router.get("/get_abonnement_by_nom_abonnement", async (req, res) => {
  try {
    // Récupération du paramètre nom_abonnement de la requête.
    const { nom_abonnement } = req.query;

    // Vérification des types des données.
    if (typeof nom_abonnement !== "string") {
      return res.status(400).json({
        success: false,
        message: "Le nom de l abonnement est incorrect.",
      });
    }

    // Vérification que le nom est fourni
    if (!nom_abonnement) {
      return res.status(400).json({
        success: false,
        message:
          "Le nom de la aobonnement est requis pour retourner les valeurs de l'Abonnement.",
      });
    }

    const abonnement = await controller.getAbonnementByNomAbonnement(
      nom_abonnement
    );
    res.json(abonnement);
  } catch (error) {
    // En cas d'erreur, loggez l'erreur et envoyez une réponse d'erreur au client.

    console.error("Erreur : " + error.stack);
    res
      .status(500)
      .send("Erreur lors de la récupération des données de l'abonnement");
  }
});
