import express from "express";

// Import du contrôleur qui gère la logique métier de l'application
import { controller } from "../controller/abonnement.js";

// Import des modules Express et bodyParser pour la gestion des routes et du corps des requêtes.
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

router.get("/total_amount", async (req, res) => {
  try {
    const totalAmount = await controller.getTotalAmount();
    res.json({ success: true, total_montant: totalAmount });
  } catch (error) {
    console.error("Erreur : " + error.stack);
    res.status(500).send("Erreur lors de la récupération du montant total.");
  }
});

router.get("/total_monthly_amount", async (req, res) => {
  try {
    const totalMonthlyAmount = await controller.getTotalMonthlyAmount();
    res.json({ success: true, total_montant: totalMonthlyAmount });
  } catch (error) {
    console.error("Erreur : " + error.stack);
    res
      .status(500)
      .send("Erreur lors de la récupération du montant total mensuel.");
  }
});
router.get("/total_annual_amount", async (req, res) => {
  try {
    const totalAnnualAmount = await controller.getTotalAnnualAmount();
    res.json({ success: true, total_montant: totalAnnualAmount });
  } catch (error) {
    console.error("Erreur : " + error.stack);
    res
      .status(500)
      .send("Erreur lors de la récupération du montant total annuel.");
  }
});

router.get("/total_weekly_amount", async (req, res) => {
  try {
    const totalWeeklyAmount = await controller.getTotalWeeklyAmount();
    res.json({ success: true, total_montant: totalWeeklyAmount });
  } catch (error) {
    console.error("Erreur : " + error.stack);
    res
      .status(500)
      .send("Erreur lors de la récupération du montant total hebdomadaire.");
  }
});

