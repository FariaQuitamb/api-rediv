import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AlterApiTokens extends BaseSchema {
  protected tableName = 'api_tokens'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('personal_name')
      table.string('national_id')
      table.string('phone')
      table.string('role')
      table.string('vaccination_post')
      table.integer('vaccination_post_id')
      table.string('province')
      table.string('municipality')
      table.string('api_version')
    })
  }
}
