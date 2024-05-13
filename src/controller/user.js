// src/controller/user.js
import mysql from "mysql";
import { Users } from "../model/user.js";
import bcrypt from "bcrypt";

import {
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
} from "../environment.js";

export class UserController {
  constructor() {
    this.connection = mysql.createConnection({
      host: DATABASE_HOST,
      user: DATABASE_USER,
      password: DATABASE_PASSWORD,
      database: DATABASE_NAME,
    });

    this.connection.connect((err) => {
      if (err) {
        console.error("Error connecting to the database:", err);
        return;
      }
      console.log("Database connection successfully established.");
    });
  }

  // Cette méthode exécute une requête SQL avec des paramètres en utilisant les méthodes asynchrones de JavaScript.
  // Elle renvoie une promesse qui résoud avec les résultats de la requête ou rejette avec une erreur.
  async executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      // Exécution de la requête SQL en passant la chaîne de la requête et les paramètres.
      // La méthode `query` de l'objet `connection` prend en charge la prévention des injections SQL
      // en utilisant des placeholders (`?`) qui sont remplacés de manière sécurisée par les valeurs dans `params`.
      this.connection.query(query, params, (error, results, fields) => {
        if (error) {
          // Si une erreur survient lors de l'exécution de la requête, la promesse est rejetée avec cette erreur.
          reject(error);
        } else {
          // Si la requête réussit, la promesse est résolue avec les résultats.
          resolve(results);
        }
      });
    });
  }

  async getAllUsers() {
    try {
      // Définition de la requête SQL pour sélectionner tout les enregistrements dans la table 'users'.
      const query = "SELECT * FROM utilisateur";

      // Exécution de la requête SQL et attente des résultats
      let results = await this.executeQuery(query);

      // Mapping des résultats de la requête à des objets de la classe Users.
      const users = results.map(
        (result) =>
          new Users(
            result.nom,
            result.prenom,
            result.telephone,
            result.salaire,
            result.mail,
            result.motdepasse,
            result.ismailverif ? result.ismailverif[0] != 0 : false // Ajout d'une vérification ici
          )
      );

      // Retourne la liste d'utilisateurs
      return users;
    } catch (error) {
      // Log de l'erreur pour un diagnostic interne
      console.error("Database operation failed:", error);

      // Personnalisation des messages d'erreur basée sur le type ou le contenu de l'erreur
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (error.code === "ER_DUP_ENTRY") {
        errorMessage =
          "Duplicate entry. The email or username is already in use.";
      } else if (error.message.includes("ER_NO_REFERENCED_ROW")) {
        errorMessage = "Invalid reference. Please check your input data.";
      } else if (error.message.includes("password")) {
        errorMessage = error.message; // Propager des messages d'erreur spécifiques au mot de passe
      }

      // Renvoyer une nouvelle erreur avec le message personnalisé
      throw new Error(errorMessage);
    }
  }

  async validatePassword(password) {
    // Vérifier la longueur minimale
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }

    // Vérifier la présence d'au moins une majuscule
    if (!/[A-Z]/.test(password)) {
      throw new Error("Password must contain at least one uppercase letter.");
    }

    // Vérifier la présence d'au moins une minuscule
    if (!/[a-z]/.test(password)) {
      throw new Error("Password must contain at least one lowercase letter.");
    }

    // Vérifier la présence d'au moins un chiffre
    if (!/[0-9]/.test(password)) {
      throw new Error("Password must contain at least one digit.");
    }

    // Vérifier la présence d'au moins un caractère spécial
    if (!/[^A-Za-z0-9]/.test(password)) {
      throw new Error("Password must contain at least one special character.");
    }
  }

  async validateEmail(email) {
    // Vérifier que l'email contient un arrobase
    if (!email.includes("@")) {
      throw new Error("Email must contain an @ symbol.");
    }

    // Vérifier que l'email contient un point après l'arrobase
    const parts = email.split("@");
    if (parts[1].indexOf(".") === -1) {
      throw new Error("Email must contain a dot (.) after the @ symbol.");
    }
  }

  async insertUser(
    nom = "",
    prenom = "",
    telephone = "",
    salaire = 0,
    mail,
    motdepasse,
    ismailverif
  ) {
    try {
      // Vérifier si un utilisateur avec le même email existe déjà
      const existingEmail = await this.executeQuery(
        "SELECT 1 FROM utilisateur WHERE mail = ? LIMIT 1",
        [mail]
      );

      if (existingEmail.length > 0) {
        throw new Error("An account with this email already exists.");
      }

      // Valider l'email
      await this.validateEmail(mail);

      // Valider le mot de passe
      await this.validatePassword(motdepasse);

      // Hashage du mot de passe avec bcrypt
      const hashedPassword = await bcrypt.hash(motdepasse, 10);

      // Remplacer null par false pour ismailverif
      if (ismailverif === null) {
        throw new Error("Il est impossible que ismailverif soit null.");
      }

      // Définition de la requête SQL pour insérer un nouvel utilisateur
      const query = `
      INSERT INTO utilisateur (nom, prenom, telephone, salaire, mail, motdepasse, ismailverif)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

      // Exécution de la requête
      await this.executeQuery(query, [
        nom,
        prenom,
        telephone,
        salaire,
        mail,
        hashedPassword,
        ismailverif, // Convertir la valeur booléenne en 0 ou 1
      ]);
    } catch (error) {
      // Log de l'erreur pour un diagnostic interne
      console.error("Database operation failed:", error);

      // Personnalisation des messages d'erreur basée sur le type ou le contenu de l'erreur
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (error.code === "ER_DUP_ENTRY") {
        errorMessage =
          "Duplicate entry. The email or username is already in use.";
      } else if (error.message.includes("ER_NO_REFERENCED_ROW")) {
        errorMessage = "Invalid reference. Please check your input data.";
      } else if (error.message.includes("password")) {
        errorMessage = error.message; // Propager des messages d'erreur spécifiques au mot de passe
      }

      // Renvoyer une nouvelle erreur avec le message personnalisé
      throw new Error(errorMessage);
    }
  }

  async deleteUser(mail) {
    try {
      const query = `DELETE FROM utilisateur WHERE mail = '${mail}'`;

      await this.validateEmail(mail);

      await this.executeQuery(query);
    } catch (error) {
      // Log de l'erreur pour un diagnostic interne
      console.error("Database operation failed:", error);

      // Personnalisation des messages d'erreur basée sur le type ou le contenu de l'erreur
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (error.code === "ER_DUP_ENTRY") {
        errorMessage =
          "Duplicate entry. The email or username is already in use.";
      } else if (error.message.includes("ER_NO_REFERENCED_ROW")) {
        errorMessage = "Invalid reference. Please check your input data.";
      } else if (error.message.includes("password")) {
        errorMessage = error.message; // Propager des messages d'erreur spécifiques au mot de passe
      }

      // Renvoyer une nouvelle erreur avec le message personnalisé
      throw new Error(errorMessage);
    }
  }

  // Méthode asynchrone pour mettre à jour les informations d'un utilisateur dans la base de données.
  async updateUser(
    current_mail, // Utilisez 'current_nom' pour identifier l'utilisateur actuel
    new_nom = "",
    new_prenom = "",
    new_telephone = "",
    new_salaire = 0,
    new_mail,
    new_motdepasse,
    new_ismailverif = 0
  ) {
    try {
      if (!new_mail || !new_motdepasse) {
        throw new Error("Email and password are required");
      }

      // Validationde l'email
      await this.validateEmail(new_mail);

      // Validation du mot de passe
      await this.validatePassword(new_motdepasse);

      const hashedPassword = await bcrypt.hash(new_motdepasse, 10);

      const query = `
      UPDATE utilisateur 
      SET 
        nom = ?,
        prenom = ?,
        telephone = ?,
        salaire = ?,
        mail = ?,
        motdepasse = ?,
        ismailverif = ?
      WHERE mail = ?
    `;

      await this.executeQuery(query, [
        new_nom, // Utiliser new_nom si fourni, sinon conserver l'ancien
        new_prenom,
        new_telephone,
        new_salaire,
        new_mail,
        hashedPassword,
        new_ismailverif,
        current_mail, // Assurez-vous de mettre à jour l'utilisateur correct
      ]);
    } catch (error) {
      console.error("Database operation failed:", error);
      throw error; // Relancer l'erreur pour un traitement ultérieur
    }
  }
  // Méthode asynchrone pour récupérer un utilisateur en fonction du nom de l'entreprise.
  async getUserByMail(mail) {
    try {
      // Construction de la requête SQL pour sélectionneur tout les champs de l'utilisateur ayant le nom de l'entreprise spécifié.
      const query = `SELECT *, ismailverif = 1 AS ismailverif FROM utilisateur WHERE mail = '${mail}'`;
      // Exécution de la requête SQL et attente des résultats.
      let results = await this.executeQuery(query);

      await this.validateEmail(mail);

      // Convertir les résultats en utilisant une boucle forEach
      results.forEach((result) => {
        // Si la valeur de ismailverif est null, la convertir en false
        if (result.ismailverif === null) {
          result.ismailverif = false;
        } else {
          // Sinon, convertir en booléen
          result.ismailverif = result.ismailverif === 1 ? true : false;
        }
      });

      // Retour des résultats de la requête
      return results;
    } catch (error) {
      // Log de l'erreur pour un diagnostic interne
      console.error("Database operation failed:", error);

      // Personnalisation des messages d'erreur basée sur le type ou le contenu de l'erreur
      let errorMessage = "An unexpected error occurred. Please try again.";

      if (error.code === "ER_DUP_ENTRY") {
        errorMessage =
          "Duplicate entry. The email or username is already in use.";
      } else if (error.message.includes("ER_NO_REFERENCED_ROW")) {
        errorMessage = "Invalid reference. Please check your input data.";
      } else if (error.message.includes("password")) {
        errorMessage = error.message; // Propager des messages d'erreur spécifiques au mot de passe
      }

      // Renvoyer une nouvelle erreur avec le message personnalisé
      throw new Error(errorMessage);
    }
  }
}

// Export de l'instance unique du contrôleur, permettant l'accès aux fonctionnalités définies dans la classe Controller.
export let controller = new UserController();
