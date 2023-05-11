import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import animatedlogo from "./Asset/animatedlogo.gif";

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
};

export default Modal;
