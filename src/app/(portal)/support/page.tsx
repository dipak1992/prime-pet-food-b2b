"use client";

import { useState, useEffect } from "react";
import { SectionCard } from "@/components/ui/SectionCard";

interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  message: string;
  createdAt: string;
  updatedAt: string;
  responses: {
    id: string;
    message: string;
    authorRole: string;
    createdAt: string;
  }[];
}

interface TicketsResponse {
  tickets: SupportTicket[];
}

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    category: "general",
    priority: "normal",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    try {
      setLoading(true);
      const res = await fetch("/api/support/tickets");
      if (!res.ok) throw new Error("Failed to load tickets");
      const data: TicketsResponse = await res.json();
      setTickets(data.tickets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error loading tickets");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.message.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create ticket");
      
      setFormData({ subject: "", category: "general", priority: "normal", message: "" });
      setShowForm(false);
      await fetchTickets();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error creating ticket");
    } finally {
      setSubmitting(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-blue-100 text-blue-700",
      normal: "bg-gray-100 text-gray-700",
      high: "bg-orange-100 text-orange-700",
      urgent: "bg-red-100 text-red-700",
    };
    return colors[priority] || "bg-gray-100 text-gray-700";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-blue-100 text-blue-700",
      in_progress: "bg-yellow-100 text-yellow-700",
      waiting_customer: "bg-gray-100 text-gray-700",
      resolved: "bg-green-100 text-green-700",
      closed: "bg-gray-200 text-gray-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <SectionCard title="Support center" description="Request samples, custom pricing, or sales help.">
        <p className="text-sm text-[#4b5563]">Loading...</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Support center" description="Request samples, custom pricing, or sales help.">
      <div className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center">
          <p className="text-sm text-[#4b5563]">
            {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
          </p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-lg bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836]"
          >
            {showForm ? "Cancel" : "New Ticket"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] p-4 space-y-3">
            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-1">Subject</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#d1cec4] bg-white text-sm"
                placeholder="Brief description of your issue"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#d1cec4] bg-white text-sm"
                >
                  <option value="general">General</option>
                  <option value="billing">Billing</option>
                  <option value="order">Order Issue</option>
                  <option value="product">Product Info</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#111827] mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#d1cec4] bg-white text-sm"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#111827] mb-1">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#d1cec4] bg-white text-sm"
                placeholder="Describe your issue in detail..."
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-[#1d4b43] px-4 py-2 text-sm font-semibold text-white hover:bg-[#163836] disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Ticket"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-lg border border-[#d1cec4] px-4 py-2 text-sm font-semibold text-[#111827] hover:bg-[#f5f3f0]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {tickets.length === 0 ? (
            <p className="text-center text-sm text-[#4b5563] py-8">No support tickets yet.</p>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-lg border border-[#e7e4dc] bg-[#fcfbf9] overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === ticket.id ? "" : ticket.id)}
                  className="w-full p-4 flex items-start justify-between hover:bg-[#f5f3f0] text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="text-sm font-semibold text-[#111827]">{ticket.ticketNumber}</span>
                      <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-[#111827] font-semibold mb-1">{ticket.subject}</p>
                    <p className="text-xs text-[#4b5563]">{formatDate(ticket.createdAt)}</p>
                  </div>
                  <span className="ml-2 text-[#4b5563]">{expandedId === ticket.id ? "▼" : "▶"}</span>
                </button>

                {expandedId === ticket.id && (
                  <div className="border-t border-[#e7e4dc] p-4 bg-white space-y-4">
                    <div>
                      <p className="text-sm text-[#4b5563] mb-2">
                        <span className="font-semibold text-[#111827]">Category:</span> {ticket.category}
                      </p>
                      <p className="text-sm whitespace-pre-wrap text-[#111827]">{ticket.message}</p>
                    </div>

                    {ticket.responses.length > 0 && (
                      <div className="border-t border-[#e7e4dc] pt-4 space-y-3">
                        <p className="text-xs font-semibold text-[#4b5563] uppercase">Responses</p>
                        {ticket.responses.map((response) => (
                          <div key={response.id} className="rounded-lg bg-[#f5f3f0] p-3">
                            <p className="text-xs text-[#4b5563] mb-1">
                              <span className="font-semibold">{response.authorRole}</span> • {formatDate(response.createdAt)}
                            </p>
                            <p className="text-sm text-[#111827]">{response.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </SectionCard>
  );
}
