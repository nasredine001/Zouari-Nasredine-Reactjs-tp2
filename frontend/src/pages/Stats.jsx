import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import API, { ETATS } from '../api';

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [dateMin, setDateMin] = useState('');
  const [dateMax, setDateMax] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateMin) params.date_min = dateMin;
      if (dateMax) params.date_max = dateMax;
      const res = await API.get('/stats', { params });
      setStats(res.data);
    } catch (err) {
      toast.error('Impossible de charger les statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const maxCount = stats ? Math.max(1, ...Object.values(stats.counts)) : 1;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Statistiques</h1>
      </div>

      <div className="toolbar">
        <div className="form-group inline-group">
          <label>Du</label>
          <input type="date" value={dateMin} onChange={(e) => setDateMin(e.target.value)} />
        </div>
        <div className="form-group inline-group">
          <label>Au</label>
          <input type="date" value={dateMax} onChange={(e) => setDateMax(e.target.value)} />
        </div>
        <button className="btn btn-primary" onClick={fetchStats}>Appliquer</button>
      </div>

      {loading || !stats ? (
        <p>Chargement...</p>
      ) : (
        <div className="stats-card">
          <p className="stats-total">Total : <strong>{stats.total}</strong> tâche(s)</p>
          <div className="stats-bars">
            {ETATS.map((e) => {
              const count = stats.counts[e.value] || 0;
              const percent = (count / maxCount) * 100;
              return (
                <div className="stats-row" key={e.value}>
                  <span className="stats-label">{e.label}</span>
                  <div className="stats-bar-track">
                    <div className="stats-bar-fill" style={{ width: `${percent}%`, background: e.color }} />
                  </div>
                  <span className="stats-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
