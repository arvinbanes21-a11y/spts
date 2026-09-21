export interface Tutor {
    id: number;
    name: string;
    subjects: string[];
    rating: number;
    bio: string;
    avatar: string; // URL or placeholder initials
    hourlyRate: number;
    profilePicture?: string;
    schoolAttended?: string;
    graduatedProgram?: string;
    currentGrade?: string;
}

export const mockTutors: Tutor[] = [
    {
        id: 1,
        name: "Alex Johnson",
        subjects: ["Mathematics", "Calculus", "Algebra"],
        rating: 4.8,
        bio: "Math major with 3 years of tutoring experience. valid help for high school and college students.",
        avatar: "AJ",
        hourlyRate: 25
    },
    {
        id: 2,
        name: "Emily Chen",
        subjects: ["Physics", "Chemistry", "Science"],
        rating: 4.9,
        bio: "Passionate about making science easy to understand. Specializing in mechanics and thermodynamics.",
        avatar: "EC",
        hourlyRate: 30
    },
    {
        id: 3,
        name: "Michael Brown",
        subjects: ["English", "Literature", "Essay Writing"],
        rating: 4.5,
        bio: "Helping you write better essays and understand classic literature.",
        avatar: "MB",
        hourlyRate: 20
    },
    {
        id: 4,
        name: "Sarah Williams",
        subjects: ["Computer Science", "Programming", "Python"],
        rating: 5.0,
        bio: "Software engineer by day, tutor by night. Learn to code with practical examples.",
        avatar: "SW",
        hourlyRate: 35
    },
    {
        id: 5,
        name: "David Kim",
        subjects: ["Mathematics", "Statistics", "Economics"],
        rating: 4.7,
        bio: "Economics student who loves numbers. Let's crunch some data!",
        avatar: "DK",
        hourlyRate: 28
    }
];
