
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import ScheduleCalendar from "@/components/ScheduleCalendar";

const Schedule = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base">
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden xs:inline">Back to Dashboard</span>
              <span className="xs:hidden">Back</span>
            </Link>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold brand-gradient-text">Content Scheduler</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-7xl">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">Schedule Your Content</h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">
            Plan and schedule your repurposed content across social media platforms
          </p>
        </div>

        <ScheduleCalendar />
      </div>
    </div>
  );
};

export default Schedule;
