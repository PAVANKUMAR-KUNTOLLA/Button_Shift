import React, { useState, useEffect, useRef, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Api from "../../components/Api";
import Page from "./../../components/Page";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { v4 as uuidv4 } from "uuid"; // Importing the uuid function
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import {setWorkBoardDetails} from "../../redux/app/appSlice";

const WorkBoardDetailView = () => {
  const navigate = useNavigate();

  const dispatch = useDispatch();

  const params = useParams();
  const workboard_id = params.workboard_id;

  const state = useSelector((state) => state.app);
  // const [workboardName,setWorkboardName] = useState("");

  const workboard = state.workboard;
  const users = state.users;


  const role = state.profile.role;

  const [tasks, setTasks] = useState({
    "To-Do": [],
    "In-Progress": [],
    Completed: []
  });


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
    }, duration);
  };

  const url = Api.tasks;
  const fetchWorkBoardTask = async () => {
    try {
      const token = window.localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`http://localhost:8000${url}`, {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json"
        },
        params: {
          id: workboard_id
        }
      });

      const taskData =  response.data.tasks.reduce(
        (acc, task) => {
          if (acc[task.status]) {
            acc[task.status].push({ ...task, uuid: uuidv4() }); // Assigning unique uuid to each task
          } else {
            console.warn(`Unexpected task status: ${task.status}`);
            acc.other = acc.other || [];
            acc.other.push({ ...task, uuid: uuidv4() });
          }
          return acc;
        },
        { "To-Do": [], "In-Progress": [], Completed: [] }
      );

      console.log("Fetched tasks:", taskData);
      setTasks(taskData);

      dispatch(setWorkBoardDetails(response.data))

    } catch (error) {
      console.error("Error fetching workboards:", error);
      handleAlertChange("error", "Failed to fetch workboards.");
      if (error.response && error.response.status === 401) {
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchWorkBoardTask();
  }, []);

  const onDragEnd = async (result) => {

    if (role === 'VIEWER') {
      handleAlertChange("error", "You do not have access to update task.");
        return;
    }
    if (!result) {
      console.log("No result");
      return;
    }

    console.log("Drag ended:", result);
    const { destination, source, draggableId } = result;

    if (!destination) {
      console.log("No destination");
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      console.log("No change in position");
      return;
    }

    const start = tasks[source.droppableId];
    const finish = tasks[destination.droppableId];

    if (start === finish) {
      const newTasks = Array.from(start);
      newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, tasks[source.droppableId][source.index]);

      const newState = {
        ...tasks,
        [source.droppableId]: newTasks
      };

      setTasks(newState);
    } else {
      const startTasks = Array.from(start);
      const finishTasks = Array.from(finish);

      const [movedTask] = startTasks.splice(source.index, 1);
      finishTasks.splice(destination.index, 0, movedTask);

      const newState = {
        ...tasks,
        [source.droppableId]: startTasks,
        [destination.droppableId]: finishTasks
      };

      setTasks(newState);

      // Update the backend
      try {
        const token = window.localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const payload = {
            workboard_name: workboard.name,
            name: movedTask.name,
            description: movedTask.description,
            status: destination.droppableId,
            assigned_to: movedTask.assigned_to
        };

        await axios.put(
            `http://localhost:8000${url}${movedTask.id}/`,
            payload,
            {
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );
        handleAlertChange("success", "Task updated successfully!");
      } catch (error) {
        console.error("Error updating task status:", error);
        handleAlertChange("error", "Failed to update task status.");
        // Optionally, handle different error types or show a message to the user
        if (error.response) {
          console.error("Error response:", error.response.data);
        } else if (error.request) {
          console.error("Error request:", error.request);
        } else {
          console.error("Error message:", error.message);
        }
      }
    }
  };

  const handleNavigate = (task) => {
    navigate(`/app/editTask/${workboard.id}/${task.task_id}`); //{ state: { workboardName: workboardName, task: task } }
  };


  const handleCreateTask = () => {
    navigate(`/app/editTask/${workboard.id}/${uuidv4()}`);
  }


  const columns = [
    { uuid: uuidv4(), id: "To-Do", title: "To-Do", color: "bg-red-100" },
    { uuid: uuidv4(), id: "In-Progress", title: "In Progress", color: "bg-yellow-100" },
    { uuid: uuidv4(), id: "Completed", title: "Completed", color: "bg-green-200" }
  ];

  return (
    <Page title={"Workboard Detail"}>
      <div className="max-w-screen-xl mx-auto">
        <div
          className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3 md:grid-cols-2 lg:ml-20 md:ml-10"
          style={{ marginTop: 0,marginBottom:0,paddingTop:"30px" }}
        ></div>
      </div>
      <div className="max-w-screen-xl mx-auto p-4">

        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold mb-4">{workboard.workboard_name}</h1>

          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-10 mr-5 cursor-pointer"  
          onClick={() => handleCreateTask()}
          onTouchStart={() => handleCreateTask()}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </div>

        {/* <p className="mb-4 font-normal">{workboardName}</p> */}

        {showAlert.isAlert && (
          <div
            className={`p-4 mb-4 text-sm text-center rounded-lg ${
              showAlert.severity === "error"
                ? "text-red-800 bg-red-50 dark:bg-gray-800 dark:text-red-400"
                : "text-green-800 bg-green-50 dark:bg-gray-800 dark:text-green-400"
            }`}
            role="alert"
          >
            <span className="font-medium">{showAlert.severity === "error" ? "Error!" : "Success!"} </span>
            {showAlert.alertText}
          </div>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {columns.map(({ uuid, id, title, color }) => (
              <Droppable key={uuid} droppableId={id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`${color} p-4 rounded-lg`}
                  >
                    <h3 className="font-semibold mb-2">{title}</h3>
                    {tasks[id].map((task, index) => (
                      <Draggable
                        key={task.uuid} // Use the unique UUID here
                        draggableId={task.uuid} // Use the UUID as the draggableId
                        index={index}
                      
                      >
                        {(provided) => (
                       <div
                       ref={provided.innerRef}
                       {...provided.draggableProps}
                       {...provided.dragHandleProps}
                       onClick={() => handleNavigate(task)}
                       onTouchStart={() => handleNavigate(task)}
                       className="bg-white p-4 mb-2 rounded border border-gray-300 relative"
                  
                     >
                       <div className="flex justify-between items-center">
                         <div className="text-lg font-semibold overflow-hidden line-clamp-2">
                           {task.name}
                         </div>
                         <div className="flex items-center space-x-4">
                         <div>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1"
                            stroke="currentColor"
                            className="size-5 cursor-pointer"
                            // className="size-5 cursor-pointer"
                            style={{ filter: 'brightness(0.7)' }} // Adjust the brightness value as needed
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                            />
                          </svg>
                        </div>
                           <div
                             className="h-8 w-8 flex items-center text-white  justify-center rounded-full text-lg font-medium"
                             style={{
                               backgroundColor: "#C3B1E1",
                             }}
                           >
                             {task.assigned_to && users.length > 0 ? users.find((user) => user.id === task.assigned_to).name.charAt(0).toUpperCase() : 'A'}
                           </div>
                      
                         </div>
                       </div>
                     </div>
                     
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    </Page>
  );
};

export default WorkBoardDetailView;
