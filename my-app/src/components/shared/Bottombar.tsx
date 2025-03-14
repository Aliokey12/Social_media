import { Link, useLocation } from "react-router-dom";

import { bottombarLinks } from "@/constants/index";

const Bottombar = () => {
  const { pathname } = useLocation();

  return (
    <section className="bottom-bar bg-dark-2 shadow-lg">
      <div className="flex justify-around items-center w-full">
        {bottombarLinks.map((link) => {
          const isActive = pathname === link.route;
          return (
            <Link
              key={`bottombar-${link.label}`}
              to={link.route}
              className={`${
                isActive ? "text-primary-500" : "text-light-3"
              } flex-center flex-col gap-1 p-2 transition-all duration-300`}>
              <div className={`${
                isActive ? "bg-dark-3" : "bg-transparent"
              } p-2 rounded-full`}>
                <img
                  src={link.imgURL}
                  alt={link.label}
                  width={20}
                  height={20}
                  className={`${isActive && "invert-white"}`}
                />
              </div>

              <p className="tiny-medium">{link.label}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default Bottombar;