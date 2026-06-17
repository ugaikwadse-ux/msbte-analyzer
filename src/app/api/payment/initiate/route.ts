import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { planId, amount, email, phone, userId } = await req.json();

    if (!planId || !email || !userId || !phone) {
      return NextResponse.json({ error: 'Missing required parameters (planId, email, phone, userId)' }, { status: 400 });
    }

    // Server-side price enforcement — never trust client amount
    const PLAN_PRICES: Record<string, number> = { institute: 1599 };
    const verifiedAmount = PLAN_PRICES[planId];
    if (!verifiedAmount) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const orderId = crypto.randomUUID();

    // Store in database BEFORE redirect
    const orderData = {
      orderId,
      userId,
      email,
      phone,
      plan: planId,
      amount: verifiedAmount,
      status: 'INITIATED',
      createdAt: serverTimestamp(),
      history: ['created', 'payment_started']
    };

    // Store in a new "orders" collection
    await setDoc(doc(db, 'orders', orderId), orderData);

    return NextResponse.json({
      orderId
    });
  } catch (e) {
    console.error('Payment initiate error:', e);
    return NextResponse.json(
      { error: 'Server error', details: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
