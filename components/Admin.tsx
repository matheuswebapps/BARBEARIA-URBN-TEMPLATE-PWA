
import React, { useState, useEffect } from 'react';
import { dataProvider } from '../dataProvider';
import { PROVIDER_MODE } from '../config';
import { getAdminEmail, getSupabase } from '../services/supabaseClient';
import { BusinessSettings, ServiceItem, CutSuggestion, ProductItem } from '../types';
import { DEFAULT_SETTINGS, DEFAULT_SERVICES, DEFAULT_CUTS, DEFAULT_PRODUCTS } from '../constants';

const Admin: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'business' | 'home' | 'cuts' | 'services' | 'products'>('business');
  
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);
  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  const [cuts, setCuts] = useState<CutSuggestion[]>(DEFAULT_CUTS);
  const [products, setProducts] = useState<ProductItem[]>(DEFAULT_PRODUCTS);
  
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const tryRestoreSession = async () => {
      if (PROVIDER_MODE !== 'supabase') return;
      try {
        const supabase = getSupabase();
        const { data } = await supabase.auth.getSession();
        if (data.session) setIsLoggedIn(true);
      } catch (e) {
        // ignore
      }
    };
    tryRestoreSession();
  }, []);


  useEffect(() => {
    if (isLoggedIn) loadData();
  }, [isLoggedIn]);

  
