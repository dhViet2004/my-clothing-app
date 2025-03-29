import React from 'react'
import { Link } from 'react-router-dom'
function Header() {
    return (
        <header className='bg-gray-800 text-white py-4 font-bold'>
            <nav className=''>
                <ul className='flex justify-center space-x-8'>
                    <li>
                        <Link to='/Home'
                        className='space-x-8 hover:bg-gray-700 px-4 py-2 rounded-lg'>
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link to='/ManagerProducts'
                        className='space-x-8 hover:bg-gray-700 px-4 py-2 rounded-lg'>
                            ManagerProducts
                        </Link>
                    </li>
                </ul>
            </nav>
        </header>
    )
}

export default Header
