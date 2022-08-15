import pool from '@/app/database'

import mapSqlStatement from '@/utils/mapSqlStatement'

import type { IUserService } from './types'
import type { IUser } from '../types'

const userService: IUserService = {
  async create(userInfo) {
    const { inserts, placeholders, values } =
      mapSqlStatement.create<IUser>(userInfo)

    const statement = `INSERT INTO users (${inserts.join()}) VALUES (${placeholders.join()});`

    const [result] = await pool.execute(statement, values)

    return result
  },
  async delete(userId) {
    const statement = `DELETE FROM users WHERE id = ?;`

    const [result] = await pool.execute(statement, [userId])

    return result
  },
  async update(userId, updateInfo) {
    const { updates, values } = mapSqlStatement.update<IUser>(updateInfo)

    const statement = `UPDATE users SET ${updates.join()} WHERE id = ?;`

    const [result] = await pool.execute(statement, [...values, userId])

    return result
  },
  async getUserByAny(key, value) {
    const statement = `SELECT * FROM users WHERE ${key} = ?;`

    const [result] = await pool.execute<any>(statement, [value])

    return result
  },
  async getUserByID(userId) {
    const statement = `
      SELECT
        u.id, u.name, u.realname, u.cellphone, u.enable, u.createAt, u.updateAt, u.avatarUrl,
      	JSON_OBJECT(
          'id', r.id, 'name', r.name, 'intro', r.intro, 'createAt', r.createAt,'updateAt', r.updateAt
        ) role,
      	JSON_OBJECT(
          'id', d.id, 'name', d.name, 'parentId', d.parentId, 'leader', d.leader, 'createAt', d.createAt, 'updateAt', d.updateAt
        ) depatment
      FROM users u
      LEFT JOIN role r ON r.id = u.roleId
      LEFT JOIN department d ON d.id = u.departmentId
      WHERE u.id = ?;
    `

    const [result] = await pool.execute<any>(statement, [userId])

    return result[0]
  },
  async getUserList(like, limit) {
    const likes = mapSqlStatement.like(like, 'u')

    const statement = `
      SELECT
    	  u.id, u.name, u.realname, u.cellphone, u.enable, d.name department, r.name role, u.createAt, u.updateAt
      FROM users u
      LEFT JOIN department d ON d.id = u.departmentId
      LEFT JOIN role r ON r.id = u.roleId
      ${likes.length ? `WHERE ${likes.join(' ')}` : ''}
      ${limit.length ? 'LIMIT ?, ?' : ''};
    `

    const [result] = await pool.execute<any[]>(statement, limit)

    return result
  }
}

export default userService
