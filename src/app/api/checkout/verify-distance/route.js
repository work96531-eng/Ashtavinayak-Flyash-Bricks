import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDistance } from 'geolib';

// Fallback manual geocoding for prototype if no API key is set
async function mockGeocode(address) {
  // In a real app with no API key, you might use a free geocoding service like Nominatim
  // Here we'll just simulate by returning a coordinate slightly away from the factory
  // to allow testing both success and failure cases.
  // Let's just return a fixed coordinate that we know is within 50km for 'test',
  // and outside for anything else if we want to mock.
  
  // For now, let's use a public free geocoding API like openstreetmap (Nominatim)
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`, {
      headers: {
        'User-Agent': 'AshBrickApp/1.0'
      }
    });
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon)
      };
    }
  } catch (e) {
    console.error("Geocoding failed", e);
  }
  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { address, lat, lng } = body;
    
    const settings = await prisma.settings.findFirst();
    if (!settings) {
      return NextResponse.json({ error: "System not configured." }, { status: 500 });
    }

    if (!settings.factoryLatitude || !settings.factoryLongitude) {
       return NextResponse.json({ error: "Factory location not set by owner." }, { status: 400 });
    }

    let customerCoords = null;

    if (lat && lng) {
      customerCoords = { lat, lon: lng };
    } else if (address) {
      // Use Google Maps API if available
      if (settings.googleMapsApiKey) {
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${settings.googleMapsApiKey}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          customerCoords = {
            lat: data.results[0].geometry.location.lat,
            lon: data.results[0].geometry.location.lng
          };
        }
      } else {
        customerCoords = await mockGeocode(address);
      }
    }

    if (!customerCoords) {
      return NextResponse.json({ error: "Could not determine coordinates for the given location." }, { status: 400 });
    }

    const factoryCoords = {
      lat: settings.factoryLatitude,
      lon: settings.factoryLongitude
    };

    // Calculate distance in meters
    const distanceMeters = getDistance(factoryCoords, { latitude: customerCoords.lat, longitude: customerCoords.lon });
    const distanceKm = distanceMeters / 1000;
    
    const maxRadius = settings.deliveryRadiusKm || 50;
    const isWithinRadius = distanceKm <= maxRadius;

    return NextResponse.json({
      distanceKm,
      maxRadius,
      isWithinRadius,
      coordinates: customerCoords,
      message: isWithinRadius ? "Location is within delivery radius." : "Delivery Unavailable: Your location is outside our current service radius."
    });

  } catch (error) {
    console.error("Distance verification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
