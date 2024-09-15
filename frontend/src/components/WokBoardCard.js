import React, { useMemo, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';

const WorkBoardCard = ({ workboard, index, onClick }) => {
  const navigate = useNavigate();

  const state = useSelector((state) => state.app)

  const users = state.users;

  const workboard_users = useMemo(() => {
    if (users.length > 0) {
      return users.filter((user) => workboard.users.includes(user.id));
    }
    return [];
  }, [workboard, users]);

  const [hoveredUser, setHoveredUser] = useState(null);

  const handleNavigateHome = () => {
    navigate("/home");
  };

  // More distinct background colors for cards
  const cardBackgroundColors = ['rgb(255, 233, 229)', 'rgb(73, 188, 142)', 'rgb(255, 254, 229)'];
  const cardBackgroundColor = cardBackgroundColors[index % cardBackgroundColors.length];

  // Colors for user icons
  const userIconColors = ['rgb(255, 233, 193)', 'rgb(73, 188, 142)', 'rgb(255, 254, 193)'];

  return (
    <article className="flex max-w-xl flex-col items-start justify-between px-3 py-3 sm:mb-0 mx-auto"  onClick={() => onClick(workboard)} style={{ border: "1px solid #D5D5D5", borderRadius: "16px", backgroundColor: cardBackgroundColor, height: "150px", width: "280px", cursor:"pointer" }}>
     <div className="flex items-center gap-x-4 text-xs">
        <a
          className="relative z-10 px-3 py-1.5 font-medium text-lg text-gray-800 overflow-hidden line-clamp-2"
        >
          {workboard.workboard_name}
        </a>
      </div>

      <div className="group relative w-full">
        <h3 className="mt-3  px-3 py-1.5  text-lg font-semibold leading-6 text-gray-600 group-hover:text-gray-600 absolute bottom-0 left-0">
          <a aria-label={`${workboard.tasks_count} tasks`}>
            <span className="absolute inset-0" />
            {workboard.tasks_count} Tasks
          </a>
        </h3>
        <div className="flex justify-end absolute bottom-0 right-0">
          {workboard_users.slice(0, 4).map((user, userIndex) => (
            <div
              key={userIndex}
              className="h-10 w-10 flex items-center justify-center rounded-full text-lg font-medium cursor-pointer relative"
              style={{
                backgroundColor: userIconColors[userIndex % userIconColors.length] !== cardBackgroundColor ? userIconColors[userIndex % userIconColors.length] : '#FFFFFF',
                marginLeft: userIndex === 0 ? 0 : -userIndex * 10, // Overlap each user icon
                zIndex: workboard.users.length - userIndex, // Ensure the last user icon is on top
              }}
              // onClick={() => handleUserClick(user)}
              onMouseEnter={() => setHoveredUser(user)}
              onMouseLeave={() => setHoveredUser(null)}
            >
              {user.name.charAt(0).toUpperCase() || 'A'}
              {hoveredUser === user && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-300 text-white text-sm px-2 py-1 rounded">
                  {user.name}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </article>
  );
};

export default WorkBoardCard;
