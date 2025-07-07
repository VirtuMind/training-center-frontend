import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Course Catalog</h1>
        <p className="text-muted-foreground">
          Discover our comprehensive training programs
        </p>
      </div>
      <Card>
        <CardHeader className="text-center">
          <Loader2 className="h-16 w-16 mx-auto text-muted-foreground mb-4 animate-spin" />
          <CardTitle className="text-2xl">Loading Courses...</CardTitle>
          <CardDescription>
            Please wait while we fetch the available courses
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
