import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AiChatProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AiChat({ isCollapsed, onToggle }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! Describe what you want to build and I\'ll help create a spec for it.' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // TODO: Proxy through CLI/subscription
    // For now, show a placeholder response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'AI integration coming soon. For now, use the CLI to generate specs and they\'ll appear here automatically via file watching.',
        },
      ]);
      setIsLoading(false);
    }, 500);
  };

  if (isCollapsed) {
    return (
      <button
        onClick={onToggle}
        className="w-10 bg-gray-900 border-l border-gray-800 flex items-center justify-center text-gray-500 hover:text-gray-300 transition-colors"
        title="Open AI Chat"
      >
        <span className="rotate-90 text-xs whitespace-nowrap">AI Chat</span>
      </button>
    );
  }

  return (
    <aside className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col h-full">
      <div className="p-3 border-b border-gray-800 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-300">AI Chat</span>
        <button
          onClick={onToggle}
          className="text-gray-500 hover:text-gray-300 text-xs"
        >
          Collapse
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`text-sm ${
              msg.role === 'user'
                ? 'text-blue-300 bg-blue-900/20 rounded-lg p-2'
                : 'text-gray-300 bg-gray-800/50 rounded-lg p-2'
            }`}
          >
            <span className="text-xs text-gray-500 block mb-1">
              {msg.role === 'user' ? 'You' : 'AI'}
            </span>
            {msg.content}
          </div>
        ))}
        {isLoading && (
          <div className="text-gray-500 text-sm animate-pulse">Thinking...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Describe a feature..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white text-sm px-3 py-1.5 rounded transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </aside>
  );
}
