import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { AssetCategory } from '../entities/asset.entity';

export class UpdateAssetDto {
  @IsOptional()
  @IsNotEmpty({ message: 'asset_name tidak boleh kosong jika disediakan' })
  @IsString({ message: 'asset_name harus berupa string' })
  asset_name?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'stock_quantity harus berupa bilangan bulat' })
  @Min(0, { message: 'stock_quantity tidak boleh negatif' })
  stock_quantity?: number;

  @IsOptional()
  @IsIn([AssetCategory.CONSUMABLE, AssetCategory.NON_CONSUMABLE], {
    message: 'category hanya boleh Consumable atau Non-Consumable',
  })
  category?: AssetCategory;
}
