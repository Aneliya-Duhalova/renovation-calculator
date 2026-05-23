import type { ActivityCategory, ActivityDefinition, ActivityPrice } from './types';

export const CURRENCY = '€';

export const CATEGORY_ORDER: ActivityCategory[] = [
  'drywall',
  'finish',
  'plumbing',
  'electrical',
];

export const CATEGORY_LABELS: Record<ActivityCategory, string> = {
  drywall: 'Гипсокартон',
  finish: 'Шпакловка, боя и довършителни работи',
  plumbing: 'ВиК',
  electrical: 'Електро',
};

export const ACTIVITIES: ActivityDefinition[] = [
  {
    id: 'drywall_lining',
    category: 'drywall',
    name: 'Предстенна обшивка',
    description: 'Обшивка пред съществуваща стена',
    defaultPrice: 20,
    unit: 'm2',
  },
  {
    id: 'drywall_partition',
    category: 'drywall',
    name: 'Преградна стена',
    description: 'Нова преградна стена от гипсокартон',
    defaultPrice: 30,
    unit: 'm2',
  },
  {
    id: 'drywall_double',
    category: 'drywall',
    name: 'Двоен картон',
    description: 'Монтаж с двоен гипсокартон',
    defaultPrice: 35,
    unit: 'm2',
  },
  {
    id: 'putty_joints',
    category: 'finish',
    name: 'Шпакловка фуги',
    description: 'Замазване на фуги между плочи/листове',
    defaultPrice: 3,
    unit: 'm2',
  },
  {
    id: 'openings_wrap',
    category: 'finish',
    name: 'Обръщане на врати и прозорци',
    description: 'Обръщане на отвори – линеен метър',
    defaultPrice: 10,
    unit: 'lm',
  },
  {
    id: 'putty_two_fine',
    category: 'finish',
    name: 'Шпакловка две ръце – фино',
    description: 'Финна шпакловка с две нанасяне',
    defaultPrice: 10,
    unit: 'm2',
  },
  {
    id: 'sanding',
    category: 'finish',
    name: 'Шкурене',
    description: 'Шкурене на подготвена повърхност',
    defaultPrice: 2.5,
    unit: 'm2',
  },
  {
    id: 'primer',
    category: 'finish',
    name: 'Грундиране',
    description: 'Грунд върху подготвена повърхност',
    defaultPrice: 2,
    unit: 'm2',
  },
  {
    id: 'paint_one',
    category: 'finish',
    name: 'Боядисване – един цвят',
    description: 'Боядисване в един цвят',
    defaultPrice: 6,
    unit: 'm2',
  },
  {
    id: 'paint_multi',
    category: 'finish',
    name: 'Боядисване – два и повече цвята',
    description: 'Боядисване в два или повече цвята',
    defaultPrice: 12,
    unit: 'm2',
  },
  {
    id: 'plumb_sink',
    category: 'plumbing',
    name: 'Монтаж на мивка',
    description: 'ВиК – цена по договаряне',
    defaultPrice: 0,
    unit: 'm2',
    priceOnRequest: true,
  },
  {
    id: 'plumb_toilet',
    category: 'plumbing',
    name: 'Монтаж на тоалетна',
    description: 'ВиК – цена по договаряне',
    defaultPrice: 0,
    unit: 'm2',
    priceOnRequest: true,
  },
  {
    id: 'plumb_boiler',
    category: 'plumbing',
    name: 'Монтаж на бойлер',
    description: 'ВиК – цена по договаряне',
    defaultPrice: 0,
    unit: 'm2',
    priceOnRequest: true,
  },
  {
    id: 'plumb_pipes',
    category: 'plumbing',
    name: 'Водопроводни инсталации',
    description: 'ВиК – цена по договаряне',
    defaultPrice: 0,
    unit: 'm2',
    priceOnRequest: true,
  },
  {
    id: 'plumb_drain',
    category: 'plumbing',
    name: 'Канализация',
    description: 'ВиК – цена по договаряне',
    defaultPrice: 0,
    unit: 'm2',
    priceOnRequest: true,
  },
  {
    id: 'electro_outlets',
    category: 'electrical',
    name: 'Контакти и ключове',
    description: 'Електро – цена по договаряне',
    defaultPrice: 0,
    unit: 'm2',
    priceOnRequest: true,
  },
  {
    id: 'electro_lighting',
    category: 'electrical',
    name: 'Осветление',
    description: 'Електро – цена по договаряне',
    defaultPrice: 0,
    unit: 'm2',
    priceOnRequest: true,
  },
  {
    id: 'electro_panel',
    category: 'electrical',
    name: 'Електро табло',
    description: 'Електро – цена по договаряне',
    defaultPrice: 0,
    unit: 'm2',
    priceOnRequest: true,
  },
  {
    id: 'electro_cables',
    category: 'electrical',
    name: 'Силови кабели',
    description: 'Електро – цена по договаряне',
    defaultPrice: 0,
    unit: 'm2',
    priceOnRequest: true,
  },
];

export const DEFAULT_PRICES: ActivityPrice[] = ACTIVITIES.map((a) => ({
  id: a.id,
  price: a.defaultPrice,
  unit: a.unit,
  enabled: !a.priceOnRequest,
}));

export const STORAGE_KEY = '@renovation_prices_v2';

export function getActivityDef(id: string) {
  return ACTIVITIES.find((a) => a.id === id);
}

export function activitiesByCategory(): Map<ActivityCategory, ActivityDefinition[]> {
  const map = new Map<ActivityCategory, ActivityDefinition[]>();
  for (const cat of CATEGORY_ORDER) {
    map.set(
      cat,
      ACTIVITIES.filter((a) => a.category === cat),
    );
  }
  return map;
}
