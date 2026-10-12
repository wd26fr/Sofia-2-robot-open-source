import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  Trash2, 
  Download, 
  Search, 
  RefreshCw, 
  Clock, 
  Bot, 
  User, 
  Shield, 
  Filter, 
  BrainCircuit,
  Calendar,
  Sparkles,
  Zap,
  Check
} from 'lucide-react';
import { ChatMessage, RobotPersonality } from '../types';
import { getChatMessages, clearChatMessages } from '../lib/db';

interface IndexedDBConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  robot: RobotPersonality;
}

export const IndexedDBConversationModal: React.FC<IndexedDBConversationModalProps> = ({
  isOpen,
  onClose,
  robot
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSender, setFilterSender] = useState<'all' | 'user' | 'robot'>('all');
  const [isClearing, setIsClearing] = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState(false);

  const loadMessages = async () => {
    if (!robot) return;
    setIsLoading(true);
    try {
      const stored = await getChatMessages(robot.id);
      setMessages(stored || []);
    } catch (err) {
      console.error('Erreur chargement messages IndexedDB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && robot) {
      loadMessages();
      setShowConfirmClear(false);
    }
  }, [isOpen, robot?.id]);

  if (!isOpen) return null;

  const filteredMessages = messages.filter(m => {
    if (filterSender !== 'all' && m.sender !== filterSender) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return m.text.toLowerCase().includes(q) || (m.source && m.source.toLowerCase().includes(q));
    }
    return true;
  });

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      robotId: robot.id,
      robotNom: robot.nom,
      exportedAt: new Date().toISOString(),
      messageCount: messages.length,
      messages: messages
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `conversations_indexeddb_${robot.nom.toLowerCase()}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2500);
  };

  const handleClearHistory = async () => {
    setIsClearing(true);
    try {
      await clearChatMessages(robot.id);
      setMessages([]);
      setShowConfirmClear(false);
    } catch (err) {
      console.error('Erreur purge:', err);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Historique des Conversations (IndexedDB)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/30 text-[10px] font-mono text-indigo-300">
                  {messages.length} messages
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sauvegardes chiffrées AES-256 stockées localement dans votre navigateur pour <strong>{robot.nom}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadMessages}
              disabled={isLoading}
              title="Rafraîchir depuis la base IndexedDB"
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/90 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un mot-clé..."
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Sender Filter Chips */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setFilterSender('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  filterSender === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tous
              </button>
              <button
                type="button"
                onClick={() => setFilterSender('user')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  filterSender === 'user' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3 h-3" /> Toi
              </button>
              <button
                type="button"
                onClick={() => setFilterSender('robot')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                  filterSender === 'robot' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="w-3 h-3" /> {robot.nom}
              </button>
            </div>
          </div>

          {/* Export & Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={handleExportJSON}
              disabled={messages.length === 0}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedStatus ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copiedStatus ? 'Exporté !' : 'Exporter JSON'}</span>
            </button>

            {!showConfirmClear ? (
              <button
                type="button"
                onClick={() => setShowConfirmClear(true)}
                disabled={messages.length === 0}
                className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 disabled:opacity-30 text-rose-300 border border-rose-800/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Effacer</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-rose-950/80 p-1 rounded-xl border border-rose-500/50">
                <span className="text-[10px] text-rose-200 px-1 font-bold">Confirmer purge ?</span>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  disabled={isClearing}
                  className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-bold rounded-lg cursor-pointer"
                >
                  {isClearing ? 'Purge...' : 'Oui, effacer tout'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmClear(false)}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] rounded-lg cursor-pointer"
                >
                  Non
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/40 min-h-[340px] max-h-[500px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
              <p className="text-xs font-mono">Déchiffrement et lecture d'IndexedDB...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500 space-y-2">
              <MessageSquare className="w-10 h-10 opacity-30 text-slate-400" />
              <p className="text-sm font-medium text-slate-400">
                {searchQuery ? 'Aucun message ne correspond à votre recherche.' : 'Aucun message dans l\'historique IndexedDB.'}
              </p>
              <p className="text-xs text-slate-500 max-w-sm">
                Les échanges dans le chat utilisateur ou dans le sandbox de test sont automatiquement mémorisés ici.
              </p>
            </div>
          ) : (
            filteredMessages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              const dateStr = msg.timestamp ? new Date(msg.timestamp).toLocaleString([], {
                dateStyle: 'short',
                timeStyle: 'medium'
              }) : '';

              return (
                <div
                  key={msg.id || idx}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isUser
                      ? 'bg-slate-900/90 border-slate-800 ml-6 sm:ml-12'
                      : 'bg-[#080b14] border-indigo-950/80 mr-6 sm:mr-12'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-lg ${isUser ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/30' : 'bg-indigo-950 text-indigo-400 border border-indigo-500/30'}`}>
                        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-xs font-bold text-white">
                        {isUser ? 'Utilisateur (Toi)' : robot.nom}
                      </span>
                      {msg.source && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                          msg.source === 'generative_ai' 
                            ? 'bg-purple-950/80 text-purple-300 border border-purple-800/40' 
                            : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                        }`}>
                          {msg.source === 'generative_ai' ? '✨ Gemini Cloud' : '⚡ 0-Token Local'}
                        </span>
                      )}
                    </div>
                    {dateStr && (
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {dateStr}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {msg.text}
                  </p>

                  {/* Emotional deltas badge if present */}
                  {msg.deltasJauges && Object.keys(msg.deltasJauges).length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800/60 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] text-slate-400 font-mono">Impact émotionnel :</span>
                      {Object.entries(msg.deltasJauges).map(([k, v]) => (
                        <span key={k} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-indigo-300 font-mono">
                          {k}: {v > 0 ? `+${v}` : v}%
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Stockage local privé (IndexedDB Déxie) • Zéro transfert tiers</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};
