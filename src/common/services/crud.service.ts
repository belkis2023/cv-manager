import { NotFoundException } from '@nestjs/common'
import { DeepPartial, FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';

//efhemmmm

export abstract class CrudService<T extends ObjectLiteral & { id: number }> {

    constructor(protected readonly repository: Repository<T>) {}

    create(dto: DeepPartial<T>): Promise<T> {
        const entity = this.repository.create(dto);
        return this.repository.save(entity);
    }

    findAll(): Promise<T[]> {
        return this.repository.find();
    }

    async findOne(id: number): Promise<T> {
        const entity = await this.repository.findOne({
            where: { id } as unknown as FindOptionsWhere<T>
        }); 
        if(!entity) throw new NotFoundException(`Element with ${id} not found`);
        return entity;
    }

    async update(id: number, dto: DeepPartial<T>): Promise<T> {
        const entity = await this.repository.preload({ id, ...dto } as DeepPartial<T>);
        if (!entity) throw new NotFoundException(`Element with id ${id} not found`);
        return this.repository.save(entity);
    }

    async remove(id: number) {
        const result = await this.repository.softDelete(id);
        if(!result.affected) throw new NotFoundException(`Element with id ${id} not found`);
        return { message: `Element ${id} deleted` }; 
    }

}