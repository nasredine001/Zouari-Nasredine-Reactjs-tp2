# ✅ Gestion des Tâches — TP2

Application web de gestion de tâches développée avec **React.js** (frontend) et **Node.js / Express** (backend).

## 🎓 Projet académique

- **Étudiant :** [Votre nom complet]
- **Filière / Classe :** [...]
- **Module :** [...]
- **Enseignant :** [...]
- **Année universitaire :** 2025-2026

## 🚀 Fonctionnalités

- **Gestion des tâches (P1)** : id, titre, note, état (créée, acceptée, en cours, terminée, annulée), priorité, date_début, date_fin, date_création et date_modification (automatiques). Application responsive.
- **Filtres (P2)** : recherche par titre/note, filtre par état.
- **Export PDF (P3)** : génère un rapport PDF des tâches filtrées.
- **Export CSV (P4)** : exporte les tâches filtrées au format CSV (compatible Excel).
- **Statistiques (P5)** : nombre de tâches par état, avec filtre par plage de dates (du/au).

## 🛠️ Technologies

**Frontend** : React.js (Vite), React Router DOM, Axios, React Icons, React Hot Toast
**Backend** : Node.js, Express.js, PDFKit (génération PDF)

## 📁 Structure

```
tasks-app/
├── backend/
│   ├── server.js       → API (CRUD, filtres, exports, statistiques)
│   └── data/tasks.json → stockage des tâches
└── frontend/
    └── src/
        ├── components/ → Navbar, ConfirmModal
        ├── pages/       → TaskList, TaskForm, Stats
        └── api.js       → configuration Axios + constantes
```

## ⚙️ Installation et lancement

### Prérequis
- [Node.js](https://nodejs.org) (v18+)

### Backend
```bash
cd backend
npm install
npm start
```
→ API sur `http://localhost:5000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```
→ Application sur `http://localhost:5173`

## 🔌 API — Endpoints

| Méthode | Route                | Description                                 |
|---------|-----------------------|----------------------------------------------|
| GET     | /api/tasks             | Liste les tâches (filtres : id, search, etat, date_min, date_max) |
| GET     | /api/tasks/:id          | Récupère une tâche                            |
| POST    | /api/tasks             | Crée une tâche                                |
| PUT     | /api/tasks/:id          | Modifie une tâche                             |
| DELETE  | /api/tasks/:id          | Supprime une tâche                            |
| GET     | /api/export/csv         | Exporte les tâches filtrées en CSV            |
| GET     | /api/export/pdf         | Exporte un rapport PDF des tâches filtrées    |
| GET     | /api/stats              | Statistiques par état (filtre de dates)       |

## 📝 Notes

- Les données sont stockées en JSON (`backend/data/tasks.json`) à des fins de démonstration.
- Les dates de création/modification sont gérées automatiquement par le serveur.
