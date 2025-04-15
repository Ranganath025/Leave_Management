import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  Clock, 
  Settings, 
  FileText 
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // Mock data for dashboard
  const stats = {
    totalEmployees: 42,
    pendingRequests: 7,
    approvedLeaves: 23,
    leaveDaysUsed: 187,
    totalLeaveDays: 336,
    leavesThisMonth: 12
  };
  
  const departmentStats = [
    { name: 'Engineering', employees: 15, onLeave: 3, leavePercentage: 20 },
    { name: 'Marketing', employees: 8, onLeave: 1, leavePercentage: 12.5 },
    { name: 'Sales', employees: 10, onLeave: 2, leavePercentage: 20 },
    { name: 'HR', employees: 4, onLeave: 0, leavePercentage: 0 },
    { name: 'Finance', employees: 5, onLeave: 1, leavePercentage: 20 }
  ];

  return (
    <DashboardLayout pageTitle="Admin Dashboard" role="admin">
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all departments
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved Leaves</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedLeaves}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Current and upcoming
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Leave Usage</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((stats.leaveDaysUsed / stats.totalLeaveDays) * 100)}%</div>
            <Progress value={(stats.leaveDaysUsed / stats.totalLeaveDays) * 100} className="h-2 mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {stats.leaveDaysUsed} of {stats.totalLeaveDays} days used
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Department Overview</CardTitle>
            <CardDescription>Leave distribution across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {departmentStats.map((dept) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{dept.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {dept.onLeave} of {dept.employees} on leave
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={dept.leavePercentage} 
                      className="h-2 flex-1" 
                    />
                    <span className="text-sm font-medium w-10 text-right">
                      {dept.leavePercentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-6"
              onClick={() => navigate('/admin/departments')}
            >
              View All Departments
            </Button>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Leave Statistics</CardTitle>
            <CardDescription>Overview of leave trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">This Month</span>
                    <Calendar className="h-4 w-4 text-brand-600" />
                  </div>
                  <p className="text-2xl font-bold">{stats.leavesThisMonth}</p>
                  <p className="text-sm text-muted-foreground">Leave requests</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Avg. Duration</span>
                    <Clock className="h-4 w-4 text-brand-600" />
                  </div>
                  <p className="text-2xl font-bold">3.2</p>
                  <p className="text-sm text-muted-foreground">Days per leave</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Sick Leave</span>
                    <Settings className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold">32%</p>
                  <p className="text-sm text-muted-foreground">Of total leaves</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Vacation</span>
                    <Settings className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold">58%</p>
                  <p className="text-sm text-muted-foreground">Of total leaves</p>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-6"
              onClick={() => navigate('/admin/reports')}
            >
              View Detailed Reports
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Leave Activity</CardTitle>
            <CardDescription>Latest leave requests and approvals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      i % 3 === 0 ? 'bg-amber-500' : i % 3 === 1 ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <div className="font-medium">
                        {i % 3 === 0 ? 'Robert Brown requested leave' : 
                         i % 3 === 1 ? 'Maria Garcia approved John Smith\'s leave' :
                         'David Lee rejected Emily Davis\'s leave'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {i % 2 === 0 ? '2 hours ago' : '1 day ago'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => navigate('/admin/activity')}
              >
                View All Activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
