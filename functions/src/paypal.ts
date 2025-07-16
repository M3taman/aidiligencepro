
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as paypal from 'paypal-rest-sdk';
import { defineSecret } from 'firebase-functions/params';

const paypalClientId = defineSecret('PAYPAL_CLIENT_ID');
const paypalClientSecret = defineSecret('PAYPAL_CLIENT_SECRET');

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const configurePayPal = () => {
    const clientId = paypalClientId.value();
    const clientSecret = paypalClientSecret.value();

    if (!clientId || !clientSecret) {
        console.error('PayPal client ID or secret not configured');
        return;
    }

    paypal.configure({
        'mode': 'sandbox', // or 'live'
        'client_id': clientId,
        'client_secret': clientSecret
    });
};

export const createPayPalSubscription = functions.https.onCall(async (data, context) => {
    configurePayPal();
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to subscribe.');
    }

    const { planId } = data;
    const uid = context.auth.uid;

    const billingPlan = {
        "name": "AI Diligence Pro Subscription",
        "description": "Monthly subscription to AI Diligence Pro.",
        "type": "fixed",
        "payment_definitions": [
            {
                "name": "Regular Payments",
                "type": "REGULAR",
                "frequency": "MONTH",
                "frequency_interval": "1",
                "amount": {
                    "value": "1999.00",
                    "currency": "USD"
                },
                "cycles": "12"
            }
        ],
        "merchant_preferences": {
            "return_url": "https://localhost:5173/dashboard",
            "cancel_url": "https://localhost:5173/dashboard",
            "auto_bill_amount": "YES",
            "initial_fail_amount_action": "CONTINUE",
            "max_fail_attempts": "0"
        }
    };

    const create_billing_plan_json = {
        ...billingPlan,
        "name": `AI Diligence Pro - ${planId}`,
    };

    let plan: paypal.BillingPlan;
    try {
        plan = await new Promise<paypal.BillingPlan>((resolve, reject) => {
            paypal.billingPlan.create(create_billing_plan_json, (error, billingPlan) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(billingPlan);
                }
            });
        });

        const patch_list = [
            {
                "op": "replace",
                "path": "/",
                "value": {
                    "state": "ACTIVE"
                }
            }
        ];

        await new Promise<void>((resolve, reject) => {
            paypal.billingPlan.update(plan.id, patch_list, (error, response) => {
                if (error) {
                    reject(error);
                } else {
                    resolve();
                }
            });
        });

    } catch (error) {
        console.error(error);
        throw new functions.https.HttpsError('internal', 'Failed to create PayPal plan.');
    }


    const isoDate = new Date();
    isoDate.setSeconds(isoDate.getSeconds() + 5);


    const billing_agreement_attributes = {
        "name": "AI Diligence Pro Subscription Agreement",
        "description": "Agreement for AI Diligence Pro Subscription",
        "start_date": isoDate.toISOString().slice(0, 19) + 'Z',
        "plan": {
            "id": plan.id
        },
        "payer": {
            "payment_method": "paypal"
        }
    };

    try {
        const agreement = await new Promise<paypal.BillingAgreement>((resolve, reject) => {
            paypal.billingAgreement.create(billing_agreement_attributes, (error, billingAgreement) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(billingAgreement);
                }
            });
        });

        for (const link of agreement.links) {
            if (link.rel === 'approval_url') {
                return { approvalUrl: link.href };
            }
        }
        throw new Error('No approval url found');

    } catch (error) {
        console.error(error);
        throw new functions.https.HttpsError('internal', 'Failed to create PayPal agreement.');
    }
});

export const executePayPalAgreement = functions.https.onRequest(async (req, res) => {
    configurePayPal();
    const { paymentToken, PayerID, uid } = req.query;

    if (!paymentToken || !PayerID || !uid) {
        res.status(400).send('Missing query parameters');
        return;
    }

    try {
        const agreement = await new Promise<paypal.BillingAgreement>((resolve, reject) => {
            paypal.billingAgreement.execute(paymentToken as string, {}, (error, billingAgreement) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(billingAgreement);
                }
            });
        });

        const db = admin.firestore();
        await db.collection('subscriptions').doc(uid as string).set({
            plan: 'Enterprise',
            status: 'active',
            paypalAgreementId: agreement.id,
            startDate: new Date(agreement.start_date),
        });

        res.redirect('/dashboard');

    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to execute PayPal agreement.');
    }
});
