'use client';

import React, { useState } from 'react';
import { API_BASE_URL } from '@/config';

interface BookingModalProps {
    tutor: any;
    isOpen: boolean;
    onClose: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ tutor, isOpen, onClose }) => {
    const [subject, setSubject] = useState(tutor?.subjects?.[0] || '');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [endTimeInput, setEndTimeInput] = useState('');
    const [notes, setNotes] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const today = new Date().toISOString().split('T')[0];

    if (!isOpen || !tutor) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Quick hack to get logged in user (in real app, use Context)
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            setError('You must be logged in to book a session');
            setLoading(false);
            return;
        }
        const user = JSON.parse(storedUser);

        try {
            // Construct timestamps
            const startDateTime = new Date(`${date}T${time}`);
            const endDateTime = new Date(`${date}T${endTimeInput}`);
            
            if (startDateTime < new Date()) {
                setError('Cannot book a session in the past. Please select a future date and time.');
                setLoading(false);
                return;
            }

            const durationHrs = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
            if (durationHrs < 1) {
                setError('Minimum booking duration is 1 hour.');
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('tutorId', tutor.id.toString());
            formData.append('tuteeId', user.id.toString());
            formData.append('subject', subject);
            formData.append('startTime', startDateTime.toISOString());
            formData.append('endTime', endDateTime.toISOString());
            if (notes.trim()) formData.append('notes', notes.trim());
            if (attachment) formData.append('attachment', attachment);

            const res = await fetch(`${API_BASE_URL}/api/sessions`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || 'Failed to book session');
            }

            alert('Session booked successfully!');
            onClose();
        } catch (err: any) {
            setError(err.message || 'Error booking session');
        } finally {
            setLoading(false);
        }
    };

    // Calculate dynamic duration for UI
    let durationUI = 0;
    if (time && endTimeInput) {
        const s = new Date(`1970-01-01T${time}`);
        const e = new Date(`1970-01-01T${endTimeInput}`);
        durationUI = Math.max(0, (e.getTime() - s.getTime()) / (1000 * 60 * 60));
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative p-5 border w-96 shadow-lg rounded-lg bg-white">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">Book Session with {tutor.name}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    {/* Payment summary */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-orange-800 mb-1">💳 Payment Info (GCash)</p>
                        <div className="flex justify-between text-xs text-orange-700">
                            <span>Rate: ₱{tutor.hourlyRate}/hr {durationUI > 0 ? `× ${durationUI.toFixed(1)} hrs` : ''}</span>
                            <span className="font-bold">Total: ₱{durationUI > 0 ? (tutor.hourlyRate * durationUI).toFixed(2) : '0.00'}</span>
                        </div>
                        {tutor.gcashNumber && (
                            <p className="text-xs text-orange-600 mt-1">Send to: <span className="font-bold">{tutor.gcashNumber}</span></p>
                        )}
                        <p className="text-xs text-orange-500 mt-1 italic">Payment is sent after the tutor accepts your request.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Subject</label>
                        <select
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                        >
                            {tutor.subjects.map((s: string) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            required
                            min={today}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Time</label>
                            <input
                                type="time"
                                required
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">End Time</label>
                            <input
                                type="time"
                                required
                                value={endTimeInput}
                                onChange={(e) => setEndTimeInput(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Message for Tutor (optional)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            placeholder="e.g. I need help with Chapter 5 problems..."
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Upload Module/PDF (optional)</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
                            <div className="space-y-1 text-center">
                                {attachment ? (
                                    <div className="flex items-center gap-2">
                                        <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm text-gray-700">{attachment.name}</span>
                                        <button type="button" onClick={() => setAttachment(null)} className="text-red-500 text-xs hover:text-red-700">Remove</button>
                                    </div>
                                ) : (
                                    <>
                                        <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                            <path d="M28 8H12a4 4 0 00-4 4v20m0 0v4a4 4 0 004 4h20a4 4 0 004-4V28m-20 8l8-8m0 0l8 8m-8-8v16" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <div className="flex text-sm text-gray-600">
                                            <label className="cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                                                <span>Choose file</span>
                                                <input
                                                    type="file"
                                                    className="sr-only"
                                                    accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg"
                                                    onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PDF, DOC, PPT, TXT, images up to 10MB</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500">Note: Minimum session duration is 1 hour.</p>

                    <div className="mt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                        >
                            {loading ? 'Booking...' : 'Confirm Booking'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingModal;
