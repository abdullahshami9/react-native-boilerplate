const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const IdentityScan = sequelize.define('IdentityScan', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    scan_file_url: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'verified', 'rejected'),
        defaultValue: 'pending'
    },
    meta_data: {
        type: DataTypes.TEXT, // Store JSON metadata about the scan (angles, lighting, etc)
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'identity_scans',
    timestamps: false
});

module.exports = IdentityScan;
