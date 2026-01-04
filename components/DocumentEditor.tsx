
import React, { useState, useRef } from 'react';
import { DocumentVariables, PhotoAttachment } from '../types';
import { Plus, Trash2, Wand2, Loader2, Calendar, Clock, Hash, ImagePlus, X, Mail, UserCheck } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface DocumentEditorProps {
  data: DocumentVariables;
  onChange: (data: DocumentVariables) => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ data, onChange }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [workInput, setWorkInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gemini Integration for polishing text
  const polishText = async (field: 'premis' | 'observations') => {
    // Check if API_KEY is available (handled by environment, but check existence)
    if (!process.env.API_KEY) {
      alert("API Key mancante o non accessibile. Impossibile usare l'IA.");
      return;
    }
    
    setIsGenerating(true);
    try {
      // Always use process.env.API_KEY directly when initializing the @google/genai client instance
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        Agisci come un esperto Collaudatore di Opere Pubbliche italiano.
        Riscrivi il seguente testo in un linguaggio tecnico, formale e burocratico appropriato per un Verbale di Collaudo.
        Mantieni il significato originale ma rendilo professionale.
        
        Testo da riscrivere:
        "${data[field]}"
      `;

      // Use gemini-3-flash-preview for basic text tasks like proofreading and formal rewrite
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      // Directly access .text property from GenerateContentResponse
      if (response.text) {
        onChange({ ...data, [field]: response.text.trim() });
      }
    } catch (error) {
      console.error("Error generating text:", error);
      alert("Errore durante la generazione del testo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const addWork = () => {
    if (workInput.trim()) {
      onChange({
        ...data,
        worksExecuted: [...data.worksExecuted, workInput]
      });
      setWorkInput('');
    }
  };

  const removeWork = (index: number) => {
    const newWorks = [...data.worksExecuted];
    newWorks.splice(index, 1);
    onChange({ ...data, worksExecuted: newWorks });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos: PhotoAttachment[] = Array.from(e.target.files).map((file: File) => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        file: file,
        description: ''
      }));
      onChange({ ...data, photos: [...(data.photos || []), ...newPhotos] });
    }
  };

  const removePhoto = (id: string) => {
    const newPhotos = data.photos.filter(p => p.id !== id);
    onChange({ ...data, photos: newPhotos });
  };

  const updatePhotoDescription = (id: string, desc: string) => {
    const newPhotos = data.photos.map(p => 
      p.id === id ? { ...p, description: desc } : p
    );
    onChange({ ...data, photos: newPhotos });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      
      {/* Header Info */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Dati Verbale n. {data.visitNumber}</h2>
            <p className="text-slate-500 text-sm mt-1">Inserisci i dettagli specifici di questo sopralluogo.</p>
          </div>
          <div className="flex items-center gap-2">
             <span className="text-xs text-slate-400">ID: {data.id.slice(0,8)}</span>
             <div className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
               In Modifica
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <Calendar className="w-4 h-4" /> Data Sopralluogo
            </label>
            <input
              type="date"
              className="w-full p-3 border border-slate-300 rounded-lg"
              value={data.date}
              onChange={(e) => onChange({ ...data, date: e.target.value })}
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <Clock className="w-4 h-4" /> Ora Inizio
            </label>
            <input
              type="time"
              className="w-full p-3 border border-slate-300 rounded-lg"
              value={data.time}
              onChange={(e) => onChange({ ...data, time: e.target.value })}
            />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
              <Hash className="w-4 h-4" /> N. Verbale
            </label>
            <input
              type="number"
              className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50"
              value={data.visitNumber}
              onChange={(e) => onChange({ ...data, visitNumber: parseInt(e.target.value) || 0 })}
              title="Puoi modificare manualmente il numero se necessario"
            />
          </div>
          <div className="md:col-span-3">
             <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
               <Mail className="w-4 h-4" /> Dettagli Convocazione
             </label>
             <textarea
               className="w-full p-3 border border-slate-300 rounded-lg h-20 text-sm"
               placeholder="Es: via PEC, in data 10/10/2025, o a seguito di comunicazione per le vie brevi..."
               value={data.convocationDetails || ''}
               onChange={(e) => onChange({ ...data, convocationDetails: e.target.value })}
             />
          </div>
          <div className="md:col-span-3">
             <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
               <UserCheck className="w-4 h-4" /> Soggetti Presenti
             </label>
             <textarea
               className="w-full p-3 border border-slate-300 rounded-lg h-32 text-sm whitespace-pre-wrap"
               placeholder="Elenco dei presenti..."
               value={data.attendees || ''}
               onChange={(e) => onChange({ ...data, attendees: e.target.value })}
             />
             <p className="text-xs text-slate-500 mt-1">Puoi modificare liberamente questo elenco.</p>
          </div>
        </div>
      </div>

      {/* Premise */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
           <div>
             <h3 className="text-lg font-bold text-slate-800">Premesse e Storia Lavori</h3>
             <p className="text-xs text-slate-500">Include automaticamente lo storico dei verbali precedenti se creato con "Nuovo".</p>
           </div>
           <button 
             onClick={() => polishText('premis')}
             disabled={isGenerating}
             className="flex items-center gap-2 text-sm text-purple-600 hover:bg-purple-50 px-3 py-1 rounded-lg transition-colors"
           >
             {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Wand2 className="w-4 h-4" />}
             Riscrivi formalmente con IA
           </button>
        </div>
        <textarea
          className="w-full p-4 border border-slate-300 rounded-lg h-64 text-sm leading-relaxed font-mono"
          placeholder="Inserisci le premesse..."
          value={data.premis}
          onChange={(e) => onChange({ ...data, premis: e.target.value })}
        />
      </div>

      {/* Works List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-2">Lavori Eseguiti (in questo sopralluogo)</h3>
        <p className="text-sm text-slate-500 mb-4 bg-blue-50 p-3 rounded text-blue-800">
           Inserisci SOLO i lavori rilevati in data odierna. Questi verranno aggiunti alla storia nel prossimo verbale.
        </p>
        
        <div className="flex gap-2 mb-4">
          <input 
            type="text" 
            className="flex-1 p-3 border border-slate-300 rounded-lg"
            placeholder="Es: Getto pilastri quota 3,07..."
            value={workInput}
            onChange={(e) => setWorkInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addWork()}
          />
          <button 
            onClick={addWork}
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" /> Aggiungi
          </button>
        </div>

        <ul className="space-y-2">
          {data.worksExecuted.map((work, idx) => (
            <li key={idx} className="flex items-start justify-between bg-slate-50 p-3 rounded border border-slate-100 group">
              <span className="text-slate-700 text-sm font-medium"><span className="text-slate-400 mr-2">{idx+1}.</span>{work}</span>
              <button 
                onClick={() => removeWork(idx)}
                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
          {data.worksExecuted.length === 0 && (
            <li className="text-slate-400 text-sm italic text-center py-4">Nessuna lavorazione inserita per questa data.</li>
          )}
        </ul>
      </div>

      {/* Observations */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-4">
           <h3 className="text-lg font-bold text-slate-800">Osservazioni / Disposizioni</h3>
           <button 
             onClick={() => polishText('observations')}
             disabled={isGenerating}
             className="flex items-center gap-2 text-sm text-purple-600 hover:bg-purple-50 px-3 py-1 rounded-lg transition-colors"
           >
             {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Wand2 className="w-4 h-4" />}
             Riscrivi formalmente con IA
           </button>
        </div>
        <textarea
          className="w-full p-4 border border-slate-300 rounded-lg h-32 text-sm leading-relaxed"
          placeholder="Inserisci disposizioni date all'impresa, verifiche effettuate, ecc..."
          value={data.observations}
          onChange={(e) => onChange({ ...data, observations: e.target.value })}
        />
      </div>

      {/* Photos */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Rilievo Fotografico</h3>
            <p className="text-sm text-slate-500">Le foto vengono collegate dal tuo PC per la stampa.</p>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
          >
            <ImagePlus className="w-4 h-4" />
            Seleziona Foto
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePhotoUpload} 
            multiple 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {data.photos && data.photos.map((photo, idx) => (
            <div key={photo.id} className="relative group border border-slate-200 rounded-lg p-2">
              <img 
                src={photo.url} 
                alt="preview" 
                className="w-full h-32 object-cover rounded bg-slate-100" 
              />
              <button 
                onClick={() => removePhoto(photo.id)}
                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
              <input 
                type="text" 
                placeholder="Didascalia..."
                className="w-full mt-2 text-xs border-b border-slate-200 focus:border-blue-500 outline-none pb-1"
                value={photo.description}
                onChange={(e) => updatePhotoDescription(photo.id, e.target.value)}
              />
            </div>
          ))}
          {(!data.photos || data.photos.length === 0) && (
            <div className="col-span-full text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
              Nessuna foto allegata.
            </div>
          )}
        </div>
      </div>
      
       <div className="flex items-center justify-end">
        <div className="text-xs text-green-600 font-medium flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
           Dati salvati in locale
        </div>
      </div>

    </div>
  );
};