import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { RiLogoutBoxLine } from "react-icons/ri";

import { INavLink } from "@/types";
import { sidebarLinks } from "@/constants";
import { Loader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { useSignOutAccount } from "@/lib/react-query/queries";
import { useUserContext, INITIAL_USER } from "@/context/AuthContext";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, setUser, setIsAuthenticated, isLoading } = useUserContext();

  const { mutate: signOut } = useSignOutAccount();

  const handleSignOut = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.preventDefault();
    signOut();
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
    navigate("/sign-in");
  };

  return (
    <nav className="leftsidebar bg-dark-2 shadow-xl">
      <div className="flex flex-col gap-11">
        <Link to="/" className="flex gap-3 items-center">
          <div className="font-bold text-primary-500 text-3xl transition-all duration-300 hover:text-primary-600">SnapFlow</div>
        </Link>

        {isLoading || !user.email ? (
          <div className="h-14">
            <Loader />
          </div>
        ) : (
          <Link to={`/profile/${user.id}`} className="flex gap-3 items-center p-2 rounded-lg hover:bg-dark-3 transition-all duration-300">
            <img
              src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
              alt="profil"
              className="h-14 w-14 rounded-full object-cover border-2 border-primary-500"
            />
            <div className="flex flex-col">
              <p className="body-bold text-light-1">{user.name}</p>
              <p className="small-regular text-light-3">@{user.username}</p>
            </div>
          </Link>
        )}

        <ul className="flex flex-col gap-2">
          {sidebarLinks.map((link: INavLink) => {
            const isActive = pathname === link.route;

            return (
              <li
                key={link.label}
                className={`rounded-lg transition-all duration-300 hover:bg-dark-3 ${
                  isActive ? "bg-primary-500 hover:bg-primary-600" : ""
                }`}>
                <NavLink
                  to={link.route}
                  className="flex gap-4 items-center p-4">
                  <img
                    src={link.imgURL}
                    alt={link.label}
                    className={`group-hover:invert-white ${
                      isActive && "invert-white"
                    }`}
                  />
                  <span className={`${isActive ? "text-light-1" : "text-light-3"}`}>{link.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>

      <Button
        variant="ghost"
        className="flex items-center gap-2 p-4 rounded-lg hover:bg-dark-3 transition-all duration-300"
        onClick={(e) => handleSignOut(e)}>
        <RiLogoutBoxLine className="text-light-1 text-xl" />
        <p className="text-light-1 hover:text-primary-500 transition-all duration-300">Çıkış Yap</p>
      </Button>
    </nav>
  );
};

export default LeftSidebar;
