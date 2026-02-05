import React, { useEffect } from 'react';
import { BusinessSettings } from '../types';

/**
 * Creates a runtime manifest based on admin-editable settings (name/icon).
 * This avoids needing to rebuild the site to change PWA branding.
 */
const DynamicManifest: React.FC<{ settings: BusinessSettings }> = ({ settings }) => {
  useEffect(() => {
    try {
      const icon = settings.appIconUrl || '/logo.png';
      const name = settings.name || 'App';
      const shortName = (settings.name || 'App').slice(0, 12);

      const manifest = {
        name,
        short_name: shortName,
        start_url: '/',
        display: 'standalone',
        background_color: '#FDFBF7',
        theme_color: '#2C1A1D',
        icons: [
          { src: icon, sizes: '192x192', type: 'image/png' },
          { src: icon, sizes: '512x512', type: 'image/png' }
        ]
      };

      const blob = new Blob([JSON.stringify(manifest)], { type: 'application/manifest+json' });
      const url = URL.createObjectURL(blob);

      let link = document.querySelector("link[rel='manifest']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'manifest';
        document.head.appendChild(link);
      }
      link.href = url;

      return () => URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
  }, [settings.name, settings.appIconUrl]);

  return null;
};

export default DynamicManifest;
