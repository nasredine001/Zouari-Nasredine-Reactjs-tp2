import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { FiList, FiPlusCircle, FiBarChart2, FiMenu, FiX } from 'react-icons/fi';
import './Navbar.css';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <FiList /> GestTâches
      </div>
      <button className="navbar-toggle" onClick={() => setOpen(!open)} aria-label="Menu">
        {open ? <FiX /> : <FiMenu />}
      </button>
      <div className={`navbar-links ${open ? 'open' : ''}`}>
        <NavLink to="/" end onClick={close} className={({ isActive }) => (isActive ? 'active' : '')}>
          <FiList /> Liste des tâches
        </NavLink>
        <NavLink to="/ajouter" onClick={close} className={({ isActive }) => (isActive ? 'active' : '')}>
          <FiPlusCircle /> Ajouter
        </NavLink>
        <NavLink to="/statistiques" onClick={close} className={({ isActive }) => (isActive ? 'active' : '')}>
          <FiBarChart2 /> Statistiques
        </NavLink>
      </div>
    </nav>
  );
}
