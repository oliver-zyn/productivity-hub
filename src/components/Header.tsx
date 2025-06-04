import React, { useState, useEffect } from "react";
import { Sparkles, Brain, Key } from "lucide-react";
import Button from "../components/ui/Button";
import { useAI } from "../hooks/useIA";
import { useAppStore } from "../stores/useAppStore";

const Header: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toggleChat } = useAI();
  const showConfig = useAppStore((state) => state.showConfig);
  const setShowConfig = useAppStore((state) => state.setShowConfig);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Productivity Hub
              </h1>
              <p className="text-gray-400 text-sm">{formatDate(currentTime)}</p>
            </div>
          </div>

          {/* Actions and Time */}
          <div className="flex items-center gap-4">
            {/* Configuration Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowConfig(!showConfig)}
              icon={<Key className="w-4 h-4" />}
              title="Configurações"
            />

            {/* AI Chat Button */}
            <Button
              variant="primary"
              size="md"
              onClick={toggleChat}
              icon={<Brain className="w-4 h-4" />}
            >
              IA Assistant
            </Button>

            {/* Current Time */}
            <div className="text-right">
              <div className="text-2xl font-mono text-gray-100">
                {formatTime(currentTime)}
              </div>
              <div className="text-xs text-gray-400">
                {currentTime.toLocaleDateString("pt-BR", {
                  timeZone: "America/Sao_Paulo",
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
