// @ts-nocheck1

import { type } from 'os';
import {
  declareType,
  declareTypePrim,
  declareTypeNull,
  TypedData,
  Ydb,
  ITableFromClass,
} from 'ydb-sdk';

const TypePrim = Ydb.Type.PrimitiveTypeId;
export const TMDB_TABLE = 'tmdb'; // имя таблицы

type ITMdb = ITableFromClass<Tmdb>;

export class Tmdb extends TypedData {
  @declareTypePrim(TypePrim.UINT64)
  // @ts-ignore
  public id: number;

  @declareTypeNull(TypePrim.UTF8)
  public title?: string;

  @declareType({ typeId: TypePrim.JSON })
  public genre_ids?: string;
  @declareType({ typeId: TypePrim.DATE })
  public release_date?: Date;

  constructor(data: Record<string, any>) {
    super(data);
  }

  static create(inp: ITMdb) {
    return new Tmdb(inp);
  }
}
