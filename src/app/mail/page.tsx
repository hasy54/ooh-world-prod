"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Message = {
  id: string;
  snippet: string;
  internalDate: string;
};

export default function MailPage() {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMessages() {
      const res = await fetch("/api/gmail/messages");
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.error || "Not signed in");
        return;
      }
      const data: Message[] = await res.json();
      setMessages(data);
      if (data.length > 0) setSelectedMessageId(data[0].id);
    }
    fetchMessages();
  }, []);

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h1 className="text-xl font-bold mb-4">You are not signed in</h1>
          <Link href="/api/auth/login">
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
              Sign in with Google
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!messages) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <h1 className="text-xl">Loading messages...</h1>
      </div>
    );
  }

  const selectedMessage = messages.find((m) => m.id === selectedMessageId);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-300 flex flex-col">
        <div className="p-4 flex justify-between items-center border-b border-gray-300">
          <h1 className="text-lg font-bold">Messages</h1>
          <div className="flex space-x-2">
            <Link href="/api/auth/logout">
              <button className="px-3 py-1 text-sm bg-gray-200 rounded-lg">
                Logout
              </button>
            </Link>
          </div>
        </div>
        <div className="overflow-y-auto h-full">
          {messages.map((message) => (
            <div
              key={message.id}
              onClick={() => setSelectedMessageId(message.id)}
              className={`p-4 border-b cursor-pointer ${
                selectedMessage && selectedMessage.id === message.id
                  ? "bg-gray-200"
                  : "hover:bg-gray-100"
              }`}
            >
              <div className="font-bold">
                {message.id}
              </div>
              <div className="text-sm text-gray-600 truncate">
                {message.snippet || "No preview"}
              </div>
              {message.internalDate && (
                <div className="text-xs text-gray-500">
                  {new Date(Number(message.internalDate)).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="w-2/3 flex flex-col">
        {selectedMessage ? (
          <>
            {/* Header */}
            <div className="p-4 bg-white border-b border-gray-300 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">Message ID: {selectedMessage.id}</h2>
              </div>
              <button className="px-3 py-1 text-sm bg-gray-200 rounded-lg">
                Show reservation
              </button>
            </div>

            {/* Message Content */}
            <div className="flex-grow p-4 overflow-y-auto bg-gray-50">
              <div className="whitespace-pre-wrap text-sm text-gray-800 mb-4">
                {selectedMessage.snippet || "No content available."}
              </div>
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white border-t border-gray-300">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring"
                />
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center">
            <p className="text-gray-500">No message selected</p>
          </div>
        )}
      </div>
    </div>
  );
}
