const User = require('./User');
const Attendance = require('./Attendance');
const Department = require('./Department');

// Define Associations
Department.belongsTo(User, { as: 'manager', foreignKey: 'managerId' });
User.belongsTo(Department, { foreignKey: 'departmentId' });
Attendance.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Attendance, { foreignKey: 'userId' });

module.exports = {
    User,
    Attendance,
    Department
};
