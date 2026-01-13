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

    const mealLogs = await prisma.mealLog.findMany({
      where: { userId },
      orderBy: { mealDate: 'desc' },
      take: limit,
    })

    return NextResponse.json(mealLogs)
  } catch (error) {
    console.error('GET /api/meal error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meal logs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, mealType, foodName, calories, protein, carbs, fat, fiber, rating, aiAnalysis, photoUrl, mealDate } = body

    if (!userId || !mealType || !foodName || !calories) {
      return NextResponse.json(
        { error: 'userId, mealType, foodName, and calories are required' },
        { status: 400 }
      )
    }

    if (calories < 0 || calories > 10000) {
      return NextResponse.json(
        { error: 'Calories must be between 0 and 10000' },
        { status: 400 }
      )
    }

    const mealLog = await prisma.mealLog.create({
      data: {
        userId,
        mealType,
        foodName,
        calories,
        protein: protein || null,
        carbs: carbs || null,
        fat: fat || null,
        fiber: fiber || null,
        rating: rating || null,
        aiAnalysis: aiAnalysis || null,
        photoUrl: photoUrl || null,
        mealDate: mealDate ? new Date(mealDate) : new Date(),
      },
    })

    return NextResponse.json(mealLog, { status: 201 })
  } catch (error) {
    console.error('POST /api/meal error:', error)
    return NextResponse.json(
      { error: 'Failed to create meal log' },
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

    await prisma.mealLog.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Meal log deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/meal error:', error)
    return NextResponse.json(
      { error: 'Failed to delete meal log' },
      { status: 500 }
    )
  }
}
