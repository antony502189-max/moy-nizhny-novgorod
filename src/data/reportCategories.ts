import type { L10n } from '../core/i18n';
export interface ReportCategory { id: string; icon: string; label: L10n }
export const CATEGORIES: ReportCategory[] = [
  { id: 'toilet', icon: 'wc', label: { ru: 'Нет туалета рядом', en: 'No toilet nearby', zh: '附近没有厕所' } },
  { id: 'water', icon: 'drop', label: { ru: 'Нет питьевой воды', en: 'No drinking water', zh: '没有饮用水' } },
  { id: 'stepfree', icon: 'access', label: { ru: 'Нет безбарьерного пути', en: 'No step-free route', zh: '没有无障碍通道' } },
  { id: 'pavement', icon: 'stairs', label: { ru: 'Разбитое покрытие', en: 'Damaged pavement', zh: '路面损坏' } },
  { id: 'lighting', icon: 'sunset', label: { ru: 'Нет освещения', en: 'No lighting', zh: '缺少照明' } },
  { id: 'signage', icon: 'info', label: { ru: 'Нет указателей / языка', en: 'No signs / languages', zh: '缺少指示牌/语言' } },
  { id: 'transport', icon: 'route', label: { ru: 'Транспорт', en: 'Transport', zh: '交通' } },
  { id: 'cleanliness', icon: 'cloud', label: { ru: 'Чистота и мусор', en: 'Cleanliness and litter', zh: '清洁与垃圾' } },
  { id: 'safety', icon: 'flag', label: { ru: 'Безопасность', en: 'Safety', zh: '安全' } },
  { id: 'other', icon: 'heart', label: { ru: 'Другое', en: 'Other', zh: '其他' } },
];
export const catById = (id: string) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
