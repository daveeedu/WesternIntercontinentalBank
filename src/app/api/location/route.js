import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    // Optional: log the forwarded IP
    const forwarded = req.headers.get('x-forwarded-for');
    console.log('Forwarded IP:', forwarded);

    const geoRes = await fetch('https://ipapi.co/json/');
    
    if (!geoRes.ok) {
      throw new Error('Failed to fetch geo info');
    }

    const geo = await geoRes.json();

    return NextResponse.json({
      ip: geo.ip || forwarded || 'Unknown',
      country: geo.country_name || 'Unknown',
      country_code: geo.country_code?.toLowerCase() || null,
      city: geo.city || 'Unknown',
      region: geo.region || 'Unknown',
    });
  } catch (error) {
    console.error('Error fetching IP/location info:', error);
    return NextResponse.json(
      { error: 'Could not retrieve IP/location info' },
      { status: 500 }
    );
  }
}

