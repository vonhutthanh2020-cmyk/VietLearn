/** Theo GamificationViewModel.kt: getNextLevelXp và getBadgeResForLevel. */
export const nextLevelXp = (level: number) => (level === 1 ? 150 : 450);
export const badgeFor = (level: number) => (level >= 3 ? 3 : level >= 2 ? 2 : 1);
