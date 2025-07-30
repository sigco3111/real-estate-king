import { GameState } from './types';

export const calculateNetWorth = (gs: GameState): number => {
    const marketValueModifier = gs.activeEvent?.event.effects.marketValueModifier || 1;
    const propertiesValue = gs.ownedProperties.reduce((sum, p) => sum + Math.round(p.marketValue * marketValueModifier), 0);
    const loanPrincipal = gs.loan?.principal || 0;
    return gs.money + propertiesValue - loanPrincipal;
};
