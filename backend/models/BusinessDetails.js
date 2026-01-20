const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BusinessDetails = sequelize.define('BusinessDetails', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT
    },
    industry: {
        type: DataTypes.STRING(100)
    },
    category: {
        type: DataTypes.STRING(100)
    },
    business_type: {
        type: DataTypes.STRING(100)
    },
    location_lat: {
        type: DataTypes.DECIMAL(10, 8)
    },
    location_lng: {
        type: DataTypes.DECIMAL(11, 8)
    },
    address: {
        type: DataTypes.TEXT
    },
    card_template: {
        type: DataTypes.STRING(50),
        defaultValue: 'standard'
    },
    card_custom_details: {
        type: DataTypes.TEXT
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'business_details',
    timestamps: false
});

module.exports = BusinessDetails;
