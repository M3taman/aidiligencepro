import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getFunctions, httpsCallable } from 'firebase/functions';

const SubscriptionPanel: React.FC = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubscribe = async (planId: string) => {
        setLoading(true);
        setError('');

        if (!currentUser) {
            setError('You must be logged in to subscribe.');
            setLoading(false);
            return;
        }

        try {
            const functions = getFunctions();
            const createPayPalSubscription = httpsCallable(functions, 'createPayPalSubscription');
            const result = await createPayPalSubscription({ planId }) as { data: { approvalUrl: string } };
            window.location.href = result.data.approvalUrl;
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError('An unexpected error occurred. Please try again.');
                console.error('Subscription Error:', err);
            }
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
            <div className="w-full max-w-4xl mx-auto">
                <div className="bg-black bg-opacity-20 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-gray-700">
                    <h2 className="text-4xl font-bold text-center text-white mb-2">Stop Wasting Nights on Paperwork</h2>
                    <p className="text-center text-gray-300 mb-10">Your future self (on a beach) thanks you. Choose a plan.</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Plan 1 */}
                        <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 text-center border border-gray-700 hover:border-purple-500 transition-all duration-300 flex flex-col">
                            <div className="flex-grow">
                                <h3 className="text-2xl font-bold mb-2">For Solo RIAs</h3>
                                <p className="text-5xl font-extrabold mb-4">$469<span className="text-lg font-normal text-gray-400">/year</span></p>
                                <p className="text-gray-300 mb-6">50 AI-powered reports per year.</p>
                            </div>
                            <button
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105"
                                onClick={() => handleSubscribe('solo_ria_469_yearly')}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Start with 50 Reports'}
                            </button>
                            <p className="text-xs text-gray-500 mt-4">Just $9.38 per report. Unbeatable value.</p>
                        </div>
                        {/* Plan 2 */}
                        <div className="bg-gray-800 bg-opacity-50 rounded-xl p-6 text-center border border-gray-700 hover:border-green-500 transition-all duration-300 flex flex-col">
                            <div className="flex-grow">
                                <h3 className="text-2xl font-bold mb-2">For Scaling Firms</h3>
                                <p className="text-5xl font-extrabold mb-4">$1,969<span className="text-lg font-normal text-gray-400">/year</span></p>
                                <p className="text-gray-300 mb-6">Unlimited reports & collaboration tools.</p>
                            </div>
                            <button
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-all duration-300 transform hover:scale-105"
                                onClick={() => handleSubscribe('scaling_firm_1969_yearly')}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Go Unlimited'}
                            </button>
                            <p className="text-xs text-gray-500 mt-4">Close more clients. Take Fridays off.</p>
                        </div>
                    </div>
                    {error && <p className="text-red-400 text-center text-sm mt-6">{error}</p>}
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPanel;
