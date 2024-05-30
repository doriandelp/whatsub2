// src/controller/user.js
import mysql from "mysql";
import { Abonnement } from "../model/abonnement.js";
import { CategorieController } from "./categorie.js"; // Assurez-vous que le chemin est correct

const categoryController = new CategorieController();

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
  async getTotalAmount() {
    try {
      console.log("Début de la récupération du montant total.");

      const query = `
      SELECT SUM(montant) AS total_montant
      FROM abonnement
      `;

      const results = await this.executeQuery(query);
      console.log(
        "Résultats de la requête SQL pour le montant total:",
        results
      );

      const totalAmount = results[0].total_montant || 0; // Retourner le montant total ou 0 s'il n'y a pas de résultats

      // Vérification que le montant total est supérieur aux montants mensuels et annuels
      const totalMonthlyAmount = await this.getTotalMonthlyAmount();
      const totalAnnualAmount = await this.getTotalAnnualAmount();

      if (totalAmount < totalMonthlyAmount || totalAmount < totalAnnualAmount) {
        throw new Error(
          "Le montant total doit être supérieur ou égal aux montants mensuels et annuels."
        );
      }

      return totalAmount;
    } catch (error) {
      console.error(
        "Erreur lors de l'exécution de la requête SQL pour le montant total:",
        error
      );

      throw new Error(
        "Une erreur s'est produite lors de la récupération du montant total"
      );
    }
  }

  async getTotalMonthlyAmount() {
    try {
      console.log("Début de la récupération du montant total mensuel.");

      const query = `
      SELECT SUM(montant) AS total_montant
      FROM abonnement
      WHERE frequence_prelevement = 'mois'
      `;

      const results = await this.executeQuery(query);
      console.log(
        "Résultats de la requête SQL pour le montant total mensuel:",
        results
      );

      return results[0].total_montant; // Retourner le montant total ou 0 s'il n'y a pas de résultats
    } catch (error) {
      console.error(
        "Erreur lors de l'exécution de la requête SQL pour le montant total mensuel:",
        error
      );

      throw new Error(
        "Une erreur s'est produite lors de la récupération du montant total mensuel"
      );
    }
  }

  async getTotalAnnualAmount() {
    try {
      const query = `
      SELECT SUM(montant) AS total_montant
      FROM abonnement
      WHERE frequence_prelevement = 'annee'
      `;

      const results = await this.executeQuery(query);
      return results[0].total_montant;
    } catch (error) {
      throw new Error(
        "Une erreur s'est produite lors de la récupération du montant total annuel : " +
          error.message
      );
    }
  }

  async getTotalWeeklyAmount() {
    try {
      const query = `
        SELECT SUM(montant) AS total_montant
        FROM abonnement
        WHERE frequence_prelevement = 'semaine'
      `;
      const results = await this.executeQuery(query);
      return results[0].total_montant || 0; // Retourner le montant total ou 0 s'il n'y a pas de résultats
    } catch (error) {
      throw new Error(
        "Une erreur s'est produite lors de la récupération du montant total hebdomadaire : " +
          error.message
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
    id_categorie,
    nom_categorie,
    couleur
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

      // Vérifier si la catégorie existe déjà par nom et couleur, sinon l'ajouter
      const existingCategorieByNameAndColor = await this.executeQuery(
        "SELECT id_categorie FROM categorie WHERE nom = ? AND couleur = ?",
        [nom_categorie, couleur]
      );

      let categorieId;
      if (existingCategorieByNameAndColor.length === 0) {
        // La catégorie n'existe pas, nous devons l'insérer
        const insertCategorieQuery =
          "INSERT INTO categorie (nom, couleur) VALUES (?, ?)";
        const insertCategorieResult = await this.executeQuery(
          insertCategorieQuery,
          [nom_categorie, couleur]
        );
        categorieId = insertCategorieResult.insertId;
      } else {
        // La catégorie existe, nous récupérons son id
        categorieId = existingCategorieByNameAndColor[0].id_categorie;
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
        IsEngagement ? "1" : "0",
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
      const result = await this.executeQuery(query, [nom_abonnement]);

      // Vérification si la suppression a affecté des lignes
      if (result.affectedRows > 0) {
        return true; // La catégorie a été supprimée avec succès
      } else {
        return false; // La suppression a échoué
      }
    } catch (error) {
      console.error("Database operation failed:", error);
      throw new Error("Erreur lors de la suppression de l'abonnement.");
    }
  }

  async updateAbonnement(
    current_nom_abonnement,
    nom_abonnement,
    nom_fournisseur,
    montant,
    frequence_prelevement,
    date_echeance,
    date_fin_engagement,
    IsEngagement,
    id_categorie,
    nom_categorie,
    couleur
  ) {
    try {
      // Vérifier qu'au moins un des paramètres est fourni

      if (
        !nom_abonnement &&
        !nom_fournisseur &&
        !montant &&
        !frequence_prelevement &&
        !date_echeance &&
        !date_fin_engagement &&
        !IsEngagement &&
        !id_categorie &&
        !nom_categorie &&
        !couleur
      ) {
        throw new Error("Au moins un des paramètres doit être fourni.");
      }

      // Vérifier que le nouveau nom n'est pas identique à l'ancien

      if (current_nom_abonnement === nom_abonnement) {
        throw new Error(
          "Le nom actuel et le nouveau nom ne peuvent pas être identiques."
        );
      }

      // Vérifier si l'abonnement actuel existe

      const existingAbonnement = await this.executeQuery(
        "SELECT 1 FROM abonnement WHERE nom_abonnement = ?",
        [current_nom_abonnement]
      );

      if (existingAbonnement.length === 0) {
        throw new Error("Aucun abonnement avec ce nom actuel n'existe.");
      }

      if (nom_abonnement) {
        const existingNewNomAbonnement = await this.executeQuery(
          "SELECT 1 FROM abonnement WHERE nom_abonnement = ?",
          [nom_abonnement]
        );

        if (existingNewNomAbonnement.length > 0) {
          throw new Error("Ce nom d'abonnement existe déjà.");
        }
      }

      // Validation de frequence_prelevement
      const validFrequences = ["semaine", "mois", "annee"];
      if (
        frequence_prelevement &&
        !validFrequences.includes(frequence_prelevement)
      ) {
        throw new Error(
          "La fréquence de prélèvement doit être 'semaine', 'mois' ou 'annee'."
        );
      }

      if (
        IsEngagement &&
        (!date_fin_engagement || isNaN(new Date(date_fin_engagement).getTime()))
      ) {
        throw new Error(
          "La date de fin d'engagement est requise et doit être une date valide lorsque l'engagement est activé."
        );
      }

      if (!IsEngagement) {
        date_fin_engagement = null; // Ignorer la date de fin d'engagement si l'engagement est faux
      }

      if (date_echeance && date_fin_engagement) {
        const dateEcheanceObj = new Date(date_echeance);
        const dateFinEngagementObj = new Date(date_fin_engagement);

        if (dateEcheanceObj >= dateFinEngagementObj) {
          throw new Error(
            "La date d'échéance doit être antérieure à la date de fin d'engagement."
          );
        }
      }

      // Vérification des montants
      if (frequence_prelevement === "semaine") {
        const totalMonthlyAmount = await this.getTotalMonthlyAmount();
        if (montant > totalMonthlyAmount / 4) {
          throw new Error(
            "Le montant hebdomadaire doit être inférieur au montant mensuel divisé par 4."
          );
        }
      }

      if (frequence_prelevement === "mois") {
        const totalAnnualAmount = await this.getTotalAnnualAmount();
        if (montant > totalAnnualAmount / 12) {
          throw new Error(
            "Le montant mensuel doit être inférieur au montant annuel divisé par 12."
          );
        }
      }

      // Vérifier si l'id_categorie existe dans la table categorie
      if (id_categorie !== undefined) {
        const existingCategorieById = await this.executeQuery(
          "SELECT 1 FROM categorie WHERE id_categorie = ? LIMIT 1",
          [id_categorie]
        );

        if (existingCategorieById.length === 0) {
          throw new Error("La catégorie avec cet ID n'existe pas.");
        }
      }

      // Mettre à jour le nom et la couleur de la catégorie si fournis
      if (nom_categorie || couleur) {
        let updateCategorieFields = [];
        let updateCategorieValues = [];

        if (nom_categorie) {
          updateCategorieFields.push("nom = ?");
          updateCategorieValues.push(nom_categorie);
        }
        if (couleur) {
          updateCategorieFields.push("couleur = ?");
          updateCategorieValues.push(couleur);
        }

        updateCategorieValues.push(id_categorie);

        const updateCategorieQuery = `
            UPDATE categorie
            SET ${updateCategorieFields.join(", ")}
            WHERE id_categorie = ?
          `;

        await this.executeQuery(updateCategorieQuery, updateCategorieValues);
      }

      let updatedFields = [];
      let updatedValues = [];

      if (nom_abonnement !== undefined) {
        updatedFields.push("nom_abonnement = ?");
        updatedValues.push(nom_abonnement);
      }
      if (nom_fournisseur !== undefined) {
        updatedFields.push("nom_fournisseur = ?");
        updatedValues.push(nom_fournisseur);
      }
      if (montant !== undefined) {
        updatedFields.push("montant = ?");
        updatedValues.push(montant);
      }

      if (
        frequence_prelevement &&
        validFrequences.includes(frequence_prelevement)
      ) {
        updatedFields.push("frequence_prelevement = ?");
        updatedValues.push(frequence_prelevement);
      }
      if (date_echeance) {
        updatedFields.push("date_echeance = ?");
        updatedValues.push(new Date(date_echeance));
      }
      if (typeof IsEngagement === "boolean") {
        updatedFields.push("IsEngagement = ?");
        updatedValues.push(IsEngagement);

        if (IsEngagement) {
          if (
            date_fin_engagement &&
            !isNaN(new Date(date_fin_engagement).getTime())
          ) {
            updatedFields.push("date_fin_engagement = ?");
            updatedValues.push(new Date(date_fin_engagement));
          } else {
            throw new Error(
              "La date de fin d'engagement est requise et doit être une date valide lorsque l'engagement est activé."
            );
          }
        } else {
          // Si l'engagement est désactivé, on supprime la date de fin d'engagement
          updatedFields.push("date_fin_engagement = NULL");
        }
      }

      if (id_categorie !== undefined) {
        updatedFields.push("id_categorie = ?");
        updatedValues.push(id_categorie);
      }

      updatedValues.push(current_nom_abonnement);

      const query = `
         UPDATE abonnement
         SET ${updatedFields.join(", ")}
         WHERE nom_abonnement = ?
       `;

      const result = await this.executeQuery(query, updatedValues);

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(
        "Erreur lors de la mise à jour de l'abonnement : " + error.message
      );
    }
  }

  async getAbonnementByNomAbonnement(nom_abonnement) {
    try {
      // Construction de la requête SQL pour sélectionneur tout les champs de la categorie ayant le nom de l'abonnement spécifié.
      const query =
        "SELECT *, IsEngagement FROM abonnement WHERE nom_abonnement = ?";
      // Exécution de la requête SQL et attente des résultats.
      let results = await this.executeQuery(query, [nom_abonnement]);

      // Vérification si l'abonnement a été trouvé
      if (results.length === 0) {
        throw new Error("Aucun abonnement avec ce nom n'a été trouvé.");
      }

      // Convertir les résultats en abonnement une boucle forEach
      results.forEach((result) => {
        result.IsEngagement = result.IsEngagement === 1 ? true : false;
      });
      return results[0]; // Retourner un seul abonnement
    } catch (error) {
      throw new Error(
        "Une erreur s'est produite lors de la récupération de l'abonnement par son nom."
      );
    }
  }

  async getAbonnementWithCategorie() {
    try {
      // Requête SQL pour sélectionner les abonnements et joindre les informations de la catégorie
      const query = `
      SELECT a.*, c.nom AS categorie_nom
      FROM abonnement a
      JOIN categorie c ON a.id_categorie = c.id_Categorie
      `;
      // Exécution de la requête SQL
      const results = await this.executeQuery(query);

      return results;
    } catch (error) {
      throw new Error(
        "Erreur lors de la récupération des abonnements avec categorie: " +
          error.message
      );
    }
  }

  async getNomAbonnementAndCategorie() {
    try {
      // Requête SQL pour sélectionner le nom de l'abonnement et le nom de la catégorie
      const query = `
      SELECT a.nom_abonnement, c.nom AS categorie_nom
      FROM abonnement a
      JOIN categorie c ON a.id_categorie = c.id_Categorie
    `;

      const results = await this.executeQuery(query);

      return results;
    } catch (error) {
      // Gestion des erreurs en cas de problème lors de la requête

      throw new Error(
        "Erreur lors de la récupération des noms d'abonnement et de catégorie: " +
          error.message
      );
    }
  }
}

// Export de l'instance unique du contrôleur, permettant l'accès aux fonctionnalités définies dans la classe Controller.
export let controller = new AbonnementController();
