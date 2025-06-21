import { useState } from 'react';

export function useReportUsage() {
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(3);
  return { used, limit };
}
