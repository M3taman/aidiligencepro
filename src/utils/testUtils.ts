import { toast } from 'sonner';

export const testFeature = async (
  featureName: string,
  testFunction: () => Promise<boolean>,
  successMessage?: string,
  errorMessage?: string
) => {
  try {
    const result = await testFunction();
    if (result) {
      console.log(`✅ ${featureName}: Success`);
      if (successMessage) toast.success(successMessage);
      return true;
    } else {
      console.log(`❌ ${featureName}: Failed`);
      if (errorMessage) toast.error(errorMessage);
      return false;
    }
  } catch (error) {
    console.error(`❌ ${featureName} Error:`, error);
    if (errorMessage) toast.error(errorMessage);
    return false;
  }
}; 