import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/profile - 取得當前用戶資料
export async function GET() {
  const session = await auth();

  if (!session?.user?.dbId) {
    return NextResponse.json({ error: '未登入' }, { status: 401 });
  }

  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', session.user.dbId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json({ error: '取得用戶資料失敗' }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
    }

    // 轉換欄位名稱為 camelCase
    const formattedUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatar_url,
      customAvatarUrl: user.custom_avatar_url,
      rating: parseFloat(user.rating) || 0,
      reviewCount: user.review_count || 0,
      isVerified: user.is_verified,
      phoneCountryCode: user.phone_country_code,
      phoneNumber: user.phone_number,
      lineId: user.line_id,
      discordId: user.discord_id,
      showLine: user.show_line,
      showDiscord: user.show_discord,
      createdAt: user.created_at,
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error('Error in GET /api/profile:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}

// PATCH /api/profile - 更新用戶資料
export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.dbId) {
    return NextResponse.json({ error: '未登入' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      username,
      customAvatarUrl,
      phoneCountryCode,
      phoneNumber,
      lineId,
      discordId,
      showLine,
      showDiscord,
    } = body;

    // 建立更新資料
    const updateData: Record<string, unknown> = {};

    if (username !== undefined) {
      if (!username || username.trim().length < 1) {
        return NextResponse.json({ error: '名稱不能為空' }, { status: 400 });
      }
      if (username.length > 50) {
        return NextResponse.json({ error: '名稱不能超過 50 字' }, { status: 400 });
      }
      updateData.username = username.trim();
    }

    if (customAvatarUrl !== undefined) {
      updateData.custom_avatar_url = customAvatarUrl;
    }

    if (phoneCountryCode !== undefined) {
      updateData.phone_country_code = phoneCountryCode;
    }

    if (phoneNumber !== undefined) {
      // 簡單驗證電話號碼格式
      if (phoneNumber && !/^[0-9]{6,15}$/.test(phoneNumber.replace(/[\s-]/g, ''))) {
        return NextResponse.json({ error: '電話號碼格式不正確' }, { status: 400 });
      }
      updateData.phone_number = phoneNumber ? phoneNumber.replace(/[\s-]/g, '') : null;
    }

    if (lineId !== undefined) {
      if (lineId && lineId.length > 100) {
        return NextResponse.json({ error: 'LINE ID 不能超過 100 字' }, { status: 400 });
      }
      updateData.line_id = lineId || null;
    }

    if (discordId !== undefined) {
      if (discordId && discordId.length > 100) {
        return NextResponse.json({ error: 'Discord ID 不能超過 100 字' }, { status: 400 });
      }
      updateData.discord_id = discordId || null;
    }

    if (showLine !== undefined) {
      updateData.show_line = Boolean(showLine);
    }

    if (showDiscord !== undefined) {
      updateData.show_discord = Boolean(showDiscord);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: '沒有要更新的資料' }, { status: 400 });
    }

    // 執行更新
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', session.user.dbId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json({ error: '更新用戶資料失敗' }, { status: 500 });
    }

    // 轉換欄位名稱為 camelCase
    const formattedUser = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatarUrl: updatedUser.avatar_url,
      customAvatarUrl: updatedUser.custom_avatar_url,
      rating: parseFloat(updatedUser.rating) || 0,
      reviewCount: updatedUser.review_count || 0,
      isVerified: updatedUser.is_verified,
      phoneCountryCode: updatedUser.phone_country_code,
      phoneNumber: updatedUser.phone_number,
      lineId: updatedUser.line_id,
      discordId: updatedUser.discord_id,
      showLine: updatedUser.show_line,
      showDiscord: updatedUser.show_discord,
      createdAt: updatedUser.created_at,
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error('Error in PATCH /api/profile:', error);
    return NextResponse.json({ error: '伺服器錯誤' }, { status: 500 });
  }
}
