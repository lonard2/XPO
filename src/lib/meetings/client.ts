"use client";

export type MeetingRequestType =
  | "RFQ"
  | "DEAL_SLOT"
  | "BUYER_APPOINTMENT"
  | "BILATERAL_SLOT"
  | "DEAL_ROOM";

export interface MeetingRequestInput {
  eventId: string;
  type: MeetingRequestType;
  requesterName: string;
  requesterEmail: string;
  target?: string;
  slot?: string;
  message?: string;
}

/**
 * Submit a meeting/RFQ request. Returns the reference id. Throws an Error
 * with the server's message so forms can show it without inventing copy.
 */
export async function submitMeetingRequest(input: MeetingRequestInput): Promise<string> {
  const res = await fetch("/api/meetings/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await res.json().catch(() => ({}))) as {
    requestId?: string;
    error?: string;
  };
  if (!res.ok || !data.requestId) {
    throw new Error(data.error || "Could not record the request. Try again.");
  }
  return data.requestId;
}
