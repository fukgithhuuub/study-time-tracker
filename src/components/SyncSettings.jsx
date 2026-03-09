import React, { useState } from 'react';
import { Cloud, CloudUpload, CloudDownload, Key, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

export function SyncSettings({ secretKey, setSecretKey, syncToCloud, syncFromCloud, isSyncing, lastSynced, error }) {
  const [keyInput, setKeyInput] = useState(secretKey);
  const [isEditing, setIsEditing] = useState(!secretKey);

  const handleSaveKey = () => {
    if (keyInput.trim()) {
      setSecretKey(keyInput.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8 text-white">
      <div className="flex items-center gap-3 mb-2">
        <Cloud className="text-blue-500" size={32} />
        <h2 className="text-2xl font-bold">Cloud Synchronization</h2>
      </div>

      <p className="text-zinc-400">
        Sync your study progress across devices. Your data is stored offline by default and can be backed up to the cloud using a secret key.
      </p>

      <div className="bg-zinc-800 p-6 rounded-3xl border border-zinc-700 shadow-xl space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-zinc-900 rounded-2xl">
            <Key className="text-amber-500" size={24} />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Secret Sync Key</h3>
              <p className="text-xs text-zinc-500 mt-1">Use this key to access your data on any device. Keep it secret!</p>
            </div>

            {isEditing ? (
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Enter a strong secret key"
                  className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2 outline-none focus:border-blue-500"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                />
                <button
                  onClick={handleSaveKey}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-colors font-medium"
                >
                  Save Key
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-zinc-900 p-4 rounded-xl border border-zinc-700">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-green-500" size={18} />
                  <span className="font-mono text-zinc-300">••••••••••••••••</span>
                </div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Change Key
                </button>
              </div>
            )}
          </div>
        </div>

        {secretKey && (
          <div className="pt-6 border-t border-zinc-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={syncToCloud}
                disabled={isSyncing}
                className="flex items-center justify-center gap-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 py-4 rounded-2xl border border-blue-900/30 transition-all group disabled:opacity-50"
              >
                {isSyncing ? <RefreshCw className="animate-spin" size={20} /> : <CloudUpload size={20} className="group-hover:-translate-y-1 transition-transform" />}
                <span className="font-semibold">Backup to Cloud</span>
              </button>

              <button
                onClick={syncFromCloud}
                disabled={isSyncing}
                className="flex items-center justify-center gap-2 bg-zinc-900/50 hover:bg-zinc-900 text-zinc-300 py-4 rounded-2xl border border-zinc-700 transition-all group disabled:opacity-50"
              >
                {isSyncing ? <RefreshCw className="animate-spin" size={20} /> : <CloudDownload size={20} className="group-hover:translate-y-1 transition-transform" />}
                <span className="font-semibold">Restore from Cloud</span>
              </button>
            </div>

            <div className="mt-6 flex flex-col items-center gap-2">
              {lastSynced && (
                <p className="text-xs text-zinc-500">
                  Last synced: {format(lastSynced, 'MMM d, yyyy h:mm a')}
                </p>
              )}
              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/20 px-4 py-2 rounded-full">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-900/10 border border-blue-900/20 p-6 rounded-3xl">
        <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
           <ShieldCheck size={18} /> Privacy & Security
        </h4>
        <p className="text-sm text-zinc-500 leading-relaxed">
           Your data is associated only with your secret key. We do not store any personal identification or track your sessions individually.
           If you lose your secret key, you cannot recover your cloud backup.
        </p>
      </div>
    </div>
  );
}
