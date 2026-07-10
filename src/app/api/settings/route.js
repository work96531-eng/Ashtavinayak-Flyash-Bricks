import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();
    if (!settings) {
      settings = await prisma.settings.create({ data: {} });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const data = await request.json();

    const updateData = {};
    if (data.deliveryRadiusKm !== undefined) updateData.deliveryRadiusKm = parseFloat(data.deliveryRadiusKm);
    if (data.primaryColor !== undefined) updateData.primaryColor = data.primaryColor;
    if (data.bannerText !== undefined) updateData.bannerText = data.bannerText;
    if (data.aboutUsText !== undefined) updateData.aboutUsText = data.aboutUsText;
    if (data.factoryAddress !== undefined) updateData.factoryAddress = data.factoryAddress;
    if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone;
    if (data.contactWhatsApp !== undefined) updateData.contactWhatsApp = data.contactWhatsApp;
    if (data.googleMapsApiKey !== undefined) updateData.googleMapsApiKey = data.googleMapsApiKey;
    if (data.googleMapsLink !== undefined) updateData.googleMapsLink = data.googleMapsLink;
    if (data.logoUrl !== undefined) updateData.logoUrl = data.logoUrl;
    if (data.logoShape !== undefined) updateData.logoShape = data.logoShape;
    if (data.logoSize !== undefined) updateData.logoSize = parseInt(data.logoSize, 10) || 52;
    if (data.heroStats !== undefined) updateData.heroStats = JSON.stringify(data.heroStats);
    if (data.heroBadgeText !== undefined) updateData.heroBadgeText = data.heroBadgeText;
    if (data.heroImageUrl !== undefined) updateData.heroImageUrl = data.heroImageUrl;
    if (data.instagram !== undefined) updateData.instagram = data.instagram;
    if (data.facebook !== undefined) updateData.facebook = data.facebook;
    if (data.youtube !== undefined) updateData.youtube = data.youtube;
    if (data.twitter !== undefined) updateData.twitter = data.twitter;
    if (data.linkedin !== undefined) updateData.linkedin = data.linkedin;
    if (data.factoryLatitude !== undefined && data.factoryLatitude !== '') {
      updateData.factoryLatitude = parseFloat(data.factoryLatitude);
    }
    if (data.factoryLongitude !== undefined && data.factoryLongitude !== '') {
      updateData.factoryLongitude = parseFloat(data.factoryLongitude);
    }

    let settings = await prisma.settings.findFirst();
    if (settings) {
      settings = await prisma.settings.update({
        where: { id: settings.id },
        data: updateData
      });
    } else {
      settings = await prisma.settings.create({ data: updateData });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Settings PUT error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
