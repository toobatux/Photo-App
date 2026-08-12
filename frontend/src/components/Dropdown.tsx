const Dropdown = ({ children, isOpen, onClose }) => {
  if (isOpen) {
    return (
      <>
        <div onClick={onClose} className="fixed inset-0 z-40" />
        <div className="absolute top-10 right-0 z-50">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#fdfdfd] dark:bg-[#101010] rounded-xl shadow w-full max-w-xl border border-foreground/5 whitespace-nowrap"
          >
            {children}
          </div>
        </div>
      </>
    );
  }
};

export default Dropdown;