import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, FileText, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { leavesAPI, authAPI } from '@/services/api';
import { toast } from 'sonner';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [userData, setUserData] = useState(null);
  
  // Leave balance - this would ideally come from API in a real app
  const leaveBalance = [
    { type: 'Annual Leave', used: 10, total: 24, color: 'bg-blue-500' },
    { type: 'Sick Leave', used: 3, total: 12, color: 'bg-amber-500' },
    { type: 'Personal Leave', used: 2, total: 5, color: 'bg-emerald-500' }
  ];
  
  // Placeholder for team absences - in real app, would come from API
  const upcomingLeaves = [
    { id: 1, name: 'John Smith', startDate: '2025-04-15', endDate: '2025-04-22', days: 5 },
    { id: 2, name: 'Emily Johnson', startDate: '2025-04-18', endDate: '2025-04-21', days: 2 }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user profile info
        const userResponse = await authAPI.getCurrentUser();
        setUserData(userResponse.data);
        
        // Get user's leave requests
        const leavesResponse = await leavesAPI.getUserLeaves();
        setLeaves(leavesResponse.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // If we're loading or don't have a logged-in user yet, show loading state
  if (loading) {
    return (
      <DashboardLayout pageTitle="Employee Dashboard" role="employee">
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </DashboardLayout>
    );
  }

  // Get the 3 most recent leave requests
  const recentRequests = leaves.slice(0, 3);

  return (
    <DashboardLayout pageTitle="Employee Dashboard" role="employee">
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available Leave</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaveBalance.map((leave) => (
                <div key={leave.type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{leave.type}</span>
                    <span className="text-sm text-muted-foreground">{leave.used} / {leave.total} days</span>
                  </div>
                  <Progress 
                    value={(leave.used / leave.total) * 100} 
                    className="h-2"
                    indicatorClassName={leave.color}
                  />
                </div>
              ))}
            </div>
            <Button 
              className="w-full mt-6 bg-brand-600 hover:bg-brand-700"
              onClick={() => navigate('/employee/new-leave')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Request Leave
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recent Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRequests && recentRequests.length > 0 ? (
                recentRequests.map((request) => (
                  <div key={request._id} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                    <div>
                      <div className="font-medium">{request.type}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(request.startDate).toISOString().split('T')[0]} to {new Date(request.endDate).toISOString().split('T')[0]} ({request.days} {request.days > 1 ? 'days' : 'day'})
                      </div>
                    </div>
                    <Badge 
                      className={
                        request.status === 'Approved' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                        request.status === 'Rejected' ? 'bg-red-100 text-red-800 hover:bg-red-100' : 
                        'bg-amber-100 text-amber-800 hover:bg-amber-100'
                      }
                    >
                      {request.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No recent leave requests
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate('/employee/leaves')}
            >
              View All Requests
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Team Absences</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingLeaves.map((leave) => (
                <div key={leave.id} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="font-medium">{leave.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {leave.startDate} to {leave.endDate} ({leave.days} {leave.days > 1 ? 'days' : 'day'})
                  </div>
                </div>
              ))}
              {upcomingLeaves.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-4">
                  No upcoming team absences
                </div>
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate('/employee/team-calendar')}
            >
              View Team Calendar
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Company Holidays</CardTitle>
            <CardDescription>Upcoming company holidays for the year</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-md flex items-center justify-center text-red-600 mr-4">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-medium">Memorial Day</div>
                    <div className="text-sm text-muted-foreground">May 26, 2025</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-md flex items-center justify-center text-red-600 mr-4">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-medium">Independence Day</div>
                    <div className="text-sm text-muted-foreground">July 4, 2025</div>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-md">
                  <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-md flex items-center justify-center text-red-600 mr-4">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-medium">Labor Day</div>
                    <div className="text-sm text-muted-foreground">September 1, 2025</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
