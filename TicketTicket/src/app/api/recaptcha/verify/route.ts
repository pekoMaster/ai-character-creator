import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token, action } = await request.json();

    if (!token) {
      return NextResponse.json({ success: false, error: 'No token provided' }, { status: 400 });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      // If no secret key is configured, allow the request
      return NextResponse.json({ success: true, score: 1.0 });
    }

    const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

    const response = await fetch(verificationUrl, {
      method: 'POST',
    });

    const data = await response.json();

    if (data.success) {
      // For reCAPTCHA v3, check the score
      const score = data.score || 0;

      // Optionally verify the action matches
      if (action && data.action !== action) {
        return NextResponse.json({
          success: false,
          error: 'Action mismatch',
          score
        });
      }

      return NextResponse.json({
        success: true,
        score,
        action: data.action
      });
    } else {
      return NextResponse.json({
        success: false,
        error: data['error-codes']?.join(', ') || 'Verification failed',
        score: 0
      });
    }
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
