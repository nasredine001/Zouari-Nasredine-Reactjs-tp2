import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlusCircle, FiSearch, FiDownload, FiFileText, FiCheckCircle, FiClock, FiLayers } from 'react-icons/fi';
import API, { BASE_URL, ETATS, getEtatMeta } from '../api';
import ConfirmModal from '../components/ConfirmModal';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [etatFilter, setEtatFilter] = useState('all');
  const [toDelete, setToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await API.get('/tasks');
      setTasks(res.data);
    } catch (err) {
      toast.error('Impossible de charger les tâches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch = `${t.titre} ${t.note || ''}`.toLowerCase().includes(search.toLowerCase());
      const matchEtat = etatFilter === 'all' || t.etat === etatFilter;
      return matchSearch && matchEtat;
    });
  }, [tasks, search, etatFilter]);

  const completedCount = tasks.filter((task) => task.etat === 'terminee').length;
  const activeCount = tasks.filter((task) => task.etat === 'en_cours').length;

  const confirmDelete = async () => {
    try {
      await API.delete(`/tasks/${toDelete.id}`);
      toast.success(`"${toDelete.titre}" a été supprimée`);
      setToDelete(null);
      fetchTasks();
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const buildExportUrl = (type) => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (etatFilter !== 'all') params.set('etat', etatFilter);
    return `${BASE_URL}/api/export/${type}?${params.toString()}`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <span className="eyebrow">VOTRE ESPACE DE TRAVAIL</span>
          <h1>Faites avancer vos idées.</h1>
          <p className="page-intro">Un pas après l’autre, gardez le fil de ce qui compte.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/ajouter')}>
          <FiPlusCircle /> Nouvelle tâche
        </button>
      </div>

      <section className="task-summary" aria-label="Résumé des tâches">
        <div className="summary-item summary-total">
          <span className="summary-icon"><FiLayers /></span>
          <div><span className="summary-label">Toutes les tâches</span><strong>{tasks.length}</strong></div>
        </div>
        <div className="summary-item summary-active">
          <span className="summary-icon"><FiClock /></span>
          <div><span className="summary-label">En cours</span><strong>{activeCount}</strong></div>
        </div>
        <div className="summary-item summary-complete">
          <span className="summary-icon"><FiCheckCircle /></span>
          <div><span className="summary-label">Terminées</span><strong>{completedCount}</strong></div>
        </div>
      </section>

      <div className="toolbar">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher (titre / note)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="select-filter" value={etatFilter} onChange={(e) => setEtatFilter(e.target.value)}>
          <option value="all">Tous les états</option>
          {ETATS.map((e) => (
            <option key={e.value} value={e.value}>{e.label}</option>
          ))}
        </select>
        <div className="export-buttons">
          <a className="btn btn-outline" href={buildExportUrl('csv')}><FiDownload /> CSV</a>
          <a className="btn btn-outline" href={buildExportUrl('pdf')}><FiFileText /> PDF</a>
        </div>
      </div>

      {loading ? (
        <div className="skeleton-grid">
          {[...Array(4)].map((_, i) => <div className="skeleton-card" key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <p className="empty-state">
          {tasks.length === 0 ? 'Aucune tâche pour le moment.' : 'Aucun résultat pour cette recherche.'}
        </p>
      ) : (
        <div className="task-grid">
          {filtered.map((t) => {
            const meta = getEtatMeta(t.etat);
            return (
              <div className="task-card" key={t.id}>
                <div className="task-card-top">
                  <h3>{t.titre}</h3>
                  <span className={`priority-dot priority-${t.priorite}`} title={`Priorité ${t.priorite}`} />
                </div>
                {t.note && <p className="task-note">{t.note}</p>}
                <span className="badge" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                <div className="task-dates">
                  <span>Début : {t.date_debut || '—'}</span>
                  <span>Fin : {t.date_fin || '—'}</span>
                </div>
                <div className="card-actions">
                  <button className="btn btn-edit" onClick={() => navigate(`/modifier/${t.id}`)}>
                    <FiEdit2 /> Modifier
                  </button>
                  <button className="btn btn-delete" onClick={() => setToDelete(t)}>
                    <FiTrash2 /> Supprimer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={Boolean(toDelete)}
        title="Supprimer cette tâche ?"
        message={toDelete ? `Cette action est irréversible pour "${toDelete.titre}".` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
