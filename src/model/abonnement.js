export class Abonnement {
  constructor(
    nom_abonnement,
    nom_fournisseur,
    montant,
    frequence_prelevement,
    date_echeance,
    date_fin_engagement,
    isEngagement,
    id_categorie
  ) {
    this.nom_abonnement = nom_abonnement;
    this.nom_fournisseur = nom_fournisseur;
    this.montant = montant;
    this.frequence_prelevement = frequence_prelevement;
    this.date_echeance = date_echeance;
    this.date_fin_engagement = date_fin_engagement;
    this.isEngagement = isEngagement;
    this.id_categorie = id_categorie;
  }
}
