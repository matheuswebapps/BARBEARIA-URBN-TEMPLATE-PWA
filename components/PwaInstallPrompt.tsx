import React, { useEffect, useMemo, useState } from 'react';
import { BusinessSettings } from '../types';

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const LS_INSTALLED = 'pwa_installed';
const LS_DISMISS_UNTIL = 'pwa_dismiss_until';

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)')?.matches || (navigator as any).standalone;

const isDesktop = () => {
  const w = window.innerWidth;
  // treat wide screens as desktop to avoid showing the banner
  return w >= 1024;
};

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

const PwaInstallPrompt: React.FC<{ settings: BusinessSettings }> = ({ settings }) => {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<string>('');

  const canShow = useMemo(() => {
    if (isStandalone()) return false;
    if (isDesktop()) return false;

    if (localStorage.getItem(LS_INSTALLED) === '1') return false;
    const until = Number(localStorage.getItem(LS_DISMISS_UNTIL) || '0');
    if (until && Date.now() < until) return false;

    return true;
  }, [open]);

  useEffect(() => {
    const onBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferred(e as InstallEvent);
      setInfo('');
      if (canShow) setOpen(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onInstalled = () => {
      localStorage.setItem(LS_INSTALLED, '1');
      setOpen(false);
    };
    window.addEventListener('appinstalled', onInstalled);
    return () => window.removeEventListener('appinstalled', onInstalled);
  }, []);

  // For iOS and for Android where beforeinstallprompt may not fire, show a premium tutorial CTA
  useEffect(() => {
    if (!canShow) return;
    const t = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
  }, [canShow]);

  if (!canShow || !open) return null;

  const title = settings.name ? `Instalar ${settings.name}` : 'Instalar aplicativo';

  const onInstall = async () => {
    // If the browser provided the native install prompt, use it.
    if (deferred) {
      try {
        await deferred.prompt();
        try {
          const choice = await deferred.userChoice;
          if (choice?.outcome === 'accepted') {
            localStorage.setItem(LS_INSTALLED, '1');
            setOpen(false);
          } else {
            // User dismissed - don't spam
            localStorage.setItem(LS_DISMISS_UNTIL, String(Date.now() + 12 * 60 * 60 * 1000));
          }
        } finally {
          setDeferred(null);
        }
      } catch (e) {
        // Some Android browsers may block prompt() - fall back to instructions
        setInfo('Seu navegador não liberou a instalação automática. Use o menu ⋮ e toque em “Instalar app”/“Adicionar à tela inicial”.');
      }
      return;
    }

    // No native prompt available: show instructions (Android/iOS)
    setInfo('Use o menu ⋮ do navegador e toque em “Instalar app” ou “Adicionar à tela inicial”.');
  };

  const onLater = () => {
    // stop spamming: hide for 36 hours
    localStorage.setItem(LS_DISMISS_UNTIL, String(Date.now() + 36 * 60 * 60 * 1000));
    setOpen(false);
  };

  const onAlreadyInstalled = () => {
    localStorage.setItem(LS_INSTALLED, '1');
    setOpen(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[999] p-4">
      <div className="max-w-xl mx-auto bg-white border border-gray-100 shadow-2xl rounded-2xl p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F4F4F4] border border-gray-200 overflow-hidden flex items-center justify-center">
            {settings.appIconUrl ? (
              <img src={settings.appIconUrl} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-black text-gray-500">APP</span>
            )}
          </div>

          <div className="flex-1">
            <div className="text-sm font-black text-[#1C1C1C]">{title}</div>
            <div className="text-xs text-gray-500 mt-1">
              Acesso rápido na tela inicial, sem abrir navegador.
            </div>

            {info && (
              <div className="mt-3 text-xs text-gray-600 bg-[#F9FAFB] border border-gray-200 rounded-xl p-3">
                {info}
              </div>
            )}

            {/* Tutorial when native prompt isn't available */}
            {!deferred && (
              <div className="mt-4 text-xs text-gray-600 bg-[#F9FAFB] border border-gray-200 rounded-xl p-3">
                {isIOS() ? (
                  <div>
                    <div className="font-bold mb-2">iPhone / iPad</div>
                    <ol className="list-decimal ml-4 space-y-1">
                      <li>Toque em <span className="font-bold">Compartilhar</span> (ícone do quadrado com seta).</li>
                      <li>Escolha <span className="font-bold">Adicionar à Tela de Início</span>.</li>
                      <li>Confirme em <span className="font-bold">Adicionar</span>.</li>
                    </ol>
                  </div>
                ) : (
                  <div>
                    <div className="font-bold mb-2">Android</div>
                    <ol className="list-decimal ml-4 space-y-1">
                      <li>Abra o menu do navegador (⋮).</li>
                      <li>Toque em <span className="font-bold">Instalar app</span> ou <span className="font-bold">Adicionar à tela inicial</span>.</li>
                      <li>Confirme.</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex gap-2">
              <button
                onClick={onInstall}
                className="flex-1 bg-[#1C1C1C] text-white py-3 font-bold rounded-xl hover:bg-black transition-colors text-sm"
              >
                Instalar
              </button>
              <button
                onClick={onLater}
                className="px-4 py-3 font-bold rounded-xl border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors text-sm"
              >
                Depois
              </button>
              <button
                onClick={onAlreadyInstalled}
                className="px-4 py-3 font-bold rounded-xl border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors text-sm"
              >
                Já instalei
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PwaInstallPrompt;
