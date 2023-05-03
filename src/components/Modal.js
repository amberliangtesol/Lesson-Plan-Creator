import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import animatedlogo from "./animatedlogo.gif";

const Modal = {
  success(text) {
    const success = withReactContent(Swal);
    success.fire({
      title: text,
      imageUrl: animatedlogo,
      imageWidth: 100,
      imageAlt: "success",
      scrollbarPadding: false,
      confirmButtonColor: "#F46868",
    });
  },
  create(text, id) {
    Swal.fire({
      title: text,
      imageUrl: animatedlogo,
      imageWidth: 100,
      imageAlt: "success",
      scrollbarPadding: false,
    }).then((result) => {
      if (result.isConfirmed && id) {
        window.location = `/studyGroup/${id}`;
      }
    });
  },
};

export default Modal;
