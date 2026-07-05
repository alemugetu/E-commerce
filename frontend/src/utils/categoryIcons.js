import { HiShoppingBag, HiCpuChip, HiHomeModern, HiSparkles } from 'react-icons/hi2';
import { FaUtensils, FaTshirt, FaLeaf, FaGamepad, FaBook, FaCar } from 'react-icons/fa';

const ICON_RULES = [
  { keywords: ['food', 'grocery', 'drink', 'beverage', 'snack'], icon: FaUtensils },
  { keywords: ['electronic', 'tech', 'computer', 'phone', 'gadget', 'device'], icon: HiCpuChip },
  { keywords: ['cloth', 'fashion', 'wear', 'apparel', 'shoe'], icon: FaTshirt },
  { keywords: ['home', 'garden', 'furniture', 'kitchen', 'decor'], icon: HiHomeModern },
  { keywords: ['beauty', 'health', 'cosmetic', 'care'], icon: HiSparkles },
  { keywords: ['sport', 'fitness', 'outdoor'], icon: FaGamepad },
  { keywords: ['book', 'stationery', 'office'], icon: FaBook },
  { keywords: ['auto', 'car', 'vehicle'], icon: FaCar },
  { keywords: ['plant', 'organic', 'farm'], icon: FaLeaf },
];

export const getCategoryIcon = (name = '', slug = '') => {
  const text = `${name} ${slug}`.toLowerCase();
  const match = ICON_RULES.find((rule) =>
    rule.keywords.some((keyword) => text.includes(keyword))
  );
  return match?.icon || HiShoppingBag;
};
