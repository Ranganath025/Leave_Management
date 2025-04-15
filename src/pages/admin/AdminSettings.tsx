
import React, { useState } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';

const AdminSettings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [leaveApprovalNotifications, setLeaveApprovalNotifications] = useState(true);
  const [newUserNotifications, setNewUserNotifications] = useState(true);
  const [companyName, setCompanyName] = useState('Leave Management');
  const [adminEmail, setAdminEmail] = useState('admin@example.com');
  const [fiscalYearStart, setFiscalYearStart] = useState('January');
  const [weekStartDay, setWeekStartDay] = useState('Monday');
  const [maxLeaveDays, setMaxLeaveDays] = useState('21');
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [clearDataDialog, setClearDataDialog] = useState(false);

  const handleSaveGeneral = () => {
    toast.success('General settings saved successfully');
  };

  const handleSaveLeavePolicy = () => {
    toast.success('Leave policy settings saved successfully');
  };

  const handleSaveNotifications = () => {
    toast.success('Notification settings saved successfully');
  };

  const handleImport = () => {
    setIsImporting(true);
    // Simulate import process
    setTimeout(() => {
      setIsImporting(false);
      toast.success('Data imported successfully');
    }, 2000);
  };

  const handleExport = () => {
    setIsExporting(true);
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      toast.success('Data exported successfully');
    }, 2000);
  };

  const handleClearData = () => {
    setClearDataDialog(false);
    // Simulate clearing data
    setTimeout(() => {
      toast.success('All data has been cleared');
    }, 1000);
  };

  return (
    <DashboardLayout pageTitle="System Settings" role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">System Settings</h1>
          <p className="text-gray-600">Manage application settings and configurations</p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="leave-policy">Leave Policy</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="data">Data Management</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure basic system settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input 
                    id="companyName" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Administrator Email</Label>
                  <Input 
                    id="adminEmail" 
                    type="email" 
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiscalYear">Fiscal Year Start Month</Label>
                  <select 
                    id="fiscalYear"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={fiscalYearStart}
                    onChange={(e) => setFiscalYearStart(e.target.value)}
                  >
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="April">April</option>
                    <option value="May">May</option>
                    <option value="June">June</option>
                    <option value="July">July</option>
                    <option value="August">August</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                    <option value="December">December</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weekStart">Week Start Day</Label>
                  <select 
                    id="weekStart"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={weekStartDay}
                    onChange={(e) => setWeekStartDay(e.target.value)}
                  >
                    <option value="Monday">Monday</option>
                    <option value="Sunday">Sunday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveGeneral}>Save Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Leave Policy Settings */}
          <TabsContent value="leave-policy">
            <Card>
              <CardHeader>
                <CardTitle>Leave Policy Settings</CardTitle>
                <CardDescription>Configure leave policies and rules</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maxLeaveDays">Maximum Annual Leave Days</Label>
                  <Input 
                    id="maxLeaveDays" 
                    type="number" 
                    min="0" 
                    value={maxLeaveDays}
                    onChange={(e) => setMaxLeaveDays(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="requireApproval" defaultChecked />
                  <Label htmlFor="requireApproval">Require Manager Approval for All Leaves</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="carryoverLeave" defaultChecked />
                  <Label htmlFor="carryoverLeave">Allow Leave Day Carryover to Next Year</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="sickLeaveProof" />
                  <Label htmlFor="sickLeaveProof">Require Documentation for Sick Leave</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveLeavePolicy}>Save Leave Policy</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Manage email and system notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="emailNotifications" 
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                  <Label htmlFor="emailNotifications">Enable Email Notifications</Label>
                </div>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Administrator Notifications</h3>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="leaveApprovalNotifications" 
                      checked={leaveApprovalNotifications}
                      onCheckedChange={setLeaveApprovalNotifications}
                      disabled={!emailNotifications}
                    />
                    <Label htmlFor="leaveApprovalNotifications">Leave Approval Requests</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="newUserNotifications" 
                      checked={newUserNotifications}
                      onCheckedChange={setNewUserNotifications}
                      disabled={!emailNotifications}
                    />
                    <Label htmlFor="newUserNotifications">New User Registrations</Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Import, export, or clear system data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Import Data</h3>
                  <p className="text-sm text-gray-500">
                    Import users and leave data from a CSV file
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Import Data</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Import Data</DialogTitle>
                        <DialogDescription>
                          Upload a CSV file to import data into the system
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Label htmlFor="dataFile">Select File</Label>
                        <Input id="dataFile" type="file" className="mt-2" />
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handleImport}
                          disabled={isImporting}
                        >
                          {isImporting ? 'Importing...' : 'Import Data'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Export Data</h3>
                  <p className="text-sm text-gray-500">
                    Export all system data for backup or reporting
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">Export Data</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Export Data</DialogTitle>
                        <DialogDescription>
                          Select the data you want to export
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="exportUsers" defaultChecked />
                            <Label htmlFor="exportUsers">Users Data</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="exportLeaves" defaultChecked />
                            <Label htmlFor="exportLeaves">Leave Requests</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input type="checkbox" id="exportSettings" defaultChecked />
                            <Label htmlFor="exportSettings">System Settings</Label>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handleExport}
                          disabled={isExporting}
                        >
                          {isExporting ? 'Exporting...' : 'Export Data'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Clear Data</h3>
                  <p className="text-sm text-gray-500">
                    Delete all system data. This action cannot be undone.
                  </p>
                  <AlertDialog open={clearDataDialog} onOpenChange={setClearDataDialog}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Clear All Data</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete all data
                          including users, leave requests, and settings.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearData}>
                          Yes, clear all data
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
