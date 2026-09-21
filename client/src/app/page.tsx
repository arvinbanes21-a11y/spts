import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">SmartTutor</span>
          </div>
          <nav className="hidden md:flex space-x-8">
            <Link href="/login" className="text-gray-600 hover:text-blue-600 font-medium">Log In</Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
                Master Any Subject with Peer Tutoring
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl">
                Connect with top students at your school for personalized, affordable, and effective learning sessions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/find-tutor" className="bg-white text-blue-700 hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-lg shadow-lg transition transform hover:scale-105 text-center">
                  Find a Tutor
                </Link>
                <Link href="/register" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-full text-lg transition text-center">
                  Sign Up as Tutor
                </Link>
              </div>
            </div>
            
            <div className="md:w-1/2 flex justify-center lg:justify-end animate-fade-in-up mt-8 md:mt-0">
              <Image 
                src="/hero-image.png" 
                alt="Online Tutoring Virtual Classroom" 
                width={800} 
                height={600} 
                className="w-full h-auto object-contain drop-shadow-2xl scale-110 origin-center"
                priority
              />
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900">Why SmartTutor?</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Verified Tutors", desc: "All tutors are vetted students who have excelled in their subjects." },
                { title: "Flexible Scheduling", desc: "Book sessions that fit your timetable with our easy calendar." },
                { title: "Collaborative Learning", desc: "Learn from peers who understand your curriculum and challenges." }
              ].map((feature, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>© 2024 Smart PeerTutoring System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
