import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

// GET /api/listings - 獲取所有刊登
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('listings')
      .select(`
        *,
        host:users!host_id(id, username, avatar_url, custom_avatar_url, rating, review_count, line_id, discord_id, show_line, show_discord)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching listings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in GET /api/listings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/listings - 新增刊登
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.dbId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // 準備插入資料
    const insertData: Record<string, unknown> = {
      host_id: session.user.dbId,
      event_name: body.eventName,
      artist_tags: body.artistTags || [],
      event_date: body.eventDate,
      venue: body.venue,
      meeting_time: body.meetingTime,
      meeting_location: body.meetingLocation,
      original_price_jpy: body.originalPriceJPY,
      asking_price_jpy: body.askingPriceJPY,
      total_slots: body.totalSlots || 1,
      available_slots: body.totalSlots || 1,
      ticket_type: body.ticketType,
      seat_grade: body.seatGrade,
      ticket_count_type: body.ticketCountType,
      host_nationality: body.hostNationality,
      host_languages: body.hostLanguages || [],
      identification_features: body.identificationFeatures || '',
      description: body.description || '',
      status: 'open',
    };

    // 如果是換票類型，添加換票專用欄位
    if (body.ticketType === 'ticket_exchange') {
      insertData.exchange_event_name = body.exchangeEventName || '';
      insertData.exchange_seat_grade = body.exchangeSeatGrade || '';
      insertData.subsidy_amount = body.subsidyAmount || 0;
      insertData.subsidy_direction = body.subsidyDirection || 'i_pay_you';
    }

    const { data, error } = await supabaseAdmin
      .from('listings')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating listing:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/listings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
