import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

// 管理員 email 列表（可以放到環境變數）
const ADMIN_EMAILS = [
  '16861@gm.ncyu.edu.tw',
  'admin@ticketticket.live',
  'lmmlmm16861@gmail.com',
  'pekopekopekopekomura@gmail.com',
  'lmm16861@gmail.com',
];

// GET /api/events - 獲取活動列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // 統一使用 admin client（因為 RLS 與 NextAuth 不兼容）
    let query = supabaseAdmin
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching events:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in GET /api/events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/events - 新增活動（僅管理員）
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // 使用 admin client 繞過 RLS
    const { data, error } = await supabaseAdmin
      .from('events')
      .insert({
        name: body.name,
        artist: body.artist,
        event_date: body.eventDate,
        event_end_date: body.eventEndDate || null,
        venue: body.venue,
        venue_address: body.venueAddress || null,
        image_url: body.imageUrl || null,
        description: body.description || null,
        ticket_price_tiers: body.ticketPriceTiers || [],
        category: body.category || 'concert',
        is_active: body.isActive !== false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
