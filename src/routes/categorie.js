// Import du contrôleur qui gère la logique métier de l'application
import { CategorieController, controller } from "../controller/categorie.js";

// Import des modules Express et bodyParser pour la gestion des routes et du corps des requêtes.
import express from "express";
import bodyParser from "body-parser";

// Création d'un routeur Express
export let router = express.Router();

// Configuration du middleware bodyParser pour analyser le corps des requêtes en JSON.
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Route pour récupérer tous les categories.
router.get("/get_all_categorie", async (req, res) => {
  try {
    // Appel de la méthode du contrôleur pour récupérer tout les categories
    const results = await controller.getAllCategorie();
    res.json(results);
  } catch (error) {
    // En cas d'erreur, loggez l'erreur et envoyez une réponse d'erreur au client.
    console.error("Erreur : " + error.stack);
    res.status(500).send("Erreur lors de la récupération des données.");
  }
});

// Route pour créer un nouvel categorie.
router.post("/create_categorie", async (req, res) => {
  try {
    // Extraction des donnés du corps de la requête.
    const { nom, couleur } = req.body;

    // Vérification des types des données.
    if (typeof nom != "string" || typeof couleur != "string") {
      res.sendStatus(400); // Bad Request
      return;
    }

    // Vérification que le nom est fourni
    if (!nom) {
      return res.status(400).json({
        success: false,
        message: "Le nom de la catégorie est requis pour la suppression.",
      });
    }

    // Vérification que la couleur est fourni
    if (!couleur) {
      return res.status(400).json({
        success: false,
        message: "La couleur de la catégorie est requise pour la suppression.",
      });
    }

    // Appel de la méthode du contrôleur pour insérer un nouvelle categorie.
    const result = await controller.insertCategorie(nom, couleur);

    // Vérifier si la suppression a réussi
    if (result) {
      res.sendStatus(200); // OK
    } else {
      res.sendStatus(404); // Not Found
    }
    // Réponse réussie si tout se passe bien.
    res.sendStatus(200);
  } catch (error) {
    // En cas d'erreur, loggez l'erreur et envoyez une réponse d'erreur au client
    console.error("Erreur : " + error.stack);
    res.status(500).send("Failed to insert categorie");
  }
});

// Route pour supprimer l'utilisateur
router.delete("/delete_categorie", async (req, res) => {
  try {
    // Récupération du paramètre nom du corps de la requête.
    const { nom } = req.body;

    // Vérification des types des données.
    if (typeof nom != "string" || typeof couleur != "string") {
      res.sendStatus(400); // Bad Request
      return;
    }

    // Vérification que le nom est fourni
    if (!nom) {
      return res.status(400).json({
        success: false,
        message: "Le nom de la catégorie est requis pour la suppression.",
      });
    }

    // Vérification que le nom est fourni
    if (!couleur) {
      return res.status(400).json({
        success: false,
        message: "La couleur de la catégorie est requis pour la suppression.",
      });
    }

    // Appel de la méthode du contrôleur pour supprimer la categorie.
    const result = await controller.deleteCategorie(nom);

    // Vérifier si la suppression a réussi
    if (result) {
      res.sendStatus(200); // OK
    } else {
      res.sendStatus(404); // Not Found
    }

    // Réponse  si tout se passe bien.
    res.send("La catégorie a bien été supprimé");
  } catch (error) {
    // En cas d'erreur, loggez l'erreur et envoyez une réponse d'erreur au client.
    console.log("Erreur : " + error.stack);
    res.status(500).send("Erreur lors de la suppression de la categorie");
  }
});

// Route pour mettre à jour une catégorie
router.put("/update_categorie", async (req, res) => {
  try {
    // Récupérer les données de la requête
    const { current_nom, nom, couleur } = req.body;

    // Vérification des types des données
    if (
      typeof current_nom !== "string" ||
      (nom && typeof nom !== "string") ||
      (couleur && typeof couleur !== "string")
    ) {
      return res.status(400).json({
        success: false,
        message: "Les types des données sont incorrects.",
      });
    }
    // Vérifier que l'ID de la catégorie est fourni
    if (!current_nom) {
      return res.status(400).json({
        success: false,
        message:
          "Le current nom de la catégorie est requis pour la mise à jour.",
      });
    }

    // Vérification que le nom est fourni
    if (!nom) {
      return res.status(400).json({
        success: false,
        message: "Le nom de la catégorie est requis pour la modification.",
      });
    }

    // Vérification que la couleur est fourni
    if (!couleur) {
      return res.status(400).json({
        success: false,
        message: "La couleur de la catégorie est requis pour la modification.",
      });
    }

    // Appeler la méthode pour mettre à jour la catégorie
    const categorieMiseAJour = await controller.updateCategorie(
      current_nom,
      nom,
      couleur
    );

    // Vérifier si la mise à jour a réussi
    if (categorieMiseAJour) {
      res
        .status(200)
        .json({ success: true, message: "Catégorie mise à jour avec succès." });
    } else {
      res.status(404).json({
        success: false,
        message: "La catégorie n'a pas été mise à jour.",
      });
    }
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la mise à jour de la catégorie:",
      error
    );
    res.status(500).json({
      success: false,
      message:
        "Une erreur est survenue lors de la mise à jour de la catégorie.",
    });
  }
});

router.get("/get_categorie_by_nom", async (req, res) => {
  try {
    const { nom } = req.body;

    // Vérification des types des données.
    if (typeof nom !== "string") {
      return res.status(400).json({
        success: false,
        message: "Le type du nom de la catégorie est incorrect.",
      });
    }

    // Vérification que le nom est fourni
    if (!nom) {
      return res.status(400).json({
        success: false,
        message:
          "Le nom de la catégorie est requis pour retourner les valeurs de Categorie.",
      });
    }

    const categorie = await controller.getCategorieByNom(nom);

    // Vérification si la catégorie a été trouvée
    if (categorie) {
      res.status(200).json({
        success: true,
        data: categorie,
      });
    } else {
      res.status(404).json({
        success: false,
        message: "La catégorie n'a pas été trouvée.",
      });
    }
    res.json(categorie);
  } catch (error) {
    console.error("Erreur : " + error.stack);
    res
      .status(500)
      .send("Erreur lors de la récupération des données de la categorie");
  }
});
