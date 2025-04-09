import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';

function Header() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when clicking on a link
    const handleLinkClick = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-gray-900 shadow-lg' : 'bg-gray-800'}`}>
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    {/* Logo or brand name - add your logo here */}
                    <Link to="/Home" className="text-xl font-bold text-white">
                        YourBrand
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:block">
                        <ul className="flex space-x-2 lg:space-x-6">
                            <li>
                                <Link 
                                    to="/" 
                                    className="text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors duration-200 text-sm lg:text-base"
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/products" 
                                    className="text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors duration-200 text-sm lg:text-base"
                                >
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/login" 
                                    className="text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors duration-200 text-sm lg:text-base"
                                >
                                    Login
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/* Mobile menu button */}
                    <button 
                        className="md:hidden text-white focus:outline-none"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isMobileMenuOpen && (
                    <nav className="md:hidden mt-4 pb-4">
                        <ul className="flex flex-col space-y-2">
                            <li>
                                <Link 
                                    to="/Home" 
                                    className="block text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors duration-200"
                                    onClick={handleLinkClick}
                                >
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/ManagerProducts" 
                                    className="block text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors duration-200"
                                    onClick={handleLinkClick}
                                >
                                    Products
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/AuthForm" 
                                    className="block text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors duration-200"
                                    onClick={handleLinkClick}
                                >
                                    Login
                                </Link>
                            </li>
                        </ul>
                    </nav>
                )}
            </div>
        </header>
    );
}

export default Header;