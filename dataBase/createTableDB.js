import { DataTypes } from 'sequelize';
import { sequelize } from './dbConnect.js'; // Импорт пула соединений для работы с базой данных


export const Group = sequelize.define('Group', {
    group_id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING, 
        allowNull: false
    },
    member_count:{
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
    }
},{
    tableName: 'groups', 
    timestamps: false
})

export const Contact = sequelize.define('Contact', {
    phone_id:{
        type: DataTypes.STRING,
        primaryKey: true
    },
    phone_number:{
        type:DataTypes.STRING,
        unique: false
    }
},{
    tableName: 'contact',
    timestamps: false
})

export const UserGroup = sequelize.define('UserGroup', {
    phone_id: {
        type: DataTypes.STRING,
        references: {model: Contact, key: 'phone_id'}
    },
    group_id: {
        type: DataTypes.STRING,
        references: {model: Group, key: 'group_id'}
    }
}, {
    tableName: 'user_groups',
    timestamps: false,
    indexes: [
        {
            unique: true, fields: ['phone_id', 'group_id']
        }
    ]
})

export const Message = sequelize.define('Message',{
    phone_id:{
        type: DataTypes.STRING,
        references: {model: Contact, key: 'phone_id'}
    },
    group_id:{
        type: DataTypes.STRING,
        references: {model: Group, key: 'group_id'}
    },
    text:{
        type: DataTypes.TEXT,
        allowNull: false
    },
    timestamps:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
},{
    tableName: 'messages',
    timestamps: false
})

export const AnalysisResult = sequelize.define('AnalysisResult',{
    group_id: {
        type: DataTypes.STRING,
        references: {model: Group, key: 'group_id'},
        allowNull: false
    },
    user_phone:{
        type: DataTypes.STRING,
        references: {model: Contact, key: 'phone_id'},
        allowNull: false
    },
    keywords: {type: DataTypes.ARRAY(DataTypes.TEXT)},
    categories: {type: DataTypes.ARRAY(DataTypes.TEXT)},
    text:{type: DataTypes.ARRAY(DataTypes.TEXT)},
    analyzed_at:{type: DataTypes.DATE, defaultValue: DataTypes.NOW}
})

// Настройка ассоциаций для корректной работы include
AnalysisResult.belongsTo(Group, { foreignKey: 'group_id' });
Group.hasMany(AnalysisResult, { foreignKey: 'group_id' });

export async function createTables() {
    try {
        await sequelize.sync();
        console.log('Таблицы успешно созданы или уже существуют.');
    } catch (error) {
        console.error('Ошибка при создании таблиц:', error.message);
    }
}

