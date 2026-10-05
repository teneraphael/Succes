# Aperçus de profil et contrôle de l’authentification

Les liens `/users/[username]` fournissent la photo de profil dans Open Graph et Twitter, avec une image DealCity si aucun avatar n’est renseigné. La lecture de ces métadonnées ne nécessite pas de connexion.

## Corrections de sécurité

- Réinitialisation : codes générés avec `crypto.randomInt`, hachés avec Argon2, durée de 15 minutes ; 3 demandes et 5 vérifications par email sur 15 minutes. Les réponses d’envoi ne révèlent plus directement l’existence d’un compte.
- Un code est consommé une seule fois. Le changement du mot de passe et la suppression des sessions sont effectués dans la même transaction. Les anciens codes stockés en clair sont refusés ; demander un nouveau code après déploiement.
- Validation serveur du nouveau mot de passe : 8 à 128 caractères. Les mots de passe ne sont plus silencieusement tronqués par un `trim()`.
- Connexion : email et nom d’utilisateur acceptés ; limite de 10 tentatives par identifiant et par compte sur 15 minutes. Inscription : limite de 5 tentatives par email et par heure, avant le calcul Argon2.
- Compteurs persistants dans PostgreSQL, incrément atomique, identifiants hachés et nettoyage borné des entrées expirées. Une panne de la base n’autorise pas le contournement des limites.
- Google : suppression des logs de `state` et des messages internes dans les réponses ; consommation des cookies OAuth avec le domaine et le chemin corrects. Contrôles `state` et PKCE conservés.
- Pages d’authentification : politique `no-referrer`, protection contre l’intégration en iframe, absence de cache hors ligne ; champs mot de passe bornés.
- Next.js et eslint-config-next mis à jour de 15.0.0-rc.1 à 15.5.27, version corrigée recommandée au 30 septembre 2026 : https://nextjs.org/blog/september-2026-security-release

## Déploiement : migration requise

Avant d’activer le code sur chaque environnement (production et previews avec leurs bases respectives), appliquer :

```sh
npx prisma migrate deploy
```

La migration `20261005000000_auth_rate_limits` crée seulement la table des compteurs et son index. Elle ne supprime pas de données. Les variables PostgreSQL habituelles du projet sont requises. Ne pas démarrer la nouvelle version sans cette table : les actions de connexion et de réinitialisation échoueront volontairement plutôt que de désactiver les protections.

La migration n’a pas été appliquée à la base de production pendant cette intervention. Aucun compte réel n’a été créé, aucun mot de passe réel n’a été changé.

## Vérifications et limites

- 14 tests : profils avec/sans avatar, codes hachés, mauvais/anciens/expirés codes, mots de passe invalides, budgets, utilisation simultanée, révocation des sessions, erreurs Google, connexion email et redirections, régressions vidéo.
- Vérification PostgreSQL isolée via PGlite : SQL de migration, 20 demandes simultanées (5 acceptées), normalisation, expiration, séparation des budgets et verrou consultatif PostgreSQL.
- ESLint des fichiers modifiés, validation du schéma Prisma et compilation de production.

Ce contrôle porte sur le code des pages d’authentification, les actions associées et Google OAuth. Il ne constitue pas un audit complet de la plateforme ni une analyse des incidents passés. Les configurations des hébergeurs, secrets déployés, emails réels et parcours Google en production n’ont pas été testés. Les délais d’envoi d’email peuvent encore différer selon l’existence d’un compte ; les budgets limitent les essais mais ne remplacent pas la protection contre le trafic distribué au niveau de l’hébergeur. Les vulnérabilités directes de Next.js sont corrigées. L’audit npm conserve 59 alertes, dont 3 critiques dans des dépendances transitoires (fast-xml-parser, protobufjs, websocket-driver), et des alertes PostCSS ; leur exploitabilité n’a pas été vérifiée dans les parcours de cette application. Elles doivent être traitées dans une revue des dépendances séparée.
