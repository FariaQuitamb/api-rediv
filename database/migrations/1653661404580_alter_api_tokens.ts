import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AlterApiTokens extends BaseSchema {
  protected tableName = 'api_tokens'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('commune')
      table.string('latitude')
      table.string('longitude')
      table.string('mac_address')
    })
  }
}
