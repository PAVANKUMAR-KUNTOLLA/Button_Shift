import React, { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Loadable from "../components/Loadable";
import LoginView from "../views/Auth/LoginView";
import PrivateRoute from "../components/PrivateRoute";
import HomePage from "../views/Home/home.page";
import AppLayout from "../components/AppLayout";
import AddWorkBoard from "../views/Home/addWorkBoard";
import WorkBoardDetailView from "../views/Home/workBoardDetailView";
import EditWorkBoardTask from "../views/Home/editWorkBoardTask";
import SignupView from "../views/Auth/SignupView";

//-----------------------|| ROUTING RENDER ||-----------------------//
const AppRoutes = () => {
  return (
    <Routes>
      {/* Default route */}
      <Route path="/" element={<Navigate replace to="/login" />} />
      {/* <Route
        path="/app/home"
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="/app/home" element={ <HomePage /> } />
        <Route path="/addWorkBoard" element={<AddWorkBoard />} />
      </Route> */}

      <Route path="/app/*" element={  
             <PrivateRoute>
            <AppLayout />
          </PrivateRoute>}>
          <Route path="home" element={ <HomePage /> } />
          <Route path="addWorkBoard" element={<AddWorkBoard />} />
          <Route path="detailview/:workboard_id" element={<WorkBoardDetailView/>}/>
          <Route path="editTask/:workboard_id/:task_id" element={<EditWorkBoardTask />} />
      </Route>
      {/* Login route */}
      
      <Route path="/login" element={<LoginView />} />
      <Route path="/signup" element={<SignupView />} />
    </Routes>
  );
};

export default AppRoutes;
