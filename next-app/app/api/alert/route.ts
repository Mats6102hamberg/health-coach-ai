import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const alerts = await prisma.alert.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error('GET /api/alert error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type, title, message, severity } = body

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { error: 'userId, type, title, and message are required' },
        { status: 400 }
      )
    }

    const alert = await prisma.alert.create({
      data: {
        userId,
        type,
        title,
        message,
        severity: severity || 'info',
      },
    })

    return NextResponse.json(alert, { status: 201 })
  } catch (error) {
    console.error('POST /api/alert error:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, isRead } = body

    if (!id) {
      return NextResponse.json(
        { error: 'id is required' },
        { status: 400 }
      )
    }

    const alert = await prisma.alert.update({
      where: { id },
      data: { isRead: isRead ?? true },
    })

    return NextResponse.json(alert)
  } catch (error) {
    console.error('PATCH /api/alert error:', error)
    return NextResponse.json(
      { error: 'Failed to update alert' },
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

    await prisma.alert.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Alert deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/alert error:', error)
    return NextResponse.json(
      { error: 'Failed to delete alert' },
      { status: 500 }
    )
  }
}
