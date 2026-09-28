import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import TaskList from './pages/TaskList';
import TaskForm from './pages/TaskForm';
import Stats from './pages/Stats';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<TaskList />} />
        <Route path="/ajouter" element={<TaskForm />} />
        <Route path="/modifier/:id" element={<TaskForm />} />
        <Route path="/statistiques" element={<Stats />} />
      </Routes>
    </>
  );
}
