import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import * as XLSX from 'xlsx';

export interface Holding {
  ticker: string;
  name: string;
  weight: number;
}

interface PortfolioContextType {
  holdings: Holding[];
  portfolioName: string;
  setHoldings: (h: Holding[]) => void;
  setPortfolioName: (n: string) => void;
  parseFile: (file: File) => void;
  clearPortfolio: () => void;
  error: string | null;
}

const PortfolioContext = createContext<PortfolioContextType | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [portfolioName, setPortfolioName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const clearPortfolio = useCallback(() => {
    setHoldings([]);
    setPortfolioName('');
    setError(null);
  }, []);

  const parseFile = useCallback((file: File) => {
    setError(null);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let rows: string[][] = [];

        if (file.name.endsWith('.csv')) {
          const text = data as string;
          rows = text.split('\n').map(row => row.split(',').map(c => c.trim().replace(/"/g, '')));
        } else {
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
        }

        const headerRow = rows.findIndex(row =>
          row.some(cell => /ticker|symbol/i.test(String(cell))) &&
          row.some(cell => /weight|allocation|%|percent/i.test(String(cell)))
        );

        if (headerRow === -1) {
          const parsed: Holding[] = [];
          for (const row of rows.slice(1)) {
            if (row.length >= 2) {
              const ticker = String(row[0]).trim().toUpperCase();
              const name = row.length >= 3 ? String(row[1]).trim() : ticker;
              const weightStr = String(row[row.length >= 3 ? 2 : 1]).replace('%', '').trim();
              const weight = parseFloat(weightStr);
              if (ticker && !isNaN(weight) && weight > 0) {
                parsed.push({ ticker, name, weight: weight > 1 ? weight / 100 : weight });
              }
            }
          }
          if (parsed.length > 0) {
            setHoldings(parsed);
            setPortfolioName(file.name.replace(/\.(csv|xlsx|xls)$/i, ''));
            return;
          }
          setError('Could not parse file. Expected columns: Ticker/Symbol, Name (optional), Weight/Allocation');
          return;
        }

        const headers = rows[headerRow].map(h => String(h).toLowerCase());
        const tickerIdx = headers.findIndex(h => /ticker|symbol/i.test(h));
        const nameIdx = headers.findIndex(h => /name|company|description/i.test(h));
        const weightIdx = headers.findIndex(h => /weight|allocation|%|percent/i.test(h));

        const parsed: Holding[] = [];
        for (const row of rows.slice(headerRow + 1)) {
          const ticker = String(row[tickerIdx] || '').trim().toUpperCase();
          const name = nameIdx >= 0 ? String(row[nameIdx] || '').trim() : ticker;
          const weightStr = String(row[weightIdx] || '').replace('%', '').trim();
          const weight = parseFloat(weightStr);
          if (ticker && !isNaN(weight) && weight > 0) {
            parsed.push({ ticker, name, weight: weight > 1 ? weight / 100 : weight });
          }
        }

        if (parsed.length === 0) {
          setError('No valid holdings found in file');
          return;
        }

        setHoldings(parsed);
        setPortfolioName(file.name.replace(/\.(csv|xlsx|xls)$/i, ''));
      } catch {
        setError('Failed to parse file. Please check the format.');
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  }, []);

  return (
    <PortfolioContext.Provider value={{ holdings, portfolioName, setHoldings, setPortfolioName, parseFile, clearPortfolio, error }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio must be used within PortfolioProvider');
  return ctx;
}
