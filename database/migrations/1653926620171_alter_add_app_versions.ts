import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AlterAddAppVersions extends BaseSchema {
  protected tableName = 'api_tokens'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('app_version')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
