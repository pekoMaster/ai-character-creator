import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

// 管理員 email 列表
const ADMIN_EMAILS = [
  '16861@gm.ncyu.edu.tw',
  'admin@ticketticket.live',
  'lmmlmm16861@gmail.com',
  'pekopekopekopekomura@gmail.com',
  'lmm16861@gmail.com',
];

// GET /api/events/[id] - 獲取單一活動
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 使用 admin client 以便能取得未啟用的活動
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching event:', error);
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/events/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH /api/events/[id] - 更新活動（僅管理員）
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    // 轉換駝峰命名為底線命名
    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.artist !== undefined) updates.artist = body.artist;
    if (body.eventDate !== undefined) updates.event_date = body.eventDate;
    if (body.eventEndDate !== undefined) updates.event_end_date = body.eventEndDate;
    if (body.venue !== undefined) updates.venue = body.venue;
    if (body.venueAddress !== undefined) updates.venue_address = body.venueAddress;
    if (body.imageUrl !== undefined) updates.image_url = body.imageUrl;
    if (body.description !== undefined) updates.description = body.description;
    if (body.ticketPriceTiers !== undefined) updates.ticket_price_tiers = body.ticketPriceTiers;
    if (body.category !== undefined) updates.category = body.category;
    if (body.isActive !== undefined) updates.is_active = body.isActive;

    // 使用 admin client 繞過 RLS
    const { data, error } = await supabaseAdmin
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH /api/events/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/events/[id] - 刪除活動（僅管理員）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // 使用 admin client 繞過 RLS
    const { error } = await supabaseAdmin
      .from('events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/events/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
