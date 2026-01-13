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

    const weightLogs = await prisma.weightLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json(weightLogs)
  } catch (error) {
    console.error('GET /api/weight error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weight logs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, weight, bodyFat, muscle, notes } = body

    if (!userId || !weight) {
      return NextResponse.json(
        { error: 'userId and weight are required' },
        { status: 400 }
      )
    }

    if (weight <= 0 || weight > 500) {
      return NextResponse.json(
        { error: 'Weight must be between 0 and 500 kg' },
        { status: 400 }
      )
    }

    const weightLog = await prisma.weightLog.create({
      data: {
        userId,
        weight,
        bodyFat: bodyFat || null,
        muscle: muscle || null,
        notes: notes || null,
      },
    })

    return NextResponse.json(weightLog, { status: 201 })
  } catch (error) {
    console.error('POST /api/weight error:', error)
    return NextResponse.json(
      { error: 'Failed to create weight log' },
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

    await prisma.weightLog.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Weight log deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/weight error:', error)
    return NextResponse.json(
      { error: 'Failed to delete weight log' },
      { status: 500 }
    )
  }
}
