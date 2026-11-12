// =====================================================================
// crud.service.ts - GENERIC BASE SERVICE (the heart of the factorisation)
// =====================================================================
// Create / read / update / delete is the SAME logic for Skill, User and Cv.
// Instead of writing it three times, we write it once here, with a GENERIC
// type T standing for "the entity". Then:
//     class SkillService extends CrudService<Skill> { ... }
// gets all five methods for free (inheritance).

import { NotFoundException } from '@nestjs/common'
import { DeepPartial, FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';

//efhemmmm  ->  explanation of the whole file is in this header and below.

// `abstract`: you can't do `new CrudService()`, it only exists to be extended.
//
// `<T extends ObjectLiteral & { id: number }>` reads as:
//   "T is any entity type, as long as it is an object AND has a numeric id".
//   The `id` requirement is what lets us write { id } in findOne/update.
export abstract class CrudService<T extends ObjectLiteral & { id: number }> {

    // `protected readonly repository`:
    //  - this is a "parameter property": declaring the visibility in the
    //    constructor parameter automatically creates AND assigns this.repository.
    //  - protected: usable in this class and in the classes that extend it
    //    (CvService uses this.repository), but not from outside.
    //  - readonly: can't be reassigned.
    // A Repository<T> is TypeORM's object to talk to ONE table (find, save,
    // softDelete...).
    constructor(protected readonly repository: Repository<T>) {}

    // DeepPartial<T> = "an object that has some (or all) fields of T".
    // repository.create() builds an entity INSTANCE from plain data (it does
    // NOT touch the database), then save() does the INSERT and returns the
    // saved row (with its new id and dates).
    create(dto: DeepPartial<T>): Promise<T> {
        const entity = this.repository.create(dto);
        return this.repository.save(entity);
    }

    // SELECT * FROM table. Rows with deletedAt filled are excluded
    // automatically because of @DeleteDateColumn.
    findAll(): Promise<T[]> {
        return this.repository.find();
    }

    // Find one row by id, or answer 404.
    async findOne(id: number): Promise<T> {
        const entity = await this.repository.findOne({
            // `as unknown as FindOptionsWhere<T>` is a TypeScript workaround:
            // with a generic T the compiler can't prove that { id } is a valid
            // "where" for ANY T, so we force the type. At runtime it is just
            // WHERE id = ...
            where: { id } as unknown as FindOptionsWhere<T>
        });
        // NotFoundException is converted by Nest into an HTTP 404 response.
        // (Cosmetic: this message says "with 5 not found" while the others say
        // "with id 5 not found". Harmless.)
        if(!entity) throw new NotFoundException(`Element with ${id} not found`);
        return entity;
    }

    // Partial update (used by PATCH).
    async update(id: number, dto: DeepPartial<T>): Promise<T> {
        // preload() loads the existing row with this id and MERGES the new
        // fields into it. It returns undefined when the id doesn't exist,
        // so one call gives us both the "404 check" and the merge.
        // Fields absent from dto keep their old value (that's what makes it a
        // PATCH and not a PUT).
        const entity = await this.repository.preload({ id, ...dto } as DeepPartial<T>);
        if (!entity) throw new NotFoundException(`Element with id ${id} not found`);
        return this.repository.save(entity);
    }

    // Soft delete: sets deletedAt instead of removing the row.
    async remove(id: number) {
        const result = await this.repository.softDelete(id);
        // `affected` = number of rows touched. 0 means the id didn't exist.
        if(!result.affected) throw new NotFoundException(`Element with id ${id} not found`);
        return { message: `Element ${id} deleted` };
    }

}
