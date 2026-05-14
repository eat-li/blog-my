const sequelize = require('../config/db.config')
const User = require('./user.model')
const Post = require('./post.model')
const Category = require('./category.model')
const Tag = require('./tag.model')
const Message = require('./message.model')
const Config = require('./config.model')
const FriendLink = require('./friendlink.model')
const Quote = require('./quote.model')
const Announcement = require('./announcement.model')
const Diary = require('./diary.model')
const Gallery = require('./gallery.model')

// 关联
User.hasMany(Post, { foreignKey: 'user_id' })
Post.belongsTo(User, { foreignKey: 'user_id' })

Category.hasMany(Post, { foreignKey: 'category_id' })
Post.belongsTo(Category, { foreignKey: 'category_id' })

Post.belongsToMany(Tag, { through: 'post_tags', foreignKey: 'post_id' })
Tag.belongsToMany(Post, { through: 'post_tags', foreignKey: 'tag_id' })

// 留言自关联（回复）
Message.hasMany(Message, { foreignKey: 'parent_id' })

// 画廊
User.hasMany(Gallery, { foreignKey: 'user_id' })
Gallery.belongsTo(User, { foreignKey: 'user_id' })

async function syncDatabase() {
  try {
    await sequelize.sync()
    console.log('数据库表同步完成')
  } catch (error) {
    console.error('数据库同步失败:', error.message)
  }
}

module.exports = {
  sequelize,
  User,
  Post,
  Category,
  Tag,
  Message,
  Config,
  FriendLink,
  Quote,
  Announcement,
  Diary,
  Gallery,
  syncDatabase
}
