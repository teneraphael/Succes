"use client";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
}

export default function TermsModal({ isOpen, onClose, title, content }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[80vh] rounded-xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-2xl font-bold">&times;</button>
        </div>
        
        {/* Corps du texte (Scrollable) */}
        <div className="p-6 overflow-y-auto text-sm leading-relaxed">
          {content}
        </div>

        {/* Footer */}
        <div className="p-4 border-t text-right">
          <button 
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            J&apos;ai compris
          </button>
        </div>
      </div>
    </div>
  );
}