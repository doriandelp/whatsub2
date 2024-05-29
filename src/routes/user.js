// Import des modules Express et bodyParser pour la gestion des routes et du corps des requêtes.
import express from "express";
import bcrypt from "bcrypt";
import bodyParser from "body-parser";

// Import du contrôleur qui gère la logique métier de l'application
import { controller } from "../controller/user.js";
// import { requireAuth } from "../middleware/auth.js";

// Création d'un routeur Express
export let router = express.Router();

// Configuration du middleware bodyParser pour analyser le corps des requêtes en JSON.
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

// router.use(requireAuth); // Protéger toutes les routes de ce routeur

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
    console.log("Début de la création de l'utilisateur");

    // Extraction des donnés du corps de la requête.
    const { nom, prenom, telephone, salaire, mail, motdepasse, ismailverif } =
      req.body;
    // Vérification que le champ mail est une chaîne de caractères et qu'il contient un '@' et un '.'
    if (
      !mail ||
      typeof mail !== "string" ||
      !mail.includes("@") ||
      !mail.includes(".")
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Le mail de l'utilisateur est requis, doit être une chaîne de caractères et contenir un '@' et un '.'.",
      });
    }

    // Vérification que le mot de passe est une chaîne de caractères et respecte les critères de complexité
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    if (
      !motdepasse ||
      typeof motdepasse !== "string" ||
      !passwordRegex.test(motdepasse)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Le mot de passe de l'utilisateur est requis, doit être une chaîne de caractères et contenir au moins 8 caractères, une lettre minuscule, une lettre majuscule et un caractère spécial.",
      });
    }

    // Vérification des paramètres facultatifs
    if (nom && typeof nom !== "string") {
      return res.status(400).json({
        success: false,
        message: "Le nom de l'utilisateur doit être une chaîne de caractères.",
      });
    }

    if (prenom && typeof prenom !== "string") {
      return res.status(400).json({
        success: false,
        message:
          "Le prénom de l'utilisateur doit être une chaîne de caractères.",
      });
    }

    if (telephone && typeof telephone !== "string") {
      return res.status(400).json({
        success: false,
        message:
          "Le téléphone de l'utilisateur doit être une chaîne de caractères.",
      });
    }

    if (salaire && typeof salaire !== "number") {
      return res.status(400).json({
        success: false,
        message: "Le salaire de l'utilisateur doit être un nombre.",
      });
    }

    if (ismailverif !== undefined && typeof ismailverif !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "La vérification de l'email doit être un booléen.",
      });
    }

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
    res
      .status(200)
      .json({ success: true, message: "Utilisateur créé avec succès." });
    console.log("Utilisateur créé avec succès");
  } catch (error) {
    // En cas d'erreur, loggez l'erreur et envoyez une réponse d'erreur au client
    console.error("Erreur : " + error.stack);
    res.status(500).json({
      success: false,
      message: "Échec de la création de l'utilisateur.",
    });
  }
});

// Route pour supprimer un utilisateur
router.delete("/delete_user", async (req, res) => {
  try {
    // Récupération du paramètre mail du corps de la requête.
    const { mail } = req.body;

    // Vérification des types des données.
    if (typeof mail != "string") {
      res.sendStatus(400); // Bad Request
      return;
    }

    // Vérification que le nom est fourni
    if (!mail) {
      return res.status(400).json({
        success: false,
        message: "Le mail de l'utilisateur est requis.",
      });
    }

    // Appel de la méthode du contrôleur pour supprimer l'utilisateur.
    const result = await controller.deleteUser(mail);
    // Vérifier si la suppression a réussi
    if (result) {
      return res
        .status(200)
        .json({ success: true, message: "Utilisateur supprimé avec succès." });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Utilisateur non trouvé." });
    }
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    res.status(500).json({
      success: false,
      message:
        "Une erreur est survenue lors de la suppression de l'utilisateur.",
    });
  }
});

