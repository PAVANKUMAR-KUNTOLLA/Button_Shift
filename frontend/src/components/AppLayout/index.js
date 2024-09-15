import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios
import Api from "../Api";
import { setUserInfo, setWorkBoardInfo } from "../../redux/app/appSlice";
import { useDispatch, useSelector } from "react-redux";

import Navbar from "./Navbar";

const AppLayout = () => {

  const dispatch = useDispatch();
  const {pathname} = useLocation();

  const [showAlert, setShowAlert] = useState({
    isAlert: false,
    alertTitle: "",
    alertText: "",
    severity: "",
  });

  const navigate = useNavigate(); // Initialize navigate

  const handleFetchProfile = async () => {
    const url = Api.profile
    try {
      const token =window.localStorage.getItem("token");
      const response = await axios.get(`http://localhost:8000${url}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      console.log("User profile:", response.data);
      // const message = response.data.userProfile.email;

      dispatch(setUserInfo(response.data.data.user_basic_info ?? {}));
      if(pathname !== "/app/home"){
        fetchWorkBoard();
      }

      const message = "";

      setShowAlert({
        isAlert: true,
        alertText: message,
        severity: "success",
        alertTitle: "",
      });
      setTimeout(()=> {
        setShowAlert({
          isAlert: false,
          alertText: "",
          severity: "",
          alertTitle: "",
        });
      },6000)

    } catch (error) {
      console.error("Error fetching user profile:", error);
      if (error.response && error.response.status === 401) {
        navigate("/login");
      }
    }
  };


  const fetchWorkBoard = async () => {
    try {

      const url = Api.workboard;

      const token = window.localStorage.getItem("token");
      console.log("Token:", token);
      console.log("API URL:", `http://localhost:8000${url}`);

      if (!token) {
        console.error("No token found");
        navigate("/login");
        return;
      }

      const response = await axios.get(`http://localhost:8000${url}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      console.log("Response:", response.data);
      // setWorkBoards(response.data["workboards"]);
      dispatch(setWorkBoardInfo({"workboards": response.data['workboards'],"users": response.data["overall_users"]}))
    } catch (error) {
      console.error("Error fetching workboards:", error);
      if (error.response && error.response.status === 401) {
        navigate("/login");
      }
    }
  };


  useEffect(() => {
    // const token =window.localStorage.getItem("token");
      handleFetchProfile(); // Call handleFetchProfile when the token changes
  }, []); // Add handleFetchProfile to dependency array

  return (
    <>
      <div>
        <div>
          <Navbar />
        </div>
        <div>

        {/* { showAlert.isAlert && showAlert.severity === "error"? (
        <div class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
          <span class="font-medium">Error! {" "}</span> {showAlert.alertText}
        </div>) : showAlert.isAlert && showAlert.severity === "success" ? (

        <div className="p-4 mb-4 text-sm text-center text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
        <span className="font-medium"></span> Welcome {showAlert.alertText}, We're excited to have you join us. 
        </div>)
          : null
          } */}
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AppLayout;