const loadData = async () => {
    const [s, serv, c, p] = await Promise.all([
      dataProvider.getSettings(),
      dataProvider.getServices(),
      dataProvider.getCuts(),
      dataProvider.getProducts()
    ]);

    // Pad lists so the admin always shows many editable slots by default (without hard limits).
    const paddedServices = padList(serv || [], MIN_SERVICES, makeServiceSlot as any);
    const paddedCuts = padList(c || [], MIN_CUTS, makeCutSlot as any);
    const paddedProducts = padList(p || [], MIN_PRODUCTS, makeProductSlot as any);

    setSettings(s);
    setServices(paddedServices as any);
    setCuts(paddedCuts as any);
    setProducts(paddedProducts as any);
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD as string | undefined;
    if (!adminPassword) {
      alert('VITE_ADMIN_PASSWORD não configurado.');
      return;
    }
    if (password !== adminPassword) {
      alert('Senha incorreta');
      return;
    }

    // If Supabase is active, also authenticate via Supabase Auth (email is hidden via env)
    if (PROVIDER_MODE === 'supabase') {
      try {
        const supabase = getSupabase();
        const email = getAdminEmail();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } catch (err: any) {
        console.error(err);
        alert('Falha no login do Supabase. Verifique se o usuário existe no Auth e se a senha está correta.');
        return;
      }
    }

    setIsLoggedIn(true);
  };

  const saveAll = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setStatus('Salvando...');

    try {
      // Salva em sequência para facilitar diagnóstico e evitar "travamento" visual se alguma etapa falhar
      await dataProvider.saveSettings(settings);
      await dataProvider.saveServices(services);
      await dataProvider.saveCuts(cuts);
      await dataProvider.saveProducts(products);

      setStatus('Salvo!');
        // Notify Service Worker so future PWA installs use the latest name/icon
        try {
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((reg) => {
              reg.active?.postMessage({
                type: 'PWA_UPDATE',
                settings: { name: settings.name, appIconUrl: settings.appIconUrl }
              });
            });
          }
        } catch (e) { /* ignore */ }
      setTimeout(() => setStatus(''), 2000);
    } catch (err: any) {
      console.error(err);
      setStatus('Erro ao salvar');
      alert('Erro ao salvar. Verifique o console e confirme se o SQL/RLS e as variáveis do Supabase estão corretas.');
      setTimeout(() => setStatus(''), 4000);
    } finally {
      setIsSaving(false);
    }
  };


  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof BusinessSettings,
    folder: 'branding' | 'cuts' | 'products' = 'branding'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await dataProvider.uploadImage(file, folder, String(field));
      const pathField = (field === 'logoUrl' ? 'logoPath' : field === 'appIconUrl' ? 'appIconPath' : field === 'heroImage' ? 'heroImagePath' : null) as any;

      setSettings(prev => ({
        ...prev,
        [field]: result.publicUrl,
        ...(pathField ? { [pathField]: result.path } : {})
      }));
    } catch (err: any) {
      console.error(err);
      alert('Falha ao enviar imagem. Verifique VITE_SUPABASE_BUCKET e as permissões do Storage.');
    } finally {
      e.target.value = '';
    }
  };

  const handleImageRemove = async (field: keyof BusinessSettings) => {
    try {
      const pathField = (field === 'logoUrl' ? 'logoPath' : field === 'appIconUrl' ? 'appIconPath' : field === 'heroImage' ? 'heroImagePath' : null) as any;
      const currentPath = (settings as any)[pathField] as string | undefined;
      if (currentPath) await dataProvider.removeImage(currentPath);

      setSettings(prev => ({
        ...prev,
        [field]: '',
        ...(pathField ? { [pathField]: null } : {})
      }));
    } catch (err: any) {
      console.error(err);
      alert('Falha ao remover imagem.');
    }
  };

  // Helper to handle option updates for any item
  
  const createId = (): string => {
    // crypto.randomUUID is supported in modern browsers; fallback keeps IDs unique enough for admin usage.
    // We avoid external deps to keep the template portable.
    // @ts-ignore
    return (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  };


// Minimum editable slots (base "quasi-ilimitado" sem depender do cliente clicar em "Adicionar")
const MIN_PRODUCTS = 20;
const MIN_SERVICES = 40;
const MIN_CUTS = 60;

const padList = <T extends { id: string }>(
  list: T[],
  min: number,
  makeSlot: (slotIndex: number) => T
): T[] => {
  if (!Array.isArray(list)) return list as any;
  if (list.length >= min) return list;

  const used = new Set(list.map(i => i.id));
  const out = [...list];
  let i = 0;
  while (out.length < min) {
    const candidate = makeSlot(i);
    i++;
    if (used.has(candidate.id)) continue;
    used.add(candidate.id);
    out.push(candidate);
  }
  return out;
};

const makeCutSlot = (slotIndex: number) => ({
  id: `slot-cut-${String(slotIndex + 1).padStart(3, '0')}`,
  name: '',
  technicalName: '',
  category: 'Geral' as const,
  imageUrl: '',
  active: false,
  options: ['', '', '', ''],
  isChild: false,
  storagePath: null
});

const makeProductSlot = (slotIndex: number) => ({
  id: `slot-prod-${String(slotIndex + 1).padStart(3, '0')}`,
  name: '',
  description: '',
  price: 0,
  imageUrl: '',
  active: false,
  options: [''],
  notForKids: false,
  storagePath: null
});

const makeServiceSlot = (slotIndex: number) => ({
  id: `slot-serv-${String(slotIndex + 1).padStart(3, '0')}`,
  name: '',
  price: 0,
  durationMinutes: 30,
  description: '',
  icon: 'hair',
  active: false,
  options: [''],
  isChild: false,
  notForKids: false
});

  const addCut = () => {
    setCuts(prev => ([
      ...prev,
      {
        id: createId(),
        name: '',
        technicalName: '',
        category: 'Geral',
        imageUrl: '',
        active: true,
        options: ['', '', '', ''],
        isChild: false,
        storagePath: null
      }
    ]));
  };

  const removeCut = (id: string) => {
    setCuts(prev => prev.filter(c => c.id !== id));
  };

  const addProduct = () => {
    setProducts(prev => ([
      ...prev,
      {
        id: createId(),
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        active: true,
        options: ['', '', '', ''],
        notForKids: false,
        storagePath: null
      }
    ]));
  };

  const removeProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addService = () => {
    setServices(prev => ([
      ...prev,
      {
        id: createId(),
        name: '',
        price: 0,
        durationMinutes: 0,
        description: '',
        icon: '',
        active: true,
        options: ['', '', '', ''],
        isChild: false,
        notForKids: false
      }
    ]));
  };

  const removeService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

const updateItemOptions = (
    itemIndex: number, 
    optionIndex: number, 
    value: string, 
    list: any[], 
    setList: any
  ) => {
    const newList = [...list];
    const currentOptions = newList[itemIndex].options ? [...newList[itemIndex].options] : [];
    
    // Ensure array is big enough
    while (currentOptions.length <= optionIndex) currentOptions.push('');
    
    currentOptions[optionIndex] = value;
    
    newList[itemIndex].options = currentOptions;
    setList(newList);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F4F4] p-6">
        <div className="bg-white p-8 max-w-sm w-full shadow-xl rounded-2xl border border-gray-100">
          <h2 className="text-2xl font-header font-bold text-center mb-6 text-[#1C1C1C]">Login Admin</h2>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              placeholder="Senha"
              className="w-full p-4 border border-gray-200 mb-4 outline-none focus:border-[#2F6F5E] rounded-xl font-body"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button className="w-full bg-[#1C1C1C] text-white py-4 font-bold rounded-xl hover:bg-black transition-colors">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pb-24 bg-[#F4F4F4] text-[#1C1C1C]">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black font-header">Painel Admin</h1>
          <button onClick={saveAll} disabled={isSaving} className="bg-[#2F6F5E] text-white px-6 py-3 font-bold rounded-xl shadow-lg hover:bg-[#1A4238] transition-colors text-sm disabled:opacity-60 disabled:cursor-not-allowed">
            {status || 'SALVAR TUDO'}
          </button>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
           {['business', 'home', 'cuts', 'services', 'products'].map((t) => (
             <button 
               key={t}
               onClick={() => setActiveTab(t as any)}
               className={`px-6 py-3 font-bold text-sm transition-colors whitespace-nowrap rounded-full border ${activeTab === t ? 'bg-[#1C1C1C] text-white border-[#1C1C1C]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
             >
               {t === 'business' ? 'Geral' : t === 'home' ? 'Home' : t === 'cuts' ? 'Catálogo' : t === 'services' ? 'Serviços' : 'Produtos'}
             </button>
           ))}
        </div>

        <div className="bg-white p-6 md:p-8 shadow-sm rounded-2xl border border-gray-100">
          
          {/* BUSINESS SETTINGS */}
          {activeTab === 'business' && (
            <div className="grid md:grid-cols-2 gap-6">
               <div className="col-span-2 bg-[#F0FDF4] border border-[#DCFCE7] p-4 rounded-xl mb-4">
                  <h3 className="text-sm font-bold uppercase mb-4 text-[#166534] flex items-center gap-2">
                    <i className="fas fa-sliders-h"></i> Configurações Globais
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                     <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                       <span className="text-sm font-bold text-gray-700">Aba Produtos no Site</span>
                       <div className="relative inline-block w-12 h-6 align-middle select-none">
                         <input 
                            type="checkbox" 
                            checked={settings.productsEnabled} 
                            onChange={e => setSettings({...settings, productsEnabled: e.target.checked})} 
                            className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-[#2F6F5E] right-6 border-gray-300 transition-all duration-300"
                         />
                         <label className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${settings.productsEnabled ? 'bg-[#2F6F5E]/20' : 'bg-gray-200'}`}></label>
                       </div>
                     </div>
                     <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                       <span className="text-sm font-bold text-gray-700">Corte Infantil</span>
                       <div className="relative inline-block w-12 h-6 align-middle select-none">
                         <input 
                            type="checkbox" 
                            checked={settings.childCutEnabled} 
                            onChange={e => setSettings({...settings, childCutEnabled: e.target.checked})} 
                            className="absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-[#2F6F5E] right-6 border-gray-300 transition-all duration-300"
                         />
                         <label className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors ${settings.childCutEnabled ? 'bg-[#2F6F5E]/20' : 'bg-gray-200'}`}></label>
                       </div>
                     </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">
                    * Desativar "Produtos" remove a aba do site e a etapa no agendamento.<br/>
                    * Desativar "Corte Infantil" remove a opção de serviço e campos de nome de criança.
                  </p>
               </div>

               <div className="col-span-2">
                 <label className="text-xs font-bold uppercase block mb-2 text-gray-400">Nome da Barbearia</label>
                 <input className="admin-input" value={settings.name} onChange={e => setSettings({...settings, name: e.target.value})} />
               </div>
               <div className="col-span-2">
                 <label className="text-xs font-bold uppercase block mb-2 text-gray-400">Subtítulo</label>
                 <input className="admin-input" value={settings.subtitle} onChange={e => setSettings({...settings, subtitle: e.target.value})} />
               </div>
               <div>
                 <label className="text-xs font-bold uppercase block mb-2 text-gray-400">Telefone</label>
                 <input className="admin-input" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} />
               </div>
               
               <div className="col-span-2">
                 <label className="text-xs font-bold uppercase block mb-2 text-gray-400">Endereço</label>
                 <input className="admin-input" value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} />
               </div>
               <div>
                 <label className="text-xs font-bold uppercase block mb-2 text-gray-400">Link Maps</label>
                 <input className="admin-input" value={settings.googleMapsUrl} onChange={e => setSettings({...settings, googleMapsUrl: e.target.value})} />
               </div>
               <div>
                 <label className="text-xs font-bold uppercase block mb-2 text-gray-400">Horários (Use | para quebrar linha)</label>
                 <input className="admin-input" value={settings.openingHoursText} onChange={e => setSettings({...settings, openingHoursText: e.target.value})} />
               </div>

               {/* Identidade Visual */}
               <div className="col-span-2 mt-6 border-t border-gray-100 pt-6">
                 <h3 className="text-sm font-bold uppercase mb-4 text-[#2F6F5E]">Imagens</h3>
                 <div className="grid md:grid-cols-2 gap-8">
                   <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                     <label className="text-xs font-bold uppercase block mb-3">Logo (Header)</label>
                     <div className="flex items-center gap-4">
                       <div className="w-16 h-16 bg-white border border-gray-200 flex items-center justify-center rounded-lg overflow-hidden shrink-0">
                         {settings.logoUrl ? <img src={settings.logoUrl} className="w-full h-full object-contain" /> : <span className="text-[9px]">Vazio</span>}
                       </div>
                       <div className="flex flex-col gap-2 w-full">
                         <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logoUrl', 'branding')} className="text-xs w-full" />
                         {settings.logoUrl && (
                           <button 
                             onClick={() => handleImageRemove('logoUrl')} 
                             className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                           >
                             <i className="fas fa-trash"></i> Remover Logo
                           </button>
                         )}
                       </div>
                     </div>
                   </div>
                   <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                     <label className="text-xs font-bold uppercase block mb-3">Ícone App</label>
                     <div className="flex items-center gap-4">
                       <div className="w-16 h-16 bg-white border border-gray-200 flex items-center justify-center rounded-lg overflow-hidden shrink-0">
                          {settings.appIconUrl ? <img src={settings.appIconUrl} className="w-full h-full object-cover" /> : <span className="text-[9px]">Vazio</span>}
                       </div>
                       <div className="flex flex-col gap-2 w-full">
                         <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'appIconUrl', 'branding')} className="text-xs w-full" />
                         {settings.appIconUrl && (
                           <button 
                             onClick={() => handleImageRemove('appIconUrl')} 
                             className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
                           >
                             <i className="fas fa-trash"></i> Remover Ícone
                           </button>
                         )}
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          )}

          {/* HOME & CONTACT SETTINGS */}
          {activeTab === 'home' && (
            <div className="space-y-8">
               <div>
                  <h3 className="text-sm font-bold uppercase mb-4 text-[#2F6F5E]">Redes Sociais</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <input className="admin-input" placeholder="WhatsApp Link" value={settings.whatsappLink || ''} onChange={e => setSettings({...settings, whatsappLink: e.target.value})} />
                    <input className="admin-input" placeholder="Instagram Link" value={settings.instagramLink || ''} onChange={e => setSettings({...settings, instagramLink: e.target.value})} />
                    <input className="admin-input" placeholder="Facebook Link" value={settings.facebookLink || ''} onChange={e => setSettings({...settings, facebookLink: e.target.value})} />
                  </div>
               </div>

               <div>
                  <h3 className="text-sm font-bold uppercase mb-4 text-[#2F6F5E]">Conteúdo Hero</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                     <div className="col-span-2">
                       <input className="admin-input" placeholder="URL Imagem Fundo" value={settings.heroImage} onChange={e => setSettings({...settings, heroImage: e.target.value})} />
                     </div>
                     <input className="admin-input" placeholder="Botão 1 Texto" value={settings.heroButtonTextSchedule} onChange={e => setSettings({...settings, heroButtonTextSchedule: e.target.value})} />
                     <input className="admin-input" placeholder="Botão 2 Texto" value={settings.heroButtonTextCuts} onChange={e => setSettings({...settings, heroButtonTextCuts: e.target.value})} />
                  </div>
                  
                  <div className="space-y-4">
                    {[1, 2, 3].map(num => (
                      <div key={num} className="border border-gray-100 p-4 rounded-xl bg-gray-50">
                        <span className="text-[10px] font-bold text-gray-400 block mb-2">CARD {num}</span>
                        <input className="admin-input mb-2 font-bold" value={(settings as any)[`feature${num}Title`] || ''} onChange={e => setSettings({...settings, [`feature${num}Title`]: e.target.value})} />
                        <textarea className="admin-input text-sm h-16" value={(settings as any)[`feature${num}Description`] || ''} onChange={e => setSettings({...settings, [`feature${num}Description`]: e.target.value})} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <input className="admin-input" placeholder="Frase Rodapé" value={settings.footerQuote} onChange={e => setSettings({...settings, footerQuote: e.target.value})} />
                  </div>
               </div>
            </div>
          )}

          {/* CUTS / PORTFOLIO */}
          {activeTab === 'cuts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase">Itens ilimitados</span>
                <button onClick={addCut} className="bg-[#2F6F5E] text-white px-4 py-2 text-xs font-bold rounded-xl shadow hover:bg-[#1A4238] transition-colors">
                  + Adicionar Corte
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {cuts.map((cut, idx) => (
                  <div key={cut.id} className="border border-gray-100 p-4 bg-gray-50 rounded-xl">
                     <div className="flex justify-between mb-2 items-center">
                        <span className="font-bold text-xs text-gray-400">SLOT #{idx + 1}</span>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => removeCut(cut.id)} className="text-[11px] font-bold text-red-500 hover:text-red-700">Remover</button>
                          <input type="checkbox" checked={cut.active} onChange={e => {
                             const n = [...cuts]; n[idx].active = e.target.checked; setCuts(n);
                        }} />
                     </div>
                      </div>
                     <input className="admin-input mb-2 font-bold" placeholder="Nome" value={cut.name} onChange={e => { const n = [...cuts]; n[idx].name = e.target.value; setCuts(n); }} />
                     <input className="admin-input mb-2 text-xs" placeholder="Detalhe" value={cut.technicalName} onChange={e => { const n = [...cuts]; n[idx].technicalName = e.target.value; setCuts(n); }} />
                     <input className="admin-input text-xs mb-3" placeholder="URL Imagem" value={cut.imageUrl} onChange={e => { const n = [...cuts]; n[idx].imageUrl = e.target.value; setCuts(n); }} />
                     
                     <div className="flex items-center gap-2 mb-3 bg-white p-2 border border-gray-200 rounded-lg">
                       <input 
                         type="checkbox" 
                         checked={cut.isChild || false} 
                         onChange={e => { const n = [...cuts]; n[idx].isChild = e.target.checked; setCuts(n); }} 
                         className="w-4 h-4 text-[#2F6F5E]"
                       />
                       <span className="text-xs font-bold text-gray-600 uppercase">É um estilo infantil?</span>
                     </div>

                     <div className="border-t pt-3 border-gray-200">
                       <span className="text-[10px] font-bold text-gray-400 block mb-2 uppercase">Opções do Item (Sub-escolhas)</span>
                       <div className="grid grid-cols-2 gap-2">
                         {[0, 1, 2, 3].map(optIdx => (
                           <input 
                              key={optIdx}
                              className="admin-input text-xs px-2 py-1"
                              placeholder={`Opção ${optIdx + 1}`}
                              value={cut.options?.[optIdx] || ''}
                              onChange={e => updateItemOptions(idx, optIdx, e.target.value, cuts, setCuts)}
                           />
                         ))}
                       </div>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRODUCTS (NEW TAB) */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase">Itens ilimitados</span>
                <button onClick={addProduct} className="bg-[#2F6F5E] text-white px-4 py-2 text-xs font-bold rounded-xl shadow hover:bg-[#1A4238] transition-colors">
                  + Adicionar Produto
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {products.map((prod, idx) => (
                  <div key={prod.id} className="border border-gray-100 p-4 bg-gray-50 rounded-xl">
                     <div className="flex justify-between mb-2 items-center">
                        <span className="font-bold text-xs text-gray-400">SLOT #{idx + 1}</span>
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => removeProduct(prod.id)} className="text-[11px] font-bold text-red-500 hover:text-red-700">Remover</button>
                          <input type="checkbox" checked={prod.active} onChange={e => {
                             const n = [...products]; n[idx].active = e.target.checked; setProducts(n);
                        }} />
                     </div>
                      </div>
                     <input className="admin-input mb-2 font-bold" placeholder="Nome do Produto" value={prod.name} onChange={e => { const n = [...products]; n[idx].name = e.target.value; setProducts(n); }} />
                     <input className="admin-input mb-2 text-xs" placeholder="Descrição Curta" value={prod.description} onChange={e => { const n = [...products]; n[idx].description = e.target.value; setProducts(n); }} />
                     <div className="flex gap-2 mb-2">
                        <input type="number" className="admin-input w-24" placeholder="Preço" value={prod.price} onChange={e => { const n = [...products]; n[idx].price = Number(e.target.value); setProducts(n); }} />
                        <input className="admin-input text-xs flex-1" placeholder="URL Imagem" value={prod.imageUrl} onChange={e => { const n = [...products]; n[idx].imageUrl = e.target.value; setProducts(n); }} />
                     </div>

                     <div className="flex items-center gap-2 mb-3 bg-white p-2 border border-gray-200 rounded-lg max-w-xs mt-2">
                        <input 
                          type="checkbox" 
                          checked={prod.notForKids || false} 
                          onChange={e => { const n = [...products]; n[idx].notForKids = e.target.checked; setProducts(n); }} 
                          className="w-4 h-4 text-red-500"
                        />
                        <span className="text-xs font-bold text-red-500 uppercase">🚫 Não p/ Criança</span>
                     </div>

                     <div className="border-t pt-3 border-gray-200 mt-2">
                       <span className="text-[10px] font-bold text-gray-400 block mb-2 uppercase">Opções (Ex: Tamanho/Cor)</span>
                       <div className="grid grid-cols-2 gap-2">
                         {[0, 1, 2, 3].map(optIdx => (
                           <input 
                              key={optIdx}
                              className="admin-input text-xs px-2 py-1"
                              placeholder={`Opção ${optIdx + 1}`}
                              value={prod.options?.[optIdx] || ''}
                              onChange={e => updateItemOptions(idx, optIdx, e.target.value, products, setProducts)}
                           />
                         ))}
                       </div>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SERVICES */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase">Itens ilimitados</span>
                <button onClick={addService} className="bg-[#2F6F5E] text-white px-4 py-2 text-xs font-bold rounded-xl shadow hover:bg-[#1A4238] transition-colors">
                  + Adicionar Serviço
                </button>
              </div>
              {services.map((svc, idx) => (
                <div key={svc.id} className="border border-gray-100 p-4 bg-gray-50 rounded-xl">
                   <div className="flex justify-between items-center mb-2">
                     <span className="font-bold text-xs text-gray-400">SLOT #{idx + 1}</span>
                     <button type="button" onClick={() => removeService(svc.id)} className="text-[11px] font-bold text-red-500 hover:text-red-700">Remover</button>
                   </div>
                   <div className="flex flex-col md:flex-row gap-4 items-center mb-3">
                     <div className="flex-1 w-full">
                        
                        <input className="admin-input mb-1 font-bold" placeholder="Nome" value={svc.name} onChange={e => { const n = [...services]; n[idx].name = e.target.value; setServices(n); }} />
                        <input className="admin-input text-xs" placeholder="Desc" value={svc.description} onChange={e => { const n = [...services]; n[idx].description = e.target.value; setServices(n); }} />
                     </div>
                     <div className="w-24">
                        <input type="number" className="admin-input" value={svc.price} onChange={e => { const n = [...services]; n[idx].price = Number(e.target.value); setServices(n); }} />
                     </div>
                     <input type="checkbox" checked={svc.active} onChange={e => { const n = [...services]; n[idx].active = e.target.checked; setServices(n); }} />
                   </div>
                   
                   <div className="flex flex-col gap-2">
                     <div className="flex items-center gap-2 bg-white p-2 border border-gray-200 rounded-lg max-w-xs">
                         <input 
                           type="checkbox" 
                           checked={svc.isChild || false} 
                           onChange={e => { const n = [...services]; n[idx].isChild = e.target.checked; setServices(n); }} 
                           className="w-4 h-4 text-[#2F6F5E]"
                         />
                         <span className="text-xs font-bold text-gray-600 uppercase">É um serviço infantil?</span>
                     </div>
                     <div className="flex items-center gap-2 bg-white p-2 border border-gray-200 rounded-lg max-w-xs">
                         <input 
                           type="checkbox" 
                           checked={svc.notForKids || false} 
                           onChange={e => { const n = [...services]; n[idx].notForKids = e.target.checked; setServices(n); }} 
                           className="w-4 h-4 text-red-500"
                         />
                         <span className="text-xs font-bold text-red-500 uppercase">🚫 Não p/ Criança</span>
                     </div>
                   </div>

                   <div className="border-t pt-3 border-gray-200 mt-3">
                     <span className="text-[10px] font-bold text-gray-400 block mb-2 uppercase">Opções do Serviço</span>
                     <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                       {[0, 1, 2, 3].map(optIdx => (
                         <input 
                            key={optIdx}
                            className="admin-input text-xs px-2 py-1"
                            placeholder={`Opção ${optIdx + 1}`}
                            value={svc.options?.[optIdx] || ''}
                            onChange={e => updateItemOptions(idx, optIdx, e.target.value, services, setServices)}
                         />
                       ))}
                     </div>
                   </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
      <style>{`
        .admin-input { width: 100%; padding: 12px; border: 1px solid #E0E0E0; outline: none; background: white; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 14px; }
        .admin-input:focus { border-color: #2F6F5E; }
      `}</style>
    </div>
  );
};

export default Admin;
