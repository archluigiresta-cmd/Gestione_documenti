
import React, { useRef } from 'react';
import { DocumentVariables, PhotoAttachment } from '../types';
import { ImagePlus, X, Save } from 'lucide-react';

interface PhotoManagerProps {
  documents: DocumentVariables[];
  currentDocId: string;
  onSelectDocument: (id: string) => void;
  onUpdateDocument: (doc: DocumentVariables) => void;
}

export const PhotoManager: React.FC<PhotoManagerProps> = ({
  documents,
  currentDocId,
  onSelectDocument,
  onUpdateDocument
}) => {
  const currentDoc = documents.find(d => d.id === currentDocId) || documents[0];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPhotos: PhotoAttachment[] = Array.from(e.target.files).map((file: File) => ({
        id: crypto.randomUUID(),
        url: URL.createObjectURL(file),
        file: file,
        description: ''
      }));
      onUpdateDocument({ ...currentDoc, photos: [...(currentDoc.photos || []), ...newPhotos] });
    }
  };

  const removePhoto = (id: string) => {
    const newPhotos = currentDoc.photos.filter(p => p.id !== id);
    onUpdateDocument({ ...currentDoc, photos: newPhotos });
  };

  const updateDescription = (id: string, desc: string) => {
    const newPhotos = currentDoc.photos.map(p => p.id === id ? { ...p, description: desc } : p);
    onUpdateDocument({ ...currentDoc, photos: newPhotos });
  };

  if (!currentDoc) return <div>Nessun documento selezionato</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
       <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
         <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800">Galleria Fotografica</h2>
            <select 
               className="p-2 border border-blue-200 bg-blue-50 text-blue-800 rounded font-semibold"
               value={currentDocId}
               onChange={(e) => onSelectDocument(e.target.value)}
            >
               {documents.map(d => (
                 <option key={d.id} value={d.id}>
                    Verbale n. {d.visitNumber} del {new Date(d.date).toLocaleDateString()}
                 </option>
               ))}
            </select>
         </div>
         <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-900 hover:bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg"
         >
            <ImagePlus className="w-5 h-5" /> Carica Foto
         </button>
         <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} multiple accept="image/*" className="hidden" />
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 min-h-[500px]">
         {(!currentDoc.photos || currentDoc.photos.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20 border-2 border-dashed border-slate-100 rounded-xl">
               <ImagePlus className="w-16 h-16 mb-4 opacity-20" />
               <p>Nessuna foto caricata per questo verbale.</p>
               <button onClick={() => fileInputRef.current?.click()} className="text-blue-600 mt-2 hover:underline">Carica ora</button>
            </div>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
               {currentDoc.photos.map((photo) => (
                  <div key={photo.id} className="group relative bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
                     <div className="aspect-square bg-slate-100 relative">
                        <img src={photo.url} alt="preview" className="w-full h-full object-cover" />
                        <button 
                           onClick={() => removePhoto(photo.id)}
                           className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                           <X className="w-4 h-4" />
                        </button>
                     </div>
                     <div className="p-3">
                        <input 
                           type="text" 
                           placeholder="Inserisci didascalia..."
                           className="w-full text-sm border-none border-b border-transparent focus:border-blue-500 focus:ring-0 px-0 pb-1"
                           value={photo.description}
                           onChange={(e) => updateDescription(photo.id, e.target.value)}
                        />
                     </div>
                  </div>
               ))}
            </div>
         )}
      </div>
    </div>
  );
};
