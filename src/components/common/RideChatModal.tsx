import React, { useState, useEffect, useRef } from 'react';
import { safarStore } from '../../services/store';
import { ChatMessage, Language } from '../../types';
import { TRANSLATIONS } from '../../i18n/translations';
import { X, Send, User, ShieldCheck } from 'lucide-react';

interface RideChatModalProps {
  rideId: string;
  currentUserRole: 'passenger' | 'driver';
  currentUserId: string;
  currentUserName: string;
  otherPartyName: string;
  lang: Language;
  onClose: () => void;
}

export const RideChatModal: React.FC<RideChatModalProps> = ({
  rideId,
  currentUserRole,
  currentUserId,
  currentUserName,
  otherPartyName,
  lang,
  onClose,
}) => {
  const t = TRANSLATIONS[lang];
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickMessages = {
    en: [
      "I am waiting at the pickup spot.",
      "Are you near the main bazar?",
      "I am standing by the gate.",
      "Please turn on the AC.",
      "Okay, thanks!",
    ],
    ur: [
      "میں پک اپ کے مقام پر کھڑا ہوں۔",
      "کیا آپ مین بازار کے قریب ہیں؟",
      "میں گیٹ کے سامنے موجود ہوں۔",
      "مہربانی کر کے اے سی آن رکھیں۔",
      "ٹھیک ہے، شکریہ!",
    ],
    sd: [
      "مان پڪ اپ پوائنٽ تي انتظار ڪري رهيو آهيان.",
      "ڇا توهان مين بازار ڀرسان پهچي ويا آهيو؟",
      "مان مين گيٽ وٽ بيٺو آهيان.",
      "مهرباني ڪري اي سي آن رکو.",
      "ٺيڪ آهي، مهرباني!",
    ],
  };

  const syncMessages = () => {
    setMessages(safarStore.getMessages(rideId));
  };

  useEffect(() => {
    syncMessages();
    const unsubscribe = safarStore.subscribe(syncMessages);
    return () => unsubscribe();
  }, [rideId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (textToSend?: string) => {
    const messageContent = (textToSend || inputText).trim();
    if (!messageContent) return;

    safarStore.sendMessage(
      rideId,
      currentUserId,
      currentUserName,
      currentUserRole,
      messageContent
    );
    setInputText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col h-[560px] overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
              <User size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {otherPartyName}
                </h3>
                <ShieldCheck size={16} className="text-emerald-500" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                SafarSindh Secure In-App Chat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40 dark:bg-slate-950/50">
          {messages.length === 0 ? (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm">
              <p>No messages yet.</p>
              <p className="text-xs mt-1">Tap a quick reply below or type a message.</p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.senderRole === currentUserRole;
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-br-xs shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {new Date(m.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Canned Responses */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto flex gap-2 no-scrollbar bg-white dark:bg-slate-900">
          {(quickMessages[lang] || quickMessages.en).map((msg, i) => (
            <button
              key={i}
              onClick={() => handleSend(msg)}
              className="text-xs whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 hover:text-emerald-700 dark:hover:text-emerald-400 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 transition"
            >
              {msg}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.typeMessage}
            className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition shadow-md"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
