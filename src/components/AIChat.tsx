import React, { useEffect, useRef } from "react";
import { Brain, X, Send, Bot, User, Trash2 } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAI } from "../hooks/useIA";
import { useAIChatSelector } from "../stores/useAppStore";
import { cn } from "../utils/cn";
import type { AIMessage } from "../types";

interface MessageItemProps {
  message: AIMessage;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.type === "user";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] p-3 rounded-lg animate-fade-in-up",
          isUser ? "bg-blue-600 text-white" : "bg-gray-700/50 text-gray-100"
        )}
      >
        <div className="flex items-start gap-2">
          {!isUser && (
            <Bot className="w-4 h-4 mt-0.5 text-purple-400 flex-shrink-0" />
          )}
          {isUser && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}

          <div className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.content}
          </div>
        </div>

        <div
          className={cn(
            "text-xs mt-2 opacity-70",
            isUser ? "text-blue-100" : "text-gray-400"
          )}
        >
          {message.timestamp.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
};

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-700/50 text-gray-100 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-purple-400" />
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AIChat: React.FC = () => {
  const chatEndRef = useRef<HTMLDivElement>(null);

  const aiChat = useAIChatSelector();
  const {
    sendMessage,
    toggleChat,
    clearChat,
    setInput,
    isConfigured,
    canSendMessage,
    messagesCount,
  } = useAI();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiChat.messages]);

  const handleSendMessage = () => {
    if (canSendMessage) {
      sendMessage(aiChat.input);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!aiChat.isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[32rem] bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-2xl z-30 flex flex-col animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-semibold text-gray-100">IA Assistant</span>
            {!isConfigured && (
              <div className="text-xs text-orange-400">
                Configuração necessária
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Clear Chat Button */}
          {messagesCount > 1 && (
            <Button
              onClick={clearChat}
              variant="ghost"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              title="Limpar chat"
            />
          )}

          {/* Close Button */}
          <Button
            onClick={toggleChat}
            variant="ghost"
            size="sm"
            icon={<X className="w-4 h-4" />}
            title="Fechar chat"
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!isConfigured && (
          <div className="p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg">
            <p className="text-orange-300 text-sm">
              ⚠️ Configure sua API key da OpenAI para usar o chat da IA
            </p>
          </div>
        )}

        {aiChat.messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}

        {aiChat.isTyping && <TypingIndicator />}

        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700/50">
        <div className="flex gap-2">
          <Input
            value={aiChat.input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isConfigured
                ? "Digite sua mensagem..."
                : "Configure a IA primeiro..."
            }
            disabled={!isConfigured || aiChat.isTyping}
            className="flex-1"
          />

          <Button
            onClick={handleSendMessage}
            disabled={!canSendMessage || !isConfigured}
            loading={aiChat.isTyping}
            icon={<Send className="w-4 h-4" />}
            title="Enviar mensagem"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-1 mt-2">
          {[
            "Como está minha produtividade?",
            "Criar projeto sobre...",
            "Reunião às 15h sobre...",
          ].map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setInput(suggestion)}
              disabled={!isConfigured || aiChat.isTyping}
              className="text-xs px-2 py-1 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIChat;
