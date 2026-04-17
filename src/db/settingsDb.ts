import Dexie, { type Table } from 'dexie';
import type { BrandSettings } from '../../types';

interface SettingsRecord {
  key: string;
  value: BrandSettings;
}

class SettingsDB extends Dexie {
  settings!: Table<SettingsRecord, string>;

  constructor() {
    super('HRcopilot_settings');
    this.version(1).stores({ settings: 'key' });
  }
}

export const settingsDb = new SettingsDB();

const BRAND_KEY = 'brand';

export async function loadBrandSettings(): Promise<BrandSettings | null> {
  const record = await settingsDb.settings.get(BRAND_KEY);
  return record?.value ?? null;
}

export async function saveBrandSettings(brand: BrandSettings): Promise<void> {
  await settingsDb.settings.put({ key: BRAND_KEY, value: brand });
}
