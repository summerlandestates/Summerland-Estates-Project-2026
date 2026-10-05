import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Plus,
  X,
  Edit2,
  Save,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface ServiceCalendarProps {
  userId: string;
  isOwner: boolean;
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
// JS getDay(): 0 = Sunday ... 6 = Saturday → map to our Monday-first labels
const jsDayToName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const defaultTimeSlots: TimeSlot[] = [
  { day: 'Monday', startTime: '09:00', endTime: '17:00', available: true },
  { day: 'Tuesday', startTime: '09:00', endTime: '17:00', available: true },
  { day: 'Wednesday', startTime: '09:00', endTime: '17:00', available: true },
  { day: 'Thursday', startTime: '09:00', endTime: '17:00', available: true },
  { day: 'Friday', startTime: '09:00', endTime: '17:00', available: true },
  { day: 'Saturday', startTime: '10:00', endTime: '14:00', available: false },
  { day: 'Sunday', startTime: '10:00', endTime: '14:00', available: false },
];

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export default function ServiceCalendar({ userId, isOwner }: ServiceCalendarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(defaultTimeSlots);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [newSlot, setNewSlot] = useState<TimeSlot>({
    day: 'Monday',
    startTime: '09:00',
    endTime: '17:00',
    available: true,
  });

  useEffect(() => {
    const loadAvailability = async () => {
      // Prefer Supabase (shared across devices & visible to viewers), fall back to localStorage
      try {
        const { data } = await supabase
          .from('profiles')
          .select('application_data')
          .eq('id', userId)
          .maybeSingle();

        const slots = data?.application_data?.availability_slots;
        if (Array.isArray(slots) && slots.length) {
          setTimeSlots(slots);
          setLoaded(true);
          return;
        }
      } catch {
        // fall through to localStorage
      }

      const savedSlots = localStorage.getItem(`service-calendar-${userId}`);
      if (savedSlots) {
        try {
          setTimeSlots(JSON.parse(savedSlots));
        } catch {
          // ignore malformed cache
        }
      }
      setLoaded(true);
    };

    loadAvailability();
  }, [userId]);

  const saveAvailability = async () => {
    setSaving(true);
    localStorage.setItem(`service-calendar-${userId}`, JSON.stringify(timeSlots));

    if (isOwner) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('application_data')
          .eq('id', userId)
          .maybeSingle();

        await supabase
          .from('profiles')
          .update({
            application_data: {
              ...(profile?.application_data || {}),
              availability_slots: timeSlots,
            },
          })
          .eq('id', userId);
      } catch (error) {
        console.error('Failed to save availability to profile:', error);
      }
    }

    setSaving(false);
    setIsEditing(false);
  };

  const toggleAvailability = (index: number) => {
    if (!isEditing) return;
    const updatedSlots = [...timeSlots];
    updatedSlots[index].available = !updatedSlots[index].available;
    setTimeSlots(updatedSlots);
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string | boolean) => {
    if (!isEditing) return;
    const updatedSlots = [...timeSlots];
    updatedSlots[index] = { ...updatedSlots[index], [field]: value };
    setTimeSlots(updatedSlots);
  };

  const addTimeSlot = () => {
    if (!isEditing) return;
    setTimeSlots([...timeSlots, { ...newSlot }]);
    setNewSlot({ day: 'Monday', startTime: '09:00', endTime: '17:00', available: true });
  };

  const removeTimeSlot = (index: number) => {
    if (!isEditing) return;
    setTimeSlots(timeSlots.filter((_, i) => i !== index));
  };

  const availableDayNames = new Set(
    timeSlots.filter((s) => s.available).map((s) => s.day)
  );

  const getAvailableDaysCount = () => timeSlots.filter((s) => s.available).length;

  const getTotalHours = () =>
    timeSlots
      .filter((s) => s.available)
      .reduce((total, slot) => {
        const start = new Date(`2000-01-01T${slot.startTime}`);
        const end = new Date(`2000-01-01T${slot.endTime}`);
        return total + (end.getTime() - start.getTime()) / 3600000;
      }, 0);

  // Month calendar rendering
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday-first offset
  const startOffset = (firstDay.getDay() + 6) % 7;
  const today = new Date();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const calendarCells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <Card className="p-6 bg-card text-card-foreground shadow-lg border border-gray-100 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">
              Availability Calendar
            </h2>
            <p className="text-sm text-muted-foreground">
              {isOwner ? 'Manage your service hours' : 'Available service hours'}
            </p>
          </div>
        </div>

        {isOwner && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={saveAvailability}
                  size="sm"
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="w-4 h-4 mr-1" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={() => setIsEditing(false)} size="sm" variant="outline">
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} size="sm" variant="outline">
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Month calendar view */}
      <div className="mb-6 rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-[#FBF9F6] border-b border-gray-200">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-md hover:bg-[#F2EDE4] text-[#5C554A]"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-sm text-[#2C2820]">
            {monthNames[month]} {year}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-md hover:bg-[#F2EDE4] text-[#5C554A]"
            aria-label="Next month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 text-center">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
            <div
              key={d}
              className="py-2 text-[11px] font-semibold uppercase tracking-wide text-[#9A9183] border-b border-gray-100"
            >
              {d}
            </div>
          ))}
          {calendarCells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="h-10 border-b border-gray-50" />;
            }
            const date = new Date(year, month, day);
            const dayName = jsDayToName[date.getDay()];
            const slot = timeSlots.find((s) => s.day === dayName);
            const isAvailable = !!slot?.available;
            const isToday =
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear();

            return (
              <div
                key={day}
                title={
                  isAvailable && slot
                    ? `${dayName}: ${slot.startTime} - ${slot.endTime}`
                    : `${dayName}: Unavailable`
                }
                className={`h-10 flex items-center justify-center text-sm border-b border-gray-50 ${
                  isAvailable
                    ? 'bg-green-50 text-green-800 font-medium'
                    : 'text-gray-300'
                } ${isToday ? 'ring-1 ring-inset ring-[#A89F91] font-bold' : ''}`}
              >
                {day}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 px-4 py-2.5 bg-[#FBF9F6] text-xs text-[#9A9183]">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-100 border border-green-200" />
            Available
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gray-100 border border-gray-200" />
            Unavailable
          </span>
        </div>
      </div>

      {/* Availability Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-primary">{getAvailableDaysCount()}</div>
          <div className="text-xs text-muted-foreground">Available Days</div>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-primary">{Math.round(getTotalHours())}h</div>
          <div className="text-xs text-muted-foreground">Total Hours</div>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-primary">{timeSlots.length}</div>
          <div className="text-xs text-muted-foreground">Time Slots</div>
        </div>
        <div className="text-center p-3 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-primary">
            {timeSlots.filter((s) => s.available && ['Saturday', 'Sunday'].includes(s.day)).length}
          </div>
          <div className="text-xs text-muted-foreground">Weekend Days</div>
        </div>
      </div>

      {/* Time Slots */}
      <div className="space-y-3">
        {loaded && timeSlots.map((slot, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              slot.available ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            } ${isEditing ? 'cursor-pointer' : ''}`}
            onClick={() => isEditing && toggleAvailability(index)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-foreground">{slot.day}</span>
                <Badge
                  variant={slot.available ? 'default' : 'secondary'}
                  className={`text-xs ${
                    slot.available
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  {slot.available ? 'Available' : 'Unavailable'}
                </Badge>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {isEditing ? (
                    <input
                      type="time"
                      value={slot.startTime}
                      onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                      className="border rounded px-1 py-0.5 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span>{slot.startTime}</span>
                  )}
                  <span>-</span>
                  {isEditing ? (
                    <input
                      type="time"
                      value={slot.endTime}
                      onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                      className="border rounded px-1 py-0.5 text-xs"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span>{slot.endTime}</span>
                  )}
                </div>
              </div>
            </div>

            {isEditing && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  removeTimeSlot(index);
                }}
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Add New Time Slot */}
      {isEditing && (
        <div className="mt-4 p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <select
                  value={newSlot.day}
                  onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                  className="border rounded px-2 py-1 text-sm bg-background"
                >
                  {days.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>

                <input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  className="border rounded px-2 py-1 text-sm bg-background"
                />
                <span>-</span>
                <input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  className="border rounded px-2 py-1 text-sm bg-background"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newSlot.available}
                  onChange={(e) => setNewSlot({ ...newSlot, available: e.target.checked })}
                  className="rounded"
                />
                Available
              </label>
            </div>

            <Button onClick={addTimeSlot} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Add Slot
            </Button>
          </div>
        </div>
      )}

      {!isOwner && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <Check className="w-4 h-4 inline mr-1" />
            Contact this service provider to book appointments during available hours
          </p>
        </div>
      )}
    </Card>
  );
}
