import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Application from '@ioc:Adonis/Core/Application'

export default class IndexSeeder extends BaseSeeder {
  private async runSeeder(seeder: { default: typeof BaseSeeder }) {
    /**
     * Do not run when not in dev mode and seeder is development
     * only
     */
    if (seeder.default.developmentOnly && !Application.inDev) {
      return
    }

    await new seeder.default(this.client).run()
  }

  public async run() {
    await this.runSeeder(await import('../User'))
    await this.runSeeder(await import('../Province'))
    await this.runSeeder(await import('../Municipality'))
    await this.runSeeder(await import('../Sector'))
    await this.runSeeder(await import('../Institution'))
    await this.runSeeder(await import('../Supplier'))
    await this.runSeeder(await import('../Member'))
    await this.runSeeder(await import('../Detachment'))
  }
}
