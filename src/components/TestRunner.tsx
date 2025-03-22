import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { runSystemTests, TestResult } from '@/utils/systemTest';
import { Loader2 } from 'lucide-react';

export const TestRunner = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      const testResults = await runSystemTests();
      setResults(testResults);
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">System Tests</h2>
          <Button 
            onClick={handleRunTests} 
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run Tests'
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Results:</h3>
            <div className="grid gap-2">
              {results.map((result, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg ${
                    result.success 
                      ? 'bg-green-100 dark:bg-green-900/20' 
                      : 'bg-red-100 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-2">
                      {result.success ? '✅' : '❌'}
                    </span>
                    <span className="font-medium">{result.feature}</span>
                  </div>
                  {result.error && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {result.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 text-right">
              <p className="text-sm font-medium">
                Success Rate: {
                  ((results.filter(r => r.success).length / results.length) * 100).toFixed(1)
                }%
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}; 