import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

// GET /api/applications - 獲取用戶相關的申請
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.dbId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.dbId;

    // 獲取用戶發出的申請
    const { data: sentApplications, error: sentError } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        listing:listings!listing_id(
          id,
          event_name,
          event_date,
          venue,
          host_id,
          asking_price_jpy,
          host:users!host_id(id, username, avatar_url)
        )
      `)
      .eq('guest_id', userId)
      .order('created_at', { ascending: false });

    if (sentError) {
      console.error('Error fetching sent applications:', sentError);
      return NextResponse.json({ error: sentError.message }, { status: 500 });
    }

    // 獲取用戶收到的申請（針對自己的刊登）
    const { data: receivedApplications, error: receivedError } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        guest:users!guest_id(id, username, avatar_url, rating, review_count),
        listing:listings!listing_id(id, event_name, event_date, venue)
      `)
      .eq('listing.host_id', userId)
      .order('created_at', { ascending: false });

    if (receivedError) {
      console.error('Error fetching received applications:', receivedError);
    }

    return NextResponse.json({
      sent: sentApplications || [],
      received: receivedApplications || [],
    });
  } catch (error) {
    console.error('Error in GET /api/applications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/applications - 新增申請
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.dbId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { listingId, message } = body;

    // 檢查刊登是否存在且開放
    const { data: listing } = await supabaseAdmin
      .from('listings')
      .select('id, host_id, status')
      .eq('id', listingId)
      .single();

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.status !== 'open') {
      return NextResponse.json({ error: 'Listing is not open' }, { status: 400 });
    }

    if (listing.host_id === session.user.dbId) {
      return NextResponse.json({ error: 'Cannot apply to own listing' }, { status: 400 });
    }

    // 檢查是否已申請
    const { data: existingApp } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('listing_id', listingId)
      .eq('guest_id', session.user.dbId)
      .single();

    if (existingApp) {
      return NextResponse.json({ error: 'Already applied' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('applications')
      .insert({
        listing_id: listingId,
        guest_id: session.user.dbId,
        message: message || '',
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating application:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/applications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
