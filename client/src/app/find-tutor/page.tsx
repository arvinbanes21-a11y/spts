'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { API_BASE_URL } from '@/config';
import Link from 'next/link';
import TutorCard from '../../components/TutorCard';

function FindTutorContent() {
    const searchParams = useSearchParams();
    const [tutors, setTutors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubject, setSelectedSubject] = useState<string>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [minPrice, setMinPrice] = useState<string>('');
    const [maxPrice, setMaxPrice] = useState<string>('');
    const [minRating, setMinRating] = useState<string>(''); // empty = any
    const [sortBy, setSortBy] = useState<string>('relevance');
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/tutors`)
            .then(res => res.json())
            .then(data => {
                setTutors(data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch tutors', err);
                setLoading(false);
            });
            
        // Check auth state for dynamic back button
        const user = localStorage.getItem('user');
        if (user) setIsLoggedIn(true);
    }, []);

    // Initialize search from query string (e.g., ?search=Tutor%20Name)
    useEffect(() => {
        const initialSearch = searchParams.get('search') || '';
        if (initialSearch) {
            setSearchQuery(initialSearch);
        }
    }, [searchParams]);

    // Extract unique subjects
    const allSubjects = useMemo(() => {
        const subjects = new Set<string>();
        tutors.forEach(tutor => tutor.subjects && tutor.subjects.forEach((s: string) => subjects.add(s)));
        return ['All', ...Array.from(subjects).sort()];
    }, [tutors]);

    // Filter tutors
    const filteredTutors = useMemo(() => {
        const normalizedSearch = searchQuery.trim().toLowerCase();

        const minPriceValue = minPrice ? parseFloat(minPrice) : null;
        const maxPriceValue = maxPrice ? parseFloat(maxPrice) : null;
        const minRatingValue = minRating ? parseFloat(minRating) : null;

        let results = tutors.filter(tutor => {
            const matchesSubject =
                selectedSubject === 'All' ||
                (tutor.subjects && tutor.subjects.includes(selectedSubject));

            const matchesSearch =
                !normalizedSearch ||
                tutor.name.toLowerCase().includes(normalizedSearch) ||
                (tutor.subjects &&
                    tutor.subjects.some((s: string) =>
                        s.toLowerCase().includes(normalizedSearch),
                    ));

            if (!matchesSubject || !matchesSearch) return false;

            if (minPriceValue !== null && !Number.isNaN(minPriceValue) && tutor.hourlyRate < minPriceValue) {
                return false;
            }
            if (maxPriceValue !== null && !Number.isNaN(maxPriceValue) && tutor.hourlyRate > maxPriceValue) {
                return false;
            }
            if (minRatingValue !== null && !Number.isNaN(minRatingValue) && tutor.rating < minRatingValue) {
                return false;
            }

            return true;
        });

        // Apply sorting
        if (sortBy === 'price-asc') {
            results = [...results].sort((a, b) => a.hourlyRate - b.hourlyRate);
        } else if (sortBy === 'price-desc') {
            results = [...results].sort((a, b) => b.hourlyRate - a.hourlyRate);
        } else if (sortBy === 'rating-desc') {
            results = [...results].sort((a, b) => b.rating - a.rating);
        }

        return results;
    }, [tutors, selectedSubject, searchQuery, minPrice, maxPrice, minRating, sortBy]);

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <Link href={isLoggedIn ? "/dashboard" : "/"} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        {isLoggedIn ? "Back to Dashboard" : "Back to Main Page"}
                    </Link>
                </div>
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Find Your Perfect Tutor</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Connect with experienced students who can help you master your subjects.
                    </p>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-2 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="w-full md:w-1/3">
                        <label htmlFor="search" className="sr-only">Search tutors</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                name="search"
                                id="search"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150 ease-in-out"
                                placeholder="Search by name or subject"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="w-full md:w-1/3 flex flex-col md:flex-row gap-3">
                        <div className="w-full">
                            <span className="block text-xs font-medium text-gray-700 mb-1">Price range (₱/hr)</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    min={0}
                                    placeholder="Min"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <span className="text-xs text-gray-400">–</span>
                                <input
                                    type="number"
                                    min={0}
                                    placeholder="Max"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        <div className="w-full md:w-32">
                            <span className="block text-xs font-medium text-gray-700 mb-1">Min rating</span>
                            <select
                                value={minRating}
                                onChange={(e) => setMinRating(e.target.value)}
                                className="block w-full pl-3 pr-8 py-1.5 text-xs border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Any</option>
                                <option value="4">4.0+ ★</option>
                                <option value="4.5">4.5+ ★</option>
                                <option value="5">5.0 ★</option>
                            </select>
                        </div>
                    </div>

                    <div className="w-full md:w-auto flex flex-col md:flex-row md:items-center gap-2 md:gap-3 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Subject:</span>
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                            >
                                {allSubjects.map(subject => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                            >
                                <option value="relevance">Relevance</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                                <option value="rating-desc">Rating: High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Advanced filter summary */}
                {(
                    (minPrice && !Number.isNaN(parseFloat(minPrice))) ||
                    (maxPrice && !Number.isNaN(parseFloat(maxPrice))) ||
                    (minRating && !Number.isNaN(parseFloat(minRating))) ||
                    sortBy !== 'relevance'
                ) && (
                        <div className="mb-4 text-right text-xs text-gray-400">
                            Filters applied:
                            {' '}
                            {[
                                minPrice && !Number.isNaN(parseFloat(minPrice)) ? 'Min price' : null,
                                maxPrice && !Number.isNaN(parseFloat(maxPrice)) ? 'Max price' : null,
                                minRating && !Number.isNaN(parseFloat(minRating)) ? 'Min rating' : null,
                                sortBy !== 'relevance' ? 'Sort order' : null,
                            ]
                                .filter(Boolean)
                                .join(', ')}
                        </div>
                    )}

                {/* Tutor Grid */}
                {filteredTutors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredTutors.map(tutor => (
                            <TutorCard key={tutor.id} tutor={tutor} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No tutors found</h3>
                        <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function FindTutorPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading tutors...</div>}>
            <FindTutorContent />
        </Suspense>
    );
}
