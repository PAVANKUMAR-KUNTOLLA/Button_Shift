import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios
import Api from "../Api";
import buttonshiftLogo from '../../static/images/buttonshift_full.png';
import { BellIcon, XIcon, MenuIcon, PlusIcon } from "@heroicons/react/solid";
import { useSelector } from "react-redux";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const state = useSelector((state) => state.app );
  const {name,email} = state.profile;

  // const [user, setUser] = useState({
  //   name: "",
  //   email: "",
  // });

  // const handleFetchProfile = async () => {
  //   const url = Api.profile;
  //   try {
  //     const token = window.localStorage.getItem("token");
  //     const response = await axios.get(`http://localhost:8000${url}`, {
  //       headers: {
  //         Authorization: `Token ${token}`,
  //       },
  //     });
  //     console.log("User profile:", response.data);

  //     if (response.data) {
  //       const userProfile = response.data;
  //       setUser({
  //         name: userProfile.name || "Tom Cook",
  //         email: userProfile.email || "tom@example.com",
  //       });
  //     } else {
  //       setUser({
  //         name: "Tom Cook",
  //         email: "tom@example.com"
  //       });
  //     }

  //   } catch (error) {
  //     console.error("Error fetching user profile:", error);
  //     if (error.response && error.response.status === 401) {
  //       navigate("/login");
  //     }
  //   }
  // };

  const handleLogout = async () => {
    console.log("Logout button clicked");

    try {
      const token = window.localStorage.getItem("token");
      if (token) {
        window.localStorage.removeItem("token");
      }

      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleNavigateHome = () => {
    navigate("/app/home");
  };

  // useEffect(() => {
  //   const token = window.localStorage.getItem("token");
  //   if (token) {
  //     // handleFetchProfile();
  //   }
  // }, [window.localStorage.getItem("token")]);

  return (
    <>
      <div className="min-h-full mb-4 mt-4">
        <nav className="bg-white-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-auto cursor-pointer"
                    src={buttonshiftLogo}
                    onClick={handleNavigateHome}
                    alt="Your Company"
                  />
                </div>
              </div>

              <div className="hidden md:flex justify-end space-x-4">
                <div className="flex-shrink-0 px-2 py-2">
                  <div
                    className="h-10 w-10 flex items-center justify-center rounded-full text-lg font-bold cursor-pointer"
                    style={{ backgroundColor: '#90E4C1' }}
                    onClick={handleNavigateHome}
                  >
                    {name && name.charAt(0).toUpperCase() || 'A'}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <div
                    className="flex items-center space-x-2 text-lg font-bold cursor-pointer px-2 py-2"
                    onClick={handleLogout}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-10 w-6 text-gray-700"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="-mr-2 flex md:hidden">
                <button
                  onClick={() => setOpen(!open)}
                  type="button"
                  className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XIcon className="h-6 w-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="h-6 w-6" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {open && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <div
                  className="h-10 w-10 flex items-center justify-center rounded-full text-lg font-bold cursor-pointer"
                  style={{ backgroundColor: '#90E4C1' }}
                  onClick={handleNavigateHome}
                >
                  {name && name.charAt(0).toUpperCase() || 'A'}
                </div>

                <div
                  className="flex items-center space-x-2 text-lg font-bold cursor-pointer px-2 py-2"
                  onClick={handleLogout}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-10 w-6 text-gray-700"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </nav>
      </div>
    </>
  );
};

export default Navbar;
