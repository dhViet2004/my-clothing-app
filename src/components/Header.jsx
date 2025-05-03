import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { ShoppingCartOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Badge, Dropdown } from 'antd';
import { useCart } from './CartContext';
import { useAuth } from './AuthContext';

function Header({ onCartClick }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { getCartItemCount } = useCart();
    const { user, logout } = useAuth();

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

    const userMenuItems = [
        {
            key: 'profile',
            label: <Link to={user?.role === 'admin' ? "/admin" : "/profile"}>
                {user?.role === 'admin' ? 'Admin' : 'Tài khoản của tôi'}
            </Link>
        },
        {
            key: 'logout',
            label: 'Đăng xuất',
            onClick: logout
        }
    ];

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
                        <ul className="flex space-x-2 lg:space-x-6 items-center">
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
                            {user ? (
                                <li>
                                    <Dropdown 
                                        menu={{ items: userMenuItems }} 
                                        trigger={['click']}
                                        placement="bottomRight"
                                    >
                                        <Button
                                            type="text"
                                            className="text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors duration-200 text-sm lg:text-base"
                                        >
                                            <UserOutlined style={{ color: 'white' }} className="mr-2" />
                                            <span className="text-white">{user.full_name || user.username}</span>
                                        </Button>
                                    </Dropdown>
                                </li>
                            ) : (
                                <li>
                                    <Link 
                                        to="/login" 
                                        className="text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors duration-200 text-sm lg:text-base"
                                    >
                                        Login
                                    </Link>
                                </li>
                            )}
                            <li>
                                <Badge count={getCartItemCount()} size="small">
                                    <Button
                                        type="text"
                                        icon={<ShoppingCartOutlined style={{ color: 'white', fontSize: '20px' }} />}
                                        onClick={onCartClick}
                                        className="hover:bg-gray-700"
                                    />
                                </Badge>
                            </li>
                        </ul>
                    </nav>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center space-x-4">
                        <Badge count={getCartItemCount()} size="small">
                            <Button
                                type="text"
                                icon={<ShoppingCartOutlined style={{ color: 'white', fontSize: '20px' }} />}
                                onClick={onCartClick}
                                className="hover:bg-gray-700"
                            />
                        </Badge>
                        {user ? (
                            <Dropdown 
                                menu={{ items: userMenuItems }} 
                                trigger={['click']}
                                placement="bottomRight"
                            >
                                <Button
                                    type="text"
                                    className="text-white hover:bg-gray-700"
                                >
                                    <UserOutlined style={{ color: 'white' }} className="mr-2" />
                                    <span className="text-white">{user.full_name || user.username}</span>
                                </Button>
                            </Dropdown>
                        ) : (
                            <Link 
                                to="/login" 
                                className="text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors duration-200"
                            >
                                Login
                            </Link>
                        )}
                        <button 
                            className="text-white focus:outline-none"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                    </div>
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
                            {user ? (
                                <>
                                    <li>
                                        <Link 
                                            to="/profile" 
                                            className="block text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors duration-200"
                                            onClick={handleLinkClick}
                                        >
                                            Tài khoản của tôi
                                        </Link>
                                    </li>
                                    <li>
                                        <button 
                                            onClick={() => {
                                                logout();
                                                handleLinkClick();
                                            }}
                                            className="block w-full text-left text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors duration-200"
                                        >
                                            Đăng xuất
                                        </button>
                                    </li>
                                </>
                            ) : (
                                <li>
                                    <Link 
                                        to="/login" 
                                        className="block text-white hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors duration-200"
                                        onClick={handleLinkClick}
                                    >
                                        Login
                                    </Link>
                                </li>
                            )}
                        </ul>
                    </nav>
                )}
            </div>
        </header>
    );
}

export default Header;