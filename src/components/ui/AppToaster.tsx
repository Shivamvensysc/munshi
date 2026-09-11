import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Mounted once near the root (see main.tsx). Every page already calls
 * `toast.success(...)` / `toast.error(...)` from "react-toastify" — this is
 * the single container that actually renders them, styled to match the
 * app instead of the library defaults.
 */
export default function AppToaster() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3500}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      pauseOnFocusLoss={false}
      draggable={false}
      limit={4}
      transition={Slide}
      toastClassName="app-toast"
      progressClassName="app-toast-progress"
      className="mt-2"
    />
  );
}
