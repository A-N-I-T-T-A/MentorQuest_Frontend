import React from "react";

const DashboardCard = ({ title, value, icon }) => {
    return (
        <div className="dashboard-card bg-white shadow-md rounded-xl p-6 flex items-center space-x-4 transition-transform transform hover:scale-105">
            <div className="icon-container bg-blue-100 p-3 rounded-full">
                <i className={`${icon} text-3xl text-blue-500`}></i>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    );
};

export default DashboardCard;
