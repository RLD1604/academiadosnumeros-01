import { createContext, useContext, useState, useCallback } from 'react';

export interface ProactiveEvent {
  type: string;
  context?: Record<string, unknown>;
  timestamp: number;
}

interface ArquimedesContextValue {
  event: ProactiveEvent | null;
  dispatchArquimedesEvent: (type: string, context?: Record<string, unknown>) => void;
}

const ArquimedesContext = createContext<ArquimedesContextValue>({
  event: null,
  dispatchArquimedesEvent: () => {},
});

export function ArquimedesProvider({ children }: { children: React.ReactNode }) {
  const [event, setEvent] = useState<ProactiveEvent | null>(null);

  const dispatchArquimedesEvent = useCallback((type: string, context?: Record<string, unknown>) => {
    setEvent({ type, context, timestamp: Date.now() });
  }, []);

  return (
    <ArquimedesContext.Provider value={{ event, dispatchArquimedesEvent }}>
      {children}
    </ArquimedesContext.Provider>
  );
}

export function useArquimedesEvents() {
  return useContext(ArquimedesContext);
}