// Route pour mettre à jour les informations d'un utilisateur
router.put("/update_user", async (req, res) => {
  try {
    // Extraire les informations de la requête.
    const {
      current_mail,
      nom,
      prenom,
      telephone,
      salaire,
      mail,
      motdepasse,
      ismailverif,
    } = req.body;

    // Vérification des champs obligatoires
    if (!current_mail || typeof current_mail !== "string") {
      return res.status(400).json({
        success: false,
        message:
          "Le mail actuel de l'utilisateur est requis et doit être une chaîne de caractères.",
      });
    }

    if (
      !mail ||
      typeof mail !== "string" ||
      !mail.includes("@") ||
      !mail.includes(".")
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Le mail de l'utilisateur est requis, doit être une chaîne de caractères et contenir un '@' et un '.'.",
      });
    }

    // Vérification que le mot de passe est une chaîne de caractères et respecte les critères de complexité
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    if (
      !motdepasse ||
      typeof motdepasse !== "string" ||
      !passwordRegex.test(motdepasse)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Le mot de passe de l'utilisateur est requis, doit être une chaîne de caractères et contenir au moins 8 caractères, une lettre minuscule, une lettre majuscule et un caractère spécial.",
      });
    }

    // Vérification des champs facultatifs
    if (nom && typeof nom !== "string") {
      return res.status(400).json({
        success: false,
        message:
          "Le nouveau nom de l'utilisateur doit être une chaîne de caractères.",
      });
    }

    if (prenom && typeof prenom !== "string") {
      return res.status(400).json({
        success: false,
        message:
          "Le prénom de l'utilisateur doit être une chaîne de caractères.",
      });
    }

    if (telephone && typeof telephone !== "string") {
      return res.status(400).json({
        success: false,
        message: "Le numéro de téléphone doit être une chaîne de caractères.",
      });
    }

    if (salaire && typeof salaire !== "number") {
      return res.status(400).json({
        success: false,
        message: "Le salaire doit être un nombre.",
      });
    }

    if (ismailverif !== undefined && typeof ismailverif !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "La vérification de l'email doit être un booléen.",
      });
    }

    // Appel à la méthode de mise à jour
    const result = await controller.updateUser(
      current_mail,
      nom,
      prenom,
      telephone,
      salaire,
      mail,
      motdepasse,
      ismailverif
    );

    if (result) {
      res.status(200).json({
        success: true,
        message: "Utilisateur mis à jour avec succès.",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "L'utilisateur n'a pas été mis à jour.",
      });
    }
  } catch (error) {
    console.error(
      "Une erreur est survenue lors de la mise à jour de l'utilisateur:",
      error
    );
    res.status(500).json({
      success: false,
      message:
        "Une erreur est survenue lors de la mise à jour de l'utilisateur.",
    });
  }
});

// Route de connexion
router.post("/login", async (req, res) => {
  try {
    const { mail, motdepasse } = req.body;

    if (!mail || !motdepasse) {
      return res.status(400).json({
        success: false,
        message: "Mail et mot de passe sont requis.",
      });
    }

    // Vérification des informations d'identification de l'utilisateur
    const user = await controller.getUserByMailPassword(mail, motdepasse);

    // Log de l'utilisateur récupéré
    console.log("Utilisateur récupéré:", user);
    // Assurez-vous que user existe avant de continuer
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }
    // Log avant la comparaison des mots de passe
    console.log("Mot de passe fourni:", motdepasse);
    console.log("Mot de passe stocké:", user.motdepasse);

    // const isPasswordValid = await bcrypt.compare(motdepasse, user.motdepasse);
    const isPasswordValid = motdepasse === user.motdepasse;

    // Log après la comparaison des mots de passe
    console.log("Le mot de passe est-il valide ? :", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email ou mot de passe incorrect",
      });
    }

    req.session.mail = user.mail; // Stocker l'mail de l'utilisateur dans la session
    console.log("Session créée : ", req.session); // Ajoutez cette ligne pour vérifier la création de la session
    res.json({ success: true, message: "Connexion réussie" });
  } catch (error) {
    console.error("Erreur lors de la connexion de l'utilisateur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la connexion de l'utilisateur.",
    });
  }
});

router.get("/protected", (req, res) => {
  if (req.session.mail) {
    res.json({
      success: true,
      message: "Vous êtes connecté.",
      mail: req.session.mail,
    });
  } else {
    res
      .status(401)
      .json({
        success: false,
        message: "Vous devez être connecté pour accéder à cette ressource.",
      });
  }
});

// Route pour déconnecter l'utilisateur
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Erreur lors de la déconnexion de l'utilisateur:", err);
      return res.status(500).json({
        success: false,
        message: "Erreur lors de la déconnexion de l'utilisateur.",
      });
    }
    res.json({ success: true, message: "Déconnexion réussie" });
  });
});

export { router as userRouter };
