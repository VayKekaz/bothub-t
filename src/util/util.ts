const alphanum = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export const getRandomString = (length: number = 12, characters: string = alphanum): string => {
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charactersLength);
        result += characters.charAt(randomIndex);
    }
    return result;
};

export const intersection = <T>(a: Set<T>, b: Set<T>): Set<T> => {
    const result = new Set<T>();

    for (const elem of a) {
        if (b.has(elem)) {
            result.add(elem);
        }
    }

    return result;
};
