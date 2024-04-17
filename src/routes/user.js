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

/*
    Cette partie du code importe le contrôleur principal ('controller') qui gère la logique métier de l'application.
    Ensuite, elle utilise le module Express pour créer un routeur ('router'). De plus, le module 'body-parser'
    est configuré comme un middleware pour analyser le corps des requêtes HTTP, permettant ainsi de 
    récupérer au format JSON ou URL encodé dans les requêtes.

*/

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

    /*
    Cette partie du code traite la route qui permet de créer un nouvel utilisateur (/create_user). 
    Les données nécessaires pour créer l'utilisateur sont extraites du corps de la requête (req.body) à l'aide de la déstructuration.
    Ensuite, ces données sont passées en tant qu'arguments à la méthode du contrôleur (insertUser) chargée d'insérer ces informations
    dans la base de données. Cela permet de séparer la logique de gestion des routes de la logique métier, 
    favorisant une meilleure organisation et facilitant la maintenance du code.
    */
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

/*
Ces routes définissent des points d'API pour récupérer tout les utilisateurs
('/get_all_users') et créer un nouvel utilisaateur ('/create_user').
Les méthodes du contrôleur associées sont appelées pour traiter ces requêtes et 
des réponses appropriées sont renvoyées au client en cas de succès d'erreur
*/

// Route pour supprimer un utilisateur
router.delete("/delete_user", async (req, res) => {
  try {
    // Récupération du paramètre firm_name du corps de la requête.
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
    // Récupération des paramètres du corps de la requête.
    const { nom } = req.body;
    const {
      new_nom,
      new_prenom,
      new_telephone,
      new_salaire,
      new_mail,
      new_motdepasse,
      new_ismailverif,
    } = req.body;

    // Appel de la méthode du contrôleur pour mettre à jour l'utilisateur.
    await controller.updateUser(
      nom,
      new_nom,
      new_prenom,
      new_telephone,
      new_salaire,
      new_mail,
      new_motdepasse,
      new_ismailverif
    );

    // Réponse réussie si tout se passe bien
    res.send("L'utilisateur a bien été modifié avec succès");
  } catch (error) {
    // En cas d'erreur, loggez l'erreur et envoyez une réponse d'erreur au client.
    console.log("Recette a été modifié");
    res.status(500).send("Erreur lors de la modification de l'utilisateur");
  }
});

// Route pour récupérer un utilisateur en fonction du nom de l'entreprise (firm_name).
router.get("/get_user_by_nom", async (req, res) => {
  try {
    // Récupération du paramètre firm_name de la requête.
    const { nom } = req.body;

    // Appel de la méthode du contrôleur pour récupérer l'utilisateur par le nom de l'entreprise.

    const user = await controller.getUserByNom(nom);
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
