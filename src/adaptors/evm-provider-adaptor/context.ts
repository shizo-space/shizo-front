import {createContext} from "react";

export const EvmProviderContext = createContext<EvmProviderContext | null>(null);

export const Provider = EvmProviderContext.Provider;

export const context = EvmProviderContext;
