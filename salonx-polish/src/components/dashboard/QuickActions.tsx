import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus, UserPlus, Scissors, Receipt } from "lucide-react";

const actions = [
  {
    icon: CalendarPlus,
    label: "New Appointment",
    description: "Book a new appointment",
    color: "bg-blue-500",
  },
  {
    icon: UserPlus,
    label: "Add Client",
    description: "Register new client",
    color: "bg-emerald-500",
  },
  {
    icon: Scissors,
    label: "Add Service",
    description: "Create new service",
    color: "bg-purple-500",
  },
  {
    icon: Receipt,
    label: "Create Invoice",
    description: "Generate invoice",
    color: "bg-amber-500",
  },
];

export function QuickActions() {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="font-serif text-xl">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:border-primary hover:bg-primary/5 transition-all"
            >
              <div className={`h-10 w-10 rounded-lg ${action.color} flex items-center justify-center`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">{action.label}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
