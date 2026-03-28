import Modal from "./modal";
export default function ModalDelete({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal>
      <Modal.Header>Confirm deletion</Modal.Header>
      <Modal.Body>Are you sure you want to delete this activity?</Modal.Body>
      <Modal.Footer>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Delete
        </button>
      </Modal.Footer>
    </Modal>
  );
}
