export const GOLDEN_USERS = ['diptanu', 'annie', 'kala', 'sarkar'];

export const isGoldenUser = (username: string | undefined | null) => {
    if (!username) return false;
    return GOLDEN_USERS.includes(username.toLowerCase());
};
