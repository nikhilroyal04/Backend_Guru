const express = require('express');
const RoleService = require('../../services/role/role_Services');
const ResponseManager = require('../../utils/responseManager');
const consoleManager = require('../../utils/consoleManager');

const router = express.Router();

// Create a new role
router.post('/addRole', async (req, res) => {
    try {
        if (!req.body.roleName) {
            return ResponseManager.handleBadRequestError(res, 'Name is required');
        }

        const role = await RoleService.createRole(req.body);
        return ResponseManager.sendSuccess(res, role, 201, 'Role created successfully');
    } catch (err) {
        return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error creating role');
    }
});

// Get a role by ID
router.get('/getRole/:id', async (req, res) => {
    try {
        const role = await RoleService.getRoleById(req.params.id);
        if (role) {
            ResponseManager.sendSuccess(res, role, 200, 'Role retrieved successfully');
        } else {
            ResponseManager.sendSuccess(res, [], 200, 'Role not found');
        }
    } catch (err) {
        ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching role');
    }
});

// Update a role by ID
router.put('/updateRole/:id', async (req, res) => {
    try {
        if (!req.body.roleName) {
            return ResponseManager.handleBadRequestError(res, 'Name is required');
        }

        const role = await RoleService.updateRole(req.params.id, req.body);
        if (role) {
            return ResponseManager.sendSuccess(res, role, 200, 'Role updated successfully');
        } else {
            return ResponseManager.sendSuccess(res, [], 200, 'Role not found for update');
        }
    } catch (err) {
        return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error updating role');
    }
});

// Delete a role by ID
router.delete('/deleteRole/:id', async (req, res) => {
    try {
        const role = await RoleService.deleteRole(req.params.id);
        if (role) {
            ResponseManager.sendSuccess(res, role, 200, 'Role deleted successfully');
        } else {
            ResponseManager.sendSuccess(res, [], 200, 'Role not found for deletion');
        }
    } catch (err) {
        ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error deleting role');
    }
});

// Get all roles
router.get('/getAllRoles', async (req, res) => {
    try {
        const roles = await RoleService.getAllRoles();
        if (roles.length === 0) {
            return ResponseManager.sendSuccess(res, [], 200, 'No roles found');
        }

        return ResponseManager.sendSuccess(res, roles, 200, 'Roles retrieved successfully');
    } catch (err) {
        consoleManager.error(`Error fetching roles: ${err.message}`);
        return ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error fetching roles');
    }
});

// Toggle role status
router.put('/removeRole/:id', async (req, res) => {
    try {
        const role = await RoleService.toggleRoleStatus(req.params.id);
        if (role) {
            ResponseManager.sendSuccess(res, role, 200, 'Role status removed successfully');
        } else {
            ResponseManager.sendSuccess(res, [], 200, 'Role not found for remove');
        }
    } catch (err) {
        ResponseManager.sendError(res, 500, 'INTERNAL_ERROR', 'Error removing role');
    }
});

module.exports = router;
