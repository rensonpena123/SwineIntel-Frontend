import { useState } from 'react'

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-6">
      {/* Container with a border and shadow to test layout utilities */}
      <div className="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl p-8 border border-emerald-500/30 text-center">
        
        <h1 className="text-4xl font-extrabold text-emerald-400 mb-4 tracking-tight">
          SwineIntel
        </h1>
        
        <p className="text-slate-400 text-lg mb-8">
          If you see a dark background and <span className="text-emerald-400 font-bold underline">emerald text</span>, Tailwind is working perfectly.
        </p>

        <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20">
          Tailwind Test Button
        </button>
        
      </div>
    </div>
  )
}

export default App