import { CATEGORIES } from "@/lib/data";
import type { CategoryName } from "@/lib/types";
import { MoreHorizontal } from "lucide-react";

type CategoryIconProps = {
  name: CategoryName;
  className?: string;
};

export function CategoryIcon({ name, ...props }: CategoryIconProps) {
  const category = CATEGORIES.find(c => c.name === name);
  const Icon = category ? category.icon : MoreHorizontal;
  return <Icon {...props} />;
}
