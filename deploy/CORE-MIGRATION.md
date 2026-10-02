# Déploiement sur core

Le workflow `Deploy to core` construit/teste une image puis peut appliquer son
digest à `212.132.108.151`. Les pushes ne déploient pas tant que
`CORE_DEPLOY_ENABLED` ne vaut pas `true`.

Le Compose `docker-compose.core.yml` et `deploy/core/infra` sont dédiés au serveur
partagé. `docker-compose.prod.yml` reste celui de l'ancien VPS. Le bootstrap
installé sur core utilise le Compose core copié en `docker-compose.prod.yml`.

Procédure, secrets et limites : [aist-infra / CORE-MIGRATION.md](https://github.com/AI-SmartTalk/aist-infra/blob/main/CORE-MIGRATION.md).

Les fichiers `deploy/core/infra` et les workflows de déploiement/vérification sont
générés par `aist-infra/scripts/sync-app-deploy.py` ; modifier leur source dans
le dépôt infra puis régénérer les trois applications.
