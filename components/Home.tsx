
import React from 'react';
import { BusinessSettings } from '../types';

interface HomeProps {
  onNavigate: (tab: string) => void;
  settings: BusinessSettings;
}

const Home: React.FC<HomeProps> = ({ onNavigate, settings }) => {
  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Hero Section - Split Layout Concept / Clean Overlay */}
      <section className="relative px-6 py-12 lg:py-24 max-w-6xl mx-auto w-full flex flex-col md:flex-row items-center gap-12">
        
        <div className="w-full md:w-1/2 text-left animate-in">
           <div className="inline-block px-3 py-1 bg-[#2F6F5E]/10 text-[#2F6F5E] rounded-full text-xs font-bold mb-6 font-header tracking-wide">
             BARBEARIA MODERNA
           </div>
           
           <h1 className="text-5xl lg:text-7xl font-black text-[#1C1C1C] mb-6 leading-tight font-header tracking-tight">
             {settings.name}
           </h1>
           
           <p className="text-lg text-gray-500 font-body leading-relaxed mb-8 max-w-md">
             {settings.subtitle}
           </p>
           
           <div className="flex gap-4">
             <button 
               onClick={() => onNavigate('schedule')}
               className="urban-btn px-8 py-4 text-base shadow-lg shadow-[#2F6F5E]/20"
             >
               {settings.heroButtonTextSchedule}
             </button>
             <button 
               onClick={() => onNavigate('suggestions')}
               className="urban-btn-outline px-8 py-4 text-base"
             >
               {settings.heroButtonTextCuts}
             </button>
           </div>
        </div>

        <div className="w-full md:w-1/2 relative h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-2xl animate-in delay-100">
           <img 
             src={settings.heroImage} 
             alt="Ambiente" 
             className="w-full h-full object-cover"
             onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&q=80&w=1600'; }}
           />
           {/* Subtle gradient overlay */}
           <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        </div>

      </section>

      {/* Features - Clean Grid */}
      <section className="px-6 py-10 w-full max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: settings.feature1Title, desc: settings.feature1Description },
            { title: settings.feature2Title, desc: settings.feature2Description },
            { title: settings.feature3Title, desc: settings.feature3Description }
          ].map((item, idx) => (
            <div key={idx} className="urban-card p-8 hover:shadow-lg transition-shadow duration-300">
              <div className="w-10 h-1 bg-[#D17A22] mb-6"></div>
              <h3 className="text-xl font-bold font-header text-[#1C1C1C] mb-3">{item.title}</h3>
              <p className="text-gray-500 font-body text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mini CTA Footer */}
      <div className="mt-8 text-center px-6">
         <p className="font-header font-bold text-gray-300 text-2xl uppercase tracking-tighter opacity-50">{settings.footerQuote}</p>
      </div>
    </div>
  );
};

export default Home;
