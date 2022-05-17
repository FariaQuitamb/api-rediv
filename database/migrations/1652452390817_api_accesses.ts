import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class ApiAccesses extends BaseSchema {
  protected tableName = 'api_accesses'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.string('name')
      table.integer('state').defaultTo(1)
      table.uuid('api_id').index()
      table.string('access_key')
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
