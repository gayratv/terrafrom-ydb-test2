import { TMDB_TABLE, Tmdb } from './table_defs';
import { databaseName, SYNTAX_V1 } from './config';
import { Logger, Session, withRetries, Ydb } from 'ydb-sdk';

/*
PRAGMA

AutoCommit	Автоматически выполнять COMMIT после каждого запроса.

TablePathPrefix
    Добавить указанный префикс к путям таблиц внутри кластеров.
    Работает по принципу объединения путей в файловой системе: поддерживает ссылки на родительский каталог .. и не требует добавления / справа.

    Пример
    PRAGMA TablePathPrefix = "home/yql"; SELECT * FROM test;

    Префикс не добавляется, если имя таблицы указано как абсолютный путь (начинается с /).
*/

export async function importTmdb(session: Session, logger: Logger) {
  const query = `
PRAGMA TablePathPrefix("${databaseName}");

DECLARE $id as Uint64;
DECLARE $title as Optional<Utf8>;
DECLARE $genre_ids as Json?;
DECLARE $release_date as Date?;

DECLARE $adult as Bool?;
DECLARE $backdrop_path as Utf8?;
DECLARE $original_language as Utf8?;
DECLARE $original_title as Utf8?;
DECLARE $overview as Utf8?;
DECLARE $popularity as float?;
DECLARE $poster_path as Utf8?;
DECLARE $video as Bool?;
DECLARE $vote_average as float?;
DECLARE $vote_count as Uint32?;


UPSERT INTO  ${TMDB_TABLE}
    (
        id,
        title,
        genre_ids,
        release_date,
        
        adult,
        backdrop_path,
        original_language,
        original_title,
        overview,
        popularity,
        poster_path,
        video,
        vote_average,
        vote_count

        )
VALUES (
        $id,
        $title,
        $genre_ids,
        $release_date,
        
        $adult,
        $backdrop_path,
        $original_language,
        $original_title,
        $overview,
        $popularity,
        $poster_path,
        $video,
        $vote_average,
        $vote_count
 );

`;

  const tmdb_record = Tmdb.create({
    id: 1213,
    title: '1212',
    genre_ids: JSON.stringify([1]),
    release_date: new Date('2020-05-26'),
  });

  console.log();
  console.log('======== QUERY====================');
  // console.log(tmdb_record.generateYQLUpsert(TMDB_TABLE));
  console.log(tmdb_record.YQLUpsert);
  console.log('======== QUERY');

  async function fillTable() {
    logger.info('Inserting data to tables, preparing query...');
    // console.log(query);
    let preparedQuery: Ydb.Table.PrepareQueryResult;
    try {
      preparedQuery = await session.prepareQuery(query);
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
        process.exit(55);
      }
    }
    logger.info('Query has been prepared, executing...');
    console.log(
      "series.getTypedValue('seriesId'),",
      tmdb_record.getTypedValue('id')
    );
    console.log(
      "series.getTypedValue('title')",
      tmdb_record.getTypedValue('title')
    );
    console.log(
      "getTypedValue('genre_ids')",
      tmdb_record.getTypedValue('genre_ids')
    );
    console.log(
      "getTypedValue('release_date')",
      tmdb_record.getTypedValue('release_date')
    );
    // @ts-ignore
    await session.executeQuery(preparedQuery, {
      $id: tmdb_record.getTypedValue('id'),
      $title: tmdb_record.getTypedValue('title'),
      $genre_ids: tmdb_record.getTypedValue('genre_ids'),
      $release_date: tmdb_record.getTypedValue('release_date'),
    });
  }

  await withRetries(fillTable);

  /*
  tmdb_record = Tmdb.create(
    1214,
    '1214',
    JSON.stringify([1]),
    new Date('2020-01-26')
  );
  await withRetries(fillTable);
  console.log();
  console.log('--------------------');
  tmdb_record = Tmdb.create1({
    id: 2024,

    genre_ids: JSON.stringify([1]),
    release_date: new Date('2022-01-01'),
  });
  await withRetries(fillTable);
  
   */
}
