import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Api from "../../components/Api";
import { useNavigate } from "react-router-dom";
import AlertComponent from "../../components/Alert";
import { useSelector } from 'react-redux';

const AddWorkBoard = () => {

  const state = useSelector((state) => state.app);
  const users = state.users;

  const initialState = {
    name: "",
    about: "",
    tasks: [],
    newTask: {
      name: "",
      description: "",
      status: "",
      user: ""
    },
    currentTaskIndex: null,
    isAccordionOpen: false
  };

  const [workBoard, setWorkBoard] = useState({ ...initialState });

  const handleWorkBoardChange = (key, value) => {
    setWorkBoard((prev) => ({ ...prev, [key]: value }));
  }

  const handleNewTaskChange = (key, value) => {
    setWorkBoard((prev) => ({
      ...prev,
      newTask: {
        ...prev.newTask,
        [key]: value
      }
    }));
  }

  const navigate = useNavigate();

  const [alertMessage, setAlertMessage] = useState(null);

  const [showAlert, setShowAlert] = useState({
    isAlert: false,
    alertTitle: "",
    alertText: "",
    severity: "",
  });

  const alertTimeout = useRef(null);

  const handleAlertChange = (severity, message, duration = 3000) => {
    clearTimeout(alertTimeout.current);

    setShowAlert({
      isAlert: true,
      alertText: message,
      severity: severity,
      alertTitle: "",
    });

    alertTimeout.current = setTimeout(() => {
      setShowAlert({
        isAlert: false,
        alertText: "",
        severity: "",
        alertTitle: "",
      });

      if (severity === "success") {
        navigate('/app/home');
      }
    }, duration);
  };

  const handleAddTask = () => {
    handleWorkBoardChange("isAccordionOpen", true);
    handleWorkBoardChange("currentTaskIndex", null);
    handleNewTaskChange("name", "");
    handleNewTaskChange("description", "");
    handleNewTaskChange("status", "To-Do");
    handleNewTaskChange("user", "");
  };

  const handleTaskSubmit = () => {
    const { name, description, status, user } = workBoard.newTask;
    if (!name || !status || !user) {
      alert("All required fields must be filled.");
      return;
    }

    if (workBoard.currentTaskIndex !== null) {
      // Update existing task
      const updatedTasks = workBoard.tasks.map((task, index) =>
        index === workBoard.currentTaskIndex
          ? { ...task, name, description, status, user }
          : task
      );
      handleWorkBoardChange("tasks", updatedTasks);
    } else {
      // Add new task
      const newTask = {
        name,
        description,
        status,
        user
      };
      handleWorkBoardChange("tasks", [...workBoard.tasks, newTask]);
    }
    handleWorkBoardChange("isAccordionOpen", false);
    handleWorkBoardChange("currentTaskIndex", null);
    handleNewTaskChange("name", "");
    handleNewTaskChange("description", "");
    handleNewTaskChange("status", "To-Do");
    handleNewTaskChange("user", "");
  };

  const handleTaskClick = (index) => {
    const task = workBoard.tasks[index];
    handleWorkBoardChange("currentTaskIndex", index);
    handleNewTaskChange("name", task.name);
    handleNewTaskChange("description", task.description);
    handleNewTaskChange("status", task.status);
    handleNewTaskChange("user", task.user);
    handleWorkBoardChange("isAccordionOpen", true);
  };

  function renameField(tasks, oldField, newField) {
    return tasks.map(task => {
      if (task.hasOwnProperty(oldField)) {
        task[newField] = task[oldField];
        delete task[oldField];
      }
      return task;
    });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = window.localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const payload = {
        "name": workBoard.name,
        "description": workBoard.about,
        "tasks": workBoard.tasks
      }

      // Rename the field from 'user' to 'assigned_to'
      payload.tasks = renameField(payload.tasks, 'user', 'assigned_to');

      console.log("payload:", payload)

      const url = Api.workboard;
      const response = await axios.post(`http://localhost:8000${url}`, payload, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        handleAlertChange("success", "Workboard created successfully!", 4000);
        setWorkBoard({ ...initialState });
        } 
      else {
            handleAlertChange("error", "Failed to create workboard.");
        }
    
    } catch (error) {
      console.error("Error adding product:", error);
      handleAlertChange("error", error.response.status === 403 ?  "You do not have access to create a workboard." : "An error occurred while creating the workboard.");
    }
  }

  const handleCancel = () => {
    navigate(-1);
  };

  const handleClose = () => {
    handleWorkBoardChange("isAccordionOpen", false);
    handleWorkBoardChange("currentTaskIndex", null);
    handleNewTaskChange("name", "");
    handleNewTaskChange("description", "");
    handleNewTaskChange("status", "To-Do");
    handleNewTaskChange("user", "");
  }

  return (
    <>
      {showAlert.isAlert && showAlert.severity === "error" ? (
        <div className="p-4 mb-4 text-sm text-center text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
          <span className="font-medium">Error! {" "}</span> {showAlert.alertText}
        </div>) : showAlert.isAlert && showAlert.severity === "success" ? (

        <div className="p-4 text-sm text-center text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
          <span className="font-medium">Success! {" "}</span> {showAlert.alertText}
        </div>)
        : null
      }
      <div className="max-w-screen-xl mx-auto">
        <div
          className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3 md:grid-cols-2 lg:ml-20 md:ml-10"
          style={{ marginTop: 0, marginBottom: 0, paddingTop: "30px" }}
        ></div>
      </div>
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-center items-center mt-5">
          <form onSubmit={handleSubmit} className="bg-white rounded px-8 pt-6 pb-4 mb-4 w-full max-w-lg" style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}>
            <div className="mb-4">
              <input
                type="text"
                name="name"
                id="name"
                value={workBoard.name}
                onChange={(e) => handleWorkBoardChange("name", e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Name your Board"
                required
              />
            </div>
            <div className="mb-4">
              <textarea
                id="about"
                name="about"
                value={workBoard.about}
                onChange={(e) => handleWorkBoardChange("about", e.target.value)}
                rows={3}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-2 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Board description"
              />
            </div>
            {/* Display added tasks */}
            {workBoard.tasks.length > 0 ? (
              <div className="mt-2">
                {workBoard.tasks.map((task, index) => (
                  workBoard.currentTaskIndex !== index && (
                    <article
                      key={index}
                      className="flex max-w-xl flex-col items-start justify-between px-3 py-3 relative mb-2"
                      style={{ border: "1px solid #D5D5D5", borderRadius: "16px", backgroundColor: "rgb(255, 233, 229)", height: "100px", cursor: "pointer" }}
                      onClick={() => handleTaskClick(index)}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-x-4 text-xs">
                          <a
                            className="relative z-10 px-3 py-1.5 font-medium text-lg text-gray-800 overflow-hidden line-clamp-2"
                          >
                            {task.name}
                          </a>
                        </div>
                        <div className="flex items-center justify-end px-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1"
                            stroke="currentColor"
                            className="size-5 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTaskClick(index);
                            }}
                            onTouchStart={() => handleTaskClick(index)}
                            style={{ filter: 'brightness(0.7)' }} // Adjust the brightness value as needed
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                            />
                          </svg>

                        </div>
                      </div>
                      <div className="group relative w-full">
                        <h3 className="mt-3 px-3 py-1.5 text-lg font-semibold leading-6 text-gray-600 group-hover:text-gray-600 absolute bottom-0 left-0">
                          <a aria-label={`${task.status}`}>
                            <span className="absolute inset-0" />
                            {task.status}
                          </a>
                        </h3>
                        <div className="flex justify-end absolute bottom-0 right-0">
                          <div
                            className="h-10 w-10 flex items-center justify-center rounded-full text-lg font-medium cursor-pointer relative"
                            style={{
                              backgroundColor: "#D5D5D5",
                            }}
                          >
                            {task.user.charAt(0).toUpperCase() || 'A'}
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                ))}
              </div>

            ) : (
              <p className="text-gray-700"></p>
            )}

            {workBoard.isAccordionOpen && (
              <div className="mb-4 p-4 mt-4" style={{ border: "1px solid #D5D5D5", borderRadius: "8px" }}>
                <input
                  type="text"
                  name="taskName"
                  id="taskName"
                  value={workBoard.newTask.name}
                  onChange={(e) => handleNewTaskChange("name", e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 mb-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Task title"
                  required
                />
                <textarea
                  id="taskDescription"
                  name="taskDescription"
                  value={workBoard.newTask.description}
                  onChange={(e) => handleNewTaskChange("description", e.target.value)}
                  rows={3}
                  className="shadow appearance-none border rounded w-full py-2 px-3 mb-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Task description (optional)"
                />
                <div className="flex space-x-4">
                  <select
                    id="taskStatus"
                    name="taskStatus"
                    value={workBoard.newTask.status}
                    onChange={(e) => handleNewTaskChange("status", e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="To-Do">To Do</option>
                    <option value="In-Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <select
                    id="taskUser"
                    name="taskUser"
                    value={workBoard.newTask.user}
                    onChange={(e) => handleNewTaskChange("user", e.target.value)}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">Select User</option>
                    {users.map(user => (
                      <option key={user} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-start space-x-4 px-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="mt-4 text-black font-normal py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    style={{ border: "1px solid #D5D5D5", borderRadius: "8px" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
                      <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={handleTaskSubmit}
                    className="mt-4 px-4 rounded focus:outline-none focus:shadow-outline"
                    style={{ border: "1px solid #D5D5D5", borderRadius: "8px" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-4">
                      <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>

              </div>
            )}

            <div className="flex items-center mb-4 mt-4">
              <button
                type="button"
                onClick={handleAddTask}
                className="flex items-center justify-center text-white font-normal py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                style={{ backgroundColor: "#49bc8e" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="4"
                  stroke="currentColor"
                  className="w-4 h-4 mr-2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add a Task
              </button>
            </div>

            <div className="flex justify-end space-x-4 py-2 px-2">
              <button
                type="button"
                onClick={handleCancel}
                className="text-black font-normal py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                style={{ border: "1px solid #D5D5D5", borderRadius: "8px" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                style={{ border: "1px solid #D5D5D5", borderRadius: "8px" }}
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
export default AddWorkBoard;
