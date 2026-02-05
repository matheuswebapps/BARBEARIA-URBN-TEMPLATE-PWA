
import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import Scheduling from './components/Scheduling';
import Services from './components/Services';
import Products from './components/Products';
import Location from './components/Location';
import CutSuggestions from './components/CutSuggestions';
import Navigation from './components/Navigation';
import Admin from './components/Admin';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import FloatingSocialButtons from './components/FloatingSocialButtons';
import { dataProvider } from './dataProvider';
import { DEFAULT_SETTINGS } from './constants';
import { BusinessSettings } from './types';

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('home');
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  
  // Secret Admin Access State
  const [homeClickCount, setHomeClickCount] = useState(0);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => console.log('SW registered: ', registration.scope),
          (err) => console.log('SW registration failed: ', err)
        );
      });
    }

    const loadSettings = async () => {
      try {
        const fetchedSettings = await dataProvider.getSettings();
        setSettings(fetchedSettings);
      } catch (e) { console.error(e); }
    };
    loadSettings();
  }, [currentTab]);

  useEffect(() => {
    if (settings.appIconUrl) {
      let linkIcon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!linkIcon) {
        linkIcon = document.createElement('link');
        linkIcon.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(linkIcon);
      }
      linkIcon.href = settings.appIconUrl;
      
      let linkApple = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
      if (!linkApple) {
        linkApple = document.createElement('link');
        linkApple.rel = 'apple-touch-icon';
        document.getElementsByTagName('head')[0].appendChild(linkApple);
      }
      linkApple.href = settings.appIconUrl;
    }
  }, [settings.appIconUrl]);

  // Redirect if products disabled
  useEffect(() => {
    if (currentTab === 'products' && !settings.productsEnabled) {
      setCurrentTab('home');
    }
  }, [currentTab, settings.productsEnabled]);

  const handleTabChange = (tab: string) => {
    // Secret Access Logic
    if (tab === 'home') {
      const newCount = homeClickCount + 1;
      setHomeClickCount(newCount);
      if (newCount >= 5) {
        setCurrentTab('admin');
        setHomeClickCount(0);
        return; 
      }
      setTimeout(() => setHomeClickCount(0), 2000);
    } else {
      setHomeClickCount(0);
    }
    setCurrentTab(tab);
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'home': return <Home onNavigate={handleTabChange} settings={settings} />;
      case 'schedule': return <Scheduling settings={settings} />;
      case 'suggestions': return <CutSuggestions onNavigate={handleTabChange} />;
      case 'services': return <Services />;
      case 'products': return settings.productsEnabled ? <Products /> : <Home onNavigate={handleTabChange} settings={settings} />;
      case 'location': return <Location settings={settings} />;
      case 'admin': return <Admin />;
      default: return <Home onNavigate={handleTabChange} settings={settings} />;
    }
  };

  if (currentTab === 'admin') {
    return (
      <div className="min-h-screen relative bg-[#F4F4F4]">
         <Admin />
         <button 
           onClick={() => setCurrentTab('home')}
           className="fixed bottom-6 right-6 bg-black text-white px-6 py-3 rounded-xl text-sm font-bold shadow-2xl z-50 hover:bg-gray-800"
         >
           Sair
         </button>
      </div>
    );
  }

  // Desktop Tabs Logic
  const desktopTabs = [
    { id: 'home', label: 'Início' },
    { id: 'suggestions', label: 'Catálogo' },
    { id: 'services', label: 'Serviços' },
    // Only show Products if enabled
    ...(settings.productsEnabled ? [{ id: 'products', label: 'Produtos' }] : []),
    { id: 'schedule', label: 'Agendar' },
    { id: 'location', label: 'Local' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F4F4]">
      <DynamicManifest settings={settings} />
      <PwaInstallPrompt settings={settings} />
      {/* Header - Minimalist */}
      <header className="h-20 bg-white sticky top-0 z-40 flex items-center justify-between px-6 shadow-[0_2px_15px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3 select-none">
           {settings.logoUrl && (
             <img 
               src={settings.logoUrl} 
               alt="Logo" 
               className="h-8 w-auto object-contain" 
               onError={(e) => { e.currentTarget.style.display = 'none'; }}
             />
           )}
           
           <div>
             <h1 className="font-header text-xl font-black text-[#1C1C1C] tracking-tight leading-none">
               {settings.name.toUpperCase()}
             </h1>
           </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex gap-8">
           {desktopTabs.map(tab => (
             <button
               key={tab.id}
               onClick={() => handleTabChange(tab.id)}
               className={`text-sm font-bold transition-colors font-header ${currentTab === tab.id ? 'text-[#2F6F5E]' : 'text-gray-400 hover:text-black'}`}
             >
               {tab.label}
             </button>
           ))}
        </div>
        
        {/* Desktop CTA */}
        <button 
          onClick={() => handleTabChange('schedule')}
          className="hidden lg:block bg-[#2F6F5E] text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-[#1A4238] transition-colors"
        >
          Agendar
        </button>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto animate-in pt-4">
        {renderContent()}
      </main>

      {/* Floating Social Buttons (Mobile/Tablet) */}
      <FloatingSocialButtons currentTab={currentTab} settings={settings} />

      <div className="lg:hidden">
        <Navigation currentTab={currentTab} setTab={handleTabChange} settings={settings} />
      </div>

      {/* Desktop Footer */}
      <footer className="hidden lg:block bg-white text-gray-800 py-16 mt-12 border-t border-gray-100">
         <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
            <h2 className="font-header text-3xl font-black mb-4">{settings.name}</h2>
            <p className="font-body text-gray-500 mb-8 max-w-md">{settings.footerQuote}</p>
            
            <div className="flex gap-6">
                {settings.whatsappLink && (
                  <a href={settings.whatsappLink} className="text-gray-400 hover:text-[#25D366] text-xl transition-colors"><i className="fab fa-whatsapp"></i></a>
                )}
                {settings.instagramLink && (
                  <a href={settings.instagramLink} className="text-gray-400 hover:text-[#E1306C] text-xl transition-colors"><i className="fab fa-instagram"></i></a>
                )}
                {settings.facebookLink && (
                  <a href={settings.facebookLink} className="text-gray-400 hover:text-[#1877F2] text-xl transition-colors"><i className="fab fa-facebook-f"></i></a>
                )}
            </div>
            <p className="mt-8 text-xs text-gray-300 font-bold">© {new Date().getFullYear()} • TODOS OS DIREITOS RESERVADOS</p>
         </div>
      </footer>
    </div>
  );
};

export default App;
