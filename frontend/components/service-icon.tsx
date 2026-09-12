import { Bike, Dumbbell, Flower2, Salad, Target, Users, Waves } from "lucide-react";
import type { Service } from "@data/gym-info";

const ICONS: Record<Service["icon"], React.ComponentType<{ className?: string }>> = {
  dumbbell: Dumbbell,
  bike: Bike,
  flower: Flower2,
  salad: Salad,
  waves: Waves,
  target: Target,
  users: Users,
};

export function ServiceIcon({
  icon,
  className,
}: {
  icon: Service["icon"];
  className?: string;
}) {
  const Icon = ICONS[icon];
  return <Icon className={className} />;
}
