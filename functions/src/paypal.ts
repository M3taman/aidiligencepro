import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const paypal = require('paypal-rest-sdk');

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const mode = functions.config().paypal?.mode || process.env.PAYPAL_MODE || 'sandbox';
const client_id = functions.config().paypal?.client_id || process.env.PAYPAL_CLIENT_ID;
const client_secret = functions.config().paypal?.client_secret || process.env.PAYPAL_CLIENT_SECRET;

function configurePayPal() {
  if (!client_id || !client_secret) {
    console.error('PayPal credentials not configured');
    return;
  }
  paypal.configure({
    mode,
    client_id,
    client_secret
  });
}

export const createPayPalSubscription = functions.https.onCall(async (data: any, context) => {
  configurePayPal();
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in to subscribe.');
  }

  const planId: string | undefined = data?.planId;
  if (!planId) {
    throw new functions.https.HttpsError('invalid-argument', 'planId is required');
  }

  const billingPlan = {
    name: `AI Diligence Pro - ${planId}`,
    description: 'Monthly subscription to AI Diligence Pro.',
    type: 'fixed',
    payment_definitions: [
      {
        name: 'Regular Payments',
        type: 'REGULAR',
        frequency: 'MONTH',
        frequency_interval: '1',
        amount: {
          value: '1999.00',
          currency: 'USD',
        },
        cycles: '12',
      },
    ],
    merchant_preferences: {
      return_url: process.env.VITE_APP_URL ? `${process.env.VITE_APP_URL}/dashboard` : 'https://localhost:5173/dashboard',
      cancel_url: process.env.VITE_APP_URL ? `${process.env.VITE_APP_URL}/dashboard` : 'https://localhost:5173/dashboard',
      auto_bill_amount: 'YES',
      initial_fail_amount_action: 'CONTINUE',
      max_fail_attempts: '0',
    },
  };

  try {
    const plan: any = await new Promise((resolve, reject) => {
      paypal.billingPlan.create(billingPlan, (error: any, createdPlan: any) => {
        if (error) return reject(error);
        resolve(createdPlan);
      });
    });

    const patch_list = [
      {
        op: 'replace',
        path: '/',
        value: { state: 'ACTIVE' },
      },
    ];

    await new Promise<void>((resolve, reject) => {
      paypal.billingPlan.update(plan.id, patch_list, (error: any, _response: any) => {
        if (error) return reject(error);
        resolve();
      });
    });

    // Create agreement
    const isoDate = new Date();
    isoDate.setSeconds(isoDate.getSeconds() + 5);

    const billing_agreement_attributes = {
      name: 'AI Diligence Pro Subscription Agreement',
      description: 'Agreement for AI Diligence Pro Subscription',
      start_date: isoDate.toISOString().slice(0, 19) + 'Z',
      plan: { id: plan.id },
      payer: { payment_method: 'paypal' },
    };

    const agreement: any = await new Promise((resolve, reject) => {
      paypal.billingAgreement.create(billing_agreement_attributes, (error: any, billingAgreement: any) => {
        if (error) return reject(error);
        resolve(billingAgreement);
      });
    });

    const approvalLink = Array.isArray(agreement.links)
      ? agreement.links.find((l: any) => l.rel === 'approval_url')
      : undefined;

    if (!approvalLink?.href) {
      throw new Error('No approval url found');
    }

    return { approvalUrl: approvalLink.href };
  } catch (error) {
    console.error('PayPal subscription error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create PayPal plan or agreement.');
  }
});

export const executePayPalAgreement = functions.https.onRequest(async (req, res) => {
  configurePayPal();

  const paymentToken = req.query.paymentToken as string | undefined;
  const PayerID = req.query.PayerID as string | undefined;
  const uid = req.query.uid as string | undefined;

  if (!paymentToken || !PayerID || !uid) {
    res.status(400).send('Missing query parameters');
    return;
  }

  try {
    const agreement: any = await new Promise((resolve, reject) => {
      paypal.billingAgreement.execute(paymentToken, {}, (error: any, billingAgreement: any) => {
        if (error) return reject(error);
        resolve(billingAgreement);
      });
    });

    await admin.firestore().collection('subscriptions').doc(uid).set(
      {
        plan: 'Enterprise',
        status: 'active',
        paypalAgreementId: agreement.id,
        startDate: new Date(agreement.start_date),
      },
      { merge: true }
    );

    res.redirect('/dashboard');
  } catch (error) {
    console.error('PayPal agreement execution error:', error);
    res.status(500).send('Failed to execute PayPal agreement.');
  }
});