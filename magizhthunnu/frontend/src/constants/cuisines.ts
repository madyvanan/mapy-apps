import type { LucideIcon } from 'lucide-react';
import { Beef, IceCreamCone, Pizza, Salad, Sandwich, Soup } from 'lucide-react';

export interface Cuisine {
  label: string;
  icon: LucideIcon;
}

export const CUISINES: Cuisine[] = [
  { label: 'South Indian', icon: Soup },
  { label: 'North Indian', icon: Salad },
  { label: 'Chinese', icon: Soup },
  { label: 'Biryani', icon: Beef },
  { label: 'Pizza', icon: Pizza },
  { label: 'Burgers', icon: Sandwich },
  { label: 'Desserts', icon: IceCreamCone },
];