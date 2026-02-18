import "./modal.css";

export function Modal({
  isOpen,
  title = "Confirmação",
  message = "Tem certeza que deseja continuar?",
  onConfirm,
  onCancel,
  confirmText = "Confirmar",
  cancelText = "Cancelar"
}) {
  if (!isOpen) return null;

  function handleOverlayClick(e) {
    if (e.target.classList.contains("modal-overlay")) {
      onCancel();
    }
  }

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{title}</h3>
        <p>{message}</p>

        <div className="modal-actions">
          <button
            className="cancel"
            onClick={onCancel}
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
