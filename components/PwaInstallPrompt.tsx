import React, { useEffect, useMemo, useRef, useState } from 'react';
import { BusinessSettings } from '../types';

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const LS_INSTALLED = 'pwa_installed';
const LS_DISMISS_UNTIL = 'pwa_dismiss_until';

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)')?.matches || (navigator as any).standalone;

const isDesktop = () => window.innerWidth >= 1024;

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

const isAndroid = () => /android/i.test(navigator.userAgent);

const PwaInstallPrompt: React.FC<{ settings: BusinessSettings }> = ({ settings }) => {
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const openedOnceRef = useRef(false);

  const canShow = useMemo(() => {
    if (isStandalone()) return false;
    if (isDesktop()) return false;

    if (localStorage.getItem(LS_INSTALLED) === '1') return false;
    const until = Number(localStorage.getItem(LS_DISMISS_UNTIL) || '0');
    if (until && Date.now() < until) return false;

    return true;
  }, []);

  useEffect(() => {
    const onBeforeInstall = (e: any) => {
      // Android native install prompt is available only after this event
      e.preventDefault();
      setDeferred(e as InstallEvent);

      // open banner when the browser says it's installable
      if (canShow && !openedOnceRef.current) {
        openedOnceRef.current = true;
        setOpen(true);
      }
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall as any);
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall as any);
  }, [canShow]);

  useEffect(() => {
    const onInstalled = () => {
      localStorage.setItem(LS_INSTALLED, '1');
      setOpen(false);
      setDeferred(null);
    };
    window.addEventListener('appinstalled', onInstalled);
    return () => window.removeEventListener('appinstalled', onInstalled);
  }, []);

  // iOS doesn't fire beforeinstallprompt → show tutorial CTA instead
  useEffect(() => {
    if (!canShow) return;
    if (!isIOS()) return;

    const t = setTimeout(() => {
      if (!openedOnceRef.current) {
        openedOnceRef.current = true;
        setOpen(true);
        setShowTutorial(true);
      }
    }, 1200);

    return () => clearTimeout(t);
  }, [canShow]);

  // If user refreshed and the event didn't fire yet, DON'T auto-open on Android.
  // Otherwise you'd show an "Install" button that can't open the native prompt.
  if (!canShow || !open) return null;

  const title = settings.name ? `Instalar ${settings.name}` : 'Instalar aplicativo';

  const onInstall = async () => {
    // Android native prompt
    if (deferred) {
      try {
        await deferred.prompt();
        const choice = await deferred.userChoice;
        if (choice?.outcome === 'dismissed') {
          // keep banner open but allow user to try again later
          setShowTutorial(true);
        }
      } catch {
        setShowTutorial(true);
      } finally {
        // Chrome allows prompt() only once per event
        setDeferred(null);
      }
      return;
    }

    // No native prompt available → show tutorial steps
    setShowTutorial(true);
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

  const shouldShowTutorial = showTutorial || !deferred;

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

            {/* Tutorial when native prompt isn't available (iOS) or when user dismissed */}
            {shouldShowTutorial && (
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
                {deferred ? 'Instalar' : (isAndroid() ? 'Como instalar' : 'Instalar')}
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
