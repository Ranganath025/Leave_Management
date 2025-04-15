import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, FileText, Users, X, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { leavesAPI, usersAPI } from '@/services/api';
import { toast } from 'sonner';
import { isDemoUser } from '@/lib/utils';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamOnLeave, setTeamOnLeave] = useState([]);
  const [teamStats, setTeamStats] = useState({
    totalMembers: 0,
    onLeaveToday: 0,
    pendingRequests: 0,
    leaveUtilization: 0
  });
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail');
    setIsDemo(userEmail ? isDemoUser(userEmail) : false);
    
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      
      // If it's a demo account, use mock data
      if (userEmail && isDemoUser(userEmail)) {
        console.log('Using mock data for demo account');
        useMockData();
        setIsDemo(true);
        setLoading(false);
        return;
      }
      
      // Otherwise fetch real data
      console.log('Fetching real data from backend');
      
      // Get team members
      const teamResponse = await usersAPI.getTeamMembers();
      const teamData = teamResponse.data || [];
      setTeamMembers(teamData);
      
      // Get pending leave requests
      const pendingResponse = await leavesAPI.getPendingLeaves();
      const pendingData = pendingResponse.data || [];
      setPendingRequests(pendingData);
      
      // Get all team leaves to identify who's currently on leave
      const teamLeavesResponse = await leavesAPI.getTeamLeaves();
      const leavesData = teamLeavesResponse.data || [];
      
      // Filter approved leaves that include today's date
      const today = new Date();
      const currentLeaves = leavesData.filter(leave => 
        leave.status === 'Approved' && 
        new Date(leave.startDate) <= today && 
        new Date(leave.endDate) >= today
      );
      
      // Filter upcoming approved leaves
      const upcomingLeaves = leavesData.filter(leave => 
        leave.status === 'Approved' && 
        new Date(leave.startDate) > today
      );
      
      // Combine current and upcoming leaves for the team on leave display
      const combinedTeamLeaves = [...currentLeaves, ...upcomingLeaves].slice(0, 5);
      setTeamOnLeave(combinedTeamLeaves);
      
      // Update team stats
      setTeamStats({
        totalMembers: teamData.length,
        onLeaveToday: currentLeaves.length,
        pendingRequests: pendingData.length,
        leaveUtilization: calculateLeaveUtilization(leavesData)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      const userEmail = localStorage.getItem('userEmail');
      // Only show mock data for demo accounts
      if (userEmail && isDemoUser(userEmail)) {
        toast.error('Failed to fetch data. Using demo data instead.');
        useMockData();
        setIsDemo(true);
      } else {
        toast.error('Failed to fetch dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate leave utilization rate
  const calculateLeaveUtilization = (leaves) => {
    if (!leaves || leaves.length === 0) return 0;
    
    // This is a simplified calculation that could be enhanced
    // with more sophisticated analytics in a real application
    const totalPossibleLeaves = teamMembers.length * 30; // Assuming 30 days of leave per person
    const takenLeaves = leaves.reduce((sum, leave) => {
      return sum + (leave.status === 'Approved' ? leave.days : 0);
    }, 0);
    
    return Math.round((takenLeaves / totalPossibleLeaves) * 100);
  };

  // Mock data for development and demo accounts
  const useMockData = () => {
    // Mock pending requests
    setPendingRequests([
      { _id: 1, user: { fullName: 'John Smith' }, type: 'Annual Leave', startDate: '2025-05-15', endDate: '2025-05-20', days: 5 },
      { _id: 2, user: { fullName: 'Emily Davis' }, type: 'Sick Leave', startDate: '2025-04-10', endDate: '2025-04-10', days: 1 },
      { _id: 3, user: { fullName: 'Michael Wilson' }, type: 'Personal Leave', startDate: '2025-04-22', endDate: '2025-04-22', days: 1 }
    ]);
    
    // Mock team on leave
    setTeamOnLeave([
      { _id: 1, user: { fullName: 'Sarah Johnson' }, startDate: '2025-04-15', endDate: '2025-04-22', type: 'Annual Leave' },
      { _id: 2, user: { fullName: 'Robert Brown' }, startDate: '2025-04-18', endDate: '2025-04-21', type: 'Personal Leave' }
    ]);
    
    // Mock team stats
    setTeamStats({
      totalMembers: 8,
      onLeaveToday: 1,
      pendingRequests: 3,
      leaveUtilization: 65
    });
    
    // Set demo mode
    setIsDemo(true);
  };

  const handleApproveReject = async (leaveId, status, comments = "Processed via dashboard") => {
    try {
      // For demo mode, just update UI locally
      if (isDemo) {
        setPendingRequests(pendingRequests.filter(request => request._id !== leaveId));
        
        setTeamStats({
          ...teamStats,
          pendingRequests: teamStats.pendingRequests - 1
        });
        
        toast.success(`Leave request ${status.toLowerCase()} successfully (Demo Mode)`);
        return;
      }
      
      // Otherwise, call the real API
      await leavesAPI.updateLeaveStatus(leaveId, { 
        status, 
        comments 
      });
      
      toast.success(`Leave request ${status.toLowerCase()} successfully`);
      
      // Update the pendingRequests state to remove the processed request
      setPendingRequests(pendingRequests.filter(request => request._id !== leaveId));
      
      // Update team stats
      setTeamStats({
        ...teamStats,
        pendingRequests: teamStats.pendingRequests - 1
      });
    } catch (error) {
      console.error(`Failed to ${status.toLowerCase()} leave:`, error);
      toast.error(`Failed to ${status.toLowerCase()} leave request`);
    }
  };

  // If we're loading, show loading state
  if (loading) {
    return (
      <DashboardLayout pageTitle="Manager Dashboard" role="manager">
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout pageTitle="Manager Dashboard" role="manager">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{teamStats.totalMembers}</div>
              <Users className="h-5 w-5 text-brand-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total team members</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">On Leave Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{teamStats.onLeaveToday}</div>
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Team members absent today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{teamStats.pendingRequests}</div>
              <FileText className="h-5 w-5 text-brand-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting your approval</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Leave Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">{teamStats.leaveUtilization}%</div>
              <BarChart3 className="h-5 w-5 text-green-600" />
            </div>
            <Progress value={teamStats.leaveUtilization} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">Team leave utilization rate</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Leave requests that need your action</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.slice(0, 3).map((request) => (
                  <div key={request._id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0">
                    <div>
                      <div className="font-medium">{request.user?.fullName}</div>
                      <div className="text-sm text-muted-foreground">
                        {request.type}: {new Date(request.startDate).toISOString().split('T')[0]} to {new Date(request.endDate).toISOString().split('T')[0]} ({request.days} {request.days > 1 ? 'days' : 'day'})
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 border-red-200 hover:bg-red-50" 
                        onClick={() => handleApproveReject(request._id, 'Rejected', 'Rejected from dashboard')}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => handleApproveReject(request._id, 'Approved', 'Approved from dashboard')}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2" onClick={() => navigate('/manager/approvals')}>
                  View All Requests
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No pending requests at the moment
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Team Members on Leave</CardTitle>
            <CardDescription>Upcoming and current absences</CardDescription>
          </CardHeader>
          <CardContent>
            {teamOnLeave.length > 0 ? (
              <div className="space-y-4">
                {teamOnLeave.map((leave) => (
                  <div key={leave._id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0">
                    <div>
                      <div className="font-medium">{leave.user?.fullName}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(leave.startDate).toISOString().split('T')[0]} to {new Date(leave.endDate).toISOString().split('T')[0]}
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      {leave.type}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-2" onClick={() => navigate('/manager/calendar')}>
                  View Team Calendar
                </Button>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No team members on leave currently
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Leave Distribution by Type</CardTitle>
            <CardDescription>How your team is using different leave types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Annual Leave</span>
                  <span className="text-sm text-muted-foreground">65%</span>
                </div>
                <Progress value={65} className="h-2 bg-gray-100" indicatorClassName="bg-blue-500" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sick Leave</span>
                  <span className="text-sm text-muted-foreground">20%</span>
                </div>
                <Progress value={20} className="h-2 bg-gray-100" indicatorClassName="bg-red-500" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Personal Leave</span>
                  <span className="text-sm text-muted-foreground">10%</span>
                </div>
                <Progress value={10} className="h-2 bg-gray-100" indicatorClassName="bg-amber-500" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Other</span>
                  <span className="text-sm text-muted-foreground">5%</span>
                </div>
                <Progress value={5} className="h-2 bg-gray-100" indicatorClassName="bg-green-500" />
              </div>
            </div>
            <div className="mt-6">
              <Button variant="outline" className="w-full" onClick={() => navigate('/manager/reports')}>
                View Detailed Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ManagerDashboard;
