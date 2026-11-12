// =====================================================================
// timestamp.entity.ts - SHARED PARENT FOR ALL ENTITIES (factorisation)
// =====================================================================
// Every table (cv, skill, user) wants the same three date
// columns, so we write them ONCE here and each entity does
// `extends TimestampEntity`.

import { CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

// `abstract` = this class cannot be instantiated alone and it is NOT an
// @Entity itself (no table "timestamp_entity"). It only passes its columns
// down to the classes that extend it: TypeORM copies them into each child table.
export abstract class TimestampEntity {
    // Filled automatically with the date of INSERT. Never touched afterwards.
    @CreateDateColumn()
    createdAt!: Date;

    // Refreshed automatically by TypeORM on every UPDATE/save.
    @UpdateDateColumn()
    updatedAt!: Date;

    // SOFT DELETE column. It stays NULL while the row is alive.
    // repository.softDelete(id) fills it with the current date instead of
    // erasing the row; after that, normal find() calls hide the row.
    // (Tested: after DELETE /cv/16 the row is still in the table, with
    // deletedAt set, but GET /cv/16 answers 404.)
    @DeleteDateColumn()
    deletedAt!: Date;
    // The `!` after each name is the "definite assignment" operator: it tells
    // TypeScript "trust me, this will be set (by TypeORM), don't complain that
    // it is not initialised in the constructor".
}