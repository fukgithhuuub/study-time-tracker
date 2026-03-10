import React, { createContext, useContext, useState, useEffect } from 'react';
import { findOrCreateUser, verifyUser } from '../lib/dataService';

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        if (localStorage.getItem('study-tracker-logged-out') === 'true') {
            return null;
        }
        const saved = localStorage.getItem('study-tracker-user');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { }
        }
        return null;
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            localStorage.setItem('study-tracker-user', JSON.stringify(user));
            localStorage.removeItem('study-tracker-logged-out');
        }
    }, [user]);

    const setupUser = async (username, mode, secretKey = null) => {
        setLoading(true);
        setError(null);

        try {
            let dbUserId = null;

            if (mode === 'online' && secretKey) {
                // Register or find existing user in Supabase
                const dbUser = await findOrCreateUser(username, secretKey);
                dbUserId = dbUser.id;
            }

            const newUser = {
                username,
                mode,
                secretKey: mode === 'online' ? secretKey : null,
                dbUserId, // UUID from Supabase (null for offline)
                createdAt: new Date().toISOString(),
            };
            setUser(newUser);
            setLoading(false);
            return newUser;
        } catch (err) {
            console.error('Setup user error:', err);
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const loginUser = async (username, secretKey) => {
        setLoading(true);
        setError(null);

        try {
            const dbUser = await verifyUser(username, secretKey);
            if (!dbUser) {
                setError('Invalid username or secret key. No account found.');
                setLoading(false);
                return null;
            }

            const loggedInUser = {
                username: dbUser.username,
                mode: 'online',
                secretKey,
                dbUserId: dbUser.id,
                createdAt: dbUser.created_at,
            };
            setUser(loggedInUser);
            setLoading(false);
            return loggedInUser;
        } catch (err) {
            console.error('Login error:', err);
            setError(err.message);
            setLoading(false);
            throw err;
        }
    };

    const logout = () => {
        localStorage.setItem('study-tracker-logged-out', 'true');
        setUser(null);
        setError(null);
    };

    const isOnline = user?.mode === 'online' && !!user?.dbUserId;

    return (
        <UserContext.Provider value={{
            user,
            isOnline,
            loading,
            error,
            setupUser,
            loginUser,
            logout,
            clearError: () => setError(null),
        }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
