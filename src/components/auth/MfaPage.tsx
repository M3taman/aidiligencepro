import React, { useState } from 'react';
import { getAuth, multiFactor, PhoneAuthProvider, PhoneMultiFactorGenerator } from 'firebase/auth';

const MfaPage = () => {
    const [verificationId, setVerificationId] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [error, setError] = useState('');
    const [isEnrolled, setIsEnrolled] = useState(false);

    const auth = getAuth();
    const user = auth.currentUser;

    const handleEnroll = async () => {
        if (!user) return;

        const session = await multiFactor(user).getSession();
        const phoneInfoOptions = {
            phoneNumber: '+16505551234', // Replace with user's phone number
            session
        };

        const phoneAuthProvider = new PhoneAuthProvider(auth);
        const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, {
            onVerificationCompleted: () => { },
            onVerificationFailed: (error) => setError(error.message),
            onCodeSent: (verificationId) => setVerificationId(verificationId),
            onCodeAutoRetrievalTimeout: () => { }
        });
    };

    const handleVerify = async () => {
        if (!user) return;

        const cred = PhoneAuthProvider.credential(verificationId, verificationCode);
        const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);

        try {
            await multiFactor(user).enroll(multiFactorAssertion, 'My personal phone');
            setIsEnrolled(true);
        } catch (error: unknown) {
            if (error instanceof Error) {
                setError(error.message);
            }
        }
    };

    if (isEnrolled) {
        return (
            <div className="container mx-auto px-6 py-12">
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">MFA Enrolled</h2>
                    <p className="text-center">You have successfully enrolled in multi-factor authentication.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Set up MFA</h2>
                {!verificationId ? (
                    <button onClick={handleEnroll} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Enroll in MFA
                    </button>
                ) : (
                    <div>
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            placeholder="Verification Code"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
                        />
                        <button onClick={handleVerify} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            Verify
                        </button>
                    </div>
                )}
                {error && <p className="text-red-500 text-xs italic mt-4">{error}</p>}
            </div>
        </div>
    );
};

export default MfaPage;
