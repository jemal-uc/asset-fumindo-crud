import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum AssetCategory {
  CONSUMABLE = 'Consumable',
  NON_CONSUMABLE = 'Non-Consumable',
}

@Entity({ name: 'asset' })
export class Asset {
  @PrimaryGeneratedColumn({ name: 'asset_id' })
  asset_id: number;

  @Column({ name: 'asset_name', type: 'varchar', length: 255 })
  asset_name: string;

  @Column({ name: 'stock_quantity', type: 'integer' })
  stock_quantity: number;

  @Column({ name: 'category', type: 'varchar', length: 20 })
  category: AssetCategory;
}
