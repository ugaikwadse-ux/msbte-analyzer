import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return new NextResponse('Missing orderId', { status: 400 });
    }

    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return new NextResponse('Order not found', { status: 404 });
    }

    const orderData = orderSnap.data();

    // Construct the Vorynex payment URL securely on the server
    const redirectUrl = `https://vorynex.in/direct-pay.html?plan=${orderData.plan}&price=${orderData.amount}&email=${orderData.email}&phone=${orderData.phone}&merchantorderid=${orderId}`;

    return NextResponse.redirect(redirectUrl);
  } catch (e) {
    console.error('Checkout redirect error:', e);
    return new NextResponse('Server Error', { status: 500 });
  }
}
