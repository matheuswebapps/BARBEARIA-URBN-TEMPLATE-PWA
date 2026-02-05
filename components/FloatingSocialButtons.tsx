
import React from 'react';
import { BusinessSettings } from '../types';

interface FloatingSocialButtonsProps {
  currentTab: string;
  settings: BusinessSettings;
}

const FloatingSocialButtons: React.FC<FloatingSocialButtonsProps> = ({ currentTab, settings }) => {
  // RULE 1: Appear only on Home tab
  if (currentTab !== 'home') return null;

  // RULE 2: Check if any link exists
  const hasWhatsApp = !!settings.whatsappLink;
  const hasInstagram = !!settings.instagramLink;
  const hasFacebook = !!settings.facebookLink;

  if (!hasWhatsApp && !hasInstagram && !hasFacebook) return null;

  return (
    <div className="lg:hidden fixed bottom-24 right-4 z-40 flex flex-col gap-3 animate-in">
      {/* Facebook */}
      {hasFacebook && (
        <a 
          href={settings.facebookLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label="Facebook"
        >
          <i className="fab fa-facebook-f text-sm"></i>
        </a>
      )}

      {/* Instagram */}
      {hasInstagram && (
        <a 
          href={settings.instagramLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label="Instagram"
        >
          <i className="fab fa-instagram text-sm"></i>
        </a>
      )}

      {/* WhatsApp */}
      {hasWhatsApp && (
        <a 
          href={settings.whatsappLink} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label="WhatsApp"
        >
          <i className="fab fa-whatsapp text-lg"></i>
        </a>
      )}
    </div>
  );
};

export default FloatingSocialButtons;
