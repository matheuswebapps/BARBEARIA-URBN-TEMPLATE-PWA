
import React from 'react';
import { BusinessSettings } from '../types';

interface NavigationProps {
  currentTab: string;
  setTab: (tab: string) => void;
  settings?: BusinessSettings;
}

const Navigation: React.FC<NavigationProps> = ({ currentTab, setTab, settings }) => {
  // Ordered as requested: Home, Schedule (Agendar), Cuts, Services, (Products), Location
  const tabs = [
    { id: 'home', icon: 'fa-home', label: 'Início' },
    { id: 'schedule', icon: 'fa-calendar-plus', label: 'Agendar' },
    { id: 'suggestions', icon: 'fa-images', label: 'Cortes' },
    { id: 'services', icon: 'fa-list', label: 'Preços' },
    // Only show Products if enabled
    ...(settings?.productsEnabled ? [{ id: 'products', icon: 'fa-box-open', label: 'Prod.' }] : []),
    { id: 'location', icon: 'fa-map-pin', label: 'Local' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe-area-inset-bottom z-50">
      <div className="flex justify-between items-center h-16 w-full max-w-lg mx-auto px-1">
        {tabs.map((tab) => {
           const isActive = currentTab === tab.id;
           return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className="flex flex-1 flex-col items-center justify-center h-full relative min-w-0"
            >
              <div className={`transition-all duration-200 mb-0.5 ${isActive ? 'text-[#2F6F5E] transform -translate-y-0.5' : 'text-gray-400'}`}>
                <i className={`fas ${tab.icon} text-lg`}></i>
              </div>
              <span className={`text-[9px] font-bold font-header transition-colors truncate w-full text-center px-0.5 ${isActive ? 'text-[#2F6F5E]' : 'text-gray-400'}`}>
                {tab.label}
              </span>
              
              {/* Minimal Dot Indicator */}
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 bg-[#2F6F5E] rounded-full"></div>
              )}
            </button>
           );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
