import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, X, Edit2, Save, Check } from 'lucide-react';

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

const defaultTimeSlots: TimeSlot[] = [
  { day: 'Monday', startTime: '09:00', endTime: '17:00', available: true },
  { day: 'Tuesday', startTime: '09:00', endTime: '17:00', available: true },
  { day: 'Wednesday', startTime: '09:00', endTime: '17:00', available: true },
  { day: 'Thursday', startTime: '09:00', endTime: '17:00', available: true },
  { day: 'Friday', startTime: '09:00', endTime: '17:00', available: true },
  { day: 'Saturday', startTime: '10:00', endTime: '14:00', available: false },
  { day: 'Sunday', startTime: '10:00', endTime: '14:00', available: false },
];

export default function ServiceCalendar({ userId, isOwner }: ServiceCalendarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(defaultTimeSlots);
  const [newSlot, setNewSlot] = useState<TimeSlot>({
    day: 'Monday',
    startTime: '09:00',
    endTime: '17:00',
    available: true,
  });

  useEffect(() => {
    // Load saved availability from localStorage
    const savedSlots = localStorage.getItem(`service-calendar-${userId}`);
    if (savedSlots) {
      setTimeSlots(JSON.parse(savedSlots));
    }
  }, [userId]);

  const saveAvailability = () => {
    localStorage.setItem(`service-calendar-${userId}`, JSON.stringify(timeSlots));
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
    setNewSlot({
      day: 'Monday',
      startTime: '09:00',
      endTime: '17:00',
      available: true,
    });
  };

  const removeTimeSlot = (index: number) => {
    if (!isEditing) return;
    
    const updatedSlots = timeSlots.filter((_, i) => i !== index);
    setTimeSlots(updatedSlots);
  };

  const getAvailableDaysCount = () => {
    return timeSlots.filter(slot => slot.available).length;
  };

  const getTotalHours = () => {
    return timeSlots
      .filter(slot => slot.available)
      .reduce((total, slot) => {
        const start = new Date(`2000-01-01T${slot.startTime}`);
        const end = new Date(`2000-01-01T${slot.endTime}`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return total + hours;
      }, 0);
  };

  return (
    <Card className="p-6 bg-card text-card-foreground shadow-lg border border-gray-100 rounded-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-foreground">
              Service Availability
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
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  size="sm"
                  variant="outline"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                variant="outline"
              >
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        )}
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
            {timeSlots.filter(slot => slot.available && ['Saturday', 'Sunday'].includes(slot.day)).length}
          </div>
          <div className="text-xs text-muted-foreground">Weekend Days</div>
        </div>
      </div>

      {/* Time Slots */}
      <div className="space-y-3">
        {timeSlots.map((slot, index) => (
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
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <select
                  value={newSlot.day}
                  onChange={(e) => setNewSlot({ ...newSlot, day: e.target.value })}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {days.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                
                <input
                  type="time"
                  value={newSlot.startTime}
                  onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                  className="border rounded px-2 py-1 text-sm"
                />
                <span>-</span>
                <input
                  type="time"
                  value={newSlot.endTime}
                  onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                  className="border rounded px-2 py-1 text-sm"
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
