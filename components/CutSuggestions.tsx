
import React, { useState, useEffect } from 'react';
import { dataProvider } from '../dataProvider';
import { CutSuggestion } from '../types';

interface CutSuggestionsProps {
  onNavigate: (tabId: string) => void;
}

const CutSuggestions: React.FC<CutSuggestionsProps> = ({ onNavigate }) => {
  const [cuts, setCuts] = useState<CutSuggestion[]>([]);

  useEffect(() => {
    const loadCuts = async () => {
      const fetchedCuts = await dataProvider.getCuts();
      setCuts(fetchedCuts.filter(c => c.active && c.imageUrl.trim() !== ''));
    };
    loadCuts();
  }, []);

  const handleSelectCut = (cut: CutSuggestion) => {
    localStorage.setItem('selected_cut', JSON.stringify({
      id: cut.id,
      name: cut.name,
      technical: cut.technicalName
    }));
    onNavigate('schedule');
  };

  return (
    <div className="p-4 pb-24 min-h-screen lg:max-w-6xl lg:mx-auto">
      <div className="mb-8 animate-in">
        <h2 className="text-2xl font-black font-header text-[#1C1C1C] mb-1">Catálogo</h2>
        <p className="text-gray-500 font-body text-sm">Referências reais. Escolha o seu estilo.</p>
      </div>

      {/* Grid mudado para 2 colunas no mobile e 4 ou 5 no desktop para diminuir o tamanho individual */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {cuts.length === 0 && <p className="col-span-2 text-gray-400 text-sm">Carregando catálogo...</p>}

        {cuts.map((cut, idx) => (
          <div key={cut.id} className="group animate-in" style={{ animationDelay: `${idx * 50}ms` }}>
            <div className="aspect-[3/4] overflow-hidden rounded-lg bg-gray-200 mb-2 relative shadow-sm cursor-pointer" onClick={() => handleSelectCut(cut)}>
              <img 
                src={cut.imageUrl} 
                alt={cut.name} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {/* Minimal Overlay Button - Smaller for new grid size */}
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                 <button 
                   onClick={(e) => {
                     e.stopPropagation();
                     handleSelectCut(cut);
                   }}
                   className="bg-white text-black px-4 py-2 rounded-full font-bold text-xs transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-md whitespace-nowrap"
                 >
                   Selecionar
                 </button>
              </div>
            </div>
            
            <div className="flex flex-col">
               <h3 className="font-header font-bold text-sm text-[#1C1C1C] leading-tight mb-0.5 truncate">{cut.name}</h3>
               <p className="text-[10px] text-gray-500 uppercase tracking-wide font-bold truncate">{cut.technicalName}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CutSuggestions;
