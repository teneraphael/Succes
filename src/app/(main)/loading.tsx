
export default function Loading() {
  return (
    <div className="max-w-[600px] mx-auto p-4 space-y-6">
      {/* On génère 3 faux posts pour remplir l'écran */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4 animate-pulse">
          {/* Header du post (Avatar + Nom) */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
          
          {/* Corps du post (Image ou texte) */}
          <div className="h-64 bg-gray-100 rounded-xl w-full" />
          
          {/* Footer du post (Actions) */}
          <div className="flex space-x-4">
            <div className="h-4 bg-gray-200 rounded w-16" />
            <div className="h-4 bg-gray-200 rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}