import React, { useState, useEffect } from 'react';

interface RescheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: any;
    onRescheduleSubmit: (sessionId: number, newStartTime: string, newEndTime: string, message: string) => void;
}

const RescheduleModal: React.FC<RescheduleModalProps> = ({ isOpen, onClose, session, onRescheduleSubmit }) => {
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (date && startTime && session) {
            const durationMs = new Date(session.end_time).getTime() - new Date(session.start_time).getTime();
            const newStart = new Date(`${date}T${startTime}`);
            const newEnd = new Date(newStart.getTime() + durationMs);
            const endHrs = String(newEnd.getHours()).padStart(2, '0');
            const endMins = String(newEnd.getMinutes()).padStart(2, '0');
            setEndTime(`${endHrs}:${endMins}`);
        }
    }, [date, startTime, session]);

    if (!isOpen || !session) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!date || !startTime || !endTime) return;

        // Combine date and time into a single Date object
        const newStart = new Date(`${date}T${startTime}`);
        const newEnd = new Date(`${date}T${endTime}`);
        
        const originalDuration = new Date(session.end_time).getTime() - new Date(session.start_time).getTime();
        const newDuration = newEnd.getTime() - newStart.getTime();
        
        if (newDuration > originalDuration) {
            setError(`Cannot exceed original paid duration of ${originalDuration / (1000 * 60 * 60)} hours.`);
            return;
        }

        if (newStart >= newEnd) {
            setError('End time must be after start time.');
            return;
        }

        onRescheduleSubmit(session.id, newStart.toISOString(), newEnd.toISOString(), message);
    };

    const isDateValid = date && new Date(date) >= new Date(new Date().setHours(0, 0, 0, 0));

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <h3 className="text-xl font-bold text-gray-900 mb-2">Request Reschedule</h3>
                <p className="text-sm text-gray-500 mb-6">
                    Propose a new date and time for your session. The tutor will need to approve this change.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded border border-red-200">{error}</div>}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                        <input
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]} // Can't pick past dates
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Start Time</label>
                            <input
                                type="time"
                                required
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">New End Time</label>
                            <input
                                type="time"
                                required
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">Limited to your paid duration.</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Rescheduling (Optional)</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            placeholder="Explain why you need to reschedule..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!date || !startTime || !endTime || !isDateValid}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm text-sm"
                        >
                            Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RescheduleModal;
