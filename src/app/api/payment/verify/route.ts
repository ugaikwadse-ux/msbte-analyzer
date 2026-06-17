import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { saveSubscription } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });
    }

    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const orderData = orderSnap.data();

    // Prevent duplicate verification
    if (orderData.status === 'ACTIVE') {
      return NextResponse.json({ status: 'SUCCESS', message: 'Already verified' });
    }

    // Call Vorynex Verification API
    const verifyRes = await fetch('https://pay.vorynex.in/api/v1.0/phonePe/payment/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ orderId })
    });

    if (!verifyRes.ok) {
       console.error("Vorynex verify API failed with status:", verifyRes.status);
       // We can treat this as failure
    }

    let verifyData;
    try {
        verifyData = await verifyRes.json();
    } catch (e) {
        // If gateway returns non-JSON or fails, we treat it as PENDING to allow retries
        console.error('Failed to parse Vorynex response:', e);
        verifyData = { status: 'PENDING' };
    }

    if (verifyData.status === 'SUCCESS') {
      // Price Verification: Ensure the amount paid matches the stored amount
      const paidAmount = verifyData.amount ?? verifyData.data?.amount;
      
      if (paidAmount !== undefined && paidAmount !== null) {
        const expectedAmountINR = Number(orderData.amount);
        const expectedAmountPaise = expectedAmountINR * 100;
        const paid = Number(paidAmount);
        
        if (paid !== expectedAmountINR && paid !== expectedAmountPaise) {
          console.error(`Price manipulation detected for order ${orderId}! Expected ${expectedAmountINR} or ${expectedAmountPaise}, but got ${paid}`);
          await updateDoc(orderRef, {
            status: 'FAILED',
            history: arrayUnion('verification_failed_price_mismatch')
          });
          return NextResponse.json({ status: 'FAILED', message: 'Price verification failed' });
        }
      }

      // Mark order as ACTIVE
      await updateDoc(orderRef, {
        status: 'ACTIVE',
        history: arrayUnion('verified', 'activated'),
        paymentDate: serverTimestamp()
      });

      // Unlock subscription
      await saveSubscription({
        userId: orderData.userId,
        plan: orderData.plan,
        status: 'active',
        paypalSubscriptionId: orderId,
        startDate: new Date(),
        createdAt: new Date(),
      });

      return NextResponse.json({ status: 'SUCCESS' });
    } else if (verifyData.status === 'FAILED') {
      // Explicit failure case
      await updateDoc(orderRef, {
        status: 'FAILED',
        history: arrayUnion('verification_failed')
      });
      return NextResponse.json({ status: 'FAILED' });
    } else {
      // Pending or other states (like INITIATED)
      return NextResponse.json({ status: 'PENDING' });
    }

  } catch (e) {
    console.error('Payment verify error:', e);
    return NextResponse.json(
      { error: 'Server error', details: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
