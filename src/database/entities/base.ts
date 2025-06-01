import { Column, PrimaryGeneratedColumn } from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'updated_at' })
  updatedAt: Date;
}
