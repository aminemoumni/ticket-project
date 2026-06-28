# Support Ticket DevOps

**Université Ibn Tofail** | Module DevOps | Pr. Soufiane HAMIDA
Réalisé par : **Moumni Amin** & **Rafiq Taha**

## Stack

- **Backend:** Symfony 7 (PHP 8.3)
- **Frontend:** React
- **Database:** PostgreSQL 16
- **Web Server:** Nginx

## Getting Started

### Prérequis

- Docker & Docker Compose
- Git

### Guide d'installation

1. Clone repository
    ```bash
    git clone https://github.com/Med-RedaLagciyer/support-ticket-devops.git
    cd support-ticket-devops

2. Créer le fichier .env à la racine du projet
    ```bash
    cp .env.example .env

3. Changer les informations de la base de données dans le fichier .env

4. Créer le fichier .env du backend
    ```bash
    cp backend/.env.example backend/.env

5. Changer APP_SECRET et JWT_PASSPHRASE avec des valeurs générées
    ```bash
    openssl rand -hex 32

6. Démarrer les conteneurs docker
    ```bash
    docker compose up --build -d

7. Générer les clés JWT
    ```bash
        docker exec -it st_php php bin/console lexik:jwt:generate-keypair

8. Database migrations
    ```bash
        docker exec -it st_php php bin/console doctrine:migrations:migrate --no-interaction

9. Créer le premier utilisateur admin
    ```bash
    docker exec -it st_php php bin/console app:create-admin email@example.com motdepasse Prénom Nom

10. Accéder à l'application
App (Frontend): http://localhost
API (Backend): http://localhost/api

## Docker Hub

Image: [moumni-rafiq/support-ticket-devops](https://hub.docker.com/r/moumni-rafiq/support-ticket-devops)

## Rapport

Le rapport du projet est disponible dans le dossier [`docs/`](./docs/).
