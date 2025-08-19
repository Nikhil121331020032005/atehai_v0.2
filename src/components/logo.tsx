
import { Leaf } from "lucide-react";

export function Logo() {
  return (
    <div className="flex items-center gap-2 p-2">
      <Leaf className="h-7 w-7 text-primary" />
      <h2 className="text-xl font-bold tracking-tight text-foreground">
        Verde Budget
      </h2>
    </div>
  );
}
