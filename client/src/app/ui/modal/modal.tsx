const Modal = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6">{children}</div>
    </div>
  );
};

function ModalHeader({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-semibold mb-4">{children}</h2>;
}

function ModalBody({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}

function ModalFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-end gap-2">{children}</div>;
}

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
