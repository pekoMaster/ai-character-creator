import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET - 取得指定用戶的評價列表
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    // 取得該用戶收到的評價
    const { data: reviews, error } = await supabaseAdmin
      .from('reviews')
      .select(`
        *,
        reviewer:reviewer_id (
          id,
          username,
          avatar_url,
          custom_avatar_url
        ),
        listing:listing_id (
          id,
          event_name,
          event_date
        )
      `)
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - 建立新評價
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.dbId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { listingId, revieweeId, rating, comment } = body;

    // 驗證必填欄位
    if (!listingId || !revieweeId || !rating) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 驗證評分範圍
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // 不能評價自己
    if (revieweeId === session.user.dbId) {
      return NextResponse.json({ error: 'Cannot review yourself' }, { status: 400 });
    }

    // 檢查是否已經評價過此刊登
    const { data: existingReview } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('reviewer_id', session.user.dbId)
      .eq('listing_id', listingId)
      .single();

    if (existingReview) {
      return NextResponse.json({ error: 'Already reviewed this listing' }, { status: 400 });
    }

    // 檢查刊登是否存在
    const { data: listing } = await supabaseAdmin
      .from('listings')
      .select('id, event_date, host_id')
      .eq('id', listingId)
      .single();

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // 檢查活動日期是否已過（只能在活動結束後評價）
    const eventDate = new Date(listing.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate > today) {
      return NextResponse.json({ error: 'Cannot review before event date' }, { status: 400 });
    }

    // 檢查評價權限：
    // - 如果是主辦方，檢查是否有被接受的申請者（reviewee 必須是申請者）
    // - 如果是申請者，檢查申請是否被接受（reviewee 必須是主辦方）
    const isHost = listing.host_id === session.user.dbId;

    if (isHost) {
      // 主辦方評價申請者
      const { data: application } = await supabaseAdmin
        .from('applications')
        .select('id')
        .eq('listing_id', listingId)
        .eq('guest_id', revieweeId)
        .eq('status', 'accepted')
        .single();

      if (!application) {
        return NextResponse.json({ error: 'No accepted application found for this user' }, { status: 400 });
      }
    } else {
      // 申請者評價主辦方
      if (revieweeId !== listing.host_id) {
        return NextResponse.json({ error: 'Can only review the host' }, { status: 400 });
      }

      const { data: application } = await supabaseAdmin
        .from('applications')
        .select('id')
        .eq('listing_id', listingId)
        .eq('guest_id', session.user.dbId)
        .eq('status', 'accepted')
        .single();

      if (!application) {
        return NextResponse.json({ error: 'Your application was not accepted' }, { status: 400 });
      }
    }

    // 建立評價
    const { data: newReview, error: insertError } = await supabaseAdmin
      .from('reviews')
      .insert({
        reviewer_id: session.user.dbId,
        reviewee_id: revieweeId,
        listing_id: listingId,
        rating,
        comment: comment || null,
      })
      .select(`
        *,
        reviewer:reviewer_id (
          id,
          username,
          avatar_url,
          custom_avatar_url
        )
      `)
      .single();

    if (insertError) {
      console.error('Error creating review:', insertError);
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
