// API route to update test product prices

import { NextResponse } from 'next/server';
import { updateTestProductPrices } from '../../actions/updateTestPrices';

export async function POST() {
  try {
    const result = await updateTestProductPrices();
    
    if (result.success) {
      return NextResponse.json({ message: result.message }, { status: 200 });
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
