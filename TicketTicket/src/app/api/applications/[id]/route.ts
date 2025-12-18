import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/auth';

// PATCH /api/applications/[id] - 更新申請狀態
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.dbId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // 獲取申請和刊登資訊
    const { data: application } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        listing:listings!listing_id(id, host_id)
      `)
      .eq('id', id)
      .single();

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const userId = session.user.dbId;
    const isHost = application.listing?.host_id === userId;
    const isGuest = application.guest_id === userId;

    // 權限檢查
    if (status === 'cancelled' && !isGuest) {
      return NextResponse.json({ error: 'Only applicant can cancel' }, { status: 403 });
    }

    if ((status === 'accepted' || status === 'rejected') && !isHost) {
      return NextResponse.json({ error: 'Only host can accept/reject' }, { status: 403 });
    }

    const { data, error } = await supabaseAdmin
      .from('applications')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating application:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 如果接受申請，創建對話
    if (status === 'accepted') {
      const { data: existingConvo } = await supabaseAdmin
        .from('conversations')
        .select('id')
        .eq('listing_id', application.listing_id)
        .eq('guest_id', application.guest_id)
        .single();

      if (!existingConvo) {
        await supabaseAdmin.from('conversations').insert({
          listing_id: application.listing_id,
          host_id: application.listing.host_id,
          guest_id: application.guest_id,
        });
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PATCH /api/applications/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
