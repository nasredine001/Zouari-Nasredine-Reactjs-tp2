import axios from 'axios';

export const BASE_URL = 'http://localhost:5000';

const API = axios.create({
  baseURL: `${BASE_URL}/api`
});

export default API;

export const ETATS = [
  { value: 'creee', label: 'Créée', color: '#64748b', bg: '#e2e8f0' },
  { value: 'acceptee', label: 'Acceptée', color: '#2563eb', bg: '#dbeafe' },
  { value: 'en_cours', label: 'En cours', color: '#d97706', bg: '#fef3c7' },
  { value: 'terminee', label: 'Terminée', color: '#15803d', bg: '#dcfce7' },
  { value: 'annulee', label: 'Annulée', color: '#b91c1c', bg: '#fee2e2' }
];

export const PRIORITES = [
  { value: 'basse', label: 'Basse' },
  { value: 'moyenne', label: 'Moyenne' },
  { value: 'haute', label: 'Haute' }
];

export function getEtatMeta(value) {
  return ETATS.find((e) => e.value === value) || ETATS[0];
}
