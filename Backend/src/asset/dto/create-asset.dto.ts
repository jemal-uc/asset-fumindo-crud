import { IsIn, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AssetCategory } from '../entities/asset.entity';

export class CreateAssetDto {
  @IsNotEmpty({ message: 'asset_name tidak boleh kosong' })
  @IsString({ message: 'asset_name harus berupa string' })
  asset_name: string;

  @Type(() => Number)
  @IsInt({ message: 'stock_quantity harus berupa bilangan bulat' })
  @Min(0, { message: 'stock_quantity tidak boleh negatif' })
  stock_quantity: number;

  @IsIn([AssetCategory.CONSUMABLE, AssetCategory.NON_CONSUMABLE], {
    message: 'category hanya boleh Consumable atau Non-Consumable',
  })
  category: AssetCategory;
}
