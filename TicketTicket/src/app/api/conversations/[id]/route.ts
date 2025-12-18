import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

// GET /api/conversations/[id] - 獲取對話詳情和訊息
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.dbId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.dbId;

    // 獲取對話
    const { data: conversation, error: convoError } = await supabaseAdmin
      .from('conversations')
      .select(`
        *,
        listing:listings!listing_id(id, event_name, event_date, venue, asking_price_jpy, status),
        host:users!host_id(id, username, avatar_url, rating, review_count),
        guest:users!guest_id(id, username, avatar_url, rating, review_count)
      `)
      .eq('id', id)
      .single();

    if (convoError || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // 確認用戶是對話參與者
    if (conversation.host_id !== userId && conversation.guest_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 獲取訊息
    const { data: messages, error: msgError } = await supabaseAdmin
      .from('messages')
      .select('*')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true });

    if (msgError) {
      console.error('Error fetching messages:', msgError);
    }

    // 標記訊息為已讀
    await supabaseAdmin
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', id)
      .neq('sender_id', userId);

    return NextResponse.json({
      conversation: {
        ...conversation,
        otherUser: conversation.host_id === userId ? conversation.guest : conversation.host,
        isHost: conversation.host_id === userId,
      },
      messages: messages || [],
    });
  } catch (error) {
    console.error('Error in GET /api/conversations/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/conversations/[id] - 發送訊息
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.dbId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const userId = session.user.dbId;
    const body = await request.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    // 確認用戶是對話參與者
    const { data: conversation } = await supabaseAdmin
      .from('conversations')
      .select('host_id, guest_id')
      .eq('id', id)
      .single();

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.host_id !== userId && conversation.guest_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: id,
        sender_id: userId,
        content: content.trim(),
        is_read: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error sending message:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/conversations/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
