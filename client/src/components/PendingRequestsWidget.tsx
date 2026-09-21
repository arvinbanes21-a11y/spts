import React from 'react';

interface PendingRequestsWidgetProps {
    sessions: any[];
    onReviewClick: (sessionId: number) => void;
}

const PendingRequestsWidget: React.FC<PendingRequestsWidgetProps> = ({ sessions, onReviewClick }) => {
    // Filter for sessions that require action
    const pendingRequests = sessions.filter(s =>
        s.status === 'pending' || s.status === 'reschedule_requested' || s.status === 'payment_verifying'
    ).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    return (
        <div className="bg-white shadow rounded-lg p-5 mb-6 border-l-4 border-yellow-400">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-yellow-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Action Required
                {pendingRequests.length > 0 && (
                    <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {pendingRequests.length}
                    </span>
                )}
            </h3>

            {pendingRequests.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No pending requests at this time.</p>
            ) : (
                <ul className="space-y-3">
                    {pendingRequests.map(session => (
                        <li key={session.id} className="bg-gray-50 rounded p-3 flex justify-between items-center border border-gray-100">
                            <div>
                                <p className="text-sm font-semibold text-gray-800">
                                    {session.tutee_name} {session.tutee_last_name}
                                </p>
                                <p className="text-xs font-medium text-gray-500 mt-0.5">
                                    {new Date(session.start_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                </p>
                                <p className="text-xs mt-1">
                                    <span className={`px-1.5 py-0.5 rounded ${
                                        session.status === 'reschedule_requested' ? 'bg-orange-100 text-orange-800' :
                                        session.status === 'payment_verifying' ? 'bg-purple-100 text-purple-800' :
                                        'bg-blue-100 text-blue-800'
                                    }`}>
                                        {session.status === 'reschedule_requested' ? 'Reschedule' :
                                         session.status === 'payment_verifying' ? '💜 Verify Payment' :
                                         'New Booking'}
                                    </span>
                                </p>
                            </div>
                            <button
                                onClick={() => onReviewClick(session.id)}
                                className="text-xs font-medium bg-white border border-gray-300 shadow-sm px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
                            >
                                Review
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default PendingRequestsWidget;
