const isDev = import.meta.env.DEV;

export const logger = {
    info: (...args) => {
        if (isDev) {
            console.info(...args);
        }
    },
    warn: (...args) => {
        if (isDev) {
            console.warn(...args);
        }
    },
    error: (...args) => {
        if (isDev) {
            console.error(...args);
        }
    }
};
