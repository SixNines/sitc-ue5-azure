import { NavOptions } from "interfaces";
import { useRouter } from "next/router";

export const NavLinkButton = ({
  navPath,
  navText,
  authCondition,
  selectedNavOption,
  navOption,
  setNavOption,
}: {
  navPath: string;
  navText: string;
  authCondition: boolean;
  selectedNavOption: NavOptions;
  navOption: NavOptions;
  setNavOption(option: NavOptions): void;
}) => {
  const router = useRouter();
  return authCondition ? (
    <div className="navContainer">
      <button
        className={`${
          selectedNavOption === navOption ? "selectedNavBtn" : "navBtn"
        } btn btn-secondary btn-nav-base`}
        onClick={() => {
          setNavOption(navOption);
          router.push(navPath);
        }}
      >
        {navText}
      </button>
    </div>
  ) : (
    <div></div>
  );
};
