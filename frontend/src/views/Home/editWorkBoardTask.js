import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Api from "../../components/Api";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid"; // Importing the uuid function
import { useSelector } from 'react-redux';
import { setWorkBoardDetails } from "../../redux/app/appSlice";
import { useDispatch } from 'react-redux';

const EditWorkBoardTask = () => {
  const location = useLocation();
  // const { workboardName } = location.state || {};
  const dispatch = useDispatch();

  const params = useParams();
  const {workboard_id,task_id} = params;

  const state = useSelector((state)=> state.app);
  const {workboard, users} = state;

  const initialTaskState = {
    id:"",
    name:"",
    description:"",
    status:"To-Do",
    assigned_to:""
  }
  const [task, setTask] = useState({
   ...initialTaskState
  })


  const navigate = useNavigate();

  // Alert State
  const [showAlert, setShowAlert] = useState({
    isAlert: false,
    alertTitle: "",
    alertText: "",
    severity: "",
  });

  const alertTimeout = useRef(null);

  const handleTaskChange = (key, value) =>{
    if(key === "reset"){
      setTask((prev)=>({...prev, initialTaskState}))
    }else{
      setTask((prev)=>({...prev, [key]:value}))
    }
  }

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

      // if (severity === "success") {
      // navigate('/app/home');
      // }
    }, duration);
  };

  const fetchWorkBoardTask = async () => {
    try {
      const url = Api.tasks;
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
      dispatch(setWorkBoardDetails(response.data))
      const task = response.data.tasks.find((each)=>each.task_id === task_id)
      if(task){
        setTask(task)
      }

    } catch (error) {
      console.error("Error fetching workboards:", error);
      handleAlertChange("error", "Failed to fetch workboards.");
      if (error.response && error.response.status === 401) {
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    if(!(workboard && state.isLoadingSpin)){
      fetchWorkBoardTask();
    }else if(workboard){
      const task = workboard.tasks.find((each)=>each.task_id === task_id)
      if(task){
        setTask(task)
      }
    }
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = window.localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const url = Api.tasks; // Assuming PUT is used for updating

      let payload = {
        name: task.name,
        description: task.description,
        status: task.status,
        assigned_to: parseInt(task.assigned_to)
    };
    
    let response;
    if (task.id) {
        payload.id = task.id;
    
        console.log("payload:", payload);
    
        response = await axios.put(`http://localhost:8000${url}${task.id}/`, payload, {
            headers: {
                Authorization: `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } else {
        payload.task_id = task_id;
        payload.workboard_id = workboard.id;
    
        console.log("payload:", payload);
    
         response = await axios.post(`http://localhost:8000${url}`, payload, {
            headers: {
                Authorization: `Token ${token}`,
                'Content-Type': 'application/json'
            }
        });
    }
  

      if (response.status === 200) {
        handleAlertChange("success", "Task updated successfully!", 6000);
      } else if (response.status === 201) {
        dispatch(setWorkBoardDetails({...workboard,tasks : [...workboard["tasks"],response.data.task] }))
        setTask((prev) => ({...prev,...response.data.task}))
        handleAlertChange("success", "Task Created successfully!", 6000);
      }  else {
        handleAlertChange("error", "Failed to update Task.");
      }
    } catch (error) {
      console.error("Error updating workboard:", error);
      handleAlertChange("error", error.response.status === 403 ? "You don't acess to create task" : "An error occurred while updating the Task.");
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  console.log("task:",task);

  return (
    <>
     <div className="max-w-screen-xl mx-auto">
        <div
          className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3 md:grid-cols-2 lg:ml-20 md:ml-10"
          style={{ marginTop: 0,marginBottom:0,paddingTop:"30px" }}
        ></div>
      </div>
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

      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-center items-center mt-5">
          <form onSubmit={handleSubmit} className="bg-white rounded px-8 pt-6 pb-4 mb-4 w-full max-w-lg" style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}>
            {/* Workboard Name */}
            <h2 className="text-xl font-bold mb-4">Workboard Name</h2>
            <div className="mb-4">
              <input
                type="text"
                name="workboard_name"
                id="workboard_name"
                value={workboard.workboard_name}
                readOnly
                className="shadow appearance-none border rounded w-full py-2 px-3 mb-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            {/* Task Details */}
            <div className="mb-6 p-4" style={{ border: "1px solid #D5D5D5", borderRadius: "8px" }}>
              <h2 className="text-xl font-bold mb-4">Edit Task</h2>
              {/* Task Name */}
              <div className="mb-4">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={task.name}
                  onChange={(e) => handleTaskChange("name", e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 mb-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Task title"
                  required
                />
              </div>

              {/* Task Description */}
              <div className="mb-4">
                <textarea
                  name="description"
                  id="description"
                  value={task.description}
                  onChange={(e) => handleTaskChange("description", e.target.value)}
                  rows={3}
                  className="shadow appearance-none border rounded w-full py-2 px-3 mb-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Task description (optional)"
                />
              </div>

              {/* Task Status and Assigned User */}
              <div className="flex space-x-4">
                <select
                  name="status"
                  id="status"
                  value={task.status}
                  onChange={(e) => handleTaskChange("status", e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="To-Do">To Do</option>
                  <option value="In-Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <select
                  name="assigned_to"
                  id="assigned_to"
                  value={task.assigned_to}
                  onChange={(e) => handleTaskChange("assigned_to", e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
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
                {task.id ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default EditWorkBoardTask;
