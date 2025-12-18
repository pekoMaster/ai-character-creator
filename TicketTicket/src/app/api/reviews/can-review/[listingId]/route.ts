import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET - 檢查用戶是否可以評價此刊登
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ listingId: string }> }
) {
  const session = await auth();

  if (!session?.user?.dbId) {
    return NextResponse.json({ canReview: false, reason: 'not_logged_in' });
  }

  const { listingId } = await params;

  try {
    // 取得刊登資訊
    const { data: listing } = await supabaseAdmin
      .from('listings')
      .select('id, event_date, host_id')
      .eq('id', listingId)
      .single();

    if (!listing) {
      return NextResponse.json({ canReview: false, reason: 'listing_not_found' });
    }

    // 檢查活動日期是否已過
    const eventDate = new Date(listing.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    eventDate.setHours(0, 0, 0, 0);

    if (eventDate > today) {
      return NextResponse.json({ canReview: false, reason: 'event_not_passed' });
    }

    // 檢查是否已經評價過
    const { data: existingReview } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('reviewer_id', session.user.dbId)
      .eq('listing_id', listingId)
      .single();

    if (existingReview) {
      return NextResponse.json({ canReview: false, reason: 'already_reviewed' });
    }

    const isHost = listing.host_id === session.user.dbId;

    if (isHost) {
      // 主辦方：檢查是否有被接受的申請者
      const { data: acceptedApplications } = await supabaseAdmin
        .from('applications')
        .select('guest_id, guest:guest_id (id, username, avatar_url, custom_avatar_url)')
        .eq('listing_id', listingId)
        .eq('status', 'accepted');

      if (!acceptedApplications || acceptedApplications.length === 0) {
        return NextResponse.json({ canReview: false, reason: 'no_accepted_guests' });
      }

      // 檢查哪些申請者還沒被評價過
      const reviewableGuests = [];
      for (const app of acceptedApplications) {
        const { data: existingGuestReview } = await supabaseAdmin
          .from('reviews')
          .select('id')
          .eq('reviewer_id', session.user.dbId)
          .eq('reviewee_id', app.guest_id)
          .eq('listing_id', listingId)
          .single();

        if (!existingGuestReview) {
          reviewableGuests.push(app.guest);
        }
      }

      if (reviewableGuests.length === 0) {
        return NextResponse.json({ canReview: false, reason: 'all_guests_reviewed' });
      }

      return NextResponse.json({
        canReview: true,
        isHost: true,
        reviewableUsers: reviewableGuests,
      });
    } else {
      // 申請者：檢查申請是否被接受
      const { data: application } = await supabaseAdmin
        .from('applications')
        .select('id')
        .eq('listing_id', listingId)
        .eq('guest_id', session.user.dbId)
        .eq('status', 'accepted')
        .single();

      if (!application) {
        return NextResponse.json({ canReview: false, reason: 'application_not_accepted' });
      }

      // 取得主辦方資訊
      const { data: host } = await supabaseAdmin
        .from('users')
        .select('id, username, avatar_url, custom_avatar_url')
        .eq('id', listing.host_id)
        .single();

      return NextResponse.json({
        canReview: true,
        isHost: false,
        reviewableUsers: host ? [host] : [],
      });
    }
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return NextResponse.json({ canReview: false, reason: 'error' }, { status: 500 });
  }
}