router.post("/create_abonnement", async (req, res) => {
  try {
    const {
      nom_abonnement,
      nom_fournisseur,
      montant,
      frequence_prelevement,
      date_echeance,
      date_fin_engagement,
      IsEngagement,
      id_categorie,
      nom_categorie,
      couleur,
    } = req.body;

    // Vérification des champs requis
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

    if (!montant || typeof montant !== "number") {
      return res.status(400).json({
        success: false,
        message: "Le montant est requis et doit être un nombre.",
      });
    }

    const validFrequences = ["semaine", "mois", "annee"];
    if (
      !frequence_prelevement ||
      typeof frequence_prelevement !== "string" ||
      !validFrequences.includes(frequence_prelevement)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "La fréquence de prélèvement est requise, doit être une chaîne de caractères et doit être 'semaine', 'mois' ou 'annee'.",
      });
    }

    if (!date_echeance || isNaN(new Date(date_echeance).getTime())) {
      return res.status(400).json({
        success: false,
        message: "La date d'échéance est requise et doit être une date valide.",
      });
    }

    // Ajout de la vérification pour IsEngagement
    if (IsEngagement !== undefined && typeof IsEngagement !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "L'engagement doit être un booléen.",
      });
    }

    // Ajout de la condition pour vérifier que date_fin_engagement est requis lorsque IsEngagement est true
    if (IsEngagement) {
      if (
        !date_fin_engagement ||
        isNaN(new Date(date_fin_engagement).getTime())
      ) {
        return res.status(400).json({
          success: false,
          message:
            "La date de fin d'engagement est requise et doit être une date valide lorsque l'engagement est activé.",
        });
      }
    }

    // Ajout de la condition pour vérifier que date_fin_engagement ne doit pas être fourni lorsque IsEngagement est false
    if (!IsEngagement && date_fin_engagement) {
      return res.status(400).json({
        success: false,
        message:
          "La date de fin d'engagement ne doit pas être fournie lorsque l'engagement est désactivé.",
      });
    }

    if (!id_categorie || typeof id_categorie !== "number") {
      return res.status(400).json({
        success: false,
        message: "L'ID de catégorie est requis et doit être un nombre.",
      });
    }

    if (!nom_categorie || typeof nom_categorie !== "string") {
      return res.status(400).json({
        success: false,
        message:
          "Le nom de catégorie d abonnement est requis et doit être une chaine de caractere.",
      });
    }

    if (!couleur || typeof couleur !== "string") {
      return res.status(400).json({
        success: false,
        message:
          "Le couleur de catégorie d abonnement est requis et doit être une chaine de caractere.",
      });
    }

    await controller.insertAbonnement(
      nom_abonnement,
      nom_fournisseur,
      montant,
      frequence_prelevement,
      new Date(date_echeance),
      IsEngagement
        ? date_fin_engagement
          ? new Date(date_fin_engagement)
          : null
        : undefined, // Transformation conditionnelle des dates
      IsEngagement,
      id_categorie,
      nom_categorie,
      couleur
    );

    res
      .status(200)
      .json({ success: true, message: "Abonnement créé avec succès." });
  } catch (error) {
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

    // Vérification que le nom de l'abonnement est fourni et est une chaîne de caractères
    if (!nom_abonnement || typeof nom_abonnement !== "string") {
      return res.status(400).json({
        success: false,
        message:
          "Le nom de l'abonnement est requis et doit être une chaîne de caractères.",
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

router.put("/update_abonnement", async (req, res) => {
  try {
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
      nom_categorie, // Ajout du paramètre nom_categorie
      couleur, // Ajout du paramètre couleur
    } = req.body;

    if (!current_nom_abonnement || typeof current_nom_abonnement !== "string") {
      return res.status(400).json({
        success: false,
        message: "Le nom actuel de l'abonnement est requis.",
      });
    }

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

    const validFrequences = ["semaine", "mois", "annee"];
    if (
      !frequence_prelevement ||
      typeof frequence_prelevement !== "string" ||
      !validFrequences.includes(frequence_prelevement)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "La fréquence de prélèvement est requise, doit être une chaîne de caractères et doit être 'semaine', 'mois' ou 'annee'.",
      });
    }

    if (date_echeance && isNaN(new Date(date_echeance).getTime())) {
      return res.status(400).json({
        success: false,
        message: "La date d'échéance doit être une date valide.",
      });
    }

    // Ajout de la vérification pour IsEngagement
    if (IsEngagement) {
      if (
        !date_fin_engagement ||
        isNaN(new Date(date_fin_engagement).getTime())
      ) {
        return res.status(400).json({
          success: false,
          message:
            "La date de fin d'engagement est requise et doit être une date valide lorsque l'engagement est activé.",
        });
      }
    }

    // Ajout de la condition pour vérifier que date_fin_engagement ne doit pas être fourni lorsque IsEngagement est false
    if (!IsEngagement && date_fin_engagement) {
      return res.status(400).json({
        success: false,
        message:
          "La date de fin d'engagement ne doit pas être fournie lorsque l'engagement est désactivé.",
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

    if (nom_categorie && typeof nom_categorie !== "string") {
      return res.status(400).json({
        success: false,
        message: "Le nom de la catégorie doit être une chaîne de caractères.",
      });
    }

    if (couleur && typeof couleur !== "string") {
      return res.status(400).json({
        success: false,
        message:
          "La couleur de la catégorie doit être une chaîne de caractères.",
      });
    }

    const result = await controller.updateAbonnement(
      current_nom_abonnement,
      nom_abonnement,
      nom_fournisseur,
      montant,
      frequence_prelevement,
      date_echeance ? new Date(date_echeance) : undefined, // Transformation conditionnelle des dates
      IsEngagement
        ? date_fin_engagement
          ? new Date(date_fin_engagement)
          : null
        : undefined, // Transformation conditionnelle des dates
      IsEngagement,
      id_categorie,
      nom_categorie, // Transmission du paramètre nom_categorie
      couleur // Transmission du paramètre couleur
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
          "Le nom de l'abonnement est requis pour retourner les valeurs de l'Abonnement.",
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

router.get("/abonnements_with_categorie", async (req, res) => {
  try {
    // Appel de la méthode du contrôleur pour récupérer les abonnements avec les informations de la catégorie
    const results = await controller.getAbonnementWithCategorie();

    res.json(results);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des abonnements avec catégorie:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des abonnements avec catégorie.",
    });
  }
});

router.get("/nom_abonnement_categorie", async (req, res) => {
  try {
    // Appel de la méthode du contrôleur pour récupérer les noms d'abonnement et de catégorie
    const results = await controller.getNomAbonnementAndCategorie();
    // Envoie des résultats en réponse
    res.json(results);
  } catch (error) {
    // Gestion des erreurs et envoi d'une réponse d'erreur
    console.error(
      "Erreur lors de la récupération des noms d'abonnement et de catégorie:",
      error
    );
    res.status(500).json({
      success: false,
      message:
        "Erreur lors de la récupération des noms d'abonnement et de catégorie.",
    });
  }
});
