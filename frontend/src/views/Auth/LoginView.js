import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Api from "../../components/Api";
import AlertComponent from "../../components/Alert";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import buttonshiftLogo from '../../static/images/buttonshift_full.png';

const LoginView = () => {
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [showAlert, setShowAlert] = useState({
    isAlert: false,
    alertTitle: "",
    alertText: "",
    severity: "",
  });

  const handleAlertChange = (severity, message) => {
    setShowAlert({
      isAlert: true,
      alertText: message,
      severity: severity,
      alertTitle: "",
    });
  };
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    const url = Api.login;

    // Get the form data
    const formData = new FormData(event.target);

    try {
      const response = await axios({
        method: "POST",
        url: `http://localhost:8000${url}`,
        data: formData,
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Handle response
      const { status, data } = response; // Destructure status and data from response

      if (status === 200) {
        window.localStorage.setItem("token", data.data.token);
        console.log("token:",data.data.token)
        // Success: Redirect
        console.log("Login successfully");
        navigate("/app/home");
      } else {
        // Handle other status codes
       
        console.log("Login failed:", data);
        const message = data.message;
        setShowAlert({
          isAlert: true,
          alertText: message,
          severity: "error",
          alertTitle: "",
        });
        setTimeout(() => {
          setShowAlert({
            isAlert: false,
            alertText: "",
            severity: "",
            alertTitle: "",
          });
        }, 6000); // Hide alert after 6 seconds
      }
    } catch (error) {
      // Handle errors, e.g., display error message
      console.error("Login error:", error);

      const message = error.response.data.message;
      setShowAlert({
        isAlert: true,
        alertText: message,
        severity: "error",
        alertTitle: "",
      });
      setTimeout(() => {
        setShowAlert({
          isAlert: false,
          alertText: "",
          severity: "",
          alertTitle: "",
        });
      }, 6000); // Hide alert after 6 seconds
    }
  };

  return (
    <>
      {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-white">
        <body class="h-full">
        ```
      */}

      { showAlert.isAlert && showAlert.severity === "error"? (
        <div class="p-4 mb-4 text-sm text-center text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
          <span class="font-medium">Error! {" "}</span> {showAlert.alertText}
        </div>) : showAlert.isAlert && showAlert.severity === "success" ? (

        <div class="p-4 mb-4 text-sm text-center text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
          <span class="font-medium">Success! {" "}</span> {showAlert.alertText}
        </div>)
        : null
      }
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <img
            className="mx-auto h-10 w-auto mt-10"
            src= {buttonshiftLogo}
            alt="Your Company"
          />
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            WorkBoards
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Password
                </label>
              </div>
              <div className="mt-2 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 px-3 py-1"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

            </div>

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                style={{ backgroundColor: "#49bc8e" }}
              >
                Log in
              </button>
            </div>
          </form>
          <p className="mt-5 text-center text-sm text-gray-500">
            Don’t have an account yet?{" "}
            <a
              onClick={() => navigate("/signup")}
              className="font-semibold leading-6 text-indigo-600 "
              style={{ cursor: "pointer"}}
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default LoginView;
