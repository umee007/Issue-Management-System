import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  CategoryId: number;

  @Column()
  CategoryName: string;

  @Column({ type: "bool", default: false })
  isDeleted: boolean;
}
