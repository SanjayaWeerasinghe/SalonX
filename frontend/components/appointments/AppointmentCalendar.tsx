'use client';

import React, { useMemo } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { Appointment, CalendarAppointment } from '@/types/appointment';
import type { Customer } from '@/types/customer';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date()),
  getDay,
  locales,
});

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onSelectSlot: (slotInfo: { start: Date; end: Date }) => void;
  onSelectEvent: (appointment: Appointment) => void;
  onNavigate?: (date: Date) => void;
  onView?: (view: View) => void;
  onEventDrop?: (data: { event: CalendarAppointment; start: Date; end: Date }) => void;
}

export default function AppointmentCalendar({
  appointments,
  onSelectSlot,
  onSelectEvent,
  onNavigate,
  onView,
  onEventDrop,
}: AppointmentCalendarProps) {
  const events: CalendarAppointment[] = useMemo(() => {
    console.log('Raw appointments:', appointments);
    const mappedEvents = appointments.map((apt) => {
      const customer = typeof apt.customer_id === 'string' ? null : apt.customer_id;
      const customerName = customer
        ? `${customer.first_name} ${customer.last_name}`
        : 'Unknown Customer';

      const start = new Date(apt.appointment_date);
      const end = new Date(start.getTime() + (apt.duration_minutes || 60) * 60000);

      console.log('Creating event:', {
        id: apt.id,
        title: customerName,
        start,
        end,
        status: apt.status,
      });

      return {
        id: apt.id,
        title: customerName,
        start,
        end,
        resource: apt,
      };
    });
    console.log('Mapped calendar events:', mappedEvents);
    return mappedEvents;
  }, [appointments]);

  const eventStyleGetter = (event: CalendarAppointment) => {
    const status = event.resource.status;
    let backgroundColor = '#0ea5e9'; // blue (scheduled)

    switch (status) {
      case 'completed':
        backgroundColor = '#10b981'; // green
        break;
      case 'cancelled':
        backgroundColor = '#ef4444'; // red
        break;
      case 'no_show':
        backgroundColor = '#6b7280'; // gray
        break;
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <div className="h-[700px] bg-white p-4 rounded-lg">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={(event) => onSelectEvent(event.resource)}
        onSelectSlot={onSelectSlot}
        onNavigate={onNavigate}
        onView={onView}
        onEventDrop={onEventDrop ? ({ event, start, end }) => onEventDrop({ event: event as CalendarAppointment, start, end }) : undefined}
        eventPropGetter={eventStyleGetter}
        selectable
        resizable={false}
        draggableAccessor={() => true}
        views={['month', 'week', 'day']}
        defaultView="month"
      />
    </div>
  );
}
