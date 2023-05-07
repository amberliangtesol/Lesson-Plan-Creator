import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import animatedlogo from "./animatedlogo.gif";
import Badge1 from "./badge1.gif";
import Badge2 from "./badge2.gif";

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
  winbadge1(text) {
    const success = withReactContent(Swal);
    success.fire({
      title: text,
      imageUrl: Badge1,
      imageWidth: 100,
      imageAlt: "success",
      scrollbarPadding: false,
      confirmButtonColor: "#F46868",
    });
  },
  winbadge2(text) {
    const success = withReactContent(Swal);
    success.fire({
      title: text,
      imageUrl: Badge2,
      imageWidth: 100,
      imageAlt: "success",
      scrollbarPadding: false,
      confirmButtonColor: "#F46868",
    });
  },
  // create(text, id) {
  //   Swal.fire({
  //     title: text,
  //     imageUrl: animatedlogo,
  //     imageWidth: 100,
  //     imageAlt: "success",
  //     scrollbarPadding: false,
  //   }).then((result) => {
  //     if (result.isConfirmed && id) {
  //       window.location = `/studyGroup/${id}`;
  //     }
  //   });
  // },
};

export default Modal;
