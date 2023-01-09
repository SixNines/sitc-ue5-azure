import { Logout } from "components/auth/logout";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "components/auth/auth-context";
import { AuthorizationStatus } from "interfaces";
import { NavLinkButton } from "./nav-link-button";
import { NavOptions } from "interfaces";

export const NavBar = ({ children }: { children: JSX.Element }) => {
  const router = useRouter();
  const [navOption, setNavOption] = useState<NavOptions>(
    NavOptions.VIEW_DEPLOYMENTS
  );

  const authContext = useContext(AuthContext);
  const authStatus = authContext.authState.status;
  const isAuthorized = authStatus === AuthorizationStatus.AUTHORIZED;
  const isAdmin = authStatus === AuthorizationStatus.AUTHORIZED_AS_ADMIN;
  const updateNavOption = (option: NavOptions) => setNavOption(option);

  const pathMap: { [key: string]: NavOptions } = {
    "/": NavOptions.VIEW_DEPLOYMENTS,
    "/create": NavOptions.CREATE_DEPLOYMENT,
    "/admin": NavOptions.ADMIN_CONSOLE,
    "/docs": NavOptions.API_DOCS,
    "/logout": NavOptions.LOGOUT,
  };

  useEffect(() => {
    const activeOption = pathMap[router.pathname];
    setNavOption(activeOption);
  }, [router.asPath]);

  const openInNewTab = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={
        authStatus === AuthorizationStatus.DOCS
          ? "appContextDocs"
          : "appContext"
      }
    >
      <div className="container-flex">
        <div className="row">
          <div className="col">
            <img
              className="banner-logo-six-nines"
              src="/assets/six-nines-logo-horizontal-white.svg"
              alt="Six Nines I.T. logo"
              height={60}
              width={272}
            />
          </div>
          <div className="col">
            <div
              className={
                authStatus === AuthorizationStatus.DOCS
                  ? "navBarDocs"
                  : "navBar"
              }
            >
              <NavLinkButton
                navPath="/"
                navText="View Workstations"
                authCondition={isAuthorized || isAdmin}
                selectedNavOption={navOption}
                navOption={NavOptions.VIEW_DEPLOYMENTS}
                setNavOption={updateNavOption}
              />

              <NavLinkButton
                navPath="/create"
                navText="Create Workstation"
                authCondition={isAuthorized || isAdmin}
                selectedNavOption={navOption}
                navOption={NavOptions.CREATE_DEPLOYMENT}
                setNavOption={updateNavOption}
              />
              {/* 
              <NavLinkButton
                navPath="/admin"
                navText="Admin Console"
                authCondition={isAdmin}
                selectedNavOption={navOption}
                navOption={NavOptions.ADMIN_CONSOLE}
                setNavOption={updateNavOption}
              /> */}
              <div className="navContainer">
                <button
                  className="btn btn-secondary shadow-none btn-upgrade"
                  onClick={() =>
                    openInNewTab(
                      "https://sixninesit.com/solutions/studio-in-the-cloud-unreal-engine-5/customize/"
                    )
                  }
                >
                  Customize
                </button>
              </div>
              <Logout authCondition={isAuthorized || isAdmin} />
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};
