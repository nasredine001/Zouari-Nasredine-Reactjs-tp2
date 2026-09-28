const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, 'data', 'tasks.json');

if (!fs.existsSync(path.dirname(DATA_FILE))) fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

app.use(cors());
app.use(express.json());

const ETATS = ['creee', 'acceptee', 'en_cours', 'terminee', 'annulee'];
const ETAT_LABELS = {
  creee: 'Créée',
  acceptee: 'Acceptée',
  en_cours: 'En cours',
  terminee: 'Terminée',
  annulee: 'Annulée'
};

function readTasks() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}
function writeTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// Applique les filtres communs (id, recherche texte, état, plage de dates) à une liste de tâches
function applyFilters(tasks, query) {
  let result = [...tasks];

  if (query.id) {
    result = result.filter((t) => t.id === query.id);
  }
  if (query.search) {
    const s = query.search.toLowerCase();
    result = result.filter(
      (t) => t.titre.toLowerCase().includes(s) || (t.note || '').toLowerCase().includes(s)
    );
  }
  if (query.etat) {
    result = result.filter((t) => t.etat === query.etat);
  }
  if (query.date_min) {
    result = result.filter((t) => t.date_debut && t.date_debut >= query.date_min);
  }
  if (query.date_max) {
    result = result.filter((t) => t.date_debut && t.date_debut <= query.date_max);
  }
  return result;
}

// GET /api/tasks - liste avec filtres (?id=&search=&etat=&date_min=&date_max=)
app.get('/api/tasks', (req, res) => {
  const tasks = applyFilters(readTasks(), req.query);
  res.json(tasks.sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation)));
});

// GET /api/tasks/:id
app.get('/api/tasks/:id', (req, res) => {
  const task = readTasks().find((t) => t.id === req.params.id);
  if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });
  res.json(task);
});

// POST /api/tasks - créer une tâche
app.post('/api/tasks', (req, res) => {
  const tasks = readTasks();
  const now = new Date().toISOString();
  const newTask = {
    id: Date.now().toString(),
    titre: req.body.titre,
    note: req.body.note || '',
    etat: ETATS.includes(req.body.etat) ? req.body.etat : 'creee',
    priorite: req.body.priorite || 'moyenne',
    date_debut: req.body.date_debut || null,
    date_fin: req.body.date_fin || null,
    date_creation: now,
    date_modification: now
  };
  tasks.push(newTask);
  writeTasks(tasks);
  res.status(201).json(newTask);
});

// PUT /api/tasks/:id - modifier une tâche
app.put('/api/tasks/:id', (req, res) => {
  const tasks = readTasks();
  const index = tasks.findIndex((t) => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Tâche non trouvée' });

  const existing = tasks[index];
  tasks[index] = {
    ...existing,
    titre: req.body.titre ?? existing.titre,
    note: req.body.note ?? existing.note,
    etat: ETATS.includes(req.body.etat) ? req.body.etat : existing.etat,
    priorite: req.body.priorite ?? existing.priorite,
    date_debut: req.body.date_debut ?? existing.date_debut,
    date_fin: req.body.date_fin ?? existing.date_fin,
    date_modification: new Date().toISOString()
  };
  writeTasks(tasks);
  res.json(tasks[index]);
});

// DELETE /api/tasks/:id
app.delete('/api/tasks/:id', (req, res) => {
  const tasks = readTasks().filter((t) => t.id !== req.params.id);
  writeTasks(tasks);
  res.json({ message: 'Tâche supprimée' });
});

// GET /api/tasks/export/csv - export CSV des tâches filtrées
app.get('/api/export/csv', (req, res) => {
  const tasks = applyFilters(readTasks(), req.query);
  const headers = ['id', 'titre', 'note', 'etat', 'priorite', 'date_debut', 'date_fin', 'date_creation', 'date_modification'];
  const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
  const rows = tasks.map((t) => headers.map((h) => escape(t[h])).join(','));
  const csv = [headers.join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="taches.csv"');
  res.send('\uFEFF' + csv); // BOM pour un bon affichage des accents dans Excel
});

// GET /api/export/pdf - export PDF (rapport) des tâches filtrées
app.get('/api/export/pdf', (req, res) => {
  const tasks = applyFilters(readTasks(), req.query);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="rapport-taches.pdf"');

  const doc = new PDFDocument({ margin: 40 });
  doc.pipe(res);

  doc.fontSize(18).text('Rapport des tâches', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).fillColor('gray').text(`Généré le ${new Date().toLocaleString('fr-FR')} — ${tasks.length} tâche(s)`, { align: 'center' });
  doc.moveDown(1.5);

  tasks.forEach((t, i) => {
    doc.fillColor('black').fontSize(12).text(`${i + 1}. ${t.titre}`, { continued: false });
    doc.fontSize(9).fillColor('gray');
    doc.text(`   État : ${ETAT_LABELS[t.etat] || t.etat}   |   Priorité : ${t.priorite}`);
    if (t.note) doc.text(`   Note : ${t.note}`);
    doc.text(`   Début : ${t.date_debut || '-'}   |   Fin : ${t.date_fin || '-'}`);
    doc.moveDown(0.8);
  });

  doc.end();
});

// GET /api/stats - statistiques (compteurs par état) sur une plage de dates optionnelle
app.get('/api/stats', (req, res) => {
  const tasks = applyFilters(readTasks(), req.query);
  const counts = {};
  ETATS.forEach((e) => (counts[e] = 0));
  tasks.forEach((t) => { counts[t.etat] = (counts[t.etat] || 0) + 1; });

  res.json({
    total: tasks.length,
    counts,
    labels: ETAT_LABELS
  });
});

app.listen(PORT, () => console.log(`✅ Serveur backend démarré sur http://localhost:${PORT}`));
