
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import ScheduleCalendar from "@/components/ScheduleCalendar";

const Schedule = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold brand-gradient-text">Content Scheduler</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Schedule Your Content</h2>
          <p className="text-lg text-gray-600">
            Plan and schedule your repurposed content across social media platforms
          </p>
        </div>

        <ScheduleCalendar />
      </div>
    </div>
  );
};

export default Schedule;
