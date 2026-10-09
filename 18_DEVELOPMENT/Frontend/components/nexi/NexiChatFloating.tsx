'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Sparkles, Bot, Send, X, Minimize2, Compass, MapPin, CreditCard, User, 
  Calendar, ShieldCheck, Lock, AlertCircle, ArrowRight, RefreshCw, CheckCircle2
} from 'lucide-react';
import { sendNexiChatMessage, NexiChatResponse } from '@/lib/nexi-api';

interface ChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT';
  content: string;
  actions?: NexiChatResponse['actions'];
  timestamp: Date;
}

export function NexiChatFloating() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide on admin routes completely
  if (pathname?.startsWith('/bharatyatra-ops')) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Welcome Message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome-1',
          role: 'ASSISTANT',
          content: "Hi! I'm **NEXI**, your BharatYatra travel assistant 24/7.\n\nI can help you plan trips, understand your itinerary, check your bookings, suggest packing lists, and answer travel questions.",
          actions: [
            { type: 'OPEN_PLANNER', label: 'Plan a Trip' },
            { type: 'OPEN_TRIP', label: 'My Next Trip' },
            { type: 'OPEN_BOOKING', label: 'My Bookings' },
            { type: 'OPEN_PROFILE', label: 'Travel Preferences' },
          ],
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsgObj: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'USER',
      content: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsgObj]);
    if (!textToSend) setInputMessage('');
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await sendNexiChatMessage(query, conversationId);
      if (res.conversationId) {
        setConversationId(res.conversationId);
      }

      const botMsgObj: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'ASSISTANT',
        content: res.message,
        actions: res.actions,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsgObj]);
    } catch (err: any) {
      setErrorMsg(err.message || 'NEXI encountered a temporary connection issue.');
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: NonNullable<NexiChatResponse['actions']>[number]) => {
    switch (action.type) {
      case 'OPEN_TRIP':
        if (action.payload?.tripId) {
          router.push(`/my-trips/${action.payload.tripId}`);
        } else {
          router.push('/my-trips');
        }
        setIsOpen(false);
        break;

      case 'OPEN_BOOKING':
        router.push('/dashboard');
        setIsOpen(false);
        break;

      case 'OPEN_PROFILE':
        router.push('/profile');
        setIsOpen(false);
        break;

      case 'OPEN_PLANNER':
        const dest = action.payload?.destination ? `?destination=${encodeURIComponent(action.payload.destination)}` : '';
        router.push(`/plan${dest}`);
        setIsOpen(false);
        break;

      case 'OPEN_PAYMENT_PAGE':
        router.push('/checkout');
        setIsOpen(false);
        break;

      case 'CONFIRM_PROFILE_UPDATE':
        handleSendMessage(`Confirm update ${action.payload?.key} to ${action.payload?.value}`);
        break;

      default:
        break;
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-700 text-slate-950 font-black px-4 py-3.5 rounded-full shadow-2xl shadow-amber-500/30 border border-amber-300/40 transition-all duration-300 hover:scale-105 group cursor-pointer"
          aria-label="Open NEXI AI Travel Assistant"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6 text-slate-950 transition-transform group-hover:rotate-12" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-900 border-2 border-amber-400 rounded-full animate-ping" />
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="text-xs font-black tracking-wider uppercase">NEXI AI</span>
            <span className="text-[10px] font-semibold text-slate-900/80">24/7 Travel Assistant</span>
          </div>
        </button>
      )}

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-6 md:right-6 z-50 w-full md:w-[420px] h-[100dvh] md:h-[620px] bg-slate-950 border border-slate-800 rounded-none md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Panel Header */}
          <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm text-white">NEXI AI</h3>
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Your 24/7 BharatYatra Personal Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Minimize NEXI"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Close NEXI"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Security Notice Banner */}
          <div className="bg-slate-900/60 border-b border-slate-800 px-4 py-2 flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>NEXI assists with travel plans. Payments remain securely user-controlled.</span>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.role === 'USER' ? 'items-end' : 'items-start'} space-y-1.5`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'USER'
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-br-none shadow-md shadow-amber-500/10'
                      : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-none shadow-lg'
                  }`}
                >
                  {msg.content}
                </div>

                {/* Safe Action Buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1 max-w-[90%]">
                    {msg.actions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleActionClick(act)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-400 hover:text-amber-300 text-[11px] font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>{act.label || act.type}</span>
                        <ArrowRight className="w-3 h-3 opacity-60" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-2 bg-slate-900/40 border border-slate-800/60 rounded-xl px-3 w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-500" />
                <span>NEXI is analyzing your travel context...</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Dynamic Quick Prompt Chips */}
          <div className="px-4 py-2 bg-slate-900/60 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0 text-[11px]">
            <button
              onClick={() => handleSendMessage('Plan my next trip')}
              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg whitespace-nowrap border border-amber-500/30 transition-colors font-semibold"
            >
              ✨ Plan My Next Trip
            </button>
            <button
              onClick={() => handleSendMessage('What is on my itinerary today?')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg whitespace-nowrap border border-slate-700 transition-colors"
            >
              📍 Today's Itinerary
            </button>
            <button
              onClick={() => handleSendMessage('Show my booking details')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg whitespace-nowrap border border-slate-700 transition-colors"
            >
              🏨 Booking Details
            </button>
            <button
              onClick={() => handleSendMessage('Dwarka ma shu jovu?')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg whitespace-nowrap border border-slate-700 transition-colors"
            >
              ગુજરાતી: દ્વારકા
            </button>
            <button
              onClick={() => handleSendMessage('Dwarka me kya dekhe?')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg whitespace-nowrap border border-slate-700 transition-colors"
            >
              हिंदी: द्वारका
            </button>
            <button
              onClick={() => handleSendMessage('What should I pack?')}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg whitespace-nowrap border border-slate-700 transition-colors"
            >
              🎒 Packing List
            </button>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask NEXI anything about your journey..."
              aria-label="Message NEXI"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="p-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
