const Role = require("../../models/role/roleModel");
const consoleManager = require("../../utils/consoleManager");

class RoleService {
  // Create a new role
  async createRole(data) {
    try {
      data.createdOn = Date.now();
      data.updatedOn = Date.now();

      const role = new Role(data);
      await role.save();
      consoleManager.log("Role created successfully");
      return role;
    } catch (err) {
      consoleManager.error(`Error creating role: ${err.message}`);
      throw err;
    }
  }

  // Get a role by ID
  async getRoleById(roleId) {
    try {
      const role = await Role.findById(roleId);
      if (!role) {
        consoleManager.error("Role not found");
        return null;
      }
      return role;
    } catch (err) {
      consoleManager.error(`Error fetching role: ${err.message}`);
      throw err;
    }
  }

  // Get a role by roleName
  async getRoleByName(roleName) {
    try {
      const role = await Role.findOne({ roleName }); 
      if (!role) {
        consoleManager.error("Role not found");
        return null;
      }
      return role;
    } catch (err) {
      consoleManager.error(`Error fetching role: ${err.message}`);
      throw err;
    }
  }

  // Update a role by ID
  async updateRole(roleId, data) {
    try {
      data.updatedOn = Date.now();
      const role = await Role.findByIdAndUpdate(roleId, data, { new: true });
      if (!role) {
        consoleManager.error("Role not found for update");
        return null;
      }
      consoleManager.log("Role updated successfully");
      return role;
    } catch (err) {
      consoleManager.error(`Error updating role: ${err.message}`);
      throw err;
    }
  }

  // Delete a role by ID
  async deleteRole(roleId) {
    try {
      const role = await Role.findByIdAndDelete(roleId);
      if (!role) {
        consoleManager.error("Role not found for deletion");
        return null;
      }
      consoleManager.log("Role deleted successfully");
      return role;
    } catch (err) {
      consoleManager.error(`Error deleting role: ${err.message}`);
      throw err;
    }
  }

  // Get all roles
  async getAllRoles() {
    try {
      const roles = await Role.find();
      consoleManager.log(`Fetched ${roles.length} roles`);
      return roles;
    } catch (err) {
      consoleManager.error(`Error fetching roles: ${err.message}`);
      throw err;
    }
  }

  // Toggle role status between Active and Inactive
  async toggleRoleStatus(roleId) {
    try {
      const role = await Role.findById(roleId);
      if (!role) {
        consoleManager.error("Role not found for status toggle");
        return null;
      }

      // Toggle the status between 'Active' and 'Inactive'
      const newStatus = role.status === "Active" ? "Inactive" : "Active";
      const updatedRole = await Role.findByIdAndUpdate(
        roleId,
        { status: newStatus, updatedOn: Date.now() },
        { new: true }
      );

      consoleManager.log(`Role status updated to ${newStatus}`);
      return updatedRole;
    } catch (err) {
      consoleManager.error(`Error toggling role status: ${err.message}`);
      throw err;
    }
  }

  // Get the total number of roles
  async getNumberOfRoles() {
    try {
      const count = await Role.countDocuments();
      consoleManager.log(`Number of roles: ${count}`);
      return count;
    } catch (err) {
      consoleManager.error(`Error counting roles: ${err.message}`);
      throw err;
    }
  }
}

module.exports = new RoleService();
