import React from 'react'
import { Link } from 'react-router-dom'
import {
  FiGrid,
  FiFolder,
  FiUsers,
  FiPieChart,
  FiMessageSquare,
  FiCode,
  FiArrowUpRight
} from 'react-icons/fi'

function Menu() {
  return (
    <div className='min-h-screen w-full bg-white rounded-lg p-2'>
      <div className='flex'>
        <Link to="#">
          <img
            src="/images/Logo.jpg"
            alt="Logo"
            className='w-full h-auto max-h-30 object-contain'
          />
        </Link>
      </div>

      <ul className='space-y-2'>
        <li>
          <Link
            to="/admin/dashboard"
            className='flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-3 bg-white text-black hover:bg-pink-400 hover:text-white transition-colors'
          >
            <FiGrid className='w-5 h-5' />
            Dashboard
          </Link>
        </li>
        <li>
          <Link
            to="/admin/managerProducts"
            className='flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-3 bg-white text-black hover:bg-pink-400 hover:text-white transition-colors'
          >
            <FiFolder className='w-5 h-5' />
            Products
          </Link>
        </li>
        <li>
          <Link
            to="/admin/Teams"
            className='flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-3 bg-white text-black hover:bg-pink-400 hover:text-white transition-colors'
          >
            <FiUsers className='w-5 h-5' />
            Teams
          </Link>
        </li>
        <li>
          <Link
            to="/admin/Analytics"
            className='flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-3 bg-white text-black hover:bg-pink-400 hover:text-white transition-colors'
          >
            <FiPieChart className='w-5 h-5' />
            Analytics
          </Link>
        </li>
        <li>
          <Link
            to="/admin/Messages"
            className='flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-3 bg-white text-black hover:bg-pink-400 hover:text-white transition-colors'
          >
            <FiMessageSquare className='w-5 h-5' />
            Messages
          </Link>
        </li>
        <li>
          <Link
            to="/admin/Integrations"
            className='flex items-center gap-3 border border-gray-300 rounded-lg px-4 py-3 bg-white text-black hover:bg-pink-400 hover:text-white transition-colors'
          >
            <FiCode className='w-5 h-5' />
            Integrations
          </Link>
        </li>
      </ul>

      <div className='w-full p-3 bg-blue-100 mt-10 rounded-lg grid place-items-center'>
        <div className="w-16 h-16 bg-blue-200 rounded-full grid place-items-center mb-3">
          <FiArrowUpRight className="w-8 h-8 text-blue-600" />
        </div>
        <p className='font-bold text-xl m-2 text-center'>Back to Home page</p>
        <Link
          to="/Home"
        >
          <button className='mb-2 border border-blue-500 text-blue-500 hover:bg-blue-50 cursor-pointer font-medium py-1.5 px-6 rounded-md text-sm'>
            Go Home
          </button>
        </Link>
      </div>
    </div>
  )
}

export default Menu
