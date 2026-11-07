
import { useNavigate } from "react-router-dom";

export function useLogout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("user_role");

    navigate("/login", { replace: true });
  };

  return logout;
}