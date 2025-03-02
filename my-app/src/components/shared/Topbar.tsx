import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useSignOutAccount } from "@/lib/react-query/queries";
import { RiLogoutBoxLine } from "react-icons/ri";

const Topbar = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { mutate: signOut, isSuccess } = useSignOutAccount();

  useEffect(() => {
    if (isSuccess) navigate(0);
  }, [isSuccess, navigate]);

  return (
    <section className="topbar sticky top-0 z-50 bg-dark-2 shadow-md">
      <div className="flex justify-between items-center py-3 px-5">
        <Link to="/" className="flex gap-3 items-center">
          <div className="font-bold text-primary-500 text-3xl transition-all duration-300 hover:text-primary-600">SocialFlow</div>
        </Link>
        <div className="flex gap-4 items-center">
          <Button
            variant="ghost"
            className="shad-button_ghost rounded-full hover:bg-dark-3 transition-all duration-300"
            onClick={() => signOut()}
          >
            <RiLogoutBoxLine className="text-light-2 text-xl" />
          </Button>
          <Link to={`/profile/${user.id}`} className="flex-center gap-3">
            <div className="relative">
              <img
                src={user.imageUrl || "/assets/icons/profile-placeholder.svg"}
                alt="profile"
                className="h-10 w-10 rounded-full object-cover border-2 border-primary-500 transition-all duration-300 hover:border-primary-600"
              />
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-dark-2"></div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Topbar;
