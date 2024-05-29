// src/controller/user.js
import mysql from "mysql";
import { Users } from "../model/user.js";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "../../nodemailer.js"; // Importer la fonction pour envoyer l'email

import {
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
} from "../environment.js";

// Définir une constante pour le nombre de hachages
const HASH_SALT_ROUNDS = 10;

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
          console.error("Erreur lors de l'exécution de la requête SQL:", error); // Ajout de logs d'erreur

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
      // Définition de la requête SQL pour sélectionner tout les enregistrements dans la table 'utilisateur'.
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
      throw new Error(
        "Une erreur s'est produite lors de la récupération des utilisateurs."
      );
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
  catch(error) {
    console.error("Validation du mot de passe échouée:", error.message);
    throw new Error("La validation du mot de passe a échoué.");
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
  catch(error) {
    console.error("Validation de l'email échouée:", error.message);
    throw new Error("La validation de l'email a échoué.");
  }

  async insertUser(
    nom,
    prenom,
    telephone,
    salaire,
    mail,
    motdepasse,
    ismailverif
  ) {
    try {
      console.log("Paramètres reçus:", {
        nom,
        prenom,
        telephone,
        salaire,
        mail,
        motdepasse,
        ismailverif,
      });

      // Vérifier si un utilisateur avec le même email existe déjà
      const existingEmail = await this.executeQuery(
        "SELECT 1 FROM utilisateur WHERE mail = ? LIMIT 1",
        [mail]
      );

      if (existingEmail.length > 0) {
        throw new Error("An account with this email already exists.");
      }

      await this.validateEmail(mail);
      await this.validatePassword(motdepasse);

      // const hashedPassword = await bcrypt.hash(motdepasse, HASH_SALT_ROUNDS);
      // console.log("Mot de passe haché:", hashedPassword);

      // Remplacer null par false pour ismailverif
      if (ismailverif === null) {
        throw new Error("Il est impossible que ismailverif soit null.");
      }
      // Définition de la requête SQL pour insérer un nouvel utilisateur
      const query = `
      INSERT INTO utilisateur (nom, prenom, telephone, salaire, mail, motdepasse, ismailverif)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      console.log("Requête SQL:", query);
      console.log("Valeurs:", [
        nom,
        prenom,
        telephone,
        salaire,
        mail,
        // hashedPassword,
        motdepasse,
        ismailverif ? "1" : "0",
      ]);

      await this.executeQuery(query, [
        nom,
        prenom,
        telephone,
        salaire,
        mail,
        // hashedPassword,
        motdepasse,
        ismailverif ? "1" : "0", // Convertir la valeur booléenne en 0 ou 1
      ]);

      // Envoyer un email de vérification après l'insertion réussie
      // await sendVerificationEmail(mail);
    } catch (error) {
      throw new Error(
        "Une erreur s'est produite lors de l'insertion d'un utilisateur."
      );
    }
  }

  async deleteUser(mail) {
    try {
      // Vérifier d'abord si l'abonnement existe
      const existingUtilisateur = await this.executeQuery(
        "SELECT 1 FROM utilisateur WHERE mail = ?",
        [mail]
      );

      // Si aucun enregistrement n'est retourné, on lance une erreur
      if (existingUtilisateur.length === 0) {
        throw new Error("Aucun Utilisateur avec ce mail n'existe.");
      }

      await this.validateEmail(mail);

      const query = "DELETE FROM utilisateur WHERE mail = ?";

      const result = await this.executeQuery(query, [mail]);

      // Vérification si la suppression a affecté des lignes
      if (result.affectedRows > 0) {
        return true; // La catégorie a été supprimée avec succès
      } else {
        return false; // La suppression a échoué
      }
    } catch (error) {
      throw new Error(
        "Une erreur s'est produite lors de la suppression d'un utilisateur."
      );
    }
  }

  async updateUser(
    current_mail,
    nom,
    prenom,
    telephone,
    salaire,
    mail,
    motdepasse,
    ismailverif
  ) {
    try {
      // Vérification que le mail et le mot de passe sont fournis
      if (!mail || !motdepasse) {
        throw new Error("Email and password are required");
      }

      // condition pour vérifier que current_mail et mail ne sont pas identiques
      if (current_mail === mail) {
        throw new Error(
          "Le mail actuel et le nouveau mail ne peuvent pas être identiques."
        );
      }

      // Validation de l'email
      await this.validateEmail(mail);

      // Validation du mot de passe
      await this.validatePassword(motdepasse);

      const existingUtilisateur = await this.executeQuery(
        "SELECT 1 FROM utilisateur WHERE mail = ?",
        [current_mail]
      );

      if (existingUtilisateur.length === 0) {
        throw new Error("Aucun utilisateur avec cet email actuel n'existe.");
      }

      const existingNewMailUtilisateur = await this.executeQuery(
        "SELECT 1 FROM utilisateur WHERE mail = ?",
        [mail]
      );

      if (existingNewMailUtilisateur.length > 0 && mail !== current_mail) {
        throw new Error("Cet email existe déjà.");
      }

      let updatedFields = [];
      let updatedValues = [];

      // Mise à jour des champs et valeurs en fonction des paramètres fournis
      if (nom !== undefined) {
        updatedFields.push("nom = ?");
        updatedValues.push(nom);
      }
      if (prenom !== undefined) {
        updatedFields.push("prenom = ?");
        updatedValues.push(prenom);
      }
      if (telephone !== undefined) {
        updatedFields.push("telephone = ?");
        updatedValues.push(telephone);
      }
      if (salaire !== undefined) {
        updatedFields.push("salaire = ?");
        updatedValues.push(salaire);
      }
      if (mail !== undefined) {
        updatedFields.push("mail = ?");
        updatedValues.push(mail);
      }

      if (motdepasse !== undefined) {
        // console.log("Hachage du mot de passe");
        // const hashedPassword = await bcrypt.hash(motdepasse, HASH_SALT_ROUNDS);
        updatedFields.push("motdepasse = ?");
        updatedValues.push(motdepasse);
      }

      if (ismailverif !== undefined) {
        if (ismailverif === true) {
          updatedFields.push("ismailverif = ?");
          updatedValues.push(1);
        } else {
          throw new Error(
            "La vérification de l'email doit être vraie pour modifier l'utilisateur."
          );
        }
      }

      updatedValues.push(current_mail);

      const query = `
         UPDATE utilisateur
         SET ${updatedFields.join(", ")}
         WHERE mail = ?
       `;

      const result = await this.executeQuery(query, updatedValues);

      // Si l'email a été mis à jour, envoyer un email de vérification
      // if (mail !== current_mail) {
      //   await sendVerificationEmail(mail);
      // }

      return result.affectedRows > 0;
    } catch (error) {
      console.error("Erreur dans updateUser:", error); // Afficher l'objet d'erreur complet
      throw new Error(
        "Une erreur s'est produite lors de la modification d'un utilisateur: " +
          error.message
      );
    }
  }

  async getUserByMailPassword(mail, motdepasse) {
    try {
      const query = `SELECT nom, prenom, telephone, salaire, mail, motdepasse, ismailverif = 1 AS ismailverif FROM utilisateur WHERE mail = ? AND motdepasse = ?`;
      let results = await this.executeQuery(query, [mail, motdepasse]);

      if (results.length === 0) {
        throw new Error(
          "Aucun utilisateur avec cet email et ce mot de passe n'a été trouvé."
        );
      }

      let user = results[0];
      user.ismailverif = user.ismailverif === 1;

      console.log(user);
      return user;
    } catch (error) {
      console.error("Erreur dans getUserByMailPassword:", error.message);
      throw new Error(
        "Une erreur s'est produite lors de la récupération d'un utilisateur par l'email et le mot de passe: " +
          error.message
      );
    }
  }
}

// Export de l'instance unique du contrôleur, permettant l'accès aux fonctionnalités définies dans la classe Controller.
export let controller = new UserController();
