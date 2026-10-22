import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import httpStatus from "http-status";
import { User } from "../../database/schema/user/schema.js";
import { Notes } from "../../database/schema/notes/schema.js";
import type {
  authPayload,
  IRole,
} from "../../database/schema/user/interface.js";
import apiError from "../../utils/apiError.js";
import { buildPagination } from "../../utils/pagination.js";
import { getSafeUserData } from "./auth/service.js";

export class UserService {
  public static async getProfile(userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw apiError(httpStatus.BAD_REQUEST, "Invalid user ID");
    }

    const user = await User.findOne({
      _id: userId,
      isDeleted: false,
    });

    if (!user) {
      throw apiError(httpStatus.NOT_FOUND, "User not found");
    }

    return getSafeUserData(user);
  }

  public static async updateProfile(
    userId: string,
    data: {
      name?: string;
      interests?: string[];
    },
  ) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw apiError(httpStatus.BAD_REQUEST, "Invalid user ID");
    }

    const allowedUpdates: {
      name?: string;
      interests?: string[];
    } = {};

    if (data.name !== undefined) {
      allowedUpdates.name = data.name.trim();
    }
    if (data.interests !== undefined) {
      allowedUpdates.interests = data.interests;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      throw apiError(
        httpStatus.BAD_REQUEST,
        "No valid fields provided for update",
      );
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, isDeleted: false },
      { $set: allowedUpdates },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      throw apiError(httpStatus.NOT_FOUND, "User not found");
    }

    return getSafeUserData(updatedUser);
  }

  public static async getUsersGroupedByInterests() {
    const pipeline: mongoose.PipelineStage[] = [
      {
        $match: {
          isDeleted: false,
          interests: { $exists: true, $ne: null },
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          interests: {
            $cond: {
              if: { $isArray: "$interests" },
              then: "$interests",
              else: ["$interests"],
            },
          },
        },
      },
      { $unwind: "$interests" },
      {
        $match: {
          interests: { $nin: [null, ""] },
        },
      },
      {
        $group: {
          _id: "$interests",
          users: {
            $addToSet: {
              _id: "$_id",
              name: "$name",
              email: "$email",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          interest: "$_id",
          count: { $size: "$users" },
          users: 1,
        },
      },
      { $sort: { interest: 1 } },
    ];

    const result = await User.aggregate(pipeline);
    return result;
  }

  public static async getUserNotesWithLookup(
    currentUser: authPayload,
    targetUserId: string,
    pagination: { page: number; limit: number },
  ) {
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      throw apiError(httpStatus.BAD_REQUEST, "Invalid user ID");
    }

    // Role-based access control: regular users can only access their own notes
    if (currentUser.role !== "admin" && currentUser.id !== targetUserId) {
      throw apiError(
        httpStatus.FORBIDDEN,
        "Access forbidden: insufficient permissions",
      );
    }

    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const pipeline: mongoose.PipelineStage[] = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(targetUserId),
          isDeleted: false,
        },
      },
      {
        $lookup: {
          from: "notes",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$author", "$$userId"] },
                    { $eq: ["$isDeleted", false] },
                  ],
                },
              },
            },
            { $sort: { createdAt: -1, _id: -1 } },
            {
              $facet: {
                metadata: [{ $count: "totalData" }],
                data: [
                  { $skip: skip },
                  { $limit: limit },
                  {
                    $project: {
                      _id: 1,
                      title: 1,
                      content: 1,
                      createdAt: 1,
                      updatedAt: 1,
                    },
                  },
                ],
              },
            },
          ],
          as: "notesResult",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          notes: {
            $ifNull: [{ $arrayElemAt: ["$notesResult.data", 0] }, []],
          },
          totalData: {
            $ifNull: [
              {
                $arrayElemAt: [
                  { $arrayElemAt: ["$notesResult.metadata.totalData", 0] },
                  0,
                ],
              },
              0,
            ],
          },
        },
      },
    ];

    const results = await User.aggregate(pipeline);

    if (!results || results.length === 0) {
      throw apiError(httpStatus.NOT_FOUND, "User not found");
    }

    const result = results[0];
    const totalData = result.totalData || 0;
    const paginationMeta = buildPagination({ totalData, page, limit });

    return {
      user: {
        _id: result._id,
        name: result.name,
        email: result.email,
      },
      notes: result.notes,
      pagination: paginationMeta,
    };
  }

  // ================= ADMIN USER MANAGEMENT =================

  public static async adminCreateUser(data: {
    name: string;
    email: string;
    password: string;
    role?: IRole;
    interests?: string[];
  }) {
    const normalizedEmail = data.email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw apiError(httpStatus.CONFLICT, "Email is already registered");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await User.create({
      name: data.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: data.role || "user",
      interests: data.interests || [],
    });

    return getSafeUserData(user);
  }

  public static async adminGetUsers(pagination: {
    page: number;
    limit: number;
  }) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    const [totalData, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const paginationMeta = buildPagination({ totalData, page, limit });

    return {
      users: users.map(getSafeUserData),
      pagination: paginationMeta,
    };
  }

  public static async adminGetUserById(userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw apiError(httpStatus.BAD_REQUEST, "Invalid user ID");
    }

    const user = await User.findOne({
      _id: userId,
      isDeleted: false,
    });

    if (!user) {
      throw apiError(httpStatus.NOT_FOUND, "User not found");
    }

    return getSafeUserData(user);
  }

  public static async adminUpdateUser(
    userId: string,
    data: {
      name?: string;
      role?: IRole;
      interests?: string[];
    },
  ) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw apiError(httpStatus.BAD_REQUEST, "Invalid user ID");
    }

    const allowedUpdates: {
      name?: string;
      role?: IRole;
      interests?: string[];
    } = {};

    if (data.name !== undefined) {
      allowedUpdates.name = data.name.trim();
    }
    if (data.role !== undefined) {
      allowedUpdates.role = data.role;
    }
    if (data.interests !== undefined) {
      allowedUpdates.interests = data.interests;
    }

    if (Object.keys(allowedUpdates).length === 0) {
      throw apiError(
        httpStatus.BAD_REQUEST,
        "No valid fields provided for update",
      );
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, isDeleted: false },
      { $set: allowedUpdates },
      { new: true, runValidators: true },
    );

    if (!updatedUser) {
      throw apiError(httpStatus.NOT_FOUND, "User not found");
    }

    return getSafeUserData(updatedUser);
  }

  public static async adminDeleteUser(userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw apiError(httpStatus.BAD_REQUEST, "Invalid user ID");
    }

    const deletedUser = await User.findOneAndUpdate(
      { _id: userId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true },
    );

    if (!deletedUser) {
      throw apiError(httpStatus.NOT_FOUND, "User not found");
    }

    // Deliberate data integrity: cascade soft-deletion to user's notes so no orphaned notes remain
    await Notes.updateMany(
      { author: new mongoose.Types.ObjectId(userId), isDeleted: false },
      { $set: { isDeleted: true } },
    );

    return null;
  }
}
