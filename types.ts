
export interface PropertyBuff {
  type: 'rent' | 'maintenanceCost';
  scope: 'all' | '주거' | '상업';
  value: number; // e.g., 1.1 for +10% rent, 0.9 for -10% maintenance
  description: string;
}

export interface Property {
  id: number;
  name: string;
  type: '주거' | '상업';
  purchasePrice: number;
  marketValue: number;
  marketValueHistory: number[];
  rent: number;
  maintenanceCost: number;
  status: '매물' | '보유' | '임대중';
  tenant: Tenant | null;
  image: string;
  level: number;
  upgradeCost: number;
  districtId: string;
  category: '일반' | '랜드마크';
  buff?: PropertyBuff;
}

export interface Tenant {
  name: string;
  satisfaction: number;
  contractEndDate: Date;
}

export interface Loan {
  principal: number; // 남은 원금
  interestRate: number; // 연 이자율
  monthlyPayment: number; // 월 상환금
  originalPrincipal: number; // 초기 대출 원금
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  duration: number; // in months
  effects: {
    marketValueModifier?: number;
    rentModifier?: number;
    maintenanceCostModifier?: number;
  };
  emoji: string;
}

export interface ActiveGameEvent {
    event: GameEvent;
    remainingMonths: number;
}

export interface District {
  id:string;
  name: string;
  description: string;
  marketValueMultiplier: number; // 시세 배율
  rentMultiplier: number; // 임대료 배율
  growthRate: number; // 월별 성장률
  icon: string;
}

export interface Skill {
    id: string;
    name: string;
    description: string;
    maxLevel: number;
    icon: string;
    // cost per level is calculated as (level + 1) * baseCost
    baseCost: number; 
    // Effect per level (e.g., 0.01 for 1%)
    effectPerLevel: number; 
    effectUnit: 'percent' | 'point';
}

export interface AIPlayer {
  id: string;
  name: string;
  money: number;
  ownedProperties: Property[];
  personality: 'aggressive' | 'cautious' | 'balanced';
  color: string; // For UI identification
}

export interface FinancialSummary {
    rentIncome: number;
    salesIncome: number;
    maintenanceExpense: number;
    purchaseExpense: number;
    upgradeExpense: number;
    loanInterestExpense: number;
    loanPrincipalPaid: number;
}

export interface FinancialRecord {
    date: string; // "YYYY-MM"
    summary: FinancialSummary;
    netProfit: number;
    cashFlow: number;
}

export interface NewsItem {
  id: number;
  date: Date;
  headline: string;
  category: 'market' | 'district' | 'rival' | 'player' | 'flavor';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  isSecret?: boolean;
  isUnlocked: (prevState: GameState, nextState: GameState) => boolean;
}

export interface GameState {
  money: number;
  date: Date;
  ownedProperties: Property[];
  marketProperties: Property[];
  activeEvent: ActiveGameEvent | null;
  loan: Loan | null;
  creditScore: number;
  currentDistrictId: string | null;
  managementPoints: number;
  skills: Record<string, number>; // key: skillId, value: level
  aiPlayers: AIPlayer[];
  financialsThisMonth: FinancialSummary;
  financialHistory: FinancialRecord[];
  newsFeed: NewsItem[];
  unlockedAchievements: string[];
}

export enum GameView {
  Market = 'MARKET',
  Portfolio = 'PORTFOLIO',
  Bank = 'BANK',
  Research = 'RESEARCH',
  Rivals = 'RIVALS',
  Financials = 'FINANCIALS',
  TrophyRoom = 'TROPHY_ROOM',
}