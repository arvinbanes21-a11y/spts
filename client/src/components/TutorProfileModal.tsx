'use client';

import React, { useEffect, useState } from 'react';
import BookingModal from './BookingModal';

import { API_BASE_URL } from '@/config';

interface TutorProfileModalProps {
    tutor: any;
    isOpen: boolean;
    onClose: () => void;
}

const TutorProfileModal: React.FC<TutorProfileModalProps> = ({ tutor, isOpen, onClose }) => {
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    useEffect(() => {
        if (isOpen && tutor) {
            setLoading(true);
            fetch(`${API_BASE_URL}/api/sessions/feedback/${tutor.id}`)
                .then(res => res.json())
                .then(data => {
                    setFeedbacks(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to fetch feedback', err);
                    setLoading(false);
                });
        }
    }, [isOpen, tutor]);

    if (!isOpen || !tutor) return null;

    return (
        <>
            <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full z-40 flex items-center justify-center p-4">
                <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                    {/* Header Banner */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32 relative flex-shrink-0">
                        <button onClick={onClose} className="absolute top-4 right-4 text-white hover:text-gray-200">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    {/* Profile Header (including overlapping pic) */}
                    <div className="px-8 flex-shrink-0">
                        <div className="relative -mt-16 mb-4 flex justify-between items-end">
                            <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center text-blue-600 font-bold text-4xl">
                                {tutor.profilePicture ? (
                                    <img src={`${API_BASE_URL}/uploads/${tutor.profilePicture}`} alt={tutor.name} className="h-full w-full object-cover" />
                                ) : (
                                    tutor.avatar
                                )}
                            </div>
                            <button
                                onClick={() => setIsBookingOpen(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg shadow-md transition-transform active:scale-95"
                            >
                                Book Session
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content (About, Subjects, Feedback) */}
                    <div className="px-8 pb-8 flex-grow overflow-y-auto">
                        <div className="mb-6 pt-2">
                            <h2 className="text-3xl font-extrabold text-gray-900">{tutor.name}</h2>
                            <p className="text-lg text-gray-500 font-medium">₱{tutor.hourlyRate}/hr • <span className="text-yellow-500">★ {tutor.rating.toFixed(1)}</span></p>

                            {/* Academic Credentials */}
                            <div className="mt-4 flex flex-wrap gap-2">
                                {tutor.schoolAttended && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                        🎓 {tutor.schoolAttended}
                                    </span>
                                )}
                                {tutor.graduatedProgram && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-green-50 text-green-700 border border-green-100">
                                        📜 {tutor.graduatedProgram}
                                    </span>
                                )}
                                {tutor.currentGrade && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                        📚 {tutor.currentGrade}
                                    </span>
                                )}
                            </div>
                        </div>

                        {tutor.videoIntroduction && (
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Introduction Video</h3>
                                <div className="bg-black rounded-xl overflow-hidden shadow-lg border border-gray-200">
                                    <video 
                                        controls 
                                        className="w-full max-h-80 object-contain"
                                        src={`${API_BASE_URL}/uploads/${tutor.videoIntroduction}`}
                                        preload="metadata"
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">About Me</h3>
                            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">{tutor.bio || "This tutor hasn't added a bio yet."}</p>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Subjects Taught</h3>
                            <div className="flex flex-wrap gap-2">
                                {tutor.subjects?.map((subject: string, index: number) => (
                                    <span key={index} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-full font-semibold border border-blue-100">
                                        {subject}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Recent Feedback Section */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Student Feedback</h3>
                            {loading ? (
                                <p className="text-gray-500">Loading feedback...</p>
                            ) : feedbacks.length > 0 ? (
                                <div className="space-y-4">
                                    {feedbacks.map((fb) => (
                                        <div key={fb.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-semibold text-gray-900">{fb.first_name} {fb.last_name}</span>
                                                <div className="flex text-yellow-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <svg key={i} className={`w-4 h-4 ${i < fb.rating ? 'fill-current' : 'text-gray-300'}`} viewBox="0 0 20 20">
                                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                        </svg>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-xs text-blue-600 font-medium mb-2">{fb.subject}</p>
                                            {fb.comment && <p className="text-gray-700 text-sm italic">"{fb.comment}"</p>}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-gray-500">No feedback ratings yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <BookingModal
                tutor={tutor}
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
            />
        </>
    );
};

export default TutorProfileModal;
