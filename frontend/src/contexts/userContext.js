import { createContext } from "react";

export const UserContext = createContext({
    email: undefined,
    password: undefined,
    setUserContext: () => {
        throw new Error("setUserContext function must have a consumer implementation")
    }
});