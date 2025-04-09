import React from 'react';
import {
    FiSearch,
    FiBell,
    FiHelpCircle
} from 'react-icons/fi';
import { FaUserCircle } from 'react-icons/fa';

const DashboardHeader = () => {
    return (
        <header className="bg-white shadow-sm flex items-center justify-between gap-4 p-4">
            <div className="text-2xl font-bold text-pink-400 hidden md:block whitespace-nowrap">
                Dashboard
            </div>

            <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto justify-end flex-wrap">
                <div className="relative w-full md:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full h-10 pl-10 pr-3 border border-gray-300 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tìm kiếm..."
                    />
                </div>

                <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
                    <FiBell className="text-gray-600 w-5 h-5" />
                </button>
                <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
                    <FiHelpCircle className="text-gray-600 w-5 h-5" />
                </button>
                <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition">
                    <FaUserCircle className="text-gray-600 w-5 h-5" />
                </button>
            </div>
        </header>
    );
};


export default DashboardHeader;