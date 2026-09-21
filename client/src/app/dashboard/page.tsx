'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import FeedbackModal from '@/components/FeedbackModal';
import DaySessionsModal from '../../components/DaySessionsModal';
import SessionMessagesModal from '../../components/SessionMessagesModal';
import RescheduleModal from '@/components/RescheduleModal';
import ComplaintModal from '@/components/ComplaintModal';
import PendingRequestsWidget from '../../components/PendingRequestsWidget';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { API_BASE_URL } from '@/config';
import { getDemoSessions } from '../../data/mockSessions';
import { mockTutors } from '../../data/mockTutors';

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'cancelled' | 'profile' | 'favorite_tutors'>('upcoming');
    const [profileData, setProfileData] = useState({
        bio: '',
        hourlyRate: 0,
        subjects: [] as string[],
        graduatedProgram: '',
        currentGrade: '',
        schoolAttended: '',
        gcashNumber: '',
        profilePicture: null as File | null,
        videoIntroduction: null as File | null
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState('');
    const [date, setDate] = useState(new Date());
    const [acceptingSessionId, setAcceptingSessionId] = useState<number | null>(null);
    const [meetLinkInput, setMeetLinkInput] = useState('');
    const [feedbacks, setFeedbacks] = useState<any[]>([]);
    const [isDayModalOpen, setIsDayModalOpen] = useState(false);
    const [dayModalSessions, setDayModalSessions] = useState<any[]>([]);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [activeMessageSession, setActiveMessageSession] = useState<any>(null);
    const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
    const [activeRescheduleSession, setActiveRescheduleSession] = useState<any>(null);
    const [previousTutorSearch, setPreviousTutorSearch] = useState('');
    const [favoriteTutors, setFavoriteTutors] = useState<any[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
    const [isComplaintOpen, setIsComplaintOpen] = useState(false);
    const [payingSessionId, setPayingSessionId] = useState<number | null>(null);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [paymentUploading, setPaymentUploading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check auth
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            router.push('/login');
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        // Fetch sessions
        fetch(`${API_BASE_URL}/api/sessions?userId=${parsedUser.id}&role=${parsedUser.role}`)
            .then(res => {
                if (!res.ok) throw new Error('API unavailable');
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setSessions(data);
                } else {
                    setSessions(getDemoSessions(parsedUser.role));
                }
                setLoading(false);
            })
            .catch(err => {
                console.warn('Backend offline, loading demo sessions:', err);
                setSessions(getDemoSessions(parsedUser.role));
                setLoading(false);
            });

        // Fetch favorites
        if (parsedUser.role === 'student') {
            fetch(`${API_BASE_URL}/api/tutors/favorites/${parsedUser.id}`)
                .then(res => {
                    if (!res.ok) throw new Error('API unavailable');
                    return res.json();
                })
                .then(data => {
                    setFavoriteTutors(data);
                    setFavoriteIds(new Set(data.map((t: any) => t.id)));
                })
                .catch(() => {
                    setFavoriteTutors(mockTutors.slice(0, 2));
                    setFavoriteIds(new Set([1, 2]));
                });
        }
    }, [router]);

    useEffect(() => {
        if (activeTab === 'profile' && user) {
            setProfileLoading(true);
            fetch(`${API_BASE_URL}/api/tutors/${user.id}`)
                .then(res => {
                    if (!res.ok) throw new Error('API unavailable');
                    return res.json();
                })
                .then(data => {
                    setProfileData({
                        bio: data.bio || '',
                        hourlyRate: data.hourlyRate || 0,
                        subjects: data.subjects || [],
                        graduatedProgram: data.graduatedProgram || '',
                        currentGrade: data.currentGrade || '',
                        schoolAttended: data.schoolAttended || '',
                        gcashNumber: data.gcashNumber || '',
                        profilePicture: null,
                        videoIntroduction: null
                    });
                    setProfileLoading(false);
                })
                .catch(() => {
                    // Demo profile fallback
                    setProfileData({
                        bio: 'Dedicated peer tutor passionate about helping students excel in Calculus, Physics, and Data Structures.',
                        hourlyRate: 35,
                        subjects: ['Mathematics', 'Calculus', 'Computer Science'],
                        graduatedProgram: 'BS Computer Science',
                        currentGrade: 'Senior / 4th Year',
                        schoolAttended: 'College of Computer Studies',
                        gcashNumber: '0917-123-4567',
                        profilePicture: null,
                        videoIntroduction: null
                    });
                    setProfileLoading(false);
                });
        }
    }, [activeTab, user]);

    useEffect(() => {
        if (user && user.role === 'tutor') {
            fetch(`${API_BASE_URL}/api/sessions/feedback/${user.id}`)
                .then(res => res.json())
                .then(data => setFeedbacks(data))
                .catch(err => console.error('Failed to fetch feedback', err));
        }
    }, [user]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileMessage('');
        try {
            const formData = new FormData();
            formData.append('bio', profileData.bio);
            formData.append('hourlyRate', profileData.hourlyRate.toString());
            formData.append('subjects', JSON.stringify(profileData.subjects));
            formData.append('graduatedProgram', profileData.graduatedProgram);
            formData.append('currentGrade', profileData.currentGrade);
            formData.append('schoolAttended', profileData.schoolAttended);
            formData.append('gcashNumber', profileData.gcashNumber);
            if (profileData.profilePicture) {
                formData.append('profilePicture', profileData.profilePicture);
            }

            const res = await fetch(`${API_BASE_URL}/api/tutors/${user.id}`, {
                method: 'PUT',
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                if (profileData.videoIntroduction) {
                    const videoForm = new FormData();
                    videoForm.append('video', profileData.videoIntroduction);
                    const videoRes = await fetch(`${API_BASE_URL}/api/tutors/${user.id}/video`, {
                        method: 'POST',
                        body: videoForm
                    });
                    if (!videoRes.ok) {
                        setProfileMessage('Profile updated, but video upload failed.');
                        return;
                    }
                }
                setProfileMessage('Profile updated successfully!');
            } else {
                setProfileMessage(data.message || 'Update failed');
            }
        } catch (err) {
            setProfileMessage('Failed to update profile');
        }
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = function() {
            window.URL.revokeObjectURL(video.src);
            if (video.duration > 60) {
                setProfileMessage('Video introduction must be 1 minute or less.');
                e.target.value = '';
                setProfileData(prev => ({ ...prev, videoIntroduction: null }));
            } else {
                setProfileMessage('');
                setProfileData(prev => ({ ...prev, videoIntroduction: file }));
            }
        };
        video.src = URL.createObjectURL(file);
    };

    const toggleFavorite = async (tutorId: number, sessionObj: any) => {
        const isFav = favoriteIds.has(tutorId);
        try {
            if (isFav) {
                await fetch(`${API_BASE_URL}/api/tutors/favorites?tuteeId=${user.id}&tutorId=${tutorId}`, { method: 'DELETE' });
                setFavoriteIds(prev => { const n = new Set(prev); n.delete(tutorId); return n; });
                setFavoriteTutors(prev => prev.filter(t => t.id !== tutorId));
            } else {
                await fetch(`${API_BASE_URL}/api/tutors/favorites`, { 
                    method: 'POST', 
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({tuteeId: user.id, tutorId}) 
                });
                setFavoriteIds(prev => { const n = new Set(prev); n.add(tutorId); return n; });
                const res = await fetch(`${API_BASE_URL}/api/tutors/favorites/${user.id}`);
                const data = await res.json();
                setFavoriteTutors(data);
            }
        } catch(e) { console.error('Favorite error', e); }
    };

    const handleComplaintClick = (session: any) => {
        setSelectedSession(session);
        setIsComplaintOpen(true);
    };

    const handleComplaintSubmit = async (comment: string) => {
        if (!selectedSession || !user) return;
        
        try {
            const reportedUserId = user.role === 'student' ? selectedSession.tutor_id : selectedSession.tutee_id;
            
            const res = await fetch(`${API_BASE_URL}/api/sessions/${selectedSession.id}/complaint`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reporterId: user.id,
                    reportedUserId: reportedUserId,
                    comment: comment
                }),
            });
            
            if (res.ok) {
                alert('Your report has been submitted to the admin.');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsComplaintOpen(false);
            setSelectedSession(null);
        }
    };

    const handleRescheduleSubmit = async (sessionId: number, newStartTime: string, newEndTime: string, message: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'reschedule_requested',
                    startTime: newStartTime,
                    endTime: newEndTime
                })
            });

            if (res.ok) {
                // If there's a reason/message provided, post it to the session messages
                if (message.trim() && user?.id) {
                    await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/messages`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ senderId: user.id, message: message.trim() })
                    }).catch(e => console.error('Failed to attach reschedule message', e));
                }

                const updatedSession = await res.json();
                setSessions(prev => prev.map((s: any) => s.id === sessionId ? updatedSession : s));
                setDayModalSessions(prev => prev.map((s: any) => s.id === sessionId ? updatedSession : s));
                setIsRescheduleModalOpen(false);
            }
        } catch (error) {
            console.error('Error requesting reschedule:', error);
        }
    };

    const handleReviewRequest = (sessionId: number) => {
        // Ensure we are on the upcoming tab where these sessions live
        setActiveTab('upcoming');
        setTimeout(() => {
            const element = document.getElementById(`session-${sessionId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Optional: add a temporary highlight class
                element.classList.add('bg-yellow-50', 'transition-colors', 'duration-1000');
                setTimeout(() => element.classList.remove('bg-yellow-50', 'transition-colors', 'duration-1000'), 2000);
            }
        }, 100);
    };

    const handleFeedbackClick = (session: any) => {
        setSelectedSession(session);
        setIsFeedbackOpen(true);
    };

    const handleStatusUpdate = async (sessionId: number, status: string, meetLink?: string) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, meetLink })
            });
            if (res.ok) {
                setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, status, meeting_link: meetLink || s.meeting_link } : s));
                setAcceptingSessionId(null);
                setMeetLinkInput('');
            }
        } catch (err) {
            console.error('Failed to update session status', err);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-green-100 text-green-800',
            declined: 'bg-red-100 text-red-800',
            cancelled: 'bg-gray-100 text-gray-800',
            awaiting_payment: 'bg-orange-100 text-orange-800',
            payment_verifying: 'bg-purple-100 text-purple-800',
        };
        return styles[status] || 'bg-gray-100 text-gray-800';
    };

    const handleReceiptUpload = async (sessionId: number) => {
        if (!receiptFile) return;
        setPaymentUploading(true);
        try {
            const formData = new FormData();
            formData.append('receipt', receiptFile);
            const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/payment`, {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                const updated = await res.json();
                setSessions(prev => prev.map(s => s.id === sessionId ? updated : s));
                setPayingSessionId(null);
                setReceiptFile(null);
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to upload receipt');
            }
        } catch (err) {
            console.error('Receipt upload error', err);
        } finally {
            setPaymentUploading(false);
        }
    };

    const handleVerifyPayment = async (sessionId: number) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/verify-payment`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                const updated = await res.json();
                setSessions(prev => prev.map(s => s.id === sessionId ? updated : s));
            }
        } catch (err) {
            console.error('Verify payment error', err);
        }
    };

    // Highlight dates with sessions
    const tileContent = ({ date, view }: any) => {
        if (view === 'month') {
            const hasSession = sessions.some(s => new Date(s.start_time).toDateString() === date.toDateString());
            return hasSession ? <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto mt-1"></div> : null;
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    const upcomingSessions = sessions.filter(s => new Date(s.start_time) > new Date() && s.status !== 'cancelled');
    const historySessions = sessions.filter(s => new Date(s.start_time) <= new Date() && s.status !== 'cancelled');
    const cancelledSessions = sessions.filter(s => s.status === 'cancelled');

    // For students: aggregate unique previous tutors from past sessions
    const previousTutorSessions =
        user?.role === 'student'
            ? Object.values(
                historySessions.reduce((acc: Record<number, any>, session: any) => {
                    if (!session.tutor_id) return acc;
                    const existing = acc[session.tutor_id];
                    if (!existing || new Date(session.start_time) > new Date(existing.start_time)) {
                        acc[session.tutor_id] = session;
                    }
                    return acc;
                }, {} as Record<number, any>),
            )
            : [];

    // Filter previous tutors by name or subject based on search input
    const filteredPreviousTutorSessions =
        user?.role === 'student'
            ? (previousTutorSessions as any[]).filter((session: any) => {
                if (!previousTutorSearch.trim()) return true;
                const q = previousTutorSearch.toLowerCase();
                const name = `${session.tutor_name || ''} ${session.tutor_last_name || ''}`.toLowerCase();
                const subject = (session.subject || '').toLowerCase();
                return name.includes(q) || subject.includes(q);
            })
            : [];

    const nextSession = upcomingSessions
        .filter(s => s.status === 'confirmed')
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())[0];

    const timeUntilNext = nextSession ? new Date(nextSession.start_time).getTime() - new Date().getTime() : 0;
    const isStartingSoon = timeUntilNext > 0 && timeUntilNext <= 60 * 60 * 1000;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Sidebar (Desktop) */}
            <div className="w-full md:w-64 bg-white shadow-md z-10 flex-shrink-0 border-r border-gray-200 p-4 sticky top-0 md:h-screen md:overflow-y-auto hidden md:flex md:flex-col">
                <div className="flex items-center text-blue-600 font-bold text-2xl mb-8 px-2 cursor-default">
                    SmartTutor
                </div>
                
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Main Menu</div>
                <nav className="space-y-1 flex-1">
                    <button onClick={() => setActiveTab('upcoming')} className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'upcoming' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                        <svg className="w-5 h-5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        Upcoming Sessions
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                        <svg className="w-5 h-5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Session History
                    </button>
                    <button onClick={() => setActiveTab('cancelled')} className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'cancelled' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                        <svg className="w-5 h-5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Cancelled
                    </button>
                    {user && user.role === 'student' && (
                        <>
                            <button onClick={() => setActiveTab('favorite_tutors')} className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'favorite_tutors' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                                <svg className="w-5 h-5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                Favorite Tutors
                            </button>
                            <div className="pt-4 mt-4 border-t border-gray-100">
                                <Link href="/" className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                                    <svg className="w-5 h-5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                    Back to Website
                                </Link>
                            </div>
                        </>
                    )}
                </nav>

                {user?.role === 'tutor' && (
                    <div className="mt-8">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">Settings</div>
                        <nav className="space-y-1">
                            <button onClick={() => setActiveTab('profile')} className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                                <svg className="w-5 h-5 opacity-75" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Profile Settings
                            </button>
                        </nav>
                    </div>
                )}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen overflow-y-auto relative">
                
                {/* Upcoming Session Notification Banner */}
                {isStartingSoon && nextSession && (
                    <div className="bg-orange-500 text-white px-4 py-2.5 text-center text-sm font-medium shadow-md relative z-30 flex items-center justify-center gap-2 animate-pulse">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Reminder: You have a confirmed session for {nextSession.subject} starting in {Math.ceil(timeUntilNext / 60000)} minutes!
                    </div>
                )}

                {/* Top Header (Logout & Mobile menu) */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            {/* Mobile Info */}
                            <div className="flex md:hidden items-center gap-3">
                                <span className="text-blue-600 font-bold text-xl cursor-default">SmartTutor</span>
                                <span className="text-gray-700 font-medium text-sm border-l border-gray-300 pl-3">Dashboard</span>
                            </div>
                            
                            <div className="hidden md:flex flex-1 items-center justify-between">
                                <h1 className="text-xl font-semibold text-gray-900 ml-4">
                                    {activeTab === 'upcoming' ? 'Upcoming Sessions' :
                                     activeTab === 'history' ? 'Session History' :
                                     activeTab === 'cancelled' ? 'Cancelled Sessions' :
                                     activeTab === 'favorite_tutors' ? 'Favorite Tutors' :
                                     activeTab === 'profile' ? 'Tutor Profile' : 'Dashboard'}
                                </h1>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <span className="text-gray-700 font-medium text-sm hidden sm:block">Welcome, {user.first_name}</span>
                                <button
                                    onClick={() => {
                                        localStorage.removeItem('user');
                                        localStorage.removeItem('token');
                                        router.push('/');
                                    }}
                                    className="text-white bg-red-600 hover:bg-red-700 transition-colors px-4 py-1.5 rounded-md text-sm font-medium shadow-sm"
                                >
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Mobile Tabs Wrapper (Only visible on small screens) */}
                    <div className="md:hidden border-t border-gray-200 bg-gray-50 overflow-x-auto">
                        <nav className="flex whitespace-nowrap p-2 gap-2" aria-label="Mobile Tabs">
                            <button onClick={() => setActiveTab('upcoming')} className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'upcoming' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200'}`}>Upcoming</button>
                            <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200'}`}>History</button>
                            <button onClick={() => setActiveTab('cancelled')} className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'cancelled' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200'}`}>Cancelled</button>
                            {user && user.role === 'student' && (
                                <button onClick={() => setActiveTab('favorite_tutors')} className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'favorite_tutors' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200'}`}>Favorites</button>
                            )}
                            {user && user.role === 'tutor' && (
                                <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200'}`}>Profile</button>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="flex-1 w-full max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {user?.role === 'tutor' && user?.isValidated === false && (
                    <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md shadow-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700 font-medium">
                                    Your profile is pending admin validation.
                                </p>
                                <p className="text-xs text-yellow-600 mt-1">
                                    You will not appear in student search results until an administrator reviews and approves your credentials.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Student Stats Cards */}
                {user.role === 'student' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white shadow rounded-lg p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Upcoming Sessions</p>
                                    <p className="text-2xl font-bold text-gray-900">{upcomingSessions.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white shadow rounded-lg p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Completed Sessions</p>
                                    <p className="text-2xl font-bold text-gray-900">{historySessions.length}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white shadow rounded-lg p-5">
                            <Link href="/find-tutor" className="flex items-center group">
                                <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3 group-hover:bg-indigo-200 transition-colors">
                                    <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-500">Need Help?</p>
                                    <p className="text-lg font-bold text-indigo-600 group-hover:text-indigo-700">Find a Tutor →</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                )}
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            {/* Content */}
                            <div className="min-h-[400px]">
                                {activeTab === 'upcoming' && (
                                    <ul className="divide-y divide-gray-200">
                                        {upcomingSessions.length > 0 ? upcomingSessions.map((session) => (
                                            <li key={session.id} id={`session-${session.id}`} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-blue-600 truncate">
                                                        {session.subject}
                                                    </p>
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(session.status)}`}>
                                                        {session.status}
                                                    </span>
                                                </div>
                                                <div className="mt-2 text-sm text-gray-500">
                                                    <p>with {user.role === 'student' ? `${session.tutor_name} ${session.tutor_last_name}` : `${session.tutee_name} ${session.tutee_last_name}`}</p>
                                                    <p>{new Date(session.start_time).toLocaleString()}</p>
                                                </div>
                                                {session.notes && (
                                                    <div className="mt-2 bg-gray-50 border-l-4 border-blue-300 p-2 rounded-r">
                                                        <p className="text-xs text-gray-500 font-medium">Student Message:</p>
                                                        <p className="text-sm text-gray-700">{session.notes}</p>
                                                    </div>
                                                )}
                                                {session.attachment && (
                                                    <div className="mt-2">
                                                        <a
                                                            href={`${API_BASE_URL}/uploads/${session.attachment}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors"
                                                        >
                                                            📄 View Attached File
                                                        </a>
                                                    </div>
                                                )}
                                                {/* Action buttons */}
                                                <div className="mt-3 flex flex-col gap-2">
                                                    {user.role === 'tutor' && session.status === 'reschedule_requested' && (
                                                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-2">
                                                            <p className="text-xs font-medium text-yellow-800 mb-2">
                                                                Tutee requested to change time to:<br />
                                                                <span className="font-bold">{new Date(session.start_time).toLocaleString()}</span>
                                                            </p>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleStatusUpdate(session.id, 'confirmed', session.meeting_link || undefined)}
                                                                    className="px-3 py-1 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700"
                                                                >
                                                                    ✓ Accept New Time
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(session.id, 'declined')}
                                                                    className="px-3 py-1 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700"
                                                                >
                                                                    ✕ Decline
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {user.role === 'tutor' && session.status === 'pending' && (
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleStatusUpdate(session.id, 'awaiting_payment')}
                                                                className="px-3 py-1 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
                                                            >
                                                                ✓ Accept (Request Payment)
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(session.id, 'declined')}
                                                                className="px-3 py-1 text-xs font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors"
                                                            >
                                                                ✕ Decline
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Payment steps */}
                                                    {user.role === 'student' && session.status === 'awaiting_payment' && (
                                                        <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
                                                            <p className="text-xs font-medium text-orange-800 mb-2">
                                                                Tutor accepted! Please send GCash payment of <span className="font-bold">₱{session.tutor_hourly_rate ? (session.tutor_hourly_rate * ((new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / (1000 * 60 * 60))).toFixed(2) : '0.00'}</span> to <span className="font-bold">{session.tutor_gcash_number || 'their number'}</span> to confirm.
                                                            </p>
                                                            {payingSessionId !== session.id ? (
                                                                <button
                                                                    onClick={() => setPayingSessionId(session.id)}
                                                                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-orange-600 text-white hover:bg-orange-700"
                                                                >
                                                                    Upload Receipt
                                                                </button>
                                                            ) : (
                                                                <div className="space-y-2 mt-2">
                                                                    <input
                                                                        type="file"
                                                                        accept=".png,.jpg,.jpeg,.webp"
                                                                        onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                                                                        className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-orange-100 file:text-orange-700"
                                                                    />
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={() => handleReceiptUpload(session.id)}
                                                                            disabled={!receiptFile || paymentUploading}
                                                                            className="px-3 py-1 text-xs font-medium rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                                                        >
                                                                            {paymentUploading ? 'Uploading...' : 'Submit'}
                                                                        </button>
                                                                        <button
                                                                            onClick={() => { setPayingSessionId(null); setReceiptFile(null); }}
                                                                            className="px-3 py-1 text-xs font-medium rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {user.role === 'tutor' && session.status === 'payment_verifying' && (
                                                        <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                                                            <p className="text-xs font-medium text-purple-800 mb-2">
                                                                Student uploaded payment receipt.
                                                            </p>
                                                            <div className="flex gap-2 items-center">
                                                                {session.payment_proof && (
                                                                    <a
                                                                        href={`${API_BASE_URL}/uploads/${session.payment_proof}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="px-3 py-1.5 text-xs font-medium rounded-md bg-purple-200 text-purple-800 hover:bg-purple-300"
                                                                    >
                                                                        View Receipt
                                                                    </a>
                                                                )}
                                                                <button
                                                                    onClick={() => handleVerifyPayment(session.id)}
                                                                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700"
                                                                >
                                                                    Verify & Create Meeting
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                    {/* Show meet link for confirmed sessions */}
                                                    {session.status === 'confirmed' && session.meeting_link && (
                                                        <a
                                                            href={session.meeting_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md hover:bg-blue-100 transition-colors w-fit"
                                                        >
                                                            📹 Join Jitsi Room
                                                        </a>
                                                    )}

                                                    <div className="flex gap-2 mt-2 flex-wrap">
                                                        {session.status !== 'cancelled' && session.status !== 'declined' && (
                                                            <button
                                                                onClick={() => { setActiveMessageSession(session); setIsMessageModalOpen(true); }}
                                                                className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-1"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                                                Message
                                                            </button>
                                                        )}
                                                        {user.role === 'student' && (session.status === 'pending' || session.status === 'confirmed') && (
                                                            <button
                                                                onClick={() => { setActiveRescheduleSession(session); setIsRescheduleModalOpen(true); }}
                                                                className="px-3 py-1.5 text-xs font-medium rounded-md bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-colors"
                                                            >
                                                                Request Reschedule
                                                            </button>
                                                        )}
                                                        {session.status !== 'cancelled' && session.status !== 'declined' && acceptingSessionId !== session.id && (
                                                            <button
                                                                onClick={() => handleStatusUpdate(session.id, 'cancelled')}
                                                                className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </li>
                                        )) : (
                                            <li className="px-4 py-8 text-gray-500 text-center">No upcoming sessions.</li>
                                        )}
                                    </ul>
                                )}

                                {activeTab === 'cancelled' && (
                                    <ul className="divide-y divide-gray-200 opacity-75">
                                        {cancelledSessions.length > 0 ? cancelledSessions.map((session) => (
                                            <li key={session.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600 truncate">
                                                            {session.subject}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(session.start_time).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800`}>
                                                        Cancelled
                                                    </span>
                                                </div>
                                            </li>
                                        )) : (
                                            <li className="px-4 py-8 text-gray-500 text-center">No cancelled sessions.</li>
                                        )}
                                    </ul>
                                )}

                                {activeTab === 'history' && (
                                    <ul className="divide-y divide-gray-200 opacity-75">
                                        {historySessions.length > 0 ? historySessions.map((session) => (
                                            <li key={session.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600 truncate">
                                                            {session.subject}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(session.start_time).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {user.role === 'student' && (
                                                            <button
                                                                onClick={() => toggleFavorite(session.tutor_id, session)}
                                                                className={`p-1.5 rounded-full ${favoriteIds.has(session.tutor_id) ? 'text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-red-400 hover:bg-gray-100'} transition-colors`}
                                                                title="Favorite Tutor"
                                                            >
                                                                <svg className="w-5 h-5" fill={favoriteIds.has(session.tutor_id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleFeedbackClick(session)}
                                                            className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded hover:bg-indigo-100 font-medium"
                                                        >
                                                            Rate Session
                                                        </button>
                                                        <button
                                                            onClick={() => handleComplaintClick(session)}
                                                            className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded hover:bg-red-100 font-medium ml-2"
                                                        >
                                                            Report
                                                        </button>
                                                    </div>
                                                </div>
                                            </li>
                                        )) : (
                                            <li className="px-4 py-8 text-gray-500 text-center">No past sessions to show.</li>
                                        )}
                                    </ul>
                                )}

                                {activeTab === 'profile' && (
                                    <div className="p-6">
                                        {profileLoading ? <div className="text-center">Loading profile...</div> : (
                                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                                {profileMessage && (
                                                    <div className={`p-4 rounded-md ${profileMessage.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                        {profileMessage}
                                                    </div>
                                                )}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                                                    <textarea
                                                        value={profileData.bio}
                                                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                                        rows={4}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                        placeholder="Tell students about yourself..."
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Subjects (comma separated)</label>
                                                    <input
                                                        type="text"
                                                        value={profileData.subjects.join(', ')}
                                                        onChange={(e) => setProfileData({ ...profileData, subjects: e.target.value.split(',').map(s => s.trim()) })}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                        placeholder="Math, Physics, English"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">Hourly Rate (₱)</label>
                                                    <input
                                                        type="number"
                                                        value={profileData.hourlyRate}
                                                        onChange={(e) => setProfileData({ ...profileData, hourlyRate: parseFloat(e.target.value) })}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700">GCash Number</label>
                                                    <input
                                                        type="text"
                                                        value={profileData.gcashNumber}
                                                        onChange={(e) => setProfileData({ ...profileData, gcashNumber: e.target.value })}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                        placeholder="e.g. 09171234567"
                                                    />
                                                </div>

                                                <div className="border-t border-gray-200 pt-6">
                                                    <h4 className="text-md font-medium text-gray-900 mb-4">Academic Credentials</h4>

                                                    <div className="space-y-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => setProfileData({ ...profileData, profilePicture: e.target.files?.[0] || null })}
                                                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Video Introduction (Max 1 min)</label>
                                                            <input
                                                                type="file"
                                                                accept="video/mp4,video/webm"
                                                                onChange={handleVideoChange}
                                                                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                                                            />
                                                            <p className="mt-1 text-xs text-gray-500">Upload a short intro to build trust with students. Must be MP4 or WebM.</p>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">School Attended</label>
                                                            <input
                                                                type="text"
                                                                value={profileData.schoolAttended}
                                                                onChange={(e) => setProfileData({ ...profileData, schoolAttended: e.target.value })}
                                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                                placeholder="e.g. University of Example"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Current Grade / Year</label>
                                                            <input
                                                                type="text"
                                                                value={profileData.currentGrade}
                                                                onChange={(e) => setProfileData({ ...profileData, currentGrade: e.target.value })}
                                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                                placeholder="e.g. Senior, Year 3, 12th Grade"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">Graduated Program / Major</label>
                                                            <input
                                                                type="text"
                                                                value={profileData.graduatedProgram}
                                                                onChange={(e) => setProfileData({ ...profileData, graduatedProgram: e.target.value })}
                                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                                placeholder="e.g. B.S. Computer Science"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    type="submit"
                                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                                                >
                                                    Save Profile
                                                </button>
                                            </form>
                                        )}
                                    </div>
                                )}
                                
                                {activeTab === 'favorite_tutors' && (
                                    <ul className="divide-y divide-gray-200">
                                        {favoriteTutors.length > 0 ? favoriteTutors.map((tutor) => (
                                            <li key={tutor.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 flex-shrink-0 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold overflow-hidden border border-blue-200">
                                                        {tutor.profilePicture ? (
                                                            <img src={`${API_BASE_URL}/uploads/${tutor.profilePicture}`} alt={tutor.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            tutor.avatar || tutor.name.charAt(0)
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">{tutor.name}</p>
                                                        <p className="text-xs text-blue-600 font-medium">{tutor.subjects.join(', ')}</p>
                                                        <div className="flex items-center text-xs mt-0.5">
                                                            <svg className="h-3.5 w-3.5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                            <span>{tutor.rating.toFixed(1)}</span>
                                                            <span className="mx-1 text-gray-300">•</span>
                                                            <span className="text-gray-500 font-medium">₱{tutor.hourlyRate}/hr</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <button onClick={() => toggleFavorite(tutor.id, null)} className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-1">
                                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                                                        Unfavorite
                                                    </button>
                                                    <button onClick={() => router.push(`/find-tutor?search=${encodeURIComponent(tutor.name)}`)} className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                                                        Book Again
                                                    </button>
                                                </div>
                                            </li>
                                        )) : (
                                            <li className="px-4 py-8 text-gray-500 text-center">You haven't added any favorite tutors yet.</li>
                                        )}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Calendar & Widgets */}
                    <div className="w-full lg:w-96">
                        {user.role === 'tutor' && (
                            <PendingRequestsWidget
                                sessions={upcomingSessions}
                                onReviewClick={handleReviewRequest}
                            />
                        )}

                        <div className="bg-white shadow rounded-lg p-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Session Calendar</h3>
                            <div className="calendar-container">
                                <Calendar
                                    onChange={(value: any) => {
                                        if (value) {
                                            setDate(value);
                                            // Find sessions for this specific date
                                            const daySessions = sessions.filter(s => {
                                                const sDate = new Date(s.start_time);
                                                return sDate.getDate() === value.getDate() &&
                                                    sDate.getMonth() === value.getMonth() &&
                                                    sDate.getFullYear() === value.getFullYear();
                                            });
                                            setDayModalSessions(daySessions);
                                            setIsDayModalOpen(true);
                                        }
                                    }}
                                    value={date}
                                    tileContent={tileContent}
                                    className="w-full border-none shadow-sm rounded-lg"
                                />
                            </div>
                            <div className="mt-4 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Session scheduled</span>
                                </div>
                            </div>
                        </div>

                        {/* Previous Tutors - Student only */}
                        {user.role === 'student' && previousTutorSessions.length > 0 && (
                            <div className="bg-white shadow rounded-lg p-4 mt-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-1">Previous Tutors</h3>
                                <p className="text-xs text-gray-500 mb-3">
                                    Search by tutor name or subject, then quickly rebook or rate.
                                </p>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        value={previousTutorSearch}
                                        onChange={(e) => setPreviousTutorSearch(e.target.value)}
                                        placeholder="Search previous tutors..."
                                        className="w-full px-3 py-1.5 text-xs border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {filteredPreviousTutorSessions.length > 0 ? filteredPreviousTutorSessions.map((session: any) => (
                                        <div
                                            key={session.tutor_id}
                                            className="flex items-start justify-between gap-3 border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">
                                                    {session.tutor_name} {session.tutor_last_name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Last session: {new Date(session.start_time).toLocaleString()}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    Subject: {session.subject}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button
                                                    onClick={() =>
                                                        router.push(
                                                            `/find-tutor?search=${encodeURIComponent(
                                                                `${session.tutor_name} ${session.tutor_last_name}`,
                                                            )}`,
                                                        )
                                                    }
                                                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                                >
                                                    Book Another Session
                                                </button>
                                                <button
                                                    onClick={() => handleFeedbackClick(session)}
                                                    className="px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                                                >
                                                    Rate Previous Session
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-xs text-gray-400 text-center py-4">
                                            No previous tutors match your search.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                        {/* Feedback Showcase - Tutor only */}
                        {user.role === 'tutor' && (
                            <div className="bg-white shadow rounded-lg p-4 mt-4">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Student Feedback</h3>
                                {feedbacks.length > 0 ? (
                                    <div className="space-y-3 max-h-80 overflow-y-auto">
                                        {feedbacks.map((fb) => (
                                            <div key={fb.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-medium text-gray-800">{fb.first_name} {fb.last_name}</span>
                                                    <div className="flex items-center gap-0.5">
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <svg key={star} className={`h-4 w-4 ${star <= fb.rating ? 'text-yellow-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                            </svg>
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-500 mb-1">{fb.subject}</p>
                                                {fb.comment && <p className="text-sm text-gray-600 italic">"{fb.comment}"</p>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 text-center py-4">No feedback yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>

            <DaySessionsModal
                isOpen={isDayModalOpen}
                onClose={() => setIsDayModalOpen(false)}
                date={date}
                sessions={dayModalSessions}
                userRole={user?.role}
            />

            <SessionMessagesModal
                isOpen={isMessageModalOpen}
                onClose={() => setIsMessageModalOpen(false)}
                session={activeMessageSession}
                currentUser={user}
            />

            {activeRescheduleSession && (
                <RescheduleModal
                    isOpen={isRescheduleModalOpen}
                    onClose={() => { setIsRescheduleModalOpen(false); setActiveRescheduleSession(null); }}
                    onRescheduleSubmit={handleRescheduleSubmit}
                    session={activeRescheduleSession}
                />
            )}

            <FeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
                session={selectedSession}
                currentUser={user}
            />

            {selectedSession && (
                <ComplaintModal
                    isOpen={isComplaintOpen}
                    onClose={() => { setIsComplaintOpen(false); setSelectedSession(null); }}
                    onSubmit={handleComplaintSubmit}
                    sessionTitle={selectedSession.subject}
                />
            )}
        </div>
    );
}
