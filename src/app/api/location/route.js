import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = process.env.NODE_ENV === 'development'
      ? '102.90.80.103'
      : forwarded?.split(',')[0] ||
        req.headers.get('x-real-ip') ||
        'Unknown';

    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
    const geo = await geoRes.json();

    return NextResponse.json({
      ip: geo.ip || ip,
      country: geo.country_name || 'Unknown',
      country_code: geo.country_code?.toLowerCase() || null, // add this line
      city: geo.city || 'Unknown',
      region: geo.region || 'Unknown',
    });
  } catch (error) {
    return NextResponse.json({ error: 'Could not retrieve IP info' }, { status: 500 });
  }
}
