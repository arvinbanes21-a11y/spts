'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/config';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [tutors, setTutors] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tutorsLoading, setTutorsLoading] = useState(true);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const router = useRouter();

  const fetchTutors = () => {
    setTutorsLoading(true);
    fetch(`${API_BASE_URL}/api/admin/tutors`)
      .then((res) => res.json())
      .then((data) => {
        setTutors(data);
        setTutorsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch tutors', err);
        setTutorsLoading(false);
      });
  };

  const fetchComplaints = () => {
    setComplaintsLoading(true);
    fetch(`${API_BASE_URL}/api/admin/complaints`)
      .then((res) => res.json())
      .then((data) => {
        setComplaints(data);
        setComplaintsLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch complaints', err);
        setComplaintsLoading(false);
      });
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin') {
      router.push('/login');
      return;
    }
    setUser(parsedUser);
    setLoading(false);
    fetchTutors();
    fetchComplaints();
  }, [router]);

  const handleDeactivate = async (tutorId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/tutors/${tutorId}/deactivate`, {
        method: 'PATCH',
      });
      if (res.ok) fetchTutors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleActivate = async (tutorId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/tutors/${tutorId}/activate`, {
        method: 'PATCH',
      });
      if (res.ok) fetchTutors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleValidate = async (tutorId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/tutors/${tutorId}/validate`, {
        method: 'PATCH',
      });
      if (res.ok) fetchTutors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (complaintId: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/complaints/${complaintId}/resolve`, {
        method: 'PATCH',
      });
      if (res.ok) fetchComplaints();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center text-blue-600 font-bold text-xl cursor-default">
                SmartTutor
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-medium">Admin: {user?.first_name}</span>
              <button
                onClick={() => {
                  localStorage.removeItem('user');
                  localStorage.removeItem('token');
                  router.push('/');
                }}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Admin Dashboard</h1>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8 flex flex-col gap-8">
          {/* Manage Tutors */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden h-full flex flex-col">
              <h2 className="text-lg font-medium text-gray-900 px-4 py-3 border-b border-gray-200 shrink-0">
                Manage Tutors
              </h2>
              <div className="p-4 flex-1 overflow-auto">
            {tutorsLoading ? (
              <p className="text-gray-500 text-center py-4">Loading tutors...</p>
            ) : tutors.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tutors found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tutor</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Background</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Proof</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tutors.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                            <p className="text-sm font-medium text-gray-900">{t.name}</p>
                            <p className="text-xs text-gray-500">{t.email}</p>
                            <p className="text-xs text-yellow-600 mt-1">★ {t.rating?.toFixed(1) || '-'}</p>
                        </td>
                        <td className="px-4 py-2">
                            {t.schoolAttended ? (
                                <div className="text-xs text-gray-700 space-y-0.5">
                                    <p className="font-semibold">{t.schoolAttended}</p>
                                    <p>{t.graduatedProgram} - {t.specialization}</p>
                                    <p className="text-gray-500">{t.graduatedYear ? `Graduated: ${t.graduatedYear}` : `Level: ${t.currentGrade}`}</p>
                                </div>
                            ) : (
                                <span className="text-xs text-gray-400">Not provided</span>
                            )}
                        </td>
                        <td className="px-4 py-2">
                            {t.proofFile ? (
                                <a href={`${API_BASE_URL}/uploads/${t.proofFile}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 hover:text-blue-800 transition-colors">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                    View File
                                </a>
                            ) : (
                                <span className="text-xs text-gray-400">None</span>
                            )}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-col gap-1">
                              <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full w-fit ${t.isValidated ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {t.isValidated ? 'Validated' : 'Pending Review'}
                              </span>
                              <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full w-fit ${t.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                {t.active ? 'System Act.' : 'System Deact.'}
                              </span>
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-col gap-2 items-start">
                              {!t.isValidated && (
                                <button onClick={() => handleValidate(t.id)} className="text-xs font-medium text-blue-700 hover:text-blue-900 bg-blue-100 border border-blue-200 px-2.5 py-1 rounded shadow-sm hover:shadow transition-all">
                                  ✓ Approve
                                </button>
                              )}
                              {t.active ? (
                                <button onClick={() => handleDeactivate(t.id)} className="text-xs font-medium text-red-600 hover:text-red-800">
                                  Deactivate
                                </button>
                              ) : (
                                <button onClick={() => handleActivate(t.id)} className="text-xs font-medium text-green-600 hover:text-green-800">
                                  Activate
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
             </div>
            </div>
          </div>

          {/* Manage Complaints */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden h-full flex flex-col">
              <h2 className="text-lg font-medium text-gray-900 px-4 py-3 border-b border-gray-200 shrink-0">
                User Complaints
              </h2>
              <div className="p-4 flex-1 overflow-auto">
            {complaintsLoading ? (
              <p className="text-gray-500 text-center py-4">Loading complaints...</p>
            ) : complaints.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No complaints to review.</p>
            ) : (
              <div className="space-y-4">
                {complaints.map((c) => (
                  <div
                    key={c.id}
                    className={`border rounded-lg p-4 ${
                      c.resolved ? 'bg-gray-50 border-gray-200' : 'border-amber-200 bg-amber-50/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2 mb-2">
                          From: {c.reporterName} <span className="text-xs text-gray-500 uppercase">({c.reporterRole})</span><br/>
                          Reported: {c.reportedName}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Session: {c.sessionSubject}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">
                            {new Date(c.createdAt).toLocaleString()}
                        </p>
                        {c.comment && (
                          <p className="text-sm text-gray-700 mt-2 italic border-l-4 border-gray-300 pl-2">&quot;{c.comment}&quot;</p>
                        )}
                        {c.resolved && (
                          <span className="inline-flex mt-2 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 text-gray-700">
                            Resolved
                          </span>
                        )}
                      </div>
                      {!c.resolved && (
                        <button
                          onClick={() => handleResolve(c.id)}
                          className="px-3 py-1.5 text-xs font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Mark Resolved
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
