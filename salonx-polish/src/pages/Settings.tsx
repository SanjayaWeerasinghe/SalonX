import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Building2, Bell, Shield, Palette, Globe, CreditCard } from "lucide-react";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="font-serif text-3xl font-semibold">Settings</h1>
          <p className="text-muted-foreground">Manage your salon preferences and account</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="general" className="gap-2">
              <Building2 className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>Update your salon's basic information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="bg-gradient-primary text-2xl font-serif text-primary-foreground">
                      SX
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline">Change Logo</Button>
                </div>
                <Separator />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Business Name</Label>
                    <Input defaultValue="SalonX Beauty Studio" />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input defaultValue="+1 (555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input defaultValue="hello@salonx.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Website</Label>
                    <Input defaultValue="www.salonx.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input defaultValue="123 Beauty Lane, Fashion District, NY 10001" />
                </div>
                <Button className="bg-gradient-primary text-primary-foreground">Save Changes</Button>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Business Hours</CardTitle>
                <CardDescription>Set your salon's operating hours</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                    <div key={day} className="flex items-center justify-between">
                      <span className="font-medium w-28">{day}</span>
                      <div className="flex items-center gap-2">
                        <Input type="time" defaultValue="09:00" className="w-32" />
                        <span>to</span>
                        <Input type="time" defaultValue="20:00" className="w-32" />
                      </div>
                      <Switch defaultChecked={day !== "Sunday"} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Configure your email notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "New appointment bookings", desc: "Get notified when a client books an appointment" },
                  { label: "Appointment reminders", desc: "Send reminders to clients before appointments" },
                  { label: "Cancellations", desc: "Get notified when a client cancels" },
                  { label: "Daily summary", desc: "Receive a daily summary of appointments" },
                  { label: "Weekly reports", desc: "Receive weekly business performance reports" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>SMS Notifications</CardTitle>
                <CardDescription>Configure SMS notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Appointment confirmations", desc: "Send SMS confirmations to clients" },
                  { label: "Appointment reminders", desc: "Send SMS reminders before appointments" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Current Password</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>New Password</Label>
                  <Input type="password" />
                </div>
                <div className="space-y-2">
                  <Label>Confirm New Password</Label>
                  <Input type="password" />
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable 2FA</p>
                    <p className="text-sm text-muted-foreground">Use an authenticator app for additional security</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Customize the appearance of your dashboard</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex-col gap-2 border-2 border-primary">
                    <div className="h-8 w-8 rounded-full bg-background border-2" />
                    <span>Light</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-900" />
                    <span>Dark</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-background to-gray-900" />
                    <span>System</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Language & Region</CardTitle>
                <CardDescription>Set your preferred language and regional settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <Label>Language</Label>
                    <Input defaultValue="English (US)" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <Label>Currency</Label>
                    <Input defaultValue="USD ($)" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
