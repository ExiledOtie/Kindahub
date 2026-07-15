const bcrypt = require("bcryptjs");

const generateUsername =
  require("../utils/generateUsername");

const {
  createUserModel,
  assignUserToGroupModel,
  getAllUsersModel,
  getSingleUserModel,
  getMemberProfileModel,
  getMemberSummaryModel,
  findUserByEmailModel,
  updateUserModel,
  resetPasswordModel,
  deleteUserModel,
  getUserGroups,
} = require("../models/userModel");

/*
|--------------------------------------------------------------------------
| CREATE USER
|--------------------------------------------------------------------------
*/

const createUser = async (req, res) => {
  try {
    const {
      fullname,
      email,
      phone,
      password,
      role,
      group_id,
      group_name,
    } = req.body;

    const existingUser =
      await findUserByEmailModel(email);

    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const username =
      await generateUsername(group_name);

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user =
      await createUserModel(
        fullname,
        email,
        phone,
        hashedPassword,
        role,
        username
      );

    if (group_id) {
      await assignUserToGroupModel(
        user.id,
        group_id
      );
    }

    res.status(201).json({
      message: "User created successfully",
      user,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET ALL USERS
|--------------------------------------------------------------------------
*/

const getAllUsers = async (req, res) => {
  try {
    const users =
      await getAllUsersModel();

    res.status(200).json(users);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET SINGLE USER
|--------------------------------------------------------------------------
*/

const getSingleUser = async (req, res) => {
  try {
    const user =
      await getSingleUserModel(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET MY PROFILE
|--------------------------------------------------------------------------
*/

const getMyProfile = async (req, res) => {
  try {
    const user =
      await getSingleUserModel(
        req.user.id
      );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET MEMBER PROFILE
|--------------------------------------------------------------------------
*/

const getMemberProfile = async (req, res) => {
  try {
    const profile =
      await getMemberProfileModel(
        req.params.id
      );

    if (
      !profile ||
      profile.length === 0
    ) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    res.status(200).json(profile);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET MEMBER SUMMARY
|--------------------------------------------------------------------------
*/

const getMemberSummary = async (
  req,
  res
) => {
  try {
    const summary =
      await getMemberSummaryModel(
        req.params.id
      );

    if (!summary.user) {
      return res.status(404).json({
        message: "Member not found",
      });
    }

    res.status(200).json(summary);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE USER
|--------------------------------------------------------------------------
*/

const updateUser = async (req, res) => {
  try {
    const {
      fullname,
      email,
      phone,
      role,
      status,
    } = req.body;

    const updatedUser =
      await updateUserModel(
        req.params.id,
        fullname,
        email,
        phone,
        role,
        status
      );

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message:
        "User updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE MY PROFILE
|--------------------------------------------------------------------------
*/

const updateMyProfile = async (
  req,
  res
) => {
  try {
    const currentUser =
      await getSingleUserModel(
        req.user.id
      );

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const {
      fullname,
      email,
      phone,
    } = req.body;

    const updatedUser =
      await updateUserModel(
        req.user.id,
        fullname,
        email,
        phone,
        currentUser.role,
        currentUser.status
      );

    res.status(200).json({
      message:
        "Profile updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET USER STATS
|--------------------------------------------------------------------------
*/

const getUserStats = async (req, res) => {
  try {
    const users =
      await getAllUsersModel();

    res.status(200).json({
      totalUsers: users.length,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


const resetPassword = async (
  req,
  res
) => {
  try {

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message:
          "Password is required",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user =
      await resetPasswordModel(
        req.params.id,
        hashedPassword
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    res.status(200).json({
      message:
        "Password reset successfully",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server error",
    });

  }
};

/*
|--------------------------------------------------------------------------
| DELETE USER
|--------------------------------------------------------------------------
*/

const deleteUser = async (req, res) => {
  try {
    await deleteUserModel(
      req.params.id
    );

    res.status(200).json({
      message:
        "User deleted successfully",
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getMyGroups = async (req, res) => {
  try {
    const groups = await getUserGroups(req.user.id);

    res.status(200).json({
      success: true,
      data: groups,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user groups",
    });
  }
};


module.exports = {
  createUser,
  getAllUsers,
  getUserStats,
  getSingleUser,
  getMyProfile,
  getMyGroups,
  getMemberProfile,
  getMemberSummary,
  updateUser,
  updateMyProfile,
  deleteUser,
  resetPassword,
};