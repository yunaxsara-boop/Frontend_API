import React, { useState, useRef, useEffect } from "react";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import "./Chatbot.css";
import { sendMessage } from "../features/chatbot/chatbotApi";

const SUGGESTIONS = [
  "Comment créer une demande de brevet ?",
  "Quel est le délai de traitement ?",
  "Comment suivre mon paiement ?",
  "Comment déposer un recours ?",
];

export default function Chatbot() {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Bonjour ! Je suis votre assistant brevets. Comment puis-je vous aider aujourd'hui ?",
    },
  ]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef(null);
  const inputRef                = useRef(null);

  // Scroll en bas à chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input quand le chat s'ouvre
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  async function handleSend(text) {
    const content = (text || input).trim();
    if (!content || loading) return;

    const userMsg = { role: "user", content };
    const next    = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      // On envoie uniquement role+content à l'API (sans le 1er message assistant hardcodé)
      const apiMessages = next
        .slice(1)
        .map(({ role, content }) => ({ role, content }));

      const reply = await sendMessage(apiMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Désolé, une erreur est survenue. Veuillez réessayer.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleReset() {
    setMessages([
      {
        role: "assistant",
        content: "Bonjour ! Je suis votre assistant brevets. Comment puis-je vous aider aujourd'hui ?",
      },
    ]);
  }

  return (
    <>
      {/* ── BULLE FLOTTANTE ── */}
      <button
        className={`chatbot-fab ${open ? "open" : ""}`}
        onClick={() => setOpen((v) => !v)}
        title="Assistant IA"
      >
        {open
          ? <CloseIcon style={{ fontSize: 24 }} />
          : <SmartToyIcon style={{ fontSize: 26 }} />}
        {!open && messages.length > 1 && (
          <span className="chatbot-fab-badge">{messages.filter(m => m.role === "assistant").length - 1}</span>
        )}
      </button>

      {/* ── PANEL ── */}
      {open && (
        <div className="chatbot-panel">

          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <div className="chatbot-avatar">
                <SmartToyIcon style={{ fontSize: 20 }} />
              </div>
              <div>
                <div className="chatbot-header-title">Assistant Brevets</div>
                <div className="chatbot-header-sub">
                  <span className="chatbot-dot" /> En ligne
                </div>
              </div>
            </div>
            <button className="chatbot-reset-btn" onClick={handleReset} title="Nouvelle conversation">
              <AutorenewIcon style={{ fontSize: 18 }} />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chatbot-msg chatbot-msg-${msg.role}`}>
                {msg.role === "assistant" && (
                  <div className="chatbot-msg-avatar">
                    <SmartToyIcon style={{ fontSize: 14 }} />
                  </div>
                )}
                <div className="chatbot-bubble">
                  {msg.content.split("\n").map((line, j) => (
                    <span key={j}>{line}{j < msg.content.split("\n").length - 1 && <br />}</span>
                  ))}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="chatbot-msg chatbot-msg-assistant">
                <div className="chatbot-msg-avatar">
                  <SmartToyIcon style={{ fontSize: 14 }} />
                </div>
                <div className="chatbot-bubble chatbot-typing">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions (seulement au début) */}
          {messages.length === 1 && (
            <div className="chatbot-suggestions">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="chatbot-suggestion" onClick={() => handleSend(s)}>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input-wrap">
            <textarea
              ref={inputRef}
              className="chatbot-input"
              placeholder="Posez votre question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              disabled={loading}
            />
            <button
              className="chatbot-send-btn"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              title="Envoyer"
            >
              <SendIcon style={{ fontSize: 18 }} />
            </button>
          </div>

        </div>
      )}
    </>
  );
}