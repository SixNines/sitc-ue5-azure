import { AuthorizationStatus } from "interfaces";
import { useRouter } from "next/router";
import { useContext } from "react";
import { AuthContext } from "./auth-context";

export const Logout = ({ authCondition }: { authCondition: boolean }) => {
  const router = useRouter();
  const authContext = useContext(AuthContext);

  const logout = () => {
    authContext.resetToken();
    authContext.setAuthStatus({ status: AuthorizationStatus.UNAUTHORIZED });
    router.push("/auth/login");
  };

  return authCondition ? (
    <div className="navContainer">
      <button
        className="navBtn btn btn-secondary btn-cancel-create btn-logout"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  ) : (
    <div></div>
  );
};
