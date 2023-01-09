import { AuthorizationStatus, UserRoles } from "interfaces";
import { useEffect, useContext, useState } from "react";
import { checkAuthToken } from "services/http-service";
import { AuthContext } from "./auth-context";
import { Unauthorized } from "./unauthorized";

export const AuthorizedRoute = ({
  children,
  adminRoute,
}: {
  children: JSX.Element;
  adminRoute: boolean;
}) => {
  const authContext = useContext(AuthContext);
  const [authorizedState, setAuthorizedState] = useState("PENDING");

  useEffect(() => {
    // checks if the user is authenticated

    const verifyAuth = async () => {
      const { authorized, role } = await checkAuthToken();
      const isAdminAuthorized =
        authorized && adminRoute && role === UserRoles.ADMIN;

      const isAuthorized = adminRoute ? isAdminAuthorized : authorized === true;

      await new Promise((r) => setTimeout(r, 1000));
      if (isAuthorized === true) {
        authContext.setAuthStatus({
          status:
            role === "ADMIN"
              ? AuthorizationStatus.AUTHORIZED_AS_ADMIN
              : AuthorizationStatus.AUTHORIZED,
        });
        setAuthorizedState("AUTHORIZED");
      } else {
        authContext.setAuthStatus({ status: AuthorizationStatus.UNAUTHORIZED });
        setAuthorizedState("UNAUTHORIZED");
      }
    };

    verifyAuth();
  }, [adminRoute, authContext]);

  return (
    <div className="authorizedRoute">
      {authorizedState === "AUTHORIZED" ? (
        <div className="authorizedRoute">{children}</div>
      ) : authorizedState === "PENDING" ? (
        <div> </div>
      ) : (
        // authorizedState === "PENDING" ? <div className="authorizedRouteWait">
        //     <h2>Please wait...</h2>
        // </div>
        // :
        <div className="unauthorizedRoute">
          <Unauthorized />
        </div>
      )}
    </div>
  );
};
