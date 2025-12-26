import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IScore extends Document {
  userId: Types.ObjectId;
  courseId: string;
  time: number; // milliseconds
  faults: number;
  stars: 1 | 2 | 3;
  jumpResults: Array<{
    zone: string;
    straightness: number;
    rhythm: number;
    outcome: string;
    faults: number;
  }>;
  createdAt: Date;
}

const scoreSchema = new Schema<IScore>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: String,
      required: true,
      index: true,
    },
    time: {
      type: Number,
      required: true,
    },
    faults: {
      type: Number,
      required: true,
      default: 0,
    },
    stars: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
    },
    jumpResults: [
      {
        zone: String,
        straightness: Number,
        rhythm: Number,
        outcome: String,
        faults: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index for leaderboard queries (sort by faults, then time)
scoreSchema.index({ courseId: 1, faults: 1, time: 1 });

// Index for user's personal best
scoreSchema.index({ userId: 1, courseId: 1, faults: 1, time: 1 });

export const Score: Model<IScore> =
  mongoose.models.Score || mongoose.model<IScore>('Score', scoreSchema);
