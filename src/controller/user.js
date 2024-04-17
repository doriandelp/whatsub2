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
      // En cas d'erreur, lance une exepction pour la gérer à un niveau supérieur
      throw error;
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
  // Cette méthode asynchrone insère un nouvel utilisateur dans la base de données.
  // Elle prend en paramètre les données de l'utilisateur, dont certaines ont des valeurs par défaut si non spécifiées.
  async insertUser(
    nom = "",
    prenom = "",
    telephone = "",
    salaire = 0,
    mail,
    motdepasse,
    ismailverif = 0
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

      // Hashage du mot de passe avec bcrypt avant insertion dans la base de données pour des raisons de sécurité.
      const hashedPassword = await bcrypt.hash(motdepasse, 10);

      // Définition de la requête SQL pour insérer un nouvel utilisateur. Les placeholders `?` sont utilisés pour éviter les injections SQL.
      const query = `
      INSERT INTO utilisateur (nom, prenom, telephone, salaire, mail, motdepasse, ismailverif)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

      // Appel de `executeQuery` pour exécuter la requête d'insertion avec les valeurs fournies.
      await this.executeQuery(query, [
        nom,
        prenom,
        telephone,
        salaire,
        mail,
        hashedPassword,
        ismailverif,
      ]);
    } catch (error) {
      // En cas d'erreur lors de l'insertion, l'erreur est capturée et relancée pour être gérée à un niveau supérieur.
      throw error;
    }
  }

  async deleteUser(mail) {
    try {
      const query = `DELETE FROM utilisateur WHERE mail = '${mail}'`;

      await this.executeQuery(query);
    } catch (error) {
      // En cas d'erreur, lance une exception pour la gérer à un niveau supérieur
      throw error;
    }
  }

  // Méthode asynchrone pour mettre à jouer les informations d'un utilisateur dans la base de données.
  async updateUser(
    new_nom,
    new_prenom,
    new_telephone,
    new_salaire,
    new_mail,
    new_motdepasse,
    new_ismailverif // les enregistrements de l'utilisateur en fonction du nom de l'entreprise
  ) {
    try {
      // Définition de la requête SQL pour mettre à jour la base de données.
      const query = `
    UPDATE utilisateur 
    SET 
      nom = '${new_nom}', 
      prenom = '${new_prenom}', 
      telephone = '${new_telephone}', 
      salaire = '${new_salaire}', 
      mail = '${new_mail}',
      motdepasse = '${new_motdepasse}', 
      ismailverif = '${new_ismailverif}'
    WHERE nom = '${new_nom}'`;

      // Exécution de la requête SQL de mise à jour.
      console.log(query); // Affichage de la requête dans la console à des fins de débogage
      await this.executeQuery(query);
    } catch (error) {
      // En cas d'erreur, lance une exception pour la gérer à un niveau supérieur
      throw error;
    }
  }

  // Méthode asynchrone pour récupérer un utilisateur en fonction du nom de l'entreprise.
  async getUserByNom(nom) {
    try {
      // Construction de la requête SQL pour sélectionneur tout les champs de l'utilisateur ayant le nom de l'entreprise spécifié.
      const query = `SELECT * FROM utilisateur WHERE nom = '${nom}'`;

      // Exécution de la requête SQL et attente des résultats.
      let result = await this.executeQuery(query);

      // Retour des résultats de la requête
      return result;
    } catch (error) {
      // En cas d'erreur, lance une exception pour gérer l'erreur à un niveau supérieur
      throw error;
    }
  }
}

// Export de l'instance unique du contrôleur, permettant l'accès aux fonctionnalités définies dans la classe Controller.
export let controller = new UserController();
