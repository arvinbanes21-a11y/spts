import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '@/config';

interface SessionMessagesModalProps {
    isOpen: boolean;
    onClose: () => void;
    session: any;
    currentUser: any;
}

const SessionMessagesModal: React.FC<SessionMessagesModalProps> = ({ isOpen, onClose, session, currentUser }) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && session) {
            setLoading(true);
            fetch(`${API_BASE_URL}/api/sessions/${session.id}/messages`)
                .then(res => res.json())
                .then(data => {
                    setMessages(Array.isArray(data) ? data : []);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Failed to fetch messages', err);
                    setLoading(false);
                });
        }
    }, [isOpen, session]);

    useEffect(() => {
        // Scroll to bottom when messages load or new one is sent
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !session || !currentUser) return;

        const payload = {
            senderId: currentUser.id,
            message: newMessage.trim()
        };

        fetch(`${API_BASE_URL}/api/sessions/${session.id}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => {
                setMessages(prev => [...prev, data]);
                setNewMessage('');
            })
            .catch(err => console.error("Failed to send message", err));
    };

    if (!isOpen || !session) return null;

    const otherPersonName = currentUser.role === 'tutor'
        ? `${session.tutee_name || session.tutee_fname} ${session.tutee_last_name || session.tutee_lname}`
        : `${session.tutor_name || session.tutor_fname} ${session.tutor_last_name || session.tutor_lname}`;

    return (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col h-[600px] max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Session Message Board</h3>
                        <p className="text-xs text-gray-500 font-medium">Chat with {otherPersonName}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-grow p-6 overflow-y-auto bg-white flex flex-col space-y-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                            <svg className="w-12 h-12 mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                            <p>No messages yet.</p>
                            <p className="text-xs mt-1">Send a message to start the conversation.</p>
                        </div>
                    ) : (
                        messages.map((msg, index) => {
                            const isMe = msg.sender_id === currentUser.id;
                            const timeString = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                            return (
                                <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${isMe
                                            ? 'bg-blue-600 text-white rounded-br-sm shadow-sm'
                                            : 'bg-gray-100 text-gray-900 rounded-bl-sm border border-gray-200'
                                        }`}>
                                        <div className="text-sm pb-1 whitespace-pre-wrap">{msg.message}</div>
                                        <div className={`text-[10px] text-right mt-1 ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                                            {isMe ? 'You' : msg.first_name} • {timeString}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <form onSubmit={handleSendMessage} className="flex space-x-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-grow px-4 py-2.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm shadow-sm"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim()}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full p-2.5 shadow-sm transition-colors flex items-center justify-center w-11 h-11"
                        >
                            <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SessionMessagesModal;
