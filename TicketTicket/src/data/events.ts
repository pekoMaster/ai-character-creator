// HOLOLIVE 活動清單
// 這個檔案提供預設的 HOLOLIVE 活動選項供發布頁面選擇

import { EventCategory } from '@/types';

export interface EventData {
  id: string;
  name: string;
  artist?: string;
  category: EventCategory;
}

// HOLOLIVE 相關活動（預設清單）
export const hololiveEvents: EventData[] = [
  // hololive Production 全體活動
  { id: 'hololive-fes-5', name: 'hololive 5th fes. Capture the Moment', artist: 'hololive', category: 'concert' },
  { id: 'hololive-super-expo', name: 'hololive SUPER EXPO 2025', artist: 'hololive', category: 'expo' },
  { id: 'hololive-meet', name: 'hololive Meet', artist: 'hololive', category: 'fan_meeting' },
  { id: 'hololive-countdown', name: 'hololive Countdown Live', artist: 'hololive', category: 'concert' },

  // hololive JP
  { id: 'suisei-stellar', name: 'Stellar into the Galaxy', artist: '星街すいせい', category: 'concert' },
  { id: 'suisei-birthday', name: '星街すいせい Birthday Live', artist: '星街すいせい', category: 'streaming' },
  { id: 'fubuki-birthday', name: '白上フブキ Birthday Live', artist: '白上フブキ', category: 'streaming' },
  { id: 'aqua-live', name: '湊あくあ Solo Live', artist: '湊あくあ', category: 'concert' },
  { id: 'pekora-live', name: '兎田ぺこら Solo Live', artist: '兎田ぺこら', category: 'concert' },
  { id: 'marine-live', name: '宝鐘マリン Solo Live', artist: '宝鐘マリン', category: 'concert' },
  { id: 'miko-live', name: 'さくらみこ Solo Live', artist: 'さくらみこ', category: 'concert' },
  { id: 'korone-live', name: '戌神ころね Solo Live', artist: '戌神ころね', category: 'concert' },
  { id: 'okayu-live', name: '猫又おかゆ Solo Live', artist: '猫又おかゆ', category: 'concert' },
  { id: 'ayame-live', name: '百鬼あやめ Solo Live', artist: '百鬼あやめ', category: 'concert' },
  { id: 'subaru-live', name: '大空スバル Solo Live', artist: '大空スバル', category: 'concert' },
  { id: 'noel-live', name: '白銀ノエル Solo Live', artist: '白銀ノエル', category: 'concert' },
  { id: 'flare-live', name: '不知火フレア Solo Live', artist: '不知火フレア', category: 'concert' },
  { id: 'watame-live', name: '角巻わため Solo Live', artist: '角巻わため', category: 'concert' },
  { id: 'kanata-live', name: '天音かなた Solo Live', artist: '天音かなた', category: 'concert' },
  { id: 'towa-live', name: '常闘トワ Solo Live', artist: '常闘トワ', category: 'concert' },
  { id: 'luna-live', name: '姫森ルーナ Solo Live', artist: '姫森ルーナ', category: 'concert' },
  { id: 'lamy-live', name: '雪花ラミィ Solo Live', artist: '雪花ラミィ', category: 'concert' },
  { id: 'botan-live', name: '獅白ぼたん Solo Live', artist: '獅白ぼたん', category: 'concert' },
  { id: 'polka-live', name: '尾丸ポルカ Solo Live', artist: '尾丸ポルカ', category: 'concert' },
  { id: 'laplus-live', name: 'ラプラス・ダークネス Solo Live', artist: 'ラプラス・ダークネス', category: 'concert' },
  { id: 'lui-live', name: '鷹嶺ルイ Solo Live', artist: '鷹嶺ルイ', category: 'concert' },
  { id: 'koyori-live', name: '博衣こより Solo Live', artist: '博衣こより', category: 'concert' },
  { id: 'chloe-live', name: '沙花叉クロヱ Solo Live', artist: '沙花叉クロヱ', category: 'concert' },
  { id: 'iroha-live', name: '風真いろは Solo Live', artist: '風真いろは', category: 'concert' },

  // hololive EN
  { id: 'mori-calliope-live', name: 'UnAlive Tour 2025', artist: 'Mori Calliope', category: 'concert' },
  { id: 'gura-live', name: 'Gawr Gura 3D LIVE', artist: 'Gawr Gura', category: 'streaming' },
  { id: 'irys-live', name: 'IRyS 1st Solo Live', artist: 'IRyS', category: 'concert' },
  { id: 'kiara-live', name: 'Takanashi Kiara Solo Live', artist: 'Takanashi Kiara', category: 'concert' },
  { id: 'ina-live', name: 'Ninomae Ina\'nis Solo Live', artist: 'Ninomae Ina\'nis', category: 'concert' },
  { id: 'ame-live', name: 'Watson Amelia Solo Live', artist: 'Watson Amelia', category: 'concert' },
  { id: 'kronii-live', name: 'Ouro Kronii Solo Live', artist: 'Ouro Kronii', category: 'concert' },
  { id: 'mumei-live', name: 'Nanashi Mumei Solo Live', artist: 'Nanashi Mumei', category: 'concert' },
  { id: 'fauna-live', name: 'Ceres Fauna Solo Live', artist: 'Ceres Fauna', category: 'concert' },
  { id: 'baelz-live', name: 'Hakos Baelz Solo Live', artist: 'Hakos Baelz', category: 'concert' },
  { id: 'myth-anniversary', name: 'hololive Myth Anniversary', artist: 'hololive EN', category: 'streaming' },
  { id: 'council-anniversary', name: 'hololive Council Anniversary', artist: 'hololive EN', category: 'streaming' },

  // hololive ID
  { id: 'risu-live', name: 'Ayunda Risu Solo Live', artist: 'Ayunda Risu', category: 'concert' },
  { id: 'moona-live', name: 'Moona Hoshinova Solo Live', artist: 'Moona Hoshinova', category: 'concert' },
  { id: 'iofi-live', name: 'Airani Iofifteen Solo Live', artist: 'Airani Iofifteen', category: 'concert' },
  { id: 'ollie-live', name: 'Kureiji Ollie Solo Live', artist: 'Kureiji Ollie', category: 'concert' },
  { id: 'anya-live', name: 'Anya Melfissa Solo Live', artist: 'Anya Melfissa', category: 'concert' },
  { id: 'reine-live', name: 'Pavolia Reine Solo Live', artist: 'Pavolia Reine', category: 'concert' },
  { id: 'holoid-anniversary', name: 'hololive ID Anniversary', artist: 'hololive ID', category: 'streaming' },

  // HOLOSTARS
  { id: 'holostars-live', name: 'HOLOSTARS Live', artist: 'HOLOSTARS', category: 'concert' },
  { id: 'tempus-live', name: 'HOLOSTARS Tempus Live', artist: 'HOLOSTARS EN', category: 'concert' },
  { id: 'uproar-live', name: 'HOLOSTARS UPROAR!! Live', artist: 'HOLOSTARS', category: 'concert' },

  // 特別活動
  { id: 'hololive-summer', name: 'hololive Summer Festival', artist: 'hololive', category: 'fan_meeting' },
  { id: 'hololive-sports', name: 'hololive Sports Festival', artist: 'hololive', category: 'streaming' },
  { id: 'hololive-mario-kart', name: 'hololive Mario Kart Tournament', artist: 'hololive', category: 'streaming' },
];

// 取得所有活動名稱（用於下拉選單）
export function getEventNames(): string[] {
  return hololiveEvents.map(event => event.name);
}

// 搜尋活動
export function searchEvents(query: string): EventData[] {
  const lowerQuery = query.toLowerCase();
  return hololiveEvents.filter(
    event =>
      event.name.toLowerCase().includes(lowerQuery) ||
      event.artist?.toLowerCase().includes(lowerQuery)
  );
}

// 根據分類取得活動
export function getEventsByCategory(category: EventCategory): EventData[] {
  return hololiveEvents.filter(event => event.category === category);
}

// 取得藝人清單（不重複）
export function getArtists(): string[] {
  const artists = new Set<string>();
  hololiveEvents.forEach(event => {
    if (event.artist) {
      artists.add(event.artist);
    }
  });
  return Array.from(artists).sort();
}
