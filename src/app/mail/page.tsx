"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox, LogOut, Send, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type Message = {
  id: string;
  snippet: string;
  internalDate: string;
  subject: string;
  from: string;
};

export default function MailPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    async function fetchMessages() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/gmail/messages");
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to fetch messages");
        }
        const data: Message[] = await res.json();
        setMessages(data);
        if (data.length > 0) setSelectedMessageId(data[0].id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }
    fetchMessages();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const handleSendReply = async () => {
    if (!selectedMessageId || !replyText.trim()) return;

    try {
      const res = await fetch("/api/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: selectedMessageId, replyText }),
      });

      if (!res.ok) throw new Error("Failed to send reply");

      setReplyText("");
      // Optionally, you could refresh the messages list here
    } catch (err) {
      console.error("Error sending reply:", err);
    }
  };

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h1 className="text-xl font-bold mb-4">{error}</h1>
          <Link href="/api/auth/login">
            <Button>Sign in with Google</Button>
          </Link>
        </div>
      </div>
    );
  }

  const selectedMessage = messages?.find((m) => m.id === selectedMessageId);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold">Mail</h1>
        <div className="flex items-center space-x-2">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <MessageList
                messages={messages}
                isLoading={isLoading}
                selectedMessageId={selectedMessageId}
                setSelectedMessageId={setSelectedMessageId}
                setIsSidebarOpen={setIsSidebarOpen}
              />
            </SheetContent>
          </Sheet>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (hidden on mobile) */}
        <div className="hidden md:block w-1/3 bg-white border-r border-gray-200">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            selectedMessageId={selectedMessageId}
            setSelectedMessageId={setSelectedMessageId}
          />
        </div>

        {/* Message content */}
        <div className="flex-1 flex flex-col">
          {selectedMessage ? (
            <>
              {/* Message header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <h2 className="text-lg font-semibold">{selectedMessage.subject || "No subject"}</h2>
                <p className="text-sm text-gray-600">{selectedMessage.from}</p>
              </div>

              {/* Message body */}
              <ScrollArea className="flex-1 p-4 bg-gray-50">
                <div className="whitespace-pre-wrap text-sm text-gray-800 mb-4">
                  {selectedMessage.snippet || "No content available."}
                </div>
              </ScrollArea>

              {/* Reply input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleSendReply} disabled={!replyText.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center text-gray-500">
                <Inbox className="h-12 w-12 mx-auto mb-4" />
                <p>Select a message to view its contents</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageList({ messages, isLoading, selectedMessageId, setSelectedMessageId, setIsSidebarOpen }: {
  messages: Message[] | null;
  isLoading: boolean;
  selectedMessageId: string | null;
  setSelectedMessageId: (id: string) => void;
  setIsSidebarOpen?: (open: boolean) => void;
}){
  return (
    <ScrollArea className="h-full">
      {isLoading ? (
        Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="p-4 border-b border-gray-200">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))
      ) : (
        messages?.map((message) => (
          <div
            key={message.id}
            onClick={() => {
              setSelectedMessageId(message.id);
              if (setIsSidebarOpen) setIsSidebarOpen(false);
            }}
            className={`p-4 border-b border-gray-200 cursor-pointer ${
              selectedMessageId === message.id
                ? "bg-gray-100"
                : "hover:bg-gray-50"
            }`}
          >
            <div className="font-semibold truncate">{message.subject || "No subject"}</div>
            <div className="text-sm text-gray-600 truncate">{message.from}</div>
            <div className="text-sm text-gray-500 truncate">{message.snippet || "No preview"}</div>
            {message.internalDate && (
              <div className="text-xs text-gray-400 mt-1">
                {new Date(Number(message.internalDate)).toLocaleString()}
              </div>
            )}
          </div>
        ))
      )}
    </ScrollArea>
  );
}

