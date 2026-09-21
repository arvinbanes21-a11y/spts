import React from 'react';

interface DaySessionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date | null;
    sessions: any[];
    userRole: string;
}

const DaySessionsModal: React.FC<DaySessionsModalProps> = ({ isOpen, onClose, date, sessions, userRole }) => {
    if (!isOpen || !date) return null;

    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-80 bg-white rounded-xl shadow-2xl p-4 border border-gray-200">
            <button
                onClick={onClose}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <h3 className="text-lg font-bold text-gray-900 mb-1">{formattedDate}</h3>
            <p className="text-xs text-gray-500 mb-4">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</p>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {sessions.length > 0 ? (
                    sessions.map(session => (
                        <div key={session.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex justify-between items-start mb-1">
                                <div>
                                    <p className="text-xs font-semibold text-gray-900">
                                        {userRole === 'tutor'
                                            ? `Tutee: ${session.tutee_name} ${session.tutee_last_name}`
                                            : `Tutor: ${session.tutor_name} ${session.tutor_last_name}`
                                        }
                                    </p>
                                    <p className="text-sm text-blue-600 font-medium">{session.subject}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${session.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                    session.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                </span>
                            </div>
                            <div className="text-xs text-gray-600 flex items-center mt-2">
                                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {new Date(session.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {' '} - {' '}
                                {new Date(session.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {session.status === 'confirmed' && session.meeting_link && (
                                <div className="mt-2">
                                    <a
                                        href={session.meeting_link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors w-fit"
                                    >
                                        📹 Join Google Meet
                                    </a>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No sessions scheduled for this day.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DaySessionsModal;
