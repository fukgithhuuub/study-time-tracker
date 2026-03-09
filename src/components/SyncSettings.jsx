import React, { useState } from 'react';
import { Cloud, CloudUpload, CloudDownload, Key, ShieldCheck, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export function SyncSettings({ secretKey, setSecretKey, syncToCloud, syncFromCloud, isSyncing, lastSynced, error, onClearAllData }) {
  const [keyInput, setKeyInput] = useState(secretKey);
  const [isEditing, setIsEditing] = useState(!secretKey);

  const handleSaveKey = () => {
    if (keyInput.trim()) {
      setSecretKey(keyInput.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-12 text-white animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-2">
          <div className="p-4 bg-blue-600/10 rounded-3xl border border-blue-500/20">
            <Cloud className="text-blue-500" size={40} />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tighter">Cloud Synchronization</h2>
            <p className="text-zinc-500 text-lg font-medium">Keep your progress safe and sync across all your devices.</p>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/50 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-zinc-800 shadow-2xl space-y-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
          <Cloud size={240} />
        </div>

        <div className="flex items-start gap-6 relative">
          <div className="p-5 bg-amber-500/10 rounded-3xl border border-amber-500/20">
            <Key className="text-amber-500" size={32} />
          </div>
          <div className="flex-1 space-y-6">
            <div>
              <h3 className="text-2xl font-black">Secret Sync Key</h3>
              <p className="text-sm text-zinc-500 mt-2 font-medium leading-relaxed">
                Use this unique key to encrypt and access your study data on any platform.
                <span className="text-amber-500/80 italic ml-1 underline decoration-amber-500/30 underline-offset-4">Keep it safe and private!</span>
              </p>
            </div>

            {isEditing ? (
              <div className="flex gap-3">
                <input
                  type="password"
                  placeholder="Enter your secret key"
                  className="flex-1 bg-zinc-950/80 border border-zinc-800 rounded-2xl px-6 py-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                />
                <button
                  onClick={handleSaveKey}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl transition-all duration-300 font-black shadow-lg shadow-blue-900/40 active:scale-95"
                >
                  SAVE
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-zinc-950/80 p-6 rounded-3xl border border-zinc-800 transition-colors hover:border-zinc-700">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-green-500/10 rounded-full">
                    <ShieldCheck className="text-green-500" size={24} />
                  </div>
                  <span className="font-mono text-xl text-zinc-400 tracking-[0.4em]">••••••••••••••••</span>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm font-black text-blue-500 hover:text-blue-400 transition-colors uppercase tracking-widest px-4 py-2 hover:bg-blue-500/5 rounded-xl"
                >
                  EDIT
                </button>
              </div>
            )}
          </div>
        </div>

        {secretKey && (
          <div className="pt-10 border-t border-zinc-800 relative">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={syncToCloud}
                disabled={isSyncing}
                className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-3xl transition-all duration-300 group disabled:opacity-50 shadow-xl shadow-blue-900/20 active:scale-95"
              >
                {isSyncing ? <RefreshCw className="animate-spin" size={24} /> : <CloudUpload size={24} className="group-hover:-translate-y-1 transition-transform" />}
                <span className="font-black text-lg tracking-tight">BACKUP TO CLOUD</span>
              </button>

              <button
                onClick={syncFromCloud}
                disabled={isSyncing}
                className="flex items-center justify-center gap-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 py-5 rounded-3xl transition-all duration-300 group disabled:opacity-50 border border-zinc-700 shadow-xl active:scale-95"
              >
                {isSyncing ? <RefreshCw className="animate-spin" size={24} /> : <CloudDownload size={24} className="group-hover:translate-y-1 transition-transform" />}
                <span className="font-black text-lg tracking-tight">RESTORE DATA</span>
              </button>
            </div>

            <div className="mt-8 flex flex-col items-center gap-4 animate-in fade-in zoom-in-95">
              {lastSynced && (
                <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/40 rounded-full border border-zinc-800">
                  <RefreshCw size={12} className="text-zinc-500" />
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                    Synchronized: {format(lastSynced, 'MMM d, h:mm:ss a')}
                  </p>
                </div>
              )}
              {error && (
                <div className="flex items-center gap-3 text-red-400 text-xs bg-red-950/30 px-6 py-4 rounded-3xl border border-red-900/20">
                  <AlertCircle size={20} className="shrink-0" />
                  <span className="font-bold leading-relaxed">{error}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-blue-900/10 border border-blue-900/20 p-8 rounded-[2rem] space-y-4">
          <h4 className="text-blue-400 font-black text-xl flex items-center gap-3">
             <ShieldCheck size={24} /> Privacy First
          </h4>
          <p className="text-sm text-zinc-500 leading-relaxed font-medium italic">
             "StudyFlow uses your secret key as a unique identifier. We do not collect emails, passwords, or personal names. Your data remains yours, accessible only with your key."
          </p>
        </div>

        <div className="bg-red-900/10 border border-red-900/20 p-8 rounded-[2rem] space-y-6">
          <h4 className="text-red-500 font-black text-xl flex items-center gap-3">
             <Trash2 size={24} /> Danger Zone
          </h4>
          <p className="text-sm text-zinc-500 leading-relaxed font-medium">
             Permanently delete all data from this device.
          </p>
          <button
            onClick={onClearAllData}
            className="w-full py-4 bg-red-950/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-900/30 rounded-2xl transition-all duration-300 font-black text-sm tracking-widest uppercase active:scale-95"
          >
            Purge Local Database
          </button>
        </div>
      </div>
    </div>
  );
}
