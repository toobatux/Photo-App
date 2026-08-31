import useModal from "../../../hooks/useModal";
import useToast from "../../../hooks/useToast";
import NewGalleryModal from "./NewGalleryModal";
import AddIcon from "@mui/icons-material/Add";

const NewGalleryButton = ({isPrimary=true}) => {
  const newModal = useModal();
  const { showToast } = useToast();

  return (
    <>
      <button onClick={newModal.open} className={`flex w-fit items-center gap-2 ${isPrimary ? "btn-primary" : "btn-secondary"} px-2`}>
        <AddIcon sx={{fontSize:"18px"}}/>
        <span className="pe-2">New Gallery</span>
      </button>
      {newModal.isOpen && (
        <NewGalleryModal
          isOpen={newModal.open}
          onClose={newModal.close}
          showToast={showToast}
        />
      )}
    </>
  );
};

export default NewGalleryButton;
