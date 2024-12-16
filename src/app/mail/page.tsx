"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LogOut, Send, Menu, Inbox, Plus } from "lucide-react";

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
  const [composeOpen, setComposeOpen] = useState(false);
  const [newMail, setNewMail] = useState({ to: "", subject: "", body: "" });

  const { user } = useUser();
  const userId = user?.id;
  const clerkEmail = user?.emailAddresses?.[0]?.emailAddress;

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

    const selectedMessage = messages?.find((m) => m.id === selectedMessageId);

    try {
      const res = await fetch("/api/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedMessage?.from,
          subject: `Re: ${selectedMessage?.subject || "No subject"}`,
          body: replyText,
        }),
      });

      if (!res.ok) throw new Error("Failed to send reply");

      setReplyText("");
      alert("Reply sent successfully!");
    } catch (err) {
      console.error("Error sending reply:", err);
    }
  };

  const handleSendNewMail = async () => {
    if (!newMail.to.trim() || !newMail.subject.trim() || !newMail.body.trim()) return;

    try {
      const res = await fetch("/api/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMail),
      });

      if (!res.ok) throw new Error("Failed to send email");

      setComposeOpen(false);
      setNewMail({ to: "", subject: "", body: "" });
      alert("Email sent successfully!");
    } catch (err) {
      console.error("Error sending email:", err);
    }
  };

  const selectedMessage = messages?.find((m) => m.id === selectedMessageId);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b p-4 flex justify-between items-center shadow-sm">
        <h1 className="text-lg font-bold">Inbox</h1>
        <div className="flex space-x-2">
          <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm">
                <Plus className="mr-2 h-4 w-4" /> Compose
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Compose New Email</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Recipient email"
                  value={newMail.to}
                  onChange={(e) => setNewMail({ ...newMail, to: e.target.value })}
                />
                <Input
                  placeholder="Subject"
                  value={newMail.subject}
                  onChange={(e) => setNewMail({ ...newMail, subject: e.target.value })}
                />
                <Textarea
                  placeholder="Write your message here..."
                  value={newMail.body}
                  onChange={(e) => setNewMail({ ...newMail, body: e.target.value })}
                />
                <Button onClick={handleSendNewMail}>
                  <Send className="mr-2 h-4 w-4" /> Send
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <ScrollArea className="hidden md:block w-1/3 border-r">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            selectedMessageId={selectedMessageId}
            setSelectedMessageId={setSelectedMessageId}
          />
        </ScrollArea>

        {/* Email Content */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedMessage ? (
            <Card className="flex-1 m-4">
              <CardHeader>
                <CardTitle>{selectedMessage.subject || "No subject"}</CardTitle>
                <p className="text-sm text-gray-500">From: {selectedMessage.from}</p>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-40 mb-4">
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedMessage.snippet || "No content available."}
                  </p>
                </ScrollArea>
                {/* Reply Section */}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Write your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <Button onClick={handleSendReply} disabled={!replyText.trim()}>
                    <Send className="mr-2 h-4 w-4" /> Reply
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-1 items-center justify-center text-gray-500">
              <Inbox className="w-12 h-12 mr-2" />
              Select a message to view its content
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MessageList({
  messages,
  isLoading,
  selectedMessageId,
  setSelectedMessageId,
}: {
  messages: Message[] | null;
  isLoading: boolean;
  selectedMessageId: string | null;
  setSelectedMessageId: (id: string) => void;
}) {
  return (
    <Table>
      <TableBody>
        {isLoading
          ? Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              </TableRow>
            ))
          : messages?.map((msg) => (
              <TableRow
                key={msg.id}
                onClick={() => setSelectedMessageId(msg.id)}
                className={`cursor-pointer hover:bg-gray-100 ${
                  selectedMessageId === msg.id ? "bg-gray-200" : ""
                }`}
              >
                <TableCell>
                  <div className="font-medium">{msg.from}</div>
                  <div className="text-sm text-gray-500">{msg.subject || "No subject"}</div>
                </TableCell>
              </TableRow>
            ))}
      </TableBody>
    </Table>
  );
}
