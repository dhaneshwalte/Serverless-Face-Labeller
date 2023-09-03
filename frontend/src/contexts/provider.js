import { useState, useMemo } from 'react';
import { UserContext } from './userContext';

export const UserContextProvider = ({children}) => {
    const [userContext, userContextSetter] = useState({
        email: undefined,
        password: undefined
    });

    const value = useMemo(() => ({
        email: userContext.email,
        password: userContext.password,
        setUserContext: (newUserContext) => {
            userContextSetter((prevUserContext) => {
                return newUserContext;
            });
        }
    }), [userContext.email, userContext.password]);

    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
}