import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameMonth,
  startOfMonth,
} from "date-fns";
import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SITE } from "@/lib/site-config";

export const Route = createFileRoute("/_authenticated/admin/calendar")({
  head: () => ({
    meta: [
      { title: `Bookings calendar | ${SITE.name} Admin` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BookingCalendar,
});

function BookingCalendar() {
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [newDate, setNewDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [newNote, setNewNote] = useState("");
  const qc = useQueryClient();
  const start = format(startOfMonth(month), "yyyy-MM-dd");
  const end = format(endOfMonth(month), "yyyy-MM-dd");
  const { data: bookings = [] } = useQuery({
    queryKey: ["booking-notes", start],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("booking_notes")
        .select("*")
        .gte("event_date", start)
        .lte("event_date", end);
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: inquiries = [] } = useQuery({
    queryKey: ["calendar-inquiries", start],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("id, name, wedding_date")
        .gte("wedding_date", start)
        .lte("wedding_date", end);
      if (error) throw error;
      return data ?? [];
    },
  });
  const saveBooking = async (date: string, note: string) => {
    const { error } = await supabase
      .from("booking_notes")
      .upsert(
        {
          event_date: date,
          note: note.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "event_date" },
      );
    if (error) toast.error(error.message);
    else qc.invalidateQueries({ queryKey: ["booking-notes"] });
  };
  const first = startOfMonth(month);
  const last = endOfMonth(month);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay());
  const gridEnd = new Date(last);
  gridEnd.setDate(last.getDate() + (6 - last.getDay()));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  return (
    <section className="rounded-3xl border border-primary/40 bg-card p-4 shadow-lg shadow-black/10 sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="eyebrow">Studio schedule</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-light">
            <CalendarDays className="size-5 text-primary" />
            Bookings & inquiries
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Gold notes are confirmed bookings. Blue labels are inquiry dates.
            Edit any booking bubble directly, then leave the field to save.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonth(addMonths(month, -1))}
            className="rounded-full border border-border p-2"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-32 text-center text-sm font-medium">
            {format(month, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setMonth(addMonths(month, 1))}
            className="rounded-full border border-border p-2"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (!newNote.trim()) return toast.error("Add a short booking note");
          saveBooking(newDate, newNote).then(() => setNewNote(""));
        }}
        className="mt-6 grid gap-2 rounded-2xl border border-border bg-background p-3 sm:grid-cols-[12rem_1fr_auto]"
      >
        <input
          type="date"
          value={newDate}
          onChange={(event) => setNewDate(event.target.value)}
          className="rounded-xl border border-input bg-card px-3 py-2 text-sm"
        />
        <input
          value={newNote}
          onChange={(event) => setNewNote(event.target.value)}
          maxLength={80}
          placeholder="Confirmed booking note"
          className="rounded-xl border border-input bg-card px-3 py-2 text-sm"
        />
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground">
          <Plus className="size-4" /> Add booking
        </button>
      </form>
      <div className="mt-5 grid grid-cols-7 border-l border-t border-border">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="border-b border-r border-border bg-background px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {day}
          </div>
        ))}
        {days.map((day) => {
          const date = format(day, "yyyy-MM-dd");
          const booking = bookings.find((item) => item.event_date === date);
          const dayInquiries = inquiries.filter(
            (item) => item.wedding_date === date,
          );
          return (
            <div
              key={date}
              className={`min-h-28 border-b border-r border-border p-1.5 sm:min-h-36 sm:p-2 ${isSameMonth(day, month) ? "bg-card" : "bg-background/40 text-muted-foreground"}`}
            >
              <p className="mb-1 text-xs">{format(day, "d")}</p>
              {booking && (
                <input
                  aria-label={`Booking note for ${date}`}
                  defaultValue={booking.note}
                  maxLength={80}
                  onBlur={(event) => {
                    if (event.target.value !== booking.note)
                      saveBooking(date, event.target.value);
                  }}
                  className="mb-1 w-full rounded-md border border-primary/50 bg-primary/15 px-1.5 py-1 text-[10px] text-primary outline-none focus:border-primary"
                />
              )}
              {dayInquiries.map((inquiry) => (
                <p
                  key={inquiry.id}
                  className="mb-1 truncate rounded-md border border-sky-400/50 bg-sky-400/10 px-1.5 py-1 text-[10px] text-sky-300"
                  title={inquiry.name}
                >
                  Inquiry · {inquiry.name}
                </p>
              ))}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <span className="rounded bg-primary/15 px-2 py-1 text-primary">
          Confirmed booking
        </span>
        <span className="rounded bg-sky-400/10 px-2 py-1 text-sky-300">
          Inquiry date
        </span>
      </div>
    </section>
  );
}
