import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase';

// POST /api/profile/avatar - 上傳頭像
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.dbId) {
    return NextResponse.json({ error: '未登入' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return NextResponse.json({ error: '請選擇圖片' }, { status: 400 });
    }

    // 檢查檔案類型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '只接受圖片檔案' }, { status: 400 });
    }

    // 檢查檔案大小（最大 2MB）
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: '圖片大小不能超過 2MB' }, { status: 400 });
    }

    // 生成檔案名稱
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${session.user.dbId}-${Date.now()}.${fileExt}`;

    // 將 File 轉換為 ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // 上傳到 Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      // 如果 storage 未設定，使用 data URL 作為備選方案
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      const dataUrl = `data:${file.type};base64,${base64}`;

      // 儲存 data URL 到資料庫
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ custom_avatar_url: dataUrl })
        .eq('id', session.user.dbId);

      if (updateError) {
        console.error('Error updating avatar URL:', updateError);
        return NextResponse.json({ error: '儲存頭像失敗' }, { status: 500 });
      }

      return NextResponse.json({ avatarUrl: dataUrl });
    }

    // 取得公開 URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const avatarUrl = publicUrlData.publicUrl;

    // 更新用戶的頭像 URL
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ custom_avatar_url: avatarUrl })
      .eq('id', session.user.dbId);

    if (updateError) {
      console.error('Error updating avatar URL:', updateError);
      return NextResponse.json({ error: '儲存頭像 URL 失敗' }, { status: 500 });
    }

    return NextResponse.json({ avatarUrl });
  } catch (error) {
    console.error('Error in POST /api/profile/avatar:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}

// DELETE /api/profile/avatar - 移除自訂頭像
export async function DELETE() {
  const session = await auth();

  if (!session?.user?.dbId) {
    return NextResponse.json({ error: '未登入' }, { status: 401 });
  }

  try {
    // 清除自訂頭像
    const { error } = await supabaseAdmin
      .from('users')
      .update({ custom_avatar_url: null })
      .eq('id', session.user.dbId);

    if (error) {
      console.error('Error removing avatar:', error);
      return NextResponse.json({ error: '移除頭像失敗' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/profile/avatar:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}
