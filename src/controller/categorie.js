// src/controller/user.js
import mysql from "mysql";
import { Categorie } from "../model/categorie.js";

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
      // Définition de la requête SQL pour sélectionner tout les enregistrements dans la table 'categorie'.
      const query = "SELECT * FROM categorie";

      // Exécution de la requête SQL et attente des résultats
      let results = await this.executeQuery(query);

      // Mapping des résultats de la requête à des objets de la classe categorie.
      const categories = results.map(
        (result) => new Categorie(result.nom, result.couleur)
      );

      // Retourne la liste des categories
      return categories;
    } catch (error) {
      throw new Error(
        "Une erreur s'est produite lors de la récupération des categories."
      );
    }
  }

  async insertCategorie(nom, couleur) {
    try {
      const existingCategorie = await this.executeQuery(
        "SELECT 1 FROM categorie WHERE nom = ? LIMIT 1",
        [nom]
      );

      if (existingCategorie.length > 0) {
        throw new Error("la nom existe déjà.");
      }
      // Définition de la requête SQL pour insérer une nouvelle categorie
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
      throw new Error(
        "Erreur lors de l'insertion de la categorie : " + error.message
      );
    }
  }

  async deleteCategorie(nom) {
    try {
      // Vérifier d'abord si la categorie existe
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
      const result = await this.executeQuery(query, [nom]);

      // Vérification si la suppression a affecté des lignes
      if (result.affectedRows > 0) {
        return true; // La catégorie a été supprimée avec succès
      } else {
        return false; // La suppression a échoué
      }
    } catch (error) {
      console.error("Database operation failed:", error);
      throw new Error(
        "Erreur lors de la suppression de la categorie : " + error.message
      );
    }
  }

  // Méthode asynchrone pour mettre à jour les informations d'une categorie
  async updateCategorie(current_nom, nom, couleur) {
    try {
      // Validation des entrées.
      if (!nom && !couleur) {
        throw new Error(
          "Au moins un des paramètres doit être fourni (nom, couleur)."
        );
      }

      // Condition pour vérifier que current_nom et nom ne sont pas identiques
      if (current_nom === nom) {
        throw new Error(
          "Le nom actuel et le nouveau nom ne peuvent pas être identiques."
        );
      }

      // Vérifier si le current_nom existe
      if (nom) {
        const existingCategorie = await this.executeQuery(
          "SELECT 1 FROM categorie WHERE nom = ?",
          [current_nom]
        );

        if (existingCategorie.length === 0) {
          throw new Error("Aucune catégorie avec ce nom actuel n'existe.");
        }
      }

      // Vérifier si le nouveau nom est unique
      if (nom) {
        const existingNewNomCategorie = await this.executeQuery(
          "SELECT 1 FROM categorie WHERE nom = ?",
          [nom]
        );

        if (existingNewNomCategorie.length > 0) {
          throw new Error("Ce nom existe deja");
        }
      }

      // Initialisation des champs et valeurs mise à jour
      let updatedFields = [];
      let updatedValues = [];

      // Mise à jour des champs et valeurs en fonction des paramètres fournis
      if (nom !== undefined) {
        updatedFields.push("nom = ?");
        updatedValues.push(nom);
      }

      if (couleur !== undefined) {
        updatedFields.push("couleur = ?");
        updatedValues.push(couleur);
      }

      // Ajout de l'current_nom pour la condition WHERE
      updatedValues.push(current_nom);

      // Construction de la requête SQL
      const query = `
        UPDATE categorie
        SET ${updatedFields.join(", ")}
        WHERE nom = ?
      `;

      // Exécution de la requête de mise à jour dans la base de données
      const result = await this.executeQuery(query, updatedValues);

      // Vérification si la mise à jour a affecté des lignes
      return result.affectedRows > 0;
    } catch (error) {
      console.error(
        "Une erreur est survenue lors de la mise à jour de la catégorie",
        error
      );
      throw new Error(
        "Une erreur est survenue lors de la mise à jour de la catégorie."
      );
    }
  }

  // Méthode asynchrone pour récupérer un utilisateur en fonction du nom de la categorie
  async getCategorieByNom(nom) {
    try {
      const query = `SELECT * FROM categorie WHERE nom = ?`;

      // Exécution de la requête SQL et attente des résultats.
      let result = await this.executeQuery(query, [nom]);

      // Vérification si la catérgoie a été trouvée
      if (result.length === 0) {
        throw new Error("Aucune catégorie avec ce nom n'a été trouvée.");
      }
      // Retour la catégorie trouvée
      return result[0];
    } catch (error) {
      // En cas d'erreur, lance une exception pour gérer l'erreur à un niveau supérieur
      throw new Error(
        "Une erreur s'est produite lors de la récupération de la categorie par son nom." +
          error.message
      );
    }
  }

  async getCategorieById(id_Categorie) {
    try {
      const query = `SELECT * FROM categorie WHERE id_Categorie = ?`;
      let result = await this.executeQuery(query, [id_Categorie]);

      if (result.length === 0) {
        throw new Error(
          "Aucune catégorie avec ce id_Categorie n'a été trouvée."
        );
      }
      return result[0];
    } catch (error) {
      throw new Error(
        "Une erreur s'est produite lors de la récupération de la categorie par son id." +
          error.message
      );
    }
  }
}

// Export de l'instance unique du contrôleur, permettant l'accès aux fonctionnalités définies dans la classe Controller.
export let controller = new CategorieController();
