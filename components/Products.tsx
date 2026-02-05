
import React, { useState, useEffect } from 'react';
import { dataProvider } from '../dataProvider';
import { ProductItem, BusinessSettings } from '../types';
import { DEFAULT_SETTINGS } from '../constants';

const Products: React.FC = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const fetchData = async () => {
      const [fetchedProducts, fetchedSettings] = await Promise.all([
        dataProvider.getProducts(),
        dataProvider.getSettings()
      ]);
      setProducts(fetchedProducts.filter(p => p.active && p.name.trim() !== ''));
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

  const handleInterest = (productName: string) => {
    const slug = createSlug(settings.name);
    const shopName = settings.name || 'Barbearia';

    let msg = `loja-${slug}\n`;
    msg += `📦 Loja — *${shopName}*\n\n`;
    msg += `Olá! Tenho interesse no produto: *${productName}*`;
    
    window.open(`https://wa.me/${settings.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="p-6 pb-24 min-h-screen lg:max-w-6xl lg:mx-auto">
      <div className="mb-10 animate-in">
        <h2 className="text-3xl font-black font-header text-[#1C1C1C] mb-2">Produtos</h2>
        <p className="text-gray-500 font-body">Cuidados essenciais para o seu dia a dia.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.length === 0 && <p className="col-span-4 text-gray-400">Nenhum produto disponível no momento.</p>}

        {products.map((product, idx) => (
          <div 
            key={product.id} 
            className="urban-card overflow-hidden flex flex-col h-full animate-in group"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div className="h-48 bg-gray-100 relative overflow-hidden">
               {product.imageUrl ? (
                 <img 
                   src={product.imageUrl} 
                   alt={product.name} 
                   className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                 />
               ) : (
                 <div className="flex items-center justify-center h-full text-gray-300">
                    <i className="fas fa-box text-3xl"></i>
                 </div>
               )}
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
               <div className="flex justify-between items-start mb-2">
                 <h3 className="font-header font-bold text-lg text-[#1C1C1C] leading-tight">{product.name}</h3>
               </div>
               
               <p className="text-sm text-gray-500 font-body mb-4 flex-1">{product.description}</p>
               
               <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                  <span className="font-black text-lg text-[#2F6F5E]">R$ {product.price}</span>
                  <button 
                    onClick={() => handleInterest(product.name)}
                    className="text-xs font-bold uppercase tracking-wider border border-[#1C1C1C] px-3 py-2 rounded hover:bg-[#1C1C1C] hover:text-white transition-colors"
                  >
                    Comprar
                  </button>
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
