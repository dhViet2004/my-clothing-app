import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { message } from 'antd';
import { GoogleLogin } from '@react-oauth/google';
import { FcGoogle } from 'react-icons/fc';
import axios from 'axios';

const AuthForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [rightPanelActive, setRightPanelActive] = useState(false);
  const [signupData, setSignupData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'client' // Default role for new registrations
  });

  const [signinData, setSigninData] = useState({
    username: '',
    password: '',
  });

  const handleSignUp = async () => {
    try {
      const response = await fetch('http://localhost:8080/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();
      if (data.success) {
        message.success('Đăng ký thành công!');
        setRightPanelActive(false); // chuyển sang form đăng nhập
      } else {
        message.error(data.error || 'Lỗi đăng ký');
      }
    } catch (err) {
      console.error('Lỗi signup:', err);
      message.error('Lỗi kết nối máy chủ');
    }
  };

  const handleSignIn = async () => {
    try {
      const response = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signinData),
      });

      const data = await response.json();
      if (data.success) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        message.success('Đăng nhập thành công!');
        
        // Navigate based on role
        if (data.user.role === 'admin') {
          window.location.href = 'http://localhost:5173/admin';
        } else {
          window.location.href = '/profile';
        }
      } else {
        message.error(data.error || 'Lỗi đăng nhập');
      }
    } catch (err) {
      console.error('Lỗi signin:', err);
      message.error('Lỗi kết nối máy chủ');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
        if (!credentialResponse.credential) {
            message.error('Không nhận được thông tin xác thực từ Google');
            return;
        }

        console.log('Sending credential to server...');
        const response = await axios.post('http://localhost:8080/auth/google', {
            credential: credentialResponse.credential
        });

        if (response.data.success) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            message.success('Đăng nhập thành công!');
            
            if (response.data.user.role === 'admin') {
                window.location.href = 'http://localhost:5173/admin';
            } else {
                window.location.href = '/profile';
            }
        } else {
            message.error(response.data.error || 'Lỗi đăng nhập');
        }
    } catch (err) {
        console.error('Lỗi đăng nhập Google:', err);
        if (err.response) {
            console.error('Server response:', err.response.data);
            message.error(err.response.data.error || 'Lỗi đăng nhập');
        } else if (err.request) {
            console.error('No response received:', err.request);
            message.error('Không nhận được phản hồi từ máy chủ');
        } else {
            console.error('Error setting up request:', err.message);
            message.error('Lỗi kết nối máy chủ');
        }
    }
  };

  const handleGoogleError = () => {
    message.error('Đăng nhập Google thất bại. Vui lòng thử lại.');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rightPanelActive) {
      handleSignUp();
    } else {
      handleSignIn();
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 font-sans">
      <div className={`relative w-full max-w-4xl min-h-[480px] bg-white rounded-xl shadow-lg overflow-hidden ${rightPanelActive ? 'model-right-panel-active' : ''}`}>
        {/* Sign Up Form */}
        <div className={`absolute top-0 h-full w-1/2 transition-all duration-600 ease-in-out flex items-center justify-center ${rightPanelActive ? 'translate-x-full opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <form onSubmit={handleSubmit} className="flex flex-col items-center w-4/5">
            <h1 className="text-2xl mb-5 text-gray-800">Tạo tài khoản</h1>
            <input
              type="text"
              placeholder="Họ và tên"
              value={signupData.full_name}
              onChange={(e) => setSignupData({ ...signupData, full_name: e.target.value })}
              className="w-full p-3 my-2 border border-gray-200 rounded focus:outline-none focus:border-gray-400"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={signupData.email}
              onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
              className="w-full p-3 my-2 border border-gray-200 rounded focus:outline-none focus:border-gray-400"
              required
            />
            <input
              type="text"
              placeholder="Tên đăng nhập"
              value={signupData.username}
              onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
              className="w-full p-3 my-2 border border-gray-200 rounded focus:outline-none focus:border-gray-400"
              required
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={signupData.password}
              onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
              className="w-full p-3 my-2 border border-gray-200 rounded focus:outline-none focus:border-gray-400"
              required
            />

            <button
              type="submit"
              className="rounded-full border border-gray-700 bg-gray-700 text-white text-xs font-medium py-3 px-11 my-3 uppercase tracking-wider transition-all duration-300 hover:bg-gray-800 active:scale-95 focus:outline-none hover:cursor-pointer"
            >
              Đăng ký
            </button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className={`absolute top-0 h-full w-1/2 transition-all duration-600 ease-in-out flex items-center justify-center ${rightPanelActive ? 'translate-x-full opacity-0 z-0' : 'opacity-100 z-10'}`}>
          <form onSubmit={handleSubmit} className="flex flex-col items-center w-4/5">
            <h1 className="text-2xl mb-5 text-gray-800">Đăng nhập</h1>
            <input
              type="text"
              placeholder="Tên đăng nhập"
              value={signinData.username}
              onChange={(e) => setSigninData({ ...signinData, username: e.target.value })}
              className="w-full p-3 my-2 border border-gray-200 rounded focus:outline-none focus:border-gray-400"
              required
            />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={signinData.password}
              onChange={(e) => setSigninData({ ...signinData, password: e.target.value })}
              className="w-full p-3 my-2 border border-gray-200 rounded focus:outline-none focus:border-gray-400"
              required
            />
            <button
              type="submit"
              className="rounded-full border border-gray-700 bg-gray-700 text-white text-xs font-medium py-3 px-11 my-3 uppercase tracking-wider transition-all duration-300 hover:bg-gray-800 active:scale-95 focus:outline-none hover:cursor-pointer"
            >
              Đăng nhập
            </button>
            
            <div className="w-full flex items-center justify-center my-4">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="px-4 text-gray-500 text-sm">Hoặc</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            <div className="w-full flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_blue"
                shape="rectangular"
                text="signin_with"
                locale="vi"
                width="100%"
                flow="implicit"
                render={renderProps => (
                  <button
                    onClick={renderProps.onClick}
                    disabled={renderProps.disabled}
                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    <FcGoogle className="text-xl" />
                    <span>Đăng nhập với Google</span>
                  </button>
                )}
              />
            </div>
          </form>
        </div>

        {/* Overlay Container */}
        <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-600 ease-in-out z-50 ${rightPanelActive ? '-translate-x-full' : ''}`}>
          <div className={`relative -left-full h-full w-[200%] bg-gradient-to-r from-gray-500 to-gray-600 text-white transition-transform duration-600 ease-in-out ${rightPanelActive ? 'translate-x-1/2' : 'translate-x-0'}`}>
            {/* Overlay Left */}
            <div className={`absolute flex flex-col items-center justify-center text-center top-0 h-full w-1/2 p-10 transition-transform duration-600 ease-in-out ${rightPanelActive ? 'translate-x-0' : '-translate-x-1/5'}`}>
              <h1 className="text-2xl mb-5">Chào mừng trở lại!</h1>
              <p className="text-sm mb-5 leading-5">Đăng nhập để tiếp tục mua sắm</p>
              <button
                type="button"
                onClick={() => setRightPanelActive(false)}
                className="rounded-full border border-white bg-transparent text-white text-xs font-medium py-3 px-11 my-3 uppercase tracking-wider transition-all duration-300 hover:bg-gray-700 hover:cursor-pointer hover:bg-opacity-20 focus:outline-none"
              >
                Đăng nhập
              </button>
            </div>

            {/* Overlay Right */}
            <div className={`absolute flex flex-col items-center justify-center text-center top-0 right-0 h-full w-1/2 p-10 transition-transform duration-600 ease-in-out ${rightPanelActive ? 'translate-x-1/5' : 'translate-x-0'}`}>
              <h1 className="text-2xl mb-5">Xin chào!</h1>
              <p className="text-sm mb-5 leading-5">Đăng ký tài khoản để bắt đầu mua sắm</p>
              <button
                type="button"
                onClick={() => setRightPanelActive(true)}
                className="rounded-full border border-white bg-transparent text-white text-xs font-medium py-3 px-11 my-3 uppercase tracking-wider transition-all duration-300 hover:bg-gray-700 hover:bg-opacity-20 focus:outline-none hover:cursor-pointer"
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;