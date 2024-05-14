// Import du contrôleur qui gère la logique métier de l'application
import { controller } from "../controller/user.js";

// Import des modules Express et bodyParser pour la gestion des routes et du corps des requêtes.
import express from "express";
import bodyParser from "body-parser";

// Création d'un routeur Express
export let router = express.Router();

// Configuration du middleware bodyParser pour analyser le corps des requêtes en JSON.
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// Route pour récupérer tous les utilisateurs.
router.get("/get_all_users", async (req, res) => {
  try {
    // Appel de la méthode du contrôleur pour récupérer tout les utilisateurs
    const results = await controller.getAllUsers();
    res.json(results);
  } catch (error) {
    // En cas d'erreur, loggez l'erreur et envoyez une réponse d'erreur au client.
    console.error("Erreur : " + error.stack);
    res.status(500).send("Erreur lors de la récupération des données.");
  }
});

// Route pour créer un nouvel utilisateur.
router.post("/create_user", async (req, res) => {
  try {
    // Extraction des donnés du corps de la requête.
    const { nom, prenom, telephone, salaire, mail, motdepasse, ismailverif } =
      req.body;

    // Appel de la méthode du contrôleur pour insérer un nouvel utilisateur.
    await controller.insertUser(
      nom,
      prenom,
      telephone,
      salaire,
      mail,
      motdepasse,
      ismailverif
    );

    // Réponse réussie si tout se passe bien.
    res.sendStatus(200);
  } catch (error) {
    // En cas d'erreur, loggez l'erreur et envoyez une réponse d'erreur au client
    console.error("Erreur : " + error.stack);
    res.status(500).send("Failed to insert user");
  }
});

// Route pour supprimer un utilisateur
router.delete("/delete_user", async (req, res) => {
  try {
    // Récupération du paramètre mail du corps de la requête.
    const { mail } = req.body;

    // Appel de la méthode du contrôleur pour supprimer l'utilisateur.
    await controller.deleteUser(mail);

    // Réponse réussie si tout se passe bien.
    res.send("Utilisateur a été supprimé avec le mail");
  } catch (error) {
    // En cas d'erreur, loggez l'erreur et envoyez une réponse d'erreur au client.
    console.log("Erreur : " + error.stack);
    res.status(500).send("Erreur lors de la suppression de l'utilisateur");
  }
});

// Route pour mettre à jour les informations d'un utilisateur
router.put("/update_user", async (req, res) => {
  try {
    // Extraire les informations de la requête.
    const {
      current_mail,
      new_nom,
      new_prenom,
      new_telephone,
      new_salaire,
      new_mail,
      new_motdepasse,
      new_ismailverif,
    } = req.body;

    // Vérifie si les champs obligatoires sont présents
    if (!current_mail || !new_mail || !new_motdepasse) {
      return res
        .status(400)
        .send("Nom actuel, nouveau mail et nouveau mot de passe sont requis.");
    }

    await controller.updateUser(
      current_mail,
      new_nom,
      new_prenom,
      new_telephone,
      new_salaire,
      new_mail,
      new_motdepasse,
      new_ismailverif
    );

    res.send("L'utilisateur a bien été modifié avec succès");
  } catch (error) {
    console.log(error);
    res.status(500).send("Erreur lors de la modification de l'utilisateur");
  }
});

// Route pour récupérer un utilisateur en fonction du mail.
router.get("/get_user_by_mail", async (req, res) => {
  try {
    // Récupération du paramètre mail de la requête.
    const { mail } = req.body;

    // Appel de la méthode du contrôleur pour récupérer l'utilisateur par le mail.

    const user = await controller.getUserByMail(mail);
    // Réponse JSON contenant les données de l'utilisateur.

    res.json(user);
  } catch (error) {
    // En cas d'erreur, loggez l'erreur et envoyez une réponse d'erreur au client.

    console.error("Erreur : " + error.stack);
    res
      .status(500)
      .send("Erreur lors de la récupération des données de l'utilisateur");
  }
});
