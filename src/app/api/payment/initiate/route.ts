import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';

export async function POST(req: Request) {
  try {
    const { planId, amount, email, phone, userId } = await req.json();

    if (!planId || !email || !amount || !userId || !phone) {
      return NextResponse.json({ error: 'Missing required parameters (planId, amount, email, phone, userId)' }, { status: 400 });
    }

    const orderId = crypto.randomUUID();

    // Store in database BEFORE redirect
    const orderData = {
      orderId,
      userId,
      email,
      phone,
      plan: planId,
      amount,
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
