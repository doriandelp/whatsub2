// src/controller/user.js
import mysql from "mysql";
import { Categorie } from "../model/categorie.js";

import {
  DATABASE_HOST,
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,
} from "../environment.js";

export class AjouteController {
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

  async getAllAjoute() {
    try {
      // Définition de la requête SQL pour sélectionner tout les enregistrements dans la table 'abonnement'.
      const query = "SELECT * FROM ajoute";

      // Exécution de la requête SQL et attente des résultats
      let results = await this.executeQuery(query);

      // Mapping des résultats de la requête à des objets de la classe abonnement.
      const ajoute = results.map(
        (result) =>
          new Abonnement(
            result.id_utilisateur,
            result.id_abonnement,
            result.date_achat
          )
      );

      // Retourne la liste d'un abonnement.
      return ajoute;
    } catch (error) {
      throw new Error(
        "Une erreur s'est produite lors de la récupération de l ajout."
      );
    }
  }
}

// Export de l'instance unique du contrôleur, permettant l'accès aux fonctionnalités définies dans la classe Controller.
export let controller = new AjouteController();
