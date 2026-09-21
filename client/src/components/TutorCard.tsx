import React, { useState } from 'react';
import TutorProfileModal from './TutorProfileModal';
import { Tutor } from '../data/mockTutors';

import { API_BASE_URL } from '@/config';

interface TutorCardProps {
    tutor: Tutor;
}

const TutorCard: React.FC<TutorCardProps> = ({ tutor }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col h-full">
                <div className="p-6 flex-grow">
                    <div className="flex items-center justify-between mb-4">
                        <div
                            className="flex items-center space-x-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors -ml-2"
                            onClick={() => setIsModalOpen(true)}
                        >
                            <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl overflow-hidden shadow-sm border-2 border-white">
                                {tutor.profilePicture ? (
                                    <img src={`${API_BASE_URL}/uploads/${tutor.profilePicture}`} alt={tutor.name} className="h-full w-full object-cover" />
                                ) : (
                                    tutor.avatar
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{tutor.name}</h3>
                                <p className="text-sm text-gray-500">₱{tutor.hourlyRate}/hr</p>
                            </div>
                        </div>
                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-yellow-700 font-medium text-sm">
                            <span className="mr-1">★</span>
                            {tutor.rating.toFixed(1)}
                        </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {tutor.bio}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {tutor.subjects?.map((subject: string, index: number) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium"
                            >
                                {subject}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <TutorProfileModal
                tutor={tutor}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default TutorCard;
