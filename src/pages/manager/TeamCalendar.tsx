
import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format, isSameDay } from 'date-fns';

const TeamCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState('team');
  
  // Mock team leave data
  const teamLeaves = [
    {
      id: 1,
      user: { id: 101, name: 'John Doe', department: 'Engineering' },
      type: 'Annual Leave',
      startDate: new Date(2025, 3, 15), // April 15, 2025
      endDate: new Date(2025, 3, 20),   // April 20, 2025
      status: 'Approved'
    },
    {
      id: 2,
      user: { id: 102, name: 'Alice Smith', department: 'Marketing' },
      type: 'Sick Leave',
      startDate: new Date(2025, 3, 5),  // April 5, 2025
      endDate: new Date(2025, 3, 7),    // April 7, 2025
      status: 'Approved'
    },
    {
      id: 3,
      user: { id: 103, name: 'Bob Johnson', department: 'Finance' },
      type: 'Personal Leave',
      startDate: new Date(2025, 3, 25), // April 25, 2025
      endDate: new Date(2025, 3, 25),   // April 25, 2025
      status: 'Pending'
    }
  ];
  
  // Function to determine if a date has any leaves
  const hasLeaveOnDate = (day: Date) => {
    return teamLeaves.some(leave => 
      (day >= leave.startDate && day <= leave.endDate)
    );
  };
  
  // Get leaves for the selected date
  const getLeavesForDate = (selectedDate: Date) => {
    return teamLeaves.filter(leave => 
      (selectedDate >= leave.startDate && selectedDate <= leave.endDate)
    );
  };
  
  const selectedDateLeaves = date ? getLeavesForDate(date) : [];

  return (
    <DashboardLayout pageTitle="Team Calendar" role="manager">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Tabs defaultValue="team" onValueChange={setView}>
                <div className="flex justify-between items-center">
                  <CardTitle>Leave Calendar</CardTitle>
                  <TabsList>
                    <TabsTrigger value="team">Team View</TabsTrigger>
                    <TabsTrigger value="department">Department View</TabsTrigger>
                  </TabsList>
                </div>
                <CardDescription>
                  {view === 'team' 
                    ? 'Calendar showing all team members\' leave schedules' 
                    : 'Calendar showing leave by department'}
                </CardDescription>
              </Tabs>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border"
                modifiers={{
                  hasLeave: (day) => hasLeaveOnDate(day)
                }}
                modifiersStyles={{
                  hasLeave: { 
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    color: '#dc2626', 
                    fontWeight: 'bold'
                  }
                }}
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {date 
                  ? `Leave on ${format(date, 'MMMM d, yyyy')}` 
                  : 'Select a date'}
              </CardTitle>
              <CardDescription>
                {selectedDateLeaves.length 
                  ? `${selectedDateLeaves.length} team member(s) on leave` 
                  : 'No team members on leave for this date'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedDateLeaves.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateLeaves.map(leave => (
                    <div key={leave.id} className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{leave.user.name}</h3>
                          <p className="text-sm text-gray-500">{leave.user.department}</p>
                        </div>
                        <Badge 
                          className={
                            leave.status === 'Approved' 
                              ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-100'
                          }
                        >
                          {leave.status}
                        </Badge>
                      </div>
                      <div className="mt-2 text-sm">
                        <p><span className="text-gray-500">Type:</span> {leave.type}</p>
                        <p>
                          <span className="text-gray-500">Duration:</span> {
                            isSameDay(leave.startDate, leave.endDate)
                              ? format(leave.startDate, 'MMM d, yyyy')
                              : `${format(leave.startDate, 'MMM d')} - ${format(leave.endDate, 'MMM d, yyyy')}`
                          }
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  No leave requests for this date
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeamCalendar;
