import React from "react";
import Header from "@/components/Header";
import Dashboard from "@/components/Dashboard";
import Tasks from "@/components/Tasks";
import Projects from "@/components/Projects";
import TeamsIntegration from "@/components/TeamsIntegration";
import PomodoroTimer from "@/components/PomodoroTimer";
import AIChat from "@/components/AIChat";
import ConfigModal from "@/components/ConfigModal";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Main Column */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Dashboard Metrics */}
            <Dashboard />

            {/* Teams Integration */}
            <TeamsIntegration />

            {/* Tasks */}
            <Tasks />

            {/* Projects */}
            <Projects />
          </div>

          {/* Sidebar */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Pomodoro Timer */}
            <PomodoroTimer />
          </div>
        </div>
      </div>

      {/* Floating Components */}
      <AIChat />
      <ConfigModal />
    </div>
  );
};

export default App;
