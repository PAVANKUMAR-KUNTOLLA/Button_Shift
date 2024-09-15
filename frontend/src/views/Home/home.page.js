import React, { useState, useEffect } from "react";
import axios from "axios";
import Page from "./../../components/Page";
import WorkBoardCard from "../../components/WokBoardCard";
import Api from "../../components/Api";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { setWorkBoardInfo } from "../../redux/app/appSlice";
import { useDispatch } from 'react-redux';

const HomePage = () => {
  // const [workboards, setWorkBoards] = useState([]);
  const state = useSelector((state) => state.app);
  const workboards = state.workboards;
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const url = Api.workboard;

  const handleWorkboardClick = (id) => {
    navigate(`/app/detailview/${id}`);
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
    console.log("useEffect triggered");
    fetchWorkBoard();
  }, []);

  return (
    <Page title="home">
      <div className="max-w-screen-xl mx-auto">
        <div
          className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3 md:grid-cols-2 lg:ml-20 md:ml-10"
          style={{ marginTop: 0,paddingTop:"30px" }}
        ></div>
        <div className="max-w-screen-xl mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-gray-200 sm:mb-0 mx-auto">
          <h1 className="ml-20 text-left text-2xl font-bold leading-9 tracking-tight text-gray-900">
            WorkBoards
          </h1>
        </div>
        <div
          className="grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-4 md:grid-cols-2 lg:ml-20 md:ml-10 sm:align-center"
          style={{ marginTop: 0 }}
        >
          <article className="flex max-w-xl flex-col justify-center items-center px-3 py-3  sm:mb-0 mx-auto" style={{ border: "1px solid #D5D5D5", borderRadius: "8px", height: "150px", width: "280px",cursor: "pointer" }}  onClick={() => navigate('/app/addWorkBoard')} >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="0.2" stroke="currentColor" className="w-12 h-12">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </article>
          {workboards.map((workboard, index) => (
              <WorkBoardCard
                key={workboard.id}
                workboard={workboard}
                index={index}
                onClick={() => handleWorkboardClick(workboard.id)}
              />
            ))}
        </div>
      </div>
    </Page>
  );
};

export default HomePage;
