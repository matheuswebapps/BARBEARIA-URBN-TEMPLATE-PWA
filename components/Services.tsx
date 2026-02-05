
import React, { useEffect, useState } from 'react';
import { dataProvider } from '../dataProvider';
import { ServiceItem, BusinessSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

const Services: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const fetchData = async () => {
      const [fetchedServices, fetchedSettings] = await Promise.all([
        dataProvider.getServices(),
        dataProvider.getSettings()
      ]);
      setServices(fetchedServices.filter(s => s.active && s.name.trim() !== ''));
      setSettings(fetchedSettings);
    };
    fetchData();
  }, []);

  const createSlug = (text: string) => {
    return (text || 'Barbearia')
      .toString()
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/&/g, 'e')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleQuickAgendamento = (serviceName: string) => {
    const slug = createSlug(settings.name);
    const shopName = settings.name || 'Barbearia';

    let msg = `agendamento-${slug}\n`;
    msg += `✂️ Agendamento — *${shopName}*\n\n`;
    msg += `Olá! Gostaria de agendar: *${serviceName}*`;
    
    window.open(`https://wa.me/${settings.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="p-6 pb-24 min-h-screen lg:max-w-4xl lg:mx-auto">
      <div className="mb-10 animate-in">
        <h2 className="text-3xl font-black font-header text-[#1C1C1C] mb-2">Preços e Serviços</h2>
        <p className="text-gray-500 font-body">Simples, transparente e direto.</p>
      </div>

      <div className="grid gap-4">
        {services.length === 0 && <p className="text-gray-400">Carregando serviços...</p>}
        
        {services.map((service, idx) => (
          <div 
            key={service.id} 
            className="urban-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div>
               <div className="flex items-center gap-3 mb-1">
                 <h3 className="font-header text-lg font-bold text-[#1C1C1C]">{service.name}</h3>
                 <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-bold">{service.durationMinutes} min</span>
               </div>
               <p className="text-sm text-gray-500 font-body">{service.description}</p>
            </div>
            
            <div className="flex items-center justify-between sm:justify-end gap-6 pt-4 sm:pt-0 border-t sm:border-0 border-gray-100">
               <span className="font-header text-xl font-bold text-[#1C1C1C]">R$ {service.price}</span>
               <button 
                 onClick={() => handleQuickAgendamento(service.name)}
                 className="bg-[#1C1C1C] text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-[#2F6F5E] transition-colors"
               >
                 Agendar
               </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-gray-100 rounded-xl p-8 text-center">
        <h3 className="font-header font-bold text-lg mb-2">Tem alguma dúvida?</h3>
        <p className="text-gray-500 text-sm mb-6">Mande uma mensagem direta no nosso WhatsApp.</p>
        <button 
           onClick={() => window.open(settings.whatsappLink, '_blank')}
           className="text-[#2F6F5E] font-bold text-sm border-b-2 border-[#2F6F5E] pb-1 hover:text-[#1A4238] hover:border-[#1A4238] transition-colors"
        >
          Falar no WhatsApp
        </button>
      </div>
    </div>
  );
};

export default Services;
