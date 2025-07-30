import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameState, Property, GameView, Tenant, GameEvent, ActiveGameEvent, Loan, Achievement, FinancialRecord, NewsItem } from './types';
import { 
    INITIAL_GAME_STATE, TENANT_NAMES, GAME_SPEED_MS, 
    LOSE_CONDITION_MONEY, GAME_EVENTS, DISTRICTS, LANDMARKS,
    BASE_INTEREST_RATE, MAX_CREDIT_SCORE, LOAN_TERM_MONTHS, MIN_CREDIT_SCORE,
    LATE_PAYMENT_PENALTY_RATE, CREDIT_SCORE_PAYMENT_DEFAULT_PENALTY, CREDIT_SCORE_TIMELY_PAYMENT_BONUS,
    INITIAL_CREDIT_SCORE, SKILLS, NEWS_TEMPLATES, ACHIEVEMENTS
} from './constants';
import { calculateNetWorth } from './utils';
import Header from './components/Header';
import MarketView from './components/MarketView';
import PortfolioView from './components/PortfolioView';
import BankView from './components/BankView';
import ResearchView from './components/ResearchView';
import RivalsView from './components/RivalsView';
import FinancialsView from './components/FinancialsView';
import TrophyRoomView from './components/TrophyRoomView';
import EventLog from './components/EventLog';
import GameEndModal from './components/GameEndModal';
import FloatingMessage from './components/FloatingMessage';
import EventModal from './components/EventModal';
import NewsTicker from './components/NewsTicker';
import AchievementToast from './components/AchievementToast';
import ConfirmationModal from './components/ConfirmationModal';


type FloatingMsg = { id: number; text: string; type: 'income' | 'expense' | 'info' };

const districtsMap = new Map(DISTRICTS.map(d => [d.id, d]));
const skillsMap = new Map(SKILLS.map(s => [s.id, s]));
const SAVE_KEY = 'dougeun-real-estate-king-save-v1';

const loadGameState = (): GameState => {
  try {
    const savedGame = localStorage.getItem(SAVE_KEY);
    if (savedGame) {
      const parsedState: Partial<GameState> = JSON.parse(savedGame);
      
      // Re-hydrate Date objects
      if (parsedState.date) parsedState.date = new Date(parsedState.date);
      if (parsedState.ownedProperties) {
          parsedState.ownedProperties.forEach(p => {
              if (p.tenant && p.tenant.contractEndDate) {
                  p.tenant.contractEndDate = new Date(p.tenant.contractEndDate);
              }
          });
      }
      if (parsedState.newsFeed) {
          parsedState.newsFeed.forEach(item => {
              if (item.date) {
                  item.date = new Date(item.date);
              }
          });
      }

      return { ...INITIAL_GAME_STATE, ...parsedState };
    }
  } catch (error) {
    console.error("저장된 게임을 불러오는 데 실패했습니다:", error);
    localStorage.removeItem(SAVE_KEY);
  }
  return { ...INITIAL_GAME_STATE };
};


