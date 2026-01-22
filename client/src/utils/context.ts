// Context utility for standardized context creation
import React, { createContext, useContext, ReactNode } from 'react';

export interface ContextOptions<T> {
  displayName?: string;
  errorMessage?: string;
  defaultValue?: T;
}

/**
 * Create a context with standardized error handling and optional default value
 */
export function createAppContext<T>(
  options: ContextOptions<T> = {}
): {
  Context: React.Context<T | undefined>;
  Provider: React.ComponentType<{ children: ReactNode; value: T }>;
  useAppContext: () => T;
} {
  const {
    displayName = 'AppContext',
    errorMessage = 'useAppContext must be used within a Provider',
    defaultValue,
  } = options;

  const Context = createContext<T | undefined>(defaultValue);
  Context.displayName = displayName;

  const Provider: React.ComponentType<{ children: ReactNode; value: T }> = ({ children, value }) => {
    return React.createElement(Context.Provider, { value }, children);
  };

  const useAppContext = (): T => {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error(errorMessage);
    }
    return context;
  };

  return { Context, Provider, useAppContext };
}

/**
 * Create a context with state management
 */
export function createStateContext<T>(
  initialState: T,
  options: ContextOptions<T> = {}
): {
  Context: React.Context<T | undefined>;
  Provider: React.ComponentType<{ children: ReactNode }>;
  useAppContext: () => T;
  useSetContext: () => React.Dispatch<React.SetStateAction<T>>;
} {
  const { Context, useAppContext } = createAppContext<T>(options);

  const StateProvider: React.ComponentType<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = React.useState<T>(initialState);

    return React.createElement(Context.Provider, { value: state }, 
      React.createElement(StateSetterContext.Provider, { value: setState }, children)
    );
  };

  const StateSetterContext = createContext<React.Dispatch<React.SetStateAction<T>> | undefined>(undefined);

  const useSetContext = (): React.Dispatch<React.SetStateAction<T>> => {
    const setState = useContext(StateSetterContext);
    if (setState === undefined) {
      throw new Error('useSetContext must be used within a Provider');
    }
    return setState;
  };

  return { Context, Provider: StateProvider, useAppContext, useSetContext };
}

/**
 * Create a context with reducer pattern
 */
export function createReducerContext<TState, TAction>(
  reducer: React.Reducer<TState, TAction>,
  initialState: TState,
  options: ContextOptions<TState> = {}
): {
  Context: React.Context<TState | undefined>;
  Provider: React.ComponentType<{ children: ReactNode }>;
  useAppContext: () => TState;
  useDispatch: () => React.Dispatch<TAction>;
} {
  const { Context, useAppContext } = createAppContext<TState>(options);

  const ReducerProvider: React.ComponentType<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = React.useReducer(reducer, initialState);

    return React.createElement(Context.Provider, { value: state },
      React.createElement(DispatchContext.Provider, { value: dispatch }, children)
    );
  };

  const DispatchContext = createContext<React.Dispatch<TAction> | undefined>(undefined);

  const useDispatch = (): React.Dispatch<TAction> => {
    const dispatch = useContext(DispatchContext);
    if (dispatch === undefined) {
      throw new Error('useDispatch must be used within a Provider');
    }
    return dispatch;
  };

  return { Context, Provider: ReducerProvider, useAppContext, useDispatch };
} 