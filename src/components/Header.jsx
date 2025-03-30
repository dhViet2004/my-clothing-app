import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

function Header() {
    return (
        <div className="flex flex-col">
            <header className='bg-gray-800 text-white py-4 font-bold'>
                <nav>
                    <ul className='flex justify-center space-x-8'>
                        <li>
                            <Link to='/Home' className='hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors duration-200'>
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link to='/ManagerProducts' className='hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors duration-200'>
                                ManagerProducts
                            </Link>
                        </li>
                    </ul>
                </nav>
            </header>
        </div>
    );
}

export default Header;