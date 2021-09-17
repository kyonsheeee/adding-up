'use strict';

// モジュール呼び出し
const fs = require('fs');
const readline = require('readline');

// ファイル読み込みを行う Stream を生成し、
// さらにそれを readline オブジェクトの input として設定し rl オブジェクトを作成する。
const rs = fs.createReadStream('./popu-pref.csv');
const rl = readline.createInterface({ input: rs, output: {} });

// 集計されたデータを格納する連想配列
const prefectureDataMap = new Map();  // key: 都道府県 value: 集計データのオブジェクト

// rl オブジェクトで line というイベントが発生したらこのアロー関数(on の{}以下?)を呼ぶ
// 2010,2015年のデータから「周経年「都道府県」「15~19歳の人口」を抜き出す実装
rl.on('line', lineString => {

    // lineString で与えられた文字列を','で分割し、それを columns という名前の配列にする
    const columns = lineString.split(',');

    // ["集計年","都道府県名","10〜14歳の人口","15〜19歳の人口"]という配列になっているので、配列 columns の要素へ並び順の番号でアクセス
    // 文字列から数値へ変換するために、parseInt()使う
    const year = parseInt(columns[0]);
    const prefecture = columns[1];
    const popu = parseInt(columns[3]);

    if (year === 2010 || year === 2015) {
        let value = prefectureDataMap.get(prefecture);

        // value の値が Falsy の場合に、value に初期値となるオブジェクトを代入する
        if (!value) {
            value = {
                popu10: 0,
                popu15: 0,
                change: null
            };
        }
        if (year === 2010) {
            value.popu10 = popu;
        }
        if (year === 2015) {
            value.popu15 = popu;
        }
        prefectureDataMap.set(prefecture, value);
    }
});

rl.on('close', () => {
    for (const [key, value] of prefectureDataMap) {
        value.change = value.popu15 / value.popu10;
    }
    const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
        return pair2[1].change - pair1[1].change;
    });
    const rankingStrings = rankingArray.map(([key, value]) => {
        return (
            key + ': ' + value.popu10 + '=>' + value.popu15 + ' 変化率: ' + value.change
        );
    });
    console.log(rankingStrings);
});