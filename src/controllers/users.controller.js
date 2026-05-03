import logger from "#config/logger.js";
import { getAllUsers, getUserById as getUserByIdService, updateUser as updateUserService, deleteUser as deleteUserService } from "#services/users.service.js";
import { userIdSchema, updateUserSchema } from "#validations/users.validation.js";
import { hashPassword } from "#services/auth.service.js";


export const fetchAllUsers = async(req , res ,next) =>{
    try{

        logger.info("Getting users ...");

        const allUsers = await getAllUsers();

        res.json({
            message : 'Successfully retrieved users',
            users : allUsers,
            count : allUsers.length,
        })

    } catch(e){
        logger.error('Error getting all users' , e);
        next(e);
    }
}

export const getUserById = async(req, res, next) => {
    try {
        logger.info("Getting user by ID ...");
        const { id } = userIdSchema.parse(req.params);

        const user = await getUserByIdService(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Successfully retrieved user',
            user: user,
        });
    } catch(e) {
        logger.error('Error getting user by ID', e);
        next(e);
    }
}

export const updateUser = async(req, res, next) => {
    try {
        logger.info("Updating user ...");
        const { id } = userIdSchema.parse(req.params);
        const updates = updateUserSchema.parse(req.body);

        // Check if user is authenticated and authorized
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const isAdmin = req.user.role === 'admin';
        const isSelf = req.user.id === id || String(req.user.id) === String(id);

        if (!isAdmin && !isSelf) {
            return res.status(403).json({ message: 'Forbidden: You can only update your own information' });
        }

        if (updates.role && !isAdmin) {
            return res.status(403).json({ message: 'Forbidden: Only admin users can change roles' });
        }

        if (updates.password) {
            updates.password = await hashPassword(updates.password);
        }

        const updatedUser = await updateUserService(id, updates);

        res.json({
            message: 'Successfully updated user',
            user: updatedUser,
        });
    } catch(e) {
        logger.error('Error updating user', e);
        next(e);
    }
}

export const deleteUser = async(req, res, next) => {
    try {
        logger.info("Deleting user ...");
        const { id } = userIdSchema.parse(req.params);

        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const isAdmin = req.user.role === 'admin';
        const isSelf = req.user.id === id || String(req.user.id) === String(id);

        if (!isAdmin && !isSelf) {
            return res.status(403).json({ message: 'Forbidden: You can only delete your own account' });
        }

        const result = await deleteUserService(id);

        res.json({
            message: 'Successfully deleted user',
            result: result,
        });
    } catch(e) {
        logger.error('Error deleting user', e);
        next(e);
    }
}