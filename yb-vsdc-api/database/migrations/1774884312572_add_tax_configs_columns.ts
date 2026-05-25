import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tax_configs'

  async up() {
    await this.db.rawQuery(`ALTER TABLE ${this.tableName} ADD COLUMN IF NOT EXISTS tax_type  varchar(2)  NOT NULL DEFAULT ''`)
    await this.db.rawQuery(`ALTER TABLE ${this.tableName} ADD COLUMN IF NOT EXISTS rate       float       NOT NULL DEFAULT 0`)
    await this.db.rawQuery(`ALTER TABLE ${this.tableName} ADD COLUMN IF NOT EXISTS divider    float       NOT NULL DEFAULT 1`)
    await this.db.rawQuery(`ALTER TABLE ${this.tableName} ADD COLUMN IF NOT EXISTS is_active  boolean     NOT NULL DEFAULT true`)

    // Unique constraint on tax_type if missing
    await this.db.rawQuery(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'tax_configs_tax_type_unique'
        ) THEN
          ALTER TABLE ${this.tableName} ADD CONSTRAINT tax_configs_tax_type_unique UNIQUE (tax_type);
        END IF;
      END $$;
    `)
  }

  async down() {
    await this.db.rawQuery(`ALTER TABLE ${this.tableName} DROP COLUMN IF EXISTS tax_type`)
    await this.db.rawQuery(`ALTER TABLE ${this.tableName} DROP COLUMN IF EXISTS rate`)
    await this.db.rawQuery(`ALTER TABLE ${this.tableName} DROP COLUMN IF EXISTS divider`)
    await this.db.rawQuery(`ALTER TABLE ${this.tableName} DROP COLUMN IF EXISTS is_active`)
  }
}
