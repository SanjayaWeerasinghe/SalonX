import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const staff = [
  {
    id: 1,
    name: "Jessica Smith",
    role: "Senior Stylist",
    initials: "JS",
    avatar: "",
    status: "available",
    bookings: 6,
    maxBookings: 8,
  },
  {
    id: 2,
    name: "Alex Johnson",
    role: "Barber",
    initials: "AJ",
    avatar: "",
    status: "busy",
    bookings: 5,
    maxBookings: 6,
  },
  {
    id: 3,
    name: "Maria Garcia",
    role: "Nail Technician",
    initials: "MG",
    avatar: "",
    status: "available",
    bookings: 4,
    maxBookings: 7,
  },
  {
    id: 4,
    name: "David Lee",
    role: "Esthetician",
    initials: "DL",
    avatar: "",
    status: "break",
    bookings: 3,
    maxBookings: 6,
  },
];

const statusStyles = {
  available: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  busy: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  break: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  offline: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

export function StaffOverview() {
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="font-serif text-xl">Staff Today</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {staff.map((member) => (
          <div key={member.id} className="flex items-center gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {member.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium truncate">{member.name}</p>
                <Badge
                  variant="secondary"
                  className={statusStyles[member.status as keyof typeof statusStyles]}
                >
                  {member.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-1">{member.role}</p>
              <div className="flex items-center gap-2">
                <Progress
                  value={(member.bookings / member.maxBookings) * 100}
                  className="h-1.5 flex-1"
                />
                <span className="text-xs text-muted-foreground">
                  {member.bookings}/{member.maxBookings}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
