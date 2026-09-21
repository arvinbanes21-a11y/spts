'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/config';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student',
        schoolAttended: '',
        graduatedProgram: '',
        specialization: '',
        tutorStatus: 'graduated',
        graduatedYear: '',
        currentGrade: ''
    });
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }
        setError('');

        try {
            const dataToSubmit = new FormData();
            Object.keys(formData).forEach(key => {
                if (key !== 'confirmPassword') {
                    if (formData.role === 'student' && ['schoolAttended', 'graduatedProgram', 'specialization', 'tutorStatus', 'graduatedYear', 'currentGrade'].includes(key)) {
                        return; // Skip filling out tutor fields for students
                    }
                    dataToSubmit.append(key, (formData as any)[key]);
                }
            });
            
            if (formData.role === 'tutor' && proofFile) {
                dataToSubmit.append('proofFile', proofFile);
            }

            const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                body: dataToSubmit,
            });

            if (!res.ok) {
                let errMessage = 'Registration failed';
                const contentType = res.headers.get("content-type");

                if (contentType && contentType.indexOf("application/json") !== -1) {
                    try {
                        const errData = await res.json();
                        errMessage = errData.message || errMessage;
                    } catch (e) { /* ignore */ }
                } else {
                    const textError = await res.text();
                    errMessage = textError || errMessage;
                }
                throw new Error(errMessage);
            }

            const data = await res.json();
            // Store token if returned, for now we just redirect
            if (data.role === 'tutor') {
                router.push('/dashboard');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                        Sign in
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">First Name</label>
                                <input name="firstName" required type="text" onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                                <input name="lastName" required type="text" onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email address</label>
                            <input name="email" required type="email" onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <select name="role" onChange={handleChange} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                <option value="student">Student</option>
                                <option value="tutor">Tutor</option>
                            </select>
                        </div>

                        {formData.role === 'tutor' && (
                            <div className="space-y-4 border border-blue-100 bg-blue-50 p-4 rounded-md">
                                <h3 className="text-sm font-semibold text-blue-800">Tutor Credentials</h3>
                                
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">School / University</label>
                                    <input name="schoolAttended" required type="text" onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" placeholder="Ex: University of Example" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">Course / Program</label>
                                        <input name="graduatedProgram" required type="text" onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" placeholder="Ex: BS Computer Science" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">Specialization</label>
                                        <input name="specialization" required type="text" onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" placeholder="Ex: Machine Learning" />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Current Status</label>
                                    <select name="tutorStatus" onChange={handleChange} value={formData.tutorStatus} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                                        <option value="graduated">Graduated</option>
                                        <option value="studying">Currently Studying</option>
                                    </select>
                                </div>
                                
                                {formData.tutorStatus === 'graduated' ? (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">Year Graduated</label>
                                        <input name="graduatedYear" required type="number" onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" placeholder="Ex: 2023" />
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700">Year Level</label>
                                        <input name="currentGrade" required type="text" onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" placeholder="Ex: 3rd Year" />
                                    </div>
                                )}
                                
                                <div>
                                    <label className="block text-xs font-medium text-gray-700">Upload Diploma / Certificate (PDF or Image)</label>
                                    <input 
                                        type="file" 
                                        required 
                                        accept=".pdf, image/*"
                                        onChange={(e) => setProofFile(e.target.files?.[0] || null)} 
                                        className="mt-1 block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200" 
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input name="password" required type="password" onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                            <input name="confirmPassword" required type="password" onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm" />
                        </div>

                        <div>
                            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                                Register
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
