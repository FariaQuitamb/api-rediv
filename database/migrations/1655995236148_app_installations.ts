import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class AppInstallations extends BaseSchema {
  protected tableName = 'app_installations'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.string('mac_address')
      table.string('latitude')
      table.string('longitude')
      table.string('version')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}