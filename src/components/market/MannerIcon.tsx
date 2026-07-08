import {
  AlertOctagon,
  User,
  Home,
  ShoppingBag,
  Store,
  Landmark,
  Crown
} from 'lucide-react';

interface MannerIconProps {
  score: number;
  className?: string;
}

export function MannerIcon({ score, className = "w-4 h-4" }: MannerIconProps) {
  if (score < 30) return <AlertOctagon className={className} />;
  if (score < 36.5) return <User className={className} />;
  if (score < 40) return <Home className={className} />;
  if (score < 60) return <ShoppingBag className={className} />;
  if (score < 80) return <Store className={className} />;
  if (score < 100) return <Landmark className={className} />;
  return <Crown className={className} />;
}
