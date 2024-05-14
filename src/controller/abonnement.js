// src/controller/user.js
import mysql from "mysql";
import { Abonnement } from "../model/abonnement.js";

import {
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
} from "../environment.js";

export class AbonnementController {
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

  async getAllAbonnement() {
    try {
      // Définition de la requête SQL pour sélectionner tout les enregistrements dans la table 'abonnement'.
      const query = "SELECT * FROM abonnement";

      // Exécution de la requête SQL et attente des résultats
      let results = await this.executeQuery(query);

      // Mapping des résultats de la requête à des objets de la classe abonnement.
      const abonnements = results.map(
        (result) =>
          new Abonnement(
            result.nom_abonnement,
            result.nom_fournisseur,
            result.montant,
            result.frequence_prelevement,
            result.date_echeance,
            result.date_fin_engagement,
            result.IsEngagement ? result.IsEngagement[0] != 0 : false,
            result.id_categorie
          )
      );

      // Retourne la liste d'un abonnement.
      return abonnements;
    } catch (error) {
      throw new Error(
        "Une erreur s'est produite lors de la récupération des abonnements."
      );
    }
  }

  async insertAbonnement(
    nom_abonnement,
    nom_fournisseur,
    montant,
    frequence_prelevement,
    date_echeance,
    date_fin_engagement,
    IsEngagement,
    id_categorie
  ) {
    try {
      // Vérifier si un abonnement avec le même nom existe déjà
      const existingAbonnement = await this.executeQuery(
        "SELECT 1 FROM abonnement WHERE nom_abonnement = ? LIMIT 1",
        [nom_abonnement]
      );

      // Si un enregistrement est retourné, cela signifie que le nom_abonnement est déjà pris.
      if (existingAbonnement.length > 0) {
        throw new Error("Un abonnement avec ce nom existe déjà.");
      }

      const dateEcheanceObj = new Date(date_echeance);
      const dateFinEngagementObj = new Date(date_fin_engagement);

      if (dateEcheanceObj >= dateFinEngagementObj) {
        throw new Error(
          "La date d'échéance doit être antérieure à la date de fin d'engagement."
        );
      }

      // Définition de la requête SQL pour insérer un nouvel abonnement
      const query = `
      INSERT INTO abonnement (
        nom_abonnement,
        nom_fournisseur,
        montant,
        frequence_prelevement,
        date_echeance,
        date_fin_engagement,
        IsEngagement,
        id_categorie
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

      // Exécution de la requête
      await this.executeQuery(query, [
        nom_abonnement,
        nom_fournisseur,
        montant,
        frequence_prelevement,
        date_echeance,
        date_fin_engagement,
        IsEngagement,
        id_categorie,
      ]);
    } catch (error) {
      // Renvoyer une nouvelle erreur avec le message personnalisé
      throw new Error(
        "Erreur lors de l'insertion de l'abonnement : " + error.message
      );
    }
  }

  async deleteAbonnement(nom_abonnement) {
    try {
      // Vérifier d'abord si l'abonnement existe
      const existingAbonnement = await this.executeQuery(
        "SELECT 1 FROM abonnement WHERE nom_abonnement = ?",
        [nom_abonnement]
      );

      // Si aucun enregistrement n'est retourné, on lance une erreur
      if (existingAbonnement.length === 0) {
        throw new Error("Aucun abonnement avec ce nom n'existe.");
      }

      // S'il existe, on procède à la suppression
      const query = "DELETE FROM abonnement WHERE nom_abonnement = ?";
      await this.executeQuery(query, [nom_abonnement]);
    } catch (error) {
      console.error("Database operation failed:", error);
      throw new Error("Erreur lors de la suppression de l'abonnement.");
    }
  }

  // Méthode asynchrone pour mettre à jour les informations d'un abonnement dans la base de données.
  async updateAbonnement(
    current_nom_abonnement, // Utilisez 'current_nom_abonnement' pour identifier l'utilisateur actuel
    new_nom_abonnement,
    new_nom_fournisseur,
    new_montant,
    new_frequence_prelevement,
    new_date_echeance,
    new_date_fin_engagement,
    new_IsEngagement,
    new_id_categorie
  ) {
    try {
      const dateEcheanceObj = new Date(new_date_echeance);
      const dateFinEngagementObj = new Date(new_date_fin_engagement);

      if (dateEcheanceObj >= dateFinEngagementObj) {
        throw new Error(
          "La date d'échéance doit être antérieure à la date de fin d'engagement."
        );
      }

      const query = `
        UPDATE abonnement 
        SET 
          nom_abonnement = ?,
          nom_fournisseur = ?,
          montant = ?,
          frequence_prelevement = ?,
          date_echeance = ?,
          date_fin_engagement = ?,
          isEngagement = ?,
          id_categorie = ?
        WHERE nom_abonnement = ?
      `;

      await this.executeQuery(query, [
        new_nom_abonnement || current_nom_abonnement, // Utiliser new_nom_abonnement si fourni, sinon conserver l'ancien
        new_nom_fournisseur,
        new_montant,
        new_frequence_prelevement,
        new_date_echeance,
        new_date_fin_engagement,
        new_IsEngagement,
        new_id_categorie,
        current_nom_abonnement, // Assurez-vous de mettre à jour l'utilisateur correct
      ]);
    } catch (error) {
      throw new Error("Erreur lors de la mise à jour de l'abonnement.");
    }
  }

  async getAbonnementByNomAbonnement(nom_abonnement) {
    try {
      // Construction de la requête SQL pour sélectionneur tout les champs de la categorie ayant le nom de l'abonnement spécifié.
      const query = `SELECT *, IsEngagement = 1 AS IsEngagement FROM abonnement WHERE nom_abonnement = '${nom_abonnement}'`;
      // Exécution de la requête SQL et attente des résultats.
      let results = await this.executeQuery(query);

      // Convertir les résultats en abonnement une boucle forEach
      results.forEach((result) => {
        // Si la valeur de isEngagement est null, la convertir en false
        if (result.IsEngagement === null) {
          result.IsEngagement = false;
        } else {
          // Sinon, convertir en booléen
          result.IsEngagement = result.IsEngagement === 1 ? true : false;
        }
      });
      return results;
    } catch (error) {
      throw new Error(
        "Une erreur s'est produite lors de la récupération de l'abonnement par son nom."
      );
    }
  }
}

// Export de l'instance unique du contrôleur, permettant l'accès aux fonctionnalités définies dans la classe Controller.
export let controller = new AbonnementController();
