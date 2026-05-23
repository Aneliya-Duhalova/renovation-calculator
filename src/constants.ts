import type { ActivityDefinition, ActivityPrice } from './types';

export const ACTIVITIES: ActivityDefinition[] = [
  {
    id: 'drywall',
    name: 'Гипс картон',
    description: 'Монтаж на гипсокартон',
    defaultPrice: 18,
    unit: 'm2',
  },
  {
    id: 'putty_one',
    name: 'Шпакловка – 1 ръка',
    description: 'Шпакловка с едно нанасяне',
    defaultPrice: 6,
    unit: 'm2',
  },
  {
    id: 'putty_two',
    name: 'Шпакловка – 2 ръце',
    description: 'Шпакловка с две нанасяне',
    defaultPrice: 10,
    unit: 'm2',
  },
  {
    id: 'paint',
    name: 'Боя',
    description: 'Боядисване на стени/таван',
    defaultPrice: 8,
    unit: 'm2',
  },
  {
    id: 'frieze',
    name: 'Лепене на фризове',
    description: 'Монтаж на декоративни фризове',
    defaultPrice: 5,
    unit: 'lm',
  },
  {
    id: 'grout',
    name: 'Фугиране',
    description: 'Фугиране на плочки/шевове',
    defaultPrice: 4,
    unit: 'm2',
  },
  {
    id: 'wallpaper_removal',
    name: 'Чистене на тапети',
    description: 'Премахване на стари тапети',
    defaultPrice: 5,
    unit: 'm2',
  },
  {
    id: 'primer',
    name: 'Грундиране',
    description: 'Грунд върху подготвена повърхност',
    defaultPrice: 3,
    unit: 'm2',
  },
];

export const DEFAULT_PRICES: ActivityPrice[] = ACTIVITIES.map((a) => ({
  id: a.id,
  price: a.defaultPrice,
  unit: a.unit,
  enabled: true,
}));

export const STORAGE_KEY = '@renovation_prices_v1';

export const CURRENCY = 'лв.';
