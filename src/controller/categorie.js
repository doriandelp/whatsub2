// src/controller/user.js
import mysql from "mysql";
import { Categorie } from "../model/categorie.js";
import bcrypt from "bcrypt";

import {
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
} from "../environment.js";

export class CategorieController {
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

  async getAllCategorie() {
    try {
      // Définition de la requête SQL pour sélectionner tout les enregistrements dans la table 'users'.
      const query = "SELECT * FROM categorie";

      // Exécution de la requête SQL et attente des résultats
      let results = await this.executeQuery(query);

      // Mapping des résultats de la requête à des objets de la classe Users.
      const categories = results.map(
        (result) => new Categorie(result.nom, result.couleur)
      );

      // Retourne la liste d'utilisateurs
      return categories;
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

  async insertCategorie(nom, couleur) {
    try {
      const existingCategorie = await this.executeQuery(
        "SELECT 1 FROM categorie WHERE couleur = ? LIMIT 1",
        [couleur]
      );

      if (existingCategorie.length > 0) {
        throw new Error("la couleur avec ce nom existe déjà.");
      }
      // Définition de la requête SQL pour insérer un nouvel abonnement
      const query = `
      INSERT INTO categorie (
        nom,
        couleur
      )
      VALUES (?, ?)
    `;

      // Exécution de la requête
      await this.executeQuery(query, [nom, couleur]);
    } catch (error) {
      // Renvoyer une nouvelle erreur avec le message personnalisé
      throw new Error(error);
    }
  }

  async deleteCategorie(nom) {
    try {
      // Vérifier d'abord si l'abonnement existe
      const existingCategorie = await this.executeQuery(
        "SELECT 1 FROM categorie WHERE nom = ?",
        [nom]
      );

      // Si aucun enregistrement n'est retourné, on lance une erreur
      if (existingCategorie.length === 0) {
        throw new Error("Aucun categorie avec ce nom n'existe.");
      }

      // S'il existe, on procède à la suppression
      const query = "DELETE FROM categorie WHERE nom = ?";
      await this.executeQuery(query, [nom]);
    } catch (error) {
      console.error("Database operation failed:", error);
      throw new Error(
        "Erreur lors de la suppression de la categorie : " + error.message
      );
    }
  }

  // Méthode asynchrone pour mettre à jouer les informations d'un utilisateur dans la base de données.
  async updateCategorie(new_nom, new_couleur) {
    try {
      // Définition de la requête SQL pour mettre à jour la base de données.
      const query = `
  UPDATE categorie 
  SET 
    nom = '${new_nom}', 
    couleur = '${new_couleur}'
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
  async getCategorieByNom(nom) {
    try {
      const query = `SELECT * FROM categorie WHERE nom = '${nom}'`;

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
export let controller = new CategorieController();
