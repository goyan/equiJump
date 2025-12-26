import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import { Score } from '@/lib/models/Score';

// GET /api/scores?courseId=xxx - Get leaderboard for a course
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    if (!courseId) {
      return NextResponse.json(
        { error: 'courseId is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const scores = await Score.find({ courseId })
      .sort({ faults: 1, time: 1 })
      .limit(limit)
      .populate('userId', 'name image')
      .lean();

    // Add rank
    const leaderboard = scores.map((score, index) => ({
      rank: index + 1,
      ...score,
    }));

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/scores - Submit a new score
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { courseId, time, faults, stars, jumpResults } = body;

    // Validate required fields
    if (!courseId || typeof time !== 'number' || typeof faults !== 'number') {
      return NextResponse.json(
        { error: 'Invalid score data' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Create new score
    const score = await Score.create({
      userId: session.user.id,
      courseId,
      time,
      faults,
      stars: stars || 1,
      jumpResults: jumpResults || [],
    });

    // Check if this is a personal best
    const personalBest = await Score.findOne({
      userId: session.user.id,
      courseId,
      _id: { $ne: score._id },
    })
      .sort({ faults: 1, time: 1 })
      .lean();

    const isPersonalBest =
      !personalBest ||
      faults < personalBest.faults ||
      (faults === personalBest.faults && time < personalBest.time);

    return NextResponse.json({
      score,
      isPersonalBest,
    });
  } catch (error) {
    console.error('Error saving score:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
