import React from 'react';

const Modal = ({ isOpen, onClose, onSave, user, onChange }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 z-60"> {/* Thêm z-60 để đảm bảo nó ở trên */}
                <h2 className="text-xl font-semibold mb-4">Edit User</h2>
                {user && (
                    <div>
                        {Object.keys(user).map((key) => (
                            key !== 'id' && (
                                <div key={key} className="mb-4">
                                    <label htmlFor={key} className="block text-sm font-medium text-gray-700">
                                        {key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^./, (str) => str.toUpperCase())}
                                    </label>
                                    <input
                                        type="text"
                                        id={key}
                                        name={key}
                                        value={user[key]}
                                        onChange={(e) => onChange(e)}
                                        className="mt-1 p-2 border rounded w-full"
                                    />
                                </div>
                            )
                        ))}
                        <div className="flex justify-between">
                            <button
                                onClick={() => onSave(user)}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => {
                                    onClose(); // Đóng modal
                                }}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                                Clone
                            </button>

                        </div>
                    </div>
                )}
            </div>
            <button
                onClick={onClose}
                className="absolute top-0 left-0 right-0 bottom-0 bg-transparent z-40" // Thêm z-40 để đảm bảo nó ở dưới modal
            ></button>
        </div>
    );
};

export default Modal;
