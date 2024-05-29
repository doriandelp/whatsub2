// src/middleware/auth.js
export const requireAuth = (req, res, next) => {
  if (req.session && req.session.mail) {
    next(); // L'utilisateur est authentifié, passer à la route suivante
  } else {
    res.status(401).json({
      success: false,
      message: "Vous devez être connecté pour accéder à cette ressource.",
    });
  }
};
