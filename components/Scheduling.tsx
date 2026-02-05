
import React, { useState, useEffect } from 'react';
import { ServiceItem, DayType, Appointment, CutSuggestion, ProductItem } from '../types';
import { dataProvider } from '../dataProvider';

interface SchedulingProps {
  settings: any;
}

const STYLE_ON_SITE = 'style_on_site';

const Scheduling: React.FC<SchedulingProps> = ({ settings }) => {
  const [step, setStep] = useState(1);
  const [availableServices, setAvailableServices] = useState<ServiceItem[]>([]);
  const [availableCuts, setAvailableCuts] = useState<CutSuggestion[]>([]);
  const [availableProducts, setAvailableProducts] = useState<ProductItem[]>([]);
  
  // Selection States - Single Select (Radio Logic)
  const [selectedAdultStyleId, setSelectedAdultStyleId] = useState<string>(STYLE_ON_SITE);
  const [selectedChildStyleId, setSelectedChildStyleId] = useState<string>(STYLE_ON_SITE);
  
  // Independent Sub-options State
  const [selectedAdultOption, setSelectedAdultOption] = useState<string | null>(null);
  const [selectedChildOption, setSelectedChildOption] = useState<string | null>(null);
  
  // Universal Product Sub-options (Still map based as products can be multiple)
  const [productOptions, setProductOptions] = useState<Record<string, string>>({});

  const [childName, setChildName] = useState('');
  const [errors, setErrors] = useState({ clientName: false, childName: false });

  const [appointment, setAppointment] = useState<Appointment>({
    services: [],
    products: [],
    dayType: null,
    specificDate: null,
    time: null,
    clientName: ''
  });

  useEffect(() => {
    const loadData = async () => {
      const [services, cuts, products] = await Promise.all([
        dataProvider.getServices(),
        dataProvider.getCuts(),
        dataProvider.getProducts()
      ]);
      
      // Filter services based on Child Cut Toggle
      const filteredServices = services.filter(s => {
        if (!s.active || !s.name) return false;
        // If Child Cut disabled, remove logic
        if (!settings.childCutEnabled) {
          const isChild = s.isChild; // Use the new flag
          if (isChild) return false;
        }
        return true;
      });

      setAvailableServices(filteredServices);
      setAvailableCuts(cuts.filter(c => c.active && c.name));
      setAvailableProducts(products.filter(p => p.active && p.name));
    };
    loadData();
    
    // Check local storage for pre-selected cut (Catalog)
    const savedCut = localStorage.getItem('selected_cut');
    if (savedCut) {
      try {
        const parsed = JSON.parse(savedCut);
        // Assuming catalog selection implies Adult context primarily
        setSelectedAdultStyleId(parsed.id);
        setSelectedAdultOption(null);
      } catch (e) { console.error(e); }
    }
  }, [settings.childCutEnabled]);

  // Helper Logic
  const hasChildCut = appointment.services.some(s => s.isChild);
  const hasAdultCut = appointment.services.some(s => !s.isChild);

  const servicesTotal = appointment.services.reduce((acc, curr) => acc + curr.price, 0);
  const productsTotal = appointment.products.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0);
  const totalValue = servicesTotal + productsTotal;

  // Slug Helper
  const createSlug = (text: string) => {
    return (text || 'Barbearia')
      .toString()
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/&/g, 'e') // Replace & with e
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Service Selection
  const toggleService = (service: ServiceItem) => {
    setAppointment(prev => {
      const exists = prev.services.find(s => s.id === service.id);
      let newServices = [];
      
      if (exists) {
        newServices = prev.services.filter(s => s.id !== service.id);
      } else {
        newServices = [...prev.services, service];
        
        // LOGIC: Conflict Resolution for "Not For Kids" vs "Is Child"
        if (service.isChild) {
           // If adding a Child service, remove any active services that are Not For Kids
           newServices = newServices.filter(s => !s.notForKids);
           
           // Also remove incompatible products
           const validProducts = prev.products.filter(p => !p.item.notForKids);
           if (validProducts.length !== prev.products.length) {
              // We are modifying state in a service toggle, side-effect on products is acceptable here for consistency
              // Ideally, this should be done in a separate effect, but strict mode might double trigger.
              // We will handle product filtering in the render/next step logic or just here.
              // Since products are in a separate step, filtering them in the toggle is safer.
              // Note: We need to return the product state change too, but setAppointment updates the whole object.
              // However, setAppointment returns the new object.
           }
           // We can't easily update products here because we are calculating newServices.
           // We will rely on the products step to hide them, OR we can force update products here:
           // Let's force update products to ensure consistency.
           return { 
             ...prev, 
             services: newServices,
             products: prev.products.filter(p => !p.item.notForKids)
           };
        } else if (service.notForKids) {
           // If adding an Adult Only service, remove any Child services
           newServices = newServices.filter(s => !s.isChild);
        }
      }
      return { ...prev, services: newServices };
    });
  };

  // Service/Product Option Handler
  const handleProductOptionSelect = (itemId: string, option: string) => {
    setProductOptions(prev => ({ ...prev, [itemId]: option }));
  };

  // Product Quantity Logic
  const toggleProduct = (product: ProductItem) => {
    setAppointment(prev => {
      const exists = prev.products.find(p => p.item.id === product.id);
      if (!exists) {
        return { ...prev, products: [...prev.products, { item: product, quantity: 1 }] };
      }
      return prev;
    });
  };

  const removeProduct = (productId: string) => {
    setAppointment(prev => {
      const newProducts = prev.products.filter(p => p.item.id !== productId);
      const newProductOptions = { ...productOptions };
      delete newProductOptions[productId];
      setProductOptions(newProductOptions);
      return { ...prev, products: newProducts };
    });
  };

  const incrementProduct = (product: ProductItem) => {
    setAppointment(prev => {
      const existing = prev.products.find(p => p.item.id === product.id);
      let newProducts;
      if (existing) {
        newProducts = prev.products.map(p => 
          p.item.id === product.id ? { ...p, quantity: Math.min(p.quantity + 1, 99) } : p
        );
      } else {
        newProducts = [...prev.products, { item: product, quantity: 1 }];
      }
      return { ...prev, products: newProducts };
    });
  };

  const decrementProduct = (product: ProductItem) => {
    setAppointment(prev => {
      const existing = prev.products.find(p => p.item.id === product.id);
      let newProducts = prev.products;
      if (existing) {
        if (existing.quantity > 1) {
          newProducts = prev.products.map(p => 
            p.item.id === product.id ? { ...p, quantity: p.quantity - 1 } : p
          );
        } else {
          newProducts = prev.products.filter(p => p.item.id !== product.id);
          const newProductOptions = { ...productOptions };
          delete newProductOptions[product.id];
          setProductOptions(newProductOptions);
        }
      }
      return { ...prev, products: newProducts };
    });
  };

  // --- STYLE SELECTION LOGIC (Radio Behavior) ---

  const handleSelectAdultStyle = (id: string) => {
    if (selectedAdultStyleId !== id) {
      setSelectedAdultStyleId(id);
      setSelectedAdultOption(null); // Reset sub-option when changing style
    }
  };

  const handleSelectChildStyle = (id: string) => {
    if (selectedChildStyleId !== id) {
      setSelectedChildStyleId(id);
      setSelectedChildOption(null); // Reset sub-option when changing style
    }
  };

  // --- SUB-OPTION LOGIC ---

  const handleAdultSubOption = (option: string) => {
    setSelectedAdultOption(option);
  };

  const handleChildSubOption = (option: string) => {
    setSelectedChildOption(option);
  };

  // --- VALIDATION & CONFIRMATION ---

  const validateFields = () => {
    const newErrors = {
      clientName: !appointment.clientName.trim(),
      childName: hasChildCut && !childName.trim()
    };
    setErrors(newErrors);
    return !newErrors.clientName && !newErrors.childName;
  };

  const confirmOnWhatsApp = () => {
    if (!validateFields()) return;
    
    // Dynamic Slug and Name
    const slug = createSlug(settings.name);
    const shopName = settings.name || 'Barbearia';

    const formatServiceItem = (name: string, price?: number) => {
      const priceStr = price !== undefined ? ` – R$ ${price},00` : '';
      return `* ${name}${priceStr}`;
    };

    const formatProductName = (name: string, id: string, price: number, quantity: number) => {
      const option = productOptions[id];
      const subTotal = price * quantity;
      const optionStr = option ? ` (${option})` : '';
      return `* ${name}${optionStr} x${quantity} – R$ ${subTotal},00`;
    };

    const servicesList = appointment.services.map(s => formatServiceItem(s.name, s.price)).join('\n');
    const productsList = appointment.products.map(p => formatProductName(p.item.name, p.item.id, p.item.price, p.quantity)).join('\n');

    // Build Style Strings
    const getStyleString = (styleId: string, option: string | null, cutsSource: CutSuggestion[]) => {
      if (styleId === STYLE_ON_SITE) return `- Definir na hora`;
      const cut = cutsSource.find(c => c.id === styleId);
      if (!cut) return '';
      return option ? `- ${cut.name} (${option})` : `- ${cut.name}`;
    };

    const adultStyleText = getStyleString(selectedAdultStyleId, selectedAdultOption, availableCuts);
    const childStyleText = getStyleString(selectedChildStyleId, selectedChildOption, availableCuts);

    // MESSAGE BUILDER
    let msg = `agendamento-${slug}\n`; // Technical Line
    msg += `✂️ Agendamento — *${shopName}*\n\n`; // Pretty Line
    
    msg += `👤 *Cliente:* ${appointment.clientName}\n`;
    if (hasChildCut && childName) msg += `👶 *Cliente Infantil:* ${childName}\n`;
    msg += `\n`;

    if (appointment.services.length > 0) msg += `💈 *Serviços:*\n${servicesList}\n\n`;

    if (appointment.products.length > 0) {
      msg += `🧴 *Produtos:*\n${productsList}\n\n`;
    }

    if (hasAdultCut) {
      msg += `✂️ *Estilo(s) de Corte:*\n`;
      msg += adultStyleText;
      msg += `\n\n`;
    }

    if (hasChildCut) {
       msg += `✂️ *Estilo(s) de Corte Infantil:*\n`;
       msg += childStyleText;
       msg += `\n\n`;
    }

    msg += `💰 *Total Geral:* R$ ${totalValue},00\n\n`;
    msg += `📅 *Data:* ${appointment.specificDate || appointment.dayType}\n`;
    msg += `🕒 *Horário:* ${appointment.time}`;
    
    const phoneClean = settings.phone ? settings.phone.replace(/\D/g, '') : '';
    window.open(`https://wa.me/${phoneClean}?text=${encodeURIComponent(msg)}`, '_blank');
    localStorage.removeItem('selected_cut');
  };

  // Step Navigation Logic
  const handleNextStep = () => {
    if (step === 1) {
       if (appointment.services.length === 0) return alert("Selecione um serviço");
       // If products enabled, go to step 2 (Products), else skip to 3 (Date)
       if (settings.productsEnabled && availableProducts.length > 0) {
         setStep(2);
       } else {
         setStep(3);
       }
    } else if (step === 2) {
       setStep(3);
    } else if (step === 3) {
       if (!appointment.dayType) return alert("Escolha um dia");
       if (appointment.dayType === DayType.OUTRO && !appointment.specificDate) return alert("Escolha uma data");
       setStep(4);
    } else if (step === 4) {
       if (!appointment.time) return alert("Escolha um horário");
       setStep(5);
    }
  };

  const handleBackStep = () => {
    if (step === 2) setStep(1);
    else if (step === 3) {
      if (settings.productsEnabled && availableProducts.length > 0) setStep(2);
      else setStep(1);
    }
    else if (step === 4) setStep(3);
    else if (step === 5) setStep(4);
  };

  // Render Sub-Options Helpers
  const renderProductSubOptions = (item: any, isSelected: boolean) => {
    const validOptions = item.options?.filter((o: string) => o && o.trim() !== '') || [];
    if (!isSelected || validOptions.length === 0) return null;

    return (
      <div className="mt-2 flex flex-wrap gap-2 animate-in pl-1">
        {validOptions.map((opt: string, idx: number) => {
           const isOptSelected = productOptions[item.id] === opt;
           return (
             <button
               key={idx}
               onClick={(e) => { e.stopPropagation(); handleProductOptionSelect(item.id, opt); }}
               className={`text-[10px] uppercase font-bold px-2 py-1 rounded border transition-colors ${
                 isOptSelected ? 'bg-[#2F6F5E] text-white border-[#2F6F5E]' : 'bg-gray-100 text-gray-500 border-gray-200 hover:border-gray-300'
               }`}
             >
               {opt}
             </button>
           );
        })}
      </div>
    );
  };

  const renderStyleSubOptions = (
    item: CutSuggestion, 
    isSelected: boolean, 
    currentOption: string | null, 
    onSelectOption: (opt: string) => void
  ) => {
    const validOptions = item.options?.filter((o: string) => o && o.trim() !== '') || [];
    if (!isSelected || validOptions.length === 0) return null;

    return (
      <div className="mt-2 flex flex-wrap gap-2 animate-in pl-1">
        {validOptions.map((opt: string, idx: number) => {
           const isOptSelected = currentOption === opt;
           return (
             <button
               key={idx}
               onClick={(e) => { e.stopPropagation(); onSelectOption(opt); }}
               className={`text-[10px] uppercase font-bold px-2 py-1 rounded border transition-colors ${
                 isOptSelected ? 'bg-[#2F6F5E] text-white border-[#2F6F5E]' : 'bg-gray-100 text-gray-500 border-gray-200 hover:border-gray-300'
               }`}
             >
               {opt}
             </button>
           );
        })}
      </div>
    );
  };

  const maxSteps = 5;

  return (
    <div className="p-6 pb-24 min-h-screen lg:max-w-2xl lg:mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-black font-header text-[#1C1C1C]">Agendamento</h2>
        <div className="flex gap-2 mt-2">
            {[1, 2, 3, 4, 5].map(s => (
                <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-[#2F6F5E]' : 'bg-gray-200'}`}></div>
            ))}
        </div>
      </div>

      <div className="urban-card p-6 md:p-10">
        
        {/* Step 1: Services & Styles */}
        {step === 1 && (
          <div className="animate-in space-y-6">
            <div className="flex justify-between items-center mb-4">
                 <label className="text-sm font-bold uppercase tracking-wide text-gray-400">Selecione os serviços</label>
                 <span className="text-[#2F6F5E] font-bold text-lg">Subtotal: R$ {servicesTotal}</span>
            </div>
            
            {hasChildCut && (
               <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs p-3 rounded-lg mb-4 animate-in">
                 <i className="fas fa-info-circle mr-2"></i>
                 Alguns serviços não são exibidos quando o Corte Infantil está selecionado.
               </div>
            )}

            {/* Services List */}
            <div className="space-y-3">
                {availableServices.map(service => {
                  const isSelected = appointment.services.some(s => s.id === service.id);
                  // HIDE if service is not for kids AND we have a child cut selected
                  if (hasChildCut && service.notForKids) return null;

                  return (
                    <div key={service.id}>
                      <button
                        onClick={() => toggleService(service)}
                        className={`w-full p-4 flex justify-between items-center border-2 rounded-xl transition-all ${
                          isSelected 
                            ? 'bg-[#2F6F5E]/5 border-[#2F6F5E] text-[#2F6F5E]' 
                            : 'bg-white border-transparent hover:border-gray-200 text-gray-700 shadow-sm'
                        }`}
                      >
                        <span className="font-bold font-header flex items-center gap-2">
                          {service.name}
                          {service.isChild && <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full uppercase">Infantil</span>}
                          {service.notForKids && !hasChildCut && <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full uppercase">Adulto</span>}
                        </span>
                        <span className="font-bold text-sm">R$ {service.price}</span>
                      </button>
                    </div>
                  );
                })}
            </div>

            {/* Adult Styles Selection */}
            {hasAdultCut && (
              <div className="mt-8">
                <label className="text-sm font-bold uppercase tracking-wide text-gray-400 block mb-3">Estilo de Corte</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button 
                     onClick={() => handleSelectAdultStyle(STYLE_ON_SITE)}
                     className={`w-full px-4 py-2 text-sm font-bold rounded-lg border-2 transition-all ${
                       selectedAdultStyleId === STYLE_ON_SITE
                        ? 'bg-gray-800 text-white border-gray-800' 
                        : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                     }`}
                  >
                    Definir na hora
                  </button>
                  {availableCuts.map(cut => {
                     const isSelected = selectedAdultStyleId === cut.id;
                     return (
                        <div key={`adult-${cut.id}`} className="flex flex-col">
                          <button 
                            onClick={() => handleSelectAdultStyle(cut.id)}
                            className={`w-full px-4 py-2 text-sm font-bold rounded-lg border-2 transition-all ${
                              isSelected 
                               ? 'bg-[#2F6F5E] text-white border-[#2F6F5E]' 
                               : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            {cut.name}
                          </button>
                          {/* Independent Options for Adult */}
                          {renderStyleSubOptions(cut, isSelected, selectedAdultOption, handleAdultSubOption)}
                        </div>
                     );
                  })}
                </div>
              </div>
            )}

            {/* Child Styles Selection */}
            {hasChildCut && (
              <div className="mt-8 border-t pt-6 border-gray-100">
                 <label className="text-sm font-bold uppercase tracking-wide text-gray-400 block mb-3">Estilo Infantil</label>
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button 
                     onClick={() => handleSelectChildStyle(STYLE_ON_SITE)}
                     className={`w-full px-4 py-2 text-sm font-bold rounded-lg border-2 transition-all ${
                       selectedChildStyleId === STYLE_ON_SITE
                        ? 'bg-gray-800 text-white border-gray-800' 
                        : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                     }`}
                  >
                    Definir na hora
                  </button>
                  {availableCuts.filter(c => c.isChild).map(cut => {
                     const isSelected = selectedChildStyleId === cut.id;
                     return (
                        <div key={`child-${cut.id}`} className="flex flex-col">
                          <button 
                            onClick={() => handleSelectChildStyle(cut.id)}
                            className={`w-full px-4 py-2 text-sm font-bold rounded-lg border-2 transition-all ${
                              isSelected 
                               ? 'bg-[#2F6F5E] text-white border-[#2F6F5E]' 
                               : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'
                            }`}
                          >
                            {cut.name}
                          </button>
                          {/* Independent Options for Child */}
                          {renderStyleSubOptions(cut, isSelected, selectedChildOption, handleChildSubOption)}
                        </div>
                     );
                  })}
                </div>
                {availableCuts.filter(c => c.isChild).length === 0 && (
                  <p className="text-xs text-gray-400 mt-2">Nenhum estilo infantil cadastrado, usaremos "Definir na hora".</p>
                )}
              </div>
            )}

            <button 
              onClick={handleNextStep}
              className="urban-btn w-full py-4 mt-6 text-lg"
            >
              Continuar
            </button>
          </div>
        )}

        {/* Step 2: Products (Optional) */}
        {step === 2 && (
          <div className="animate-in space-y-6">
             <div className="flex flex-col items-center text-center mb-6">
                <h3 className="text-xl font-bold font-header">Quer adicionar um produto?</h3>
                <p className="text-sm text-gray-400">Leve o cuidado da barbearia para casa.</p>
             </div>
             
             {hasChildCut && (
               <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs p-3 rounded-lg mb-4 animate-in">
                 <i className="fas fa-info-circle mr-2"></i>
                 Produtos não recomendados para crianças foram ocultados.
               </div>
             )}

             <div className="grid grid-cols-2 gap-3">
               {availableProducts.map(product => {
                 // HIDE if product is not for kids AND we have a child cut selected
                 if (hasChildCut && product.notForKids) return null;

                 const selectedEntry = appointment.products.find(p => p.item.id === product.id);
                 const quantity = selectedEntry ? selectedEntry.quantity : 0;
                 const isSelected = quantity > 0;

                 return (
                   <div 
                     key={product.id}
                     onClick={() => toggleProduct(product)}
                     className={`border-2 rounded-xl p-3 cursor-pointer transition-all flex flex-col ${isSelected ? 'border-[#2F6F5E] bg-[#2F6F5E]/5' : 'border-gray-100 hover:border-gray-200'}`}
                   >
                      <div className="h-24 bg-gray-100 rounded-lg mb-2 overflow-hidden w-full relative">
                        {product.imageUrl ? <img src={product.imageUrl} className="w-full h-full object-cover" /> : null}
                        {quantity > 0 && (
                          <div className="absolute top-1 right-1 bg-[#2F6F5E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow">
                             x{quantity}
                          </div>
                        )}
                      </div>
                      <h4 className="font-bold text-sm leading-tight mb-1">{product.name}</h4>
                      
                      {/* Price Row */}
                      <div className="mt-auto flex justify-between items-center">
                         <span className="text-xs font-bold text-[#2F6F5E]">R$ {product.price}</span>
                      </div>

                      {/* Controls Row - Only if selected */}
                      {isSelected ? (
                        <div className="mt-2 space-y-2 animate-in" onClick={e => e.stopPropagation()}>
                           {/* Quantity Controls */}
                           <div className="flex items-center bg-white border border-[#2F6F5E] rounded-lg overflow-hidden h-8 w-full">
                              <button 
                                onClick={() => decrementProduct(product)} 
                                className="flex-1 h-full text-[#2F6F5E] hover:bg-gray-100 font-bold text-lg leading-none"
                              >
                                -
                              </button>
                              <span className="text-sm font-bold text-[#1C1C1C] px-2 w-6 text-center">{quantity}</span>
                              <button 
                                onClick={() => incrementProduct(product)} 
                                className="flex-1 h-full text-white bg-[#2F6F5E] hover:bg-[#1A4238] font-bold text-lg leading-none"
                              >
                                +
                              </button>
                           </div>
                           
                           {/* Explicit Remove Button */}
                           <button 
                             onClick={() => removeProduct(product.id)}
                             className="w-full text-[10px] font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
                           >
                             <i className="fas fa-trash"></i> Remover
                           </button>
                        </div>
                      ) : (
                        <div className="mt-2">
                           <div className="w-full py-1.5 rounded-lg border border-gray-300 text-gray-400 text-[10px] font-bold text-center group-hover:border-[#2F6F5E] group-hover:text-[#2F6F5E] transition-colors">
                              Adicionar
                           </div>
                        </div>
                      )}
                      
                      {/* Product Sub Options (Separate helper) */}
                      {renderProductSubOptions(product, isSelected)}
                   </div>
                 );
               })}
             </div>

             <div className="pt-4 flex flex-col gap-3">
                <button 
                   onClick={handleNextStep}
                   className="urban-btn w-full py-3"
                >
                   {appointment.products.length > 0 ? `Continuar (${appointment.products.reduce((a, b) => a + b.quantity, 0)} itens)` : 'Não, continuar sem produtos'}
                </button>
                <button onClick={handleBackStep} className="text-sm font-bold text-gray-400 hover:text-black">Voltar</button>
             </div>
          </div>
        )}

        {/* Step 3: Date */}
        {step === 3 && (
          <div className="animate-in space-y-6">
            <h3 className="text-xl font-bold font-header text-center mb-6">Qual a data?</h3>
            <div className="grid grid-cols-1 gap-3">
              {[DayType.HOJE, DayType.AMANHA, DayType.OUTRO].map(day => (
                <button
                  key={day}
                  onClick={() => {
                     setAppointment(prev => ({...prev, dayType: day}));
                     if (day === DayType.HOJE) setAppointment(p => ({...p, specificDate: new Date().toLocaleDateString()}));
                     if (day !== DayType.OUTRO) handleNextStep();
                  }}
                  className="p-5 border-2 border-gray-100 hover:border-[#2F6F5E] rounded-xl text-left font-bold text-lg transition-colors bg-white text-[#1C1C1C]"
                >
                  {day}
                </button>
              ))}
            </div>
            
            {appointment.dayType === DayType.OUTRO && (
              <div className="mt-2">
                 <input 
                   type="date" 
                   className="w-full p-4 border-2 border-gray-200 rounded-xl outline-none focus:border-[#2F6F5E] font-body bg-white text-lg"
                   onChange={(e) => {
                      if(e.target.value) {
                         setAppointment(p => ({...p, specificDate: e.target.value.split('-').reverse().join('/')}));
                         handleNextStep();
                      }
                   }}
                 />
              </div>
            )}
             <button onClick={handleBackStep} className="text-sm font-bold text-gray-400 mt-4 block mx-auto hover:text-black">Voltar</button>
          </div>
        )}

        {/* Step 4: Time */}
        {step === 4 && (
          <div className="animate-in">
             <h3 className="text-xl font-bold font-header text-center mb-6">Qual horário?</h3>
             <div className="grid grid-cols-3 gap-3 mb-8">
               {['09:00','10:00','11:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'].map(time => (
                 <button
                   key={time}
                   onClick={() => {
                     setAppointment(p => ({...p, time}));
                     handleNextStep();
                   }}
                   className="py-3 bg-gray-50 hover:bg-[#2F6F5E] hover:text-white rounded-lg font-bold text-sm transition-colors text-gray-700"
                 >
                   {time}
                 </button>
               ))}
             </div>
             <button onClick={handleBackStep} className="text-sm font-bold text-gray-400 block mx-auto hover:text-black">Voltar</button>
          </div>
        )}

        {/* Step 5: Confirm */}
        {step === 5 && (
          <div className="animate-in text-center space-y-6">
            <h3 className="text-2xl font-black font-header">Quase lá!</h3>
            
            <div className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Seu Nome</label>
                <input 
                  type="text" 
                  placeholder="Nome Completo"
                  className={`w-full p-4 border-2 rounded-xl text-lg outline-none font-bold ${errors.clientName ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#2F6F5E]'}`}
                  value={appointment.clientName}
                  onChange={e => {
                    setAppointment({...appointment, clientName: e.target.value});
                    setErrors({...errors, clientName: false});
                  }}
                />
              </div>

              {hasChildCut && (
                <div className="animate-in">
                   <label className="block text-xs font-bold uppercase text-gray-400 mb-1">Nome da Criança</label>
                   <input 
                     type="text" 
                     placeholder="Nome do pequeno"
                     className={`w-full p-4 border-2 rounded-xl text-lg outline-none font-bold ${errors.childName ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#2F6F5E]'}`}
                     value={childName}
                     onChange={e => {
                        setChildName(e.target.value);
                        setErrors({...errors, childName: false});
                     }}
                   />
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-6 rounded-xl text-left text-sm space-y-3 mt-4 border border-gray-100">
               <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                 <span className="text-gray-500">Quando:</span>
                 <span className="font-bold text-[#1C1C1C]">{appointment.specificDate || appointment.dayType} às {appointment.time}</span>
               </div>
               
               <div>
                 <span className="text-gray-500 block mb-1">Serviços:</span>
                 <ul className="flex flex-col gap-1">
                   {appointment.services.map(s => (
                     <li key={s.id} className="text-xs font-bold flex items-center gap-2">
                       <span className="bg-white px-2 py-1 rounded border">{s.name}</span>
                     </li>
                   ))}
                 </ul>
               </div>

               {appointment.products.length > 0 && (
                 <div>
                   <span className="text-gray-500 block mb-1">Produtos:</span>
                   <ul className="flex flex-col gap-1">
                     {appointment.products.map(p => (
                       <li key={p.item.id} className="text-xs font-bold flex items-center gap-2">
                          <span className="bg-white px-2 py-1 rounded border">{p.item.name} <span className="text-[#2F6F5E]">x{p.quantity}</span></span>
                          {productOptions[p.item.id] && <span className="text-gray-400 text-[10px] uppercase">({productOptions[p.item.id]})</span>}
                       </li>
                     ))}
                   </ul>
                 </div>
               )}

               {/* Styles Confirmation Summary */}
               {(hasAdultCut || hasChildCut) && (
                 <div>
                   <span className="text-gray-500 block mb-1">Estilo(s) Escolhido(s):</span>
                   <ul className="flex flex-col gap-1">
                     {hasAdultCut && (
                        <li className="text-xs font-bold flex flex-col">
                           <span className="text-gray-400 text-[10px] uppercase">Adulto:</span>
                           <span className="bg-white px-2 py-1 rounded border inline-block self-start">
                             {selectedAdultStyleId === STYLE_ON_SITE 
                               ? 'Definir na hora' 
                               : availableCuts.find(c => c.id === selectedAdultStyleId)?.name || 'Desconhecido'}
                             {selectedAdultOption && <span className="text-gray-400 font-normal ml-1">({selectedAdultOption})</span>}
                           </span>
                        </li>
                     )}
                     {hasChildCut && (
                        <li className="text-xs font-bold flex flex-col mt-1">
                           <span className="text-gray-400 text-[10px] uppercase">Infantil:</span>
                           <span className="bg-white px-2 py-1 rounded border inline-block self-start">
                             {selectedChildStyleId === STYLE_ON_SITE 
                               ? 'Definir na hora' 
                               : availableCuts.find(c => c.id === selectedChildStyleId)?.name || 'Desconhecido'}
                             {selectedChildOption && <span className="text-gray-400 font-normal ml-1">({selectedChildOption})</span>}
                           </span>
                        </li>
                     )}
                   </ul>
                 </div>
               )}

               <div className="pt-3 mt-2 border-t border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-gray-500">Total Estimado</span>
                  <span className="text-xl font-black text-[#2F6F5E]">R$ {totalValue}</span>
               </div>
            </div>

            <button 
              onClick={confirmOnWhatsApp}
              className="urban-btn w-full py-4 text-base flex items-center justify-center gap-3 shadow-xl shadow-[#2F6F5E]/20"
            >
              <i className="fab fa-whatsapp text-lg"></i> Confirmar Agendamento
            </button>
            <button onClick={handleBackStep} className="text-sm font-bold text-gray-400 hover:text-black">Voltar</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scheduling;
