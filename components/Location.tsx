
import React from 'react';
import { BusinessSettings } from '../types';

interface LocationProps {
  settings: BusinessSettings;
}

const Location: React.FC<LocationProps> = ({ settings }) => {
  return (
    <div className="p-6 pb-24 min-h-screen lg:max-w-4xl lg:mx-auto">
      <div className="mb-10 animate-in">
        <h2 className="text-3xl font-black font-header text-[#1C1C1C] mb-2">Localização</h2>
        <p className="text-gray-500 font-body">Fácil acesso. Estacionamento próximo.</p>
      </div>
      
      <div className="urban-card overflow-hidden animate-in delay-100">
        <div className="h-64 bg-gray-200 relative flex items-center justify-center">
             <i className="fas fa-map-marker-alt text-4xl text-gray-400"></i>
             {/* Simulating map view */}
             <div className="absolute inset-0 bg-cover bg-center opacity-50" style={{ backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Google_Maps_Logo_2020.svg/2275px-Google_Maps_Logo_2020.svg.png')" }}></div>
        </div>
        
        <div className="p-8 md:p-12 grid md:grid-cols-2 gap-10">
          <div>
            <h3 className="font-header text-xl font-bold text-[#1C1C1C] mb-2">Endereço</h3>
            <p className="text-gray-600 mb-6 font-body text-lg leading-relaxed">{settings.address}</p>
            
            <button 
              onClick={() => window.open(settings.googleMapsUrl || settings.mapLink, '_blank')}
              className="urban-btn px-6 py-3 text-sm flex items-center gap-2 inline-flex"
            >
              <i className="fas fa-location-arrow"></i> Abrir no Maps
            </button>
          </div>
          
          <div className="border-t md:border-t-0 md:border-l border-gray-100 pt-8 md:pt-0 md:pl-10">
            <h3 className="font-header text-xl font-bold text-[#1C1C1C] mb-4">Horários</h3>
            <div className="space-y-2">
                {settings.openingHoursText.split('|').map((line, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#2F6F5E]"></div>
                        <p className="text-gray-600 font-body">{line.trim()}</p>
                    </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location;
