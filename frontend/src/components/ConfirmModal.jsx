import './ConfirmModal.css';

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={onCancel}>Annuler</button>
          <button className="btn btn-delete" onClick={onConfirm}>Confirmer</button>
        </div>
      </div>
    </div>
  );
}
