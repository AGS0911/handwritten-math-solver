import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

interface MathChatbotProps {
  problem: string | null;
  solution: string | null;
}

export default function MathChatbot({ problem, solution }: MathChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat when problem and solution are available
  useEffect(() => {
    if (problem && solution && messages.length === 0) {
      // Reset chat and start with welcome message
      setMessages([
        {
          id: Date.now().toString(),
          sender: 'bot',
          text: `I've analyzed your math problem: ${problem}. Would you like me to explain the solution step by step, or do you have specific questions about it?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [problem, solution, messages.length]);

  // Auto-scroll to the bottom of the chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !problem || !solution) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    
    try {
      // Call your API to get chatbot response
      const response = await fetch('/api/math-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: inputValue,
          problem,
          solution,
          conversationHistory: messages
        })
      });
      
      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      
      // Add bot message
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: data.response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error getting chatbot response:', error);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "I'm sorry, I couldn't process your request. Please try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // If no problem/solution yet, don't render chat
  if (!problem || !solution) {
    return null;
  }

  return (
    <div className="mt-8 border rounded-lg shadow-sm bg-white max-w-2xl mx-auto overflow-hidden flex flex-col h-96">
      <div className="bg-blue-600 text-white py-3 px-4">
        <h3 className="font-medium">Math Tutor</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.sender === 'user' ? 'text-right' : ''
            }`}
          >
            <div
              className={`inline-block px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {message.text}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex items-center text-gray-500">
            <div className="mr-2"></div>
            <span className="text-sm">Thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={sendMessage} className="border-t p-2 flex">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a question about your math problem..."
          className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 disabled:bg-blue-300"
          disabled={loading || !inputValue.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}