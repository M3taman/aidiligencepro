import { useState } from 'react';
import { analyzeSECFiling } from '@/features/ai-processor';

export default function SECAnalysisPage() {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const analysis = await analyzeSECFiling(url);
      setResult(analysis.summary);
    } catch (error) {
      setResult('Error analyzing document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">SEC Filing Analyzer</h1>
      <form onSubmit={handleSubmit} className="mb-6">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter SEC filing PDF URL"
          className="border p-2 w-full mb-2"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white p-2 rounded disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>
      
      {result && (
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Analysis Results</h2>
          <div className="prose" dangerouslySetInnerHTML={{ __html: result }} />
        </div>
      )}
    </div>
  );
}
