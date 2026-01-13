import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (email) {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          weightLogs: { orderBy: { createdAt: 'desc' }, take: 10 },
          activityLogs: { orderBy: { activityDate: 'desc' }, take: 10 },
          mealLogs: { orderBy: { mealDate: 'desc' }, take: 10 },
          alerts: { where: { isRead: false }, orderBy: { createdAt: 'desc' } },
        },
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      return NextResponse.json(user)
    }

    const users = await prisma.user.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('GET /api/user error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      )
    }

    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('POST /api/user error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.update({
      where: { email },
      data: { name },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('PATCH /api/user error:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { email },
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('DELETE /api/user error:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
