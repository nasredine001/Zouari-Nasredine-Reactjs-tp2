import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiCheck } from 'react-icons/fi';
import API, { ETATS, PRIORITES } from '../api';

export default function TaskForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [titre, setTitre] = useState('');
  const [note, setNote] = useState('');
  const [etat, setEtat] = useState('creee');
  const [priorite, setPriorite] = useState('moyenne');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [meta, setMeta] = useState(null); // dates création/modification en lecture seule
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      API.get(`/tasks/${id}`).then((res) => {
        const t = res.data;
        setTitre(t.titre);
        setNote(t.note || '');
        setEtat(t.etat);
        setPriorite(t.priorite);
        setDateDebut(t.date_debut || '');
        setDateFin(t.date_fin || '');
        setMeta({ creation: t.date_creation, modification: t.date_modification });
      }).catch(() => toast.error('Tâche introuvable'));
    }
  }, [id, isEdit]);

  const validate = () => {
    const errs = {};
    if (!titre.trim()) errs.titre = 'Le titre est requis';
    if (dateDebut && dateFin && dateFin < dateDebut) errs.dateFin = 'La date de fin doit être après la date de début';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const payload = { titre: titre.trim(), note, etat, priorite, date_debut: dateDebut || null, date_fin: dateFin || null };

    try {
      if (isEdit) {
        await API.put(`/tasks/${id}`, payload);
        toast.success('Tâche modifiée avec succès');
      } else {
        await API.post('/tasks', payload);
        toast.success('Tâche créée avec succès');
      }
      navigate('/');
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form-card">
        <h1>{isEdit ? 'Modifier la tâche' : 'Nouvelle tâche'}</h1>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Titre</label>
            <input value={titre} onChange={(e) => setTitre(e.target.value)} className={errors.titre ? 'input-error' : ''} />
            {errors.titre && <span className="field-error">{errors.titre}</span>}
          </div>

          <div className="form-group">
            <label>Note</label>
            <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date début</label>
              <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Date fin</label>
              <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className={errors.dateFin ? 'input-error' : ''} />
              {errors.dateFin && <span className="field-error">{errors.dateFin}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>Priorité</label>
            <select value={priorite} onChange={(e) => setPriorite(e.target.value)}>
              {PRIORITES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label>État</label>
            <div className="etat-toggle">
              {ETATS.map((e) => (
                <label
                  key={e.value}
                  className={`etat-option ${etat === e.value ? 'selected' : ''}`}
                  style={etat === e.value ? { background: e.bg, borderColor: e.color, color: e.color } : {}}
                >
                  <input type="radio" name="etat" checked={etat === e.value} onChange={() => setEtat(e.value)} />
                  {e.label}
                </label>
              ))}
            </div>
          </div>

          {isEdit && meta && (
            <p className="meta-dates">
              Créée le {new Date(meta.creation).toLocaleString('fr-FR')} — Modifiée le {new Date(meta.modification).toLocaleString('fr-FR')}
            </p>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              <FiCheck /> {saving ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer'}
            </button>
            <button type="button" className="btn btn-cancel" onClick={() => navigate('/')}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
}