export default function App() {
  const [gameState, setGameState] = useState<GameState>(loadGameState);
  const [activeView, setActiveView] = useState<GameView>(GameView.Market);
  const [logs, setLogs] = useState<string[]>(['부동산 왕이 되기 위한 여정을 시작합니다!']);
  const [gameOver, setGameOver] = useState<'win' | 'lose' | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [floatingMessages, setFloatingMessages] = useState<FloatingMsg[]>([]);
  const [activeEventModal, setActiveEventModal] = useState<GameEvent | null>(null);
  const [achievementToastQueue, setAchievementToastQueue] = useState<Achievement[]>([]);
  const [currentToast, setCurrentToast] = useState<Achievement | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const addLog = useCallback((message: string, date: Date) => {
    setLogs(prev => [`[${date.getFullYear()}.${date.getMonth() + 1}] ${message}`, ...prev.slice(0, 99)]);
  }, []);
  
  const addFloatingMessage = useCallback((text: string, type: 'income' | 'expense' | 'info') => {
    const newMessage = { id: Date.now(), text, type };
    setFloatingMessages(prev => [...prev, newMessage]);
    setTimeout(() => {
      setFloatingMessages(current => current.filter(msg => msg.id !== newMessage.id));
    }, 3000);
  }, []);

  const showAchievementToast = useCallback((achievement: Achievement) => {
    setAchievementToastQueue(q => [...q, achievement]);
  }, []);

  const updateGameState = useCallback((updater: (prevState: GameState) => GameState) => {
    setGameState(prev => {
        const next = updater(prev);
        
        const newlyUnlocked = ACHIEVEMENTS.filter(ach => 
            !prev.unlockedAchievements.includes(ach.id) && 
            ach.isUnlocked(prev, next)
        );

        if (newlyUnlocked.length > 0) {
            newlyUnlocked.forEach(showAchievementToast);
            return {
                ...next,
                unlockedAchievements: [...next.unlockedAchievements, ...newlyUnlocked.map(a => a.id)]
            };
        }
        
        return next;
    });
  }, [showAchievementToast]);

  useEffect(() => {
    if (gameOver) return;
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    } catch (e) {
        console.error("게임 저장에 실패했습니다:", e);
    }
  }, [gameState, gameOver]);


  useEffect(() => {
    if (currentToast || achievementToastQueue.length === 0) return;

    const [first, ...rest] = achievementToastQueue;
    setCurrentToast(first);
    setAchievementToastQueue(rest);
  }, [achievementToastQueue, currentToast]);


  const skillModifiers = useMemo(() => {
    const activeSkills = gameState.skills;
    return {
      purchaseDiscount: (activeSkills['negotiation'] || 0) * (skillsMap.get('negotiation')?.effectPerLevel || 0),
      maintenanceReduction: ((activeSkills['management'] || 0) * (skillsMap.get('management')?.effectPerLevel || 0)) + ((activeSkills['legal'] || 0) * (skillsMap.get('legal')?.effectPerLevel || 0)),
      rentBonus: (activeSkills['marketing'] || 0) * (skillsMap.get('marketing')?.effectPerLevel || 0),
      upgradeDiscount: (activeSkills['construction'] || 0) * (skillsMap.get('construction')?.effectPerLevel || 0),
      interestRateReduction: (activeSkills['finance'] || 0) * (skillsMap.get('finance')?.effectPerLevel || 0),
      mpBonus: (activeSkills['urban_dev'] || 0) * (skillsMap.get('urban_dev')?.effectPerLevel || 0),
    };
  }, [gameState.skills]);

  const handleSelectDistrict = useCallback((districtId: string | null) => {
    updateGameState(prev => ({...prev, currentDistrictId: districtId}));
  }, [updateGameState]);

  const handleBuyProperty = useCallback((property: Property) => {
    updateGameState(prev => {
        const finalPrice = Math.round(property.purchasePrice * (1 - skillModifiers.purchaseDiscount));
        if (prev.money < finalPrice) {
            addLog('자금이 부족합니다!', prev.date);
            addFloatingMessage('자금 부족!', 'info');
            return prev;
        }

        addLog(`${property.name}을(를) ${finalPrice.toLocaleString('ko-KR')}원에 구매했습니다. (할인 적용)`, prev.date);
        addFloatingMessage(`-${finalPrice.toLocaleString('ko-KR')}원`, 'expense');
        const newFinancials = { ...prev.financialsThisMonth, purchaseExpense: prev.financialsThisMonth.purchaseExpense + finalPrice };

        const newOwnedProperty: Property = { ...property, status: '보유' };

        let newState = {
            ...prev,
            money: prev.money - finalPrice,
            ownedProperties: [...prev.ownedProperties, newOwnedProperty],
            marketProperties: prev.marketProperties.filter(p => p.id !== property.id),
            financialsThisMonth: newFinancials,
        };

        if (property.category === '랜드마크') {
            const headline = `부동산 큰 손, ${districtsMap.get(property.districtId)?.name}의 랜드마크 '${property.name}' 전격 인수!`;
            const newNewsItem: NewsItem = { id: Date.now(), date: newState.date, headline, category: 'player' };
            newState.newsFeed = [newNewsItem, ...newState.newsFeed.slice(0, 29)];
            addLog(`[뉴스] ${headline}`, newState.date);
        } else if (property.purchasePrice > 400000000) { // High value property
            const headline = `거액의 자금 동원, ${districtsMap.get(property.districtId)?.name}의 '${property.name}' 매입한 익명의 투자자`;
            const newNewsItem: NewsItem = { id: Date.now() + Math.random(), date: newState.date, headline, category: 'player' };
            newState.newsFeed = [newNewsItem, ...newState.newsFeed.slice(0, 29)];
        }
        
        return newState;
    });
  }, [addLog, addFloatingMessage, skillModifiers.purchaseDiscount, updateGameState]);

  const handleSellProperty = useCallback((property: Property) => {
    updateGameState(prev => {
        const marketValueModifier = prev.activeEvent?.event.effects.marketValueModifier || 1;
        const salePrice = Math.round(property.marketValue * marketValueModifier);

        addLog(`${property.name}을(를) ${salePrice.toLocaleString('ko-KR')}원에 판매했습니다.`, prev.date);
        addFloatingMessage(`+${salePrice.toLocaleString('ko-KR')}원`, 'income');
        
        const newFinancials = { ...prev.financialsThisMonth, salesIncome: prev.financialsThisMonth.salesIncome + salePrice };
        
        return {
          ...prev,
          money: prev.money + salePrice,
          ownedProperties: prev.ownedProperties.filter(p => p.id !== property.id),
          marketProperties: [...prev.marketProperties, { ...property, status: '매물', tenant: null }],
          financialsThisMonth: newFinancials,
        };
    });
  }, [addLog, addFloatingMessage, updateGameState]);

  const handleRentProperty = useCallback((property: Property) => {
    updateGameState(prev => {
        const tenantName = TENANT_NAMES[Math.floor(Math.random() * TENANT_NAMES.length)];
        const contractEndDate = new Date(prev.date);
        contractEndDate.setFullYear(contractEndDate.getFullYear() + 1); // 1년 계약

        const newTenant: Tenant = { 
          name: tenantName, 
          satisfaction: 100,
          contractEndDate: contractEndDate
        };
        
        addLog(`${property.name}에 ${tenantName}님이 입주했습니다. (1년 계약)`, prev.date);
        addFloatingMessage('임대 계약!', 'info');
        
        return {
          ...prev,
          ownedProperties: prev.ownedProperties.map(p =>
            p.id === property.id ? { ...p, status: '임대중', tenant: newTenant } : p
          ),
        };
    });
  }, [addLog, addFloatingMessage, updateGameState]);
  
  const handleUpgradeProperty = useCallback((property: Property) => {
    updateGameState(prev => {
        const finalUpgradeCost = Math.round(property.upgradeCost * (1 - skillModifiers.upgradeDiscount));
        if (prev.money >= finalUpgradeCost) {
          addLog(`${property.name}을(를) 레벨 ${property.level + 1}(으)로 업그레이드했습니다! (비용: ${finalUpgradeCost.toLocaleString('ko-KR')}원)`, prev.date);
          addFloatingMessage(`-${finalUpgradeCost.toLocaleString('ko-KR')}원`, 'expense');
          const newFinancials = { ...prev.financialsThisMonth, upgradeExpense: prev.financialsThisMonth.upgradeExpense + finalUpgradeCost };
          return {
            ...prev,
            money: prev.money - finalUpgradeCost,
            financialsThisMonth: newFinancials,
            ownedProperties: prev.ownedProperties.map(p =>
              p.id === property.id ? { 
                ...p, 
                level: p.level + 1,
                rent: Math.round(p.rent * 1.2),
                marketValue: Math.round(p.marketValue * 1.15),
                maintenanceCost: Math.round(p.maintenanceCost * 1.12),
                upgradeCost: Math.round(p.upgradeCost * 1.8),
              } : p
            ),
          };
        } else {
          addLog('업그레이드 비용이 부족합니다!', prev.date);
          addFloatingMessage('자금 부족!', 'info');
          return prev;
        }
    });
  }, [addLog, addFloatingMessage, skillModifiers.upgradeDiscount, updateGameState]);
  
  const handleTakeLoan = useCallback((amount: number) => {
      updateGameState(prev => {
        const interestRate = Math.max(0.01, BASE_INTEREST_RATE + (1 - prev.creditScore / MAX_CREDIT_SCORE) * 0.1 - skillModifiers.interestRateReduction);
        const monthlyInterestRate = interestRate / 12;
        const monthlyPayment = amount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, LOAN_TERM_MONTHS)) / (Math.pow(1 + monthlyInterestRate, LOAN_TERM_MONTHS) - 1);

        const newLoan: Loan = {
          principal: amount,
          originalPrincipal: amount,
          interestRate: interestRate,
          monthlyPayment: Math.round(monthlyPayment),
        };
        
        addLog(`은행에서 ${amount.toLocaleString('ko-KR')}원을 대출했습니다. (연 ${(interestRate * 100).toFixed(2)}%)`, prev.date);
        addFloatingMessage(`+${amount.toLocaleString('ko-KR')}원`, 'income');

        return {
            ...prev,
            money: prev.money + amount,
            loan: newLoan,
        };
    });
  }, [addLog, addFloatingMessage, skillModifiers.interestRateReduction, updateGameState]);

  const handleRepayLoan = useCallback((amount: number) => {
      updateGameState(prev => {
          if (!prev.loan) return prev;
          if (prev.money < amount) {
              addLog('상환 자금이 부족합니다.', prev.date);
              addFloatingMessage('자금 부족!', 'info');
              return prev;
          }
          
          const isFullRepayment = amount >= prev.loan.principal;
          const repaymentAmount = isFullRepayment ? prev.loan.principal : amount;

          addLog(`${repaymentAmount.toLocaleString('ko-KR')}원을 상환했습니다.`, prev.date);
          addFloatingMessage(`-${repaymentAmount.toLocaleString('ko-KR')}원`, 'expense');

          if (isFullRepayment) {
              addLog('대출금을 전액 상환하여 신용점수가 상승했습니다!', prev.date);
          }

          const newPrincipal = prev.loan.principal - repaymentAmount;
              
          return {
              ...prev,
              money: prev.money - repaymentAmount,
              loan: newPrincipal > 0 ? { ...prev.loan, principal: newPrincipal } : null,
              creditScore: Math.min(MAX_CREDIT_SCORE, prev.creditScore + (isFullRepayment ? 20 : 5))
          };
      });
  }, [addLog, addFloatingMessage, updateGameState]);

  const handleUpgradeSkill = useCallback((skillId: string) => {
    updateGameState(prev => {
        const skill = skillsMap.get(skillId);
        if (!skill) return prev;

        const currentLevel = prev.skills[skillId] || 0;
        if (currentLevel >= skill.maxLevel) {
          addLog('이미 최고 레벨입니다.', prev.date);
          return prev;
        }
        
        const cost = (currentLevel + 1) * skill.baseCost;

        if (prev.managementPoints >= cost) {
          addLog(`[연구 완료] ${skill.name} 스킬이 레벨 ${currentLevel + 1}(으)로 상승했습니다!`, prev.date);
          addFloatingMessage('✨ 연구 완료!', 'info');
          return {
            ...prev,
            managementPoints: prev.managementPoints - cost,
            skills: {
              ...prev.skills,
              [skillId]: currentLevel + 1,
            }
          };
        } else {
          addLog('경영 포인트(MP)가 부족합니다.', prev.date);
          addFloatingMessage('MP 부족!', 'info');
          return prev;
        }
    });
  }, [addLog, addFloatingMessage, updateGameState]);

  const playerNetWorth = useMemo(() => calculateNetWorth(gameState), [gameState]);
  
  const restartGame = useCallback(() => {
    localStorage.removeItem(SAVE_KEY);
    setGameState(INITIAL_GAME_STATE);
    setActiveView(GameView.Market);
    setLogs(['부동산 왕이 되기 위한 여정을 다시 시작합니다!']);
    setGameOver(null);
    setIsPaused(false);
    setActiveEventModal(null);
    setFloatingMessages([]);
    setAchievementToastQueue([]);
    setCurrentToast(null);
  }, []);

  const handleResetGame = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  const handleConfirmReset = useCallback(() => {
    restartGame();
    addFloatingMessage('게임이 초기화되었습니다.', 'info');
    setShowResetConfirm(false);
  }, [restartGame, addFloatingMessage]);

  const handleCancelReset = useCallback(() => {
    setShowResetConfirm(false);
  }, []);

  useEffect(() => {
    if (isPaused || gameOver) return;

    const gameInterval = setInterval(() => {
      updateGameState(prev => {
        const newDate = new Date(prev.date);
        newDate.setDate(newDate.getDate() + 1);
        
        let newState = { ...prev, date: newDate };

        if (newDate.getDate() === 1) { // Monthly update
          const completedMonthDate = `${prev.date.getFullYear()}-${String(prev.date.getMonth() + 1).padStart(2, '0')}`;
          const summary = prev.financialsThisMonth;
          const netProfit = summary.rentIncome + summary.salesIncome - summary.maintenanceExpense - summary.loanInterestExpense;
          const cashFlow = (summary.rentIncome + summary.salesIncome) - (summary.maintenanceExpense + summary.purchaseExpense + summary.upgradeExpense + summary.loanInterestExpense + summary.loanPrincipalPaid);

          const newRecord: FinancialRecord = {
              date: completedMonthDate,
              summary,
              netProfit,
              cashFlow,
          };

          newState.financialHistory = [...prev.financialHistory, newRecord].slice(-36);
          newState.financialsThisMonth = {
              rentIncome: 0, salesIncome: 0, maintenanceExpense: 0, purchaseExpense: 0,
              upgradeExpense: 0, loanInterestExpense: 0, loanPrincipalPaid: 0,
          };
          
          let monthlyIncome = 0;
          let monthlyExpense = 0;
          
          if (newState.activeEvent) {
            const remaining = newState.activeEvent.remainingMonths - 1;
            if (remaining > 0) {
              newState.activeEvent.remainingMonths = remaining;
            } else {
              addLog(`[이벤트 종료] ${newState.activeEvent.event.title} 효과가 사라졌습니다.`, newDate);
              addFloatingMessage('이벤트 종료', 'info');
              newState.activeEvent = null;
            }
          }

          if (!newState.activeEvent && Math.random() < 0.2) {
            const newEvent = GAME_EVENTS[Math.floor(Math.random() * GAME_EVENTS.length)];
            newState.activeEvent = { event: newEvent, remainingMonths: newEvent.duration };
            addLog(`[이벤트 발생] ${newEvent.title} ${newEvent.description}`, newDate);
            addFloatingMessage(newEvent.title, 'info');
            setActiveEventModal(newEvent);
            
            const headline = `[속보] ${newEvent.title}! ${newEvent.effects.marketValueModifier ? '부동산 시장' : '자산 유지비'}에 큰 변동 예상...`;
            const newNewsItem: NewsItem = { id: Date.now() + Math.random(), date: newDate, headline, category: 'market' };
            newState.newsFeed = [newNewsItem, ...newState.newsFeed.slice(0, 29)];
          }

          const rentBuffs: { [key in '주거' | '상업' | 'all']: number } = { '주거': 1, '상업': 1, 'all': 1 };
          newState.ownedProperties.forEach(p => {
              if (p.category === '랜드마크' && p.buff?.type === 'rent') {
                  rentBuffs[p.buff.scope] *= p.buff.value;
              }
          });
          
          const { rentModifier = 1, maintenanceCostModifier = 1 } = newState.activeEvent?.event.effects || {};

          newState.ownedProperties = newState.ownedProperties.map(p => {
            let newP = { ...p };
            const district = districtsMap.get(p.districtId);
            const districtGrowth = district ? district.growthRate : 0;
            const fluctuation = (Math.random() - 0.48) * 0.015 + districtGrowth;
            newP.marketValue = Math.round(p.marketValue * (1 + fluctuation));
            
            const newHistory = [...(newP.marketValueHistory || [newP.marketValue])].slice(-11);
            newHistory.push(newP.marketValue);
            newP.marketValueHistory = newHistory;
            
            const finalMaintenanceCost = Math.round(newP.maintenanceCost * maintenanceCostModifier * (1 - skillModifiers.maintenanceReduction));
            monthlyExpense += finalMaintenanceCost;
            newState.financialsThisMonth.maintenanceExpense += finalMaintenanceCost;

            if (newP.status === '임대중' && newP.tenant) {
                let tenant = { ...newP.tenant };
                if (newDate >= tenant.contractEndDate) {
                    if (tenant.satisfaction > 50) {
                        tenant.contractEndDate.setFullYear(tenant.contractEndDate.getFullYear() + 1);
                        tenant.satisfaction = 100;
                        addLog(`${newP.name}의 ${tenant.name}님과 임대 계약을 갱신했습니다.`, newDate);
                    } else {
                        newP.status = '보유'; newP.tenant = null;
                        addLog(`${newP.name}의 ${tenant.name}님이 퇴실했습니다.`, newDate);
                    }
                } else {
                    let satisfactionChange = -3 + newP.level;
                    tenant.satisfaction = Math.max(0, Math.min(100, tenant.satisfaction + satisfactionChange));
                    if (tenant.satisfaction < 30 && Math.random() < 0.3) {
                        addLog(`[불만] ${newP.name} 세입자 ${tenant.name}님이 월세를 연체했습니다.`, newDate);
                    } else {
                        const landmarkRentBuff = rentBuffs.all * rentBuffs[newP.type];
                        const currentRent = Math.round(newP.rent * rentModifier * landmarkRentBuff * (1 + skillModifiers.rentBonus));
                        monthlyIncome += currentRent;
                        newState.financialsThisMonth.rentIncome += currentRent;
                        if (tenant.satisfaction > 95 && Math.random() < 0.2) {
                            const bonus = Math.round(currentRent * 0.1);
                            monthlyIncome += bonus;
                            newState.financialsThisMonth.rentIncome += bonus;
                            addLog(`[보너스] ${tenant.name}님이 보너스 ${bonus.toLocaleString('ko-KR')}원을 주었습니다!`, newDate);
                            addFloatingMessage(`+${bonus.toLocaleString('ko-KR')}원`, 'income');
                        }
                    }
                    newP.tenant = tenant;
                }
            }
            return newP;
          });
          
          newState.money += monthlyIncome - monthlyExpense;
          if (monthlyIncome > 0) {
              addLog(`월세 수입: ${monthlyIncome.toLocaleString('ko-KR')}원`, newDate);
              addFloatingMessage(`+${monthlyIncome.toLocaleString('ko-KR')}원`, 'income');
              newState.managementPoints += Math.round(1 + skillModifiers.mpBonus);
          }
          if (monthlyExpense > 0) {
              addLog(`유지비 지출: ${monthlyExpense.toLocaleString('ko-KR')}원`, newDate);
              addFloatingMessage(`-${monthlyExpense.toLocaleString('ko-KR')}원`, 'expense');
          }
          
          let availableMarket = [...newState.marketProperties];
          const updatedAiPlayers = newState.aiPlayers.map(ai => {
            let updatedAI = { ...ai };
            updatedAI.money += updatedAI.ownedProperties.reduce((inc, p) => inc + Math.round(p.rent * rentModifier), 0) - updatedAI.ownedProperties.reduce((exp, p) => exp + Math.round(p.maintenanceCost * maintenanceCostModifier), 0);
            
            let buyChance: number;
            switch(ai.personality) {
                case 'aggressive': buyChance = 0.6; break;
                case 'balanced': buyChance = 0.4; break;
                default: buyChance = 0.25; break;
            }

            if (Math.random() < buyChance && availableMarket.length > 0) {
                const affordable = availableMarket.filter(p => updatedAI.money > p.purchasePrice * 1.1);
                if (affordable.length > 0) {
                    const propertyToBuy = affordable.sort((a,b) => b.purchasePrice - a.purchasePrice)[0];
                    if (propertyToBuy) {
                        updatedAI.money -= propertyToBuy.purchasePrice;
                        updatedAI.ownedProperties.push({ ...propertyToBuy, status: '보유', tenant: null });
                        availableMarket = availableMarket.filter(p => p.id !== propertyToBuy.id);
                        addLog(`[AI] ${ai.name}(이)가 ${propertyToBuy.name}을(를) 구매했습니다.`, newDate);
                        const headline = `${ai.name}, ${districtsMap.get(propertyToBuy.districtId)?.name}의 '${propertyToBuy.name}' 매입하며 보폭 넓혀`;
                        newState.newsFeed = [{ id: Date.now() + Math.random(), date: newDate, headline, category: 'rival' }, ...newState.newsFeed.slice(0, 29)];
                    }
                }
            }
            return updatedAI;
          });
          newState.aiPlayers = updatedAiPlayers;

          if (Math.random() < 0.6) {
                const newsCategories = ['market', 'district', 'flavor'] as const;
                const category = newsCategories[Math.floor(Math.random() * newsCategories.length)];
                let headline = NEWS_TEMPLATES[category][Math.floor(Math.random() * NEWS_TEMPLATES[category].length)];
                if (headline.includes('{districtName}')) {
                    headline = headline.replace(/{districtName}/g, DISTRICTS[Math.floor(Math.random() * DISTRICTS.length)].name);
                }
                newState.newsFeed = [{ id: Date.now() + Math.random(), date: newDate, headline, category }, ...newState.newsFeed.slice(0, 29)];
          }
          
          const addLandmarkIfEligible = (id: number, year: number) => {
              if (newDate.getFullYear() === year && newDate.getMonth() === 0) {
                  const isOwned = newState.ownedProperties.some(p => p.id === id) || newState.aiPlayers.some(ai => ai.ownedProperties.some(p => p.id === id));
                  const isOnMarket = availableMarket.some(p => p.id === id);

                  if (!isOwned && !isOnMarket) {
                       const landmark = LANDMARKS.find(l => l.id === id);
                       if (landmark) { 
                           availableMarket.push(landmark); 
                           addLog(`[특보] 전설적인 랜드마크 '${landmark.name}'(이)가 시장에 등장했습니다!`, newDate); 
                           addFloatingMessage('✨ 랜드마크 등장!', 'info'); 
                        }
                  }
              }
          };

          addLandmarkIfEligible(101, 2026);
          addLandmarkIfEligible(102, 2028);
          addLandmarkIfEligible(103, 2030);
          addLandmarkIfEligible(104, 2032);
          
          newState.marketProperties = availableMarket.map(p => {
              const district = districtsMap.get(p.districtId);
              const fluctuation = (Math.random() - 0.48) * 0.01 + (district?.growthRate || 0);
              const newMarketValue = Math.round(p.marketValue * (1 + fluctuation));

              const newHistory = [...(p.marketValueHistory || [p.marketValue])].slice(-11);
              newHistory.push(newMarketValue);
              
              return { ...p, marketValue: newMarketValue, marketValueHistory: newHistory };
          });
          
          if (newState.loan) {
              if (newState.money >= newState.loan.monthlyPayment) {
                  const interestPaid = Math.round(newState.loan.principal * (newState.loan.interestRate / 12));
                  const principalPaid = newState.loan.monthlyPayment - interestPaid;
                  newState.loan.principal -= principalPaid;
                  newState.money -= newState.loan.monthlyPayment;
                  newState.creditScore = Math.min(MAX_CREDIT_SCORE, newState.creditScore + CREDIT_SCORE_TIMELY_PAYMENT_BONUS);
                  addLog(`대출 상환금 ${newState.loan.monthlyPayment.toLocaleString('ko-KR')}원을 납부했습니다.`, newDate);
                  
                  newState.financialsThisMonth.loanInterestExpense += interestPaid;
                  newState.financialsThisMonth.loanPrincipalPaid += principalPaid;
                  
                  if (newState.loan.principal <= 0) {
                      addLog('대출금을 모두 상환했습니다!', newDate);
                      newState.loan = null;
                  }
              } else {
                  newState.loan.principal += Math.round(newState.loan.principal * LATE_PAYMENT_PENALTY_RATE);
                  newState.creditScore = Math.max(MIN_CREDIT_SCORE, newState.creditScore - CREDIT_SCORE_PAYMENT_DEFAULT_PENALTY);
                  addLog(`[경고] 대출 상환금을 연체하여 신용점수가 하락하고 연체 이자가 부과되었습니다.`, newDate);
                  addFloatingMessage('대출 연체!', 'info');
              }
          } else if (newState.creditScore < INITIAL_CREDIT_SCORE) {
               newState.creditScore = Math.min(INITIAL_CREDIT_SCORE, newState.creditScore + 1);
          }
        }

        if (newState.money <= LOSE_CONDITION_MONEY) {
            setGameOver('lose');
            addLog('자금난으로 파산했습니다...', newState.date);
            setIsPaused(true);
        }

        return newState;
      });
    }, GAME_SPEED_MS);

    return () => clearInterval(gameInterval);
  }, [isPaused, gameOver, addLog, addFloatingMessage, skillModifiers, updateGameState]);
  
  return (
    <div className="bg-blue-50 min-h-screen text-gray-800 jua-font flex flex-col items-center p-4">
      {gameOver && <GameEndModal status={gameOver} onRestart={restartGame} />}
      <EventModal event={activeEventModal} onClose={() => setActiveEventModal(null)} />
      <ConfirmationModal
        isOpen={showResetConfirm}
        title="게임 초기화"
        message="정말로 게임을 초기화하시겠습니까? 저장된 모든 진행 상황이 영구적으로 삭제됩니다."
        onConfirm={handleConfirmReset}
        onCancel={handleCancelReset}
        confirmText="초기화"
        cancelText="취소"
      />

      <div className="w-full max-w-7xl mx-auto">
        <Header 
          gameState={gameState} 
          netWorth={playerNetWorth} 
          isPaused={isPaused} 
          onPauseToggle={() => setIsPaused(!isPaused)} 
          onResetGame={handleResetGame}
        />
        <NewsTicker newsFeed={gameState.newsFeed} />

        <main className="flex flex-col lg:flex-row gap-4">
          <div className="lg:w-3/4 w-full">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-1 mb-4 grid grid-cols-3 lg:grid-cols-7 gap-1">
                {[
                    { view: GameView.Market, label: '시장', icon: '🏢', color: 'blue' },
                    { view: GameView.Portfolio, label: '자산', icon: '🏠', color: 'green' },
                    { view: GameView.Bank, label: '은행', icon: '🏦', color: 'purple' },
                    { view: GameView.Financials, label: '재무', icon: '📊', color: 'indigo' },
                    { view: GameView.Research, label: '연구', icon: '🔬', color: 'yellow' },
                    { view: GameView.Rivals, label: '라이벌', icon: '🏆', color: 'red' },
                    { view: GameView.TrophyRoom, label: '업적', icon: '🎖️', color: 'amber' },
                ].map(({ view, label, icon, color }) => (
                     <button
                        key={view}
                        onClick={() => {
                            setActiveView(view);
                            if (view === GameView.Market) handleSelectDistrict(null);
                        }}
                        className={`w-full py-3 text-lg rounded-lg transition-colors duration-300 ${activeView === view ? `bg-${color}-500 text-white shadow-md` : `bg-transparent hover:bg-${color}-100`}`}
                    >
                        {icon} {label}
                    </button>
                ))}
            </div>

            <div className="bg-white/50 backdrop-blur-sm rounded-xl shadow-lg p-4 min-h-[60vh]">
              {activeView === GameView.Market ? (
                <MarketView 
                  districts={DISTRICTS}
                  properties={gameState.marketProperties} 
                  onBuy={handleBuyProperty} 
                  playerMoney={gameState.money} 
                  activeEvent={gameState.activeEvent}
                  currentDistrictId={gameState.currentDistrictId}
                  onSelectDistrict={handleSelectDistrict}
                />
              ) : activeView === GameView.Portfolio ? (
                <PortfolioView 
                  properties={gameState.ownedProperties} 
                  onSell={handleSellProperty} 
                  onRent={handleRentProperty}
                  onUpgrade={handleUpgradeProperty}
                  playerMoney={gameState.money}
                  activeEvent={gameState.activeEvent}
                />
              ) : activeView === GameView.Bank ? (
                <BankView
                  gameState={gameState}
                  netWorth={playerNetWorth}
                  onTakeLoan={handleTakeLoan}
                  onRepayLoan={handleRepayLoan}
                />
              ) : activeView === GameView.Rivals ? (
                 <RivalsView
                    playerState={gameState}
                    playerNetWorth={playerNetWorth}
                    aiPlayers={gameState.aiPlayers}
                    activeEvent={gameState.activeEvent}
                />
              ) : activeView === GameView.Financials ? (
                <FinancialsView
                  financialHistory={gameState.financialHistory}
                  financialsThisMonth={gameState.financialsThisMonth}
                  currentDate={gameState.date}
                />
              ) : activeView === GameView.TrophyRoom ? (
                <TrophyRoomView 
                  achievements={ACHIEVEMENTS}
                  unlockedAchievementIds={gameState.unlockedAchievements}
                />
              ) : ( // ResearchView
                <ResearchView
                    managementPoints={gameState.managementPoints}
                    skills={SKILLS}
                    playerSkills={gameState.skills}
                    onUpgradeSkill={handleUpgradeSkill}
                />
              )}
            </div>
          </div>

          <div className="lg:w-1/4 w-full">
            <EventLog logs={logs} />
          </div>
        </main>
      </div>
      <div className="fixed top-24 right-4 z-50 flex flex-col-reverse items-end space-y-2 space-y-reverse">
        {floatingMessages.map(msg => (
          <FloatingMessage key={msg.id} text={msg.text} type={msg.type} />
        ))}
      </div>
      {currentToast && <AchievementToast achievement={currentToast} onDismiss={() => setCurrentToast(null)} />}
    </div>
  );
}