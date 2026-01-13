import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '30')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const activityLogs = await prisma.activityLog.findMany({
      where: { userId },
      orderBy: { activityDate: 'desc' },
      take: limit,
    })

    return NextResponse.json(activityLogs)
  } catch (error) {
    console.error('GET /api/activity error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, steps, calories, duration, distance, heartRate, notes, activityDate } = body

    if (!userId || !type) {
      return NextResponse.json(
        { error: 'userId and type are required' },
        { status: 400 }
      )
    }

    const activityLog = await prisma.activityLog.create({
      data: {
        userId,
        type,
        steps: steps || null,
        calories: calories || null,
        duration: duration || null,
        distance: distance || null,
        heartRate: heartRate || null,
        notes: notes || null,
        activityDate: activityDate ? new Date(activityDate) : new Date(),
      },
    })

    return NextResponse.json(activityLog, { status: 201 })
  } catch (error) {
    console.error('POST /api/activity error:', error)
    return NextResponse.json(
      { error: 'Failed to create activity log' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    await prisma.activityLog.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Activity log deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/activity error:', error)
    return NextResponse.json(
      { error: 'Failed to delete activity log' },
      { status: 500 }
    )
  }
}
