﻿/*
 Copyright (c) 2020-2022 otoge-flow-flow.com
 Released under the MIT license
 https://opensource.org/licenses/mit-license.php
*/
define = (name, value) => {
    Object.defineProperty(window, name, {
        get: () => { return value; },
        set: () => { throw (name + ' is already defined !!'); },
    });
}

define('STATS_DATA', [
    'av.',
    '75%',
    'me.',
    '25%',
    'top',
]);

define('STATS_DATA_R', [
    0, 1, 2, 3, 4
]);

define('DIFF_DATA', [
    '-∞',
    '-20k',
    '-10k',
    '-5k',
    '-3k',
    '-2k',
    '-1k',
    '-1',
    '0',
    '+1',
    '+1k',
    '+2k',
    '+3k',
    '+5k',
    '+10k',
    '+20k',
    '+∞',
]);

define('DIFF_DATA_R', [
    -200000, -20000, -10000, -5000, -3000, -2000, -1000, -1, 0, +1, +1000, +2000, +3000, +5000, +10000, +20000, +200000
]);

define('VERSION_DATA', [
    'ALL',
    'pop\'n 1',
    'pop\'n 2',
    'pop\'n 3',
    'pop\'n 4',
    'pop\'n 5',
    'pop\'n 6',
    'pop\'n 7',
    'pop\'n 8',
    'pop\'n 9',
    'pop\'n 10',
    'pop\'n 11',
    'pop\'n 12 いろは',
    'pop\'n 13 カーニバル',
    'pop\'n 14 FEVER!',
    'pop\'n 15 ADVENTURE',
    'pop\'n 16 PARTY♪',
    'pop\'n 17 THE MOVIE',
    'pop\'n 18 せんごく列伝',
    'pop\'n 19 TUNE STREET',
    'pop\'n 20 fantasia',
    'pop\'n Sunny Park',
    'pop\'n ラピストリア',
    'pop\'n éclale',
    'pop\'n うさぎと猫と少年の夢',
    'pop\'n peace',
    'pop\'n 解明リドルズ',
    'TV･ｱﾆﾒ',
    'CS',
    'BEMANI',
]);

define('VERSION_DATA_R', [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 26, 27, 28, 29, 23, 24, 25
]);

// todo : name -> target_medal_data
var target_data = [
    '<img src="/icon/medal_4.png" alt="4" width="18" height="18">',
    '<img src="/icon/medal_5.png" alt="5" width="18" height="18">',
    '<img src="/icon/medal_6.png" alt="6" width="18" height="18">',
    '<img src="/icon/medal_7.png" alt="7" width="18" height="18">',
    '<img src="/icon/medal_8.png" alt="8" width="18" height="18">',
    '<img src="/icon/medal_9.png" alt="9" width="18" height="18">',
    '<img src="/icon/medal_10.png" alt="10" width="18" height="18">',
    'NEXT',
];
var target_data_r = [
    4, 5, 6, 7, 8, 9, 10, 999
];

var target_score_data = [
    '85k',
    '90k',
    '95k',
    '98k',
    '99k',
    '99.4k',
    '100k',
    'NEXT',
];
var target_score_data_r = [
    4, 5, 6, 7, 8, 9, 10, 999
];

var target_score_class_data = [
    '-',
    '0',
    '70k',
    '80k',
    '85k',
    '90k',
    '95k',
    '98k',
    '99k',
    '99.4k',
    '100k',
];


var medal_data = [
    'NO PLAY',
    '<img src="/icon/medal_0.png" alt="0" width="18" height="18">',
    '<img src="/icon/medal_1.png" alt="1" width="18" height="18">',
    '<img src="/icon/medal_2.png" alt="2" width="18" height="18">',
    '<img src="/icon/medal_3.png" alt="3" width="18" height="18">',
    '<img src="/icon/medal_4.png" alt="4" width="18" height="18">',
    '<img src="/icon/medal_5.png" alt="5" width="18" height="18">',
    '<img src="/icon/medal_6.png" alt="6" width="18" height="18">',
    '<img src="/icon/medal_7.png" alt="7" width="18" height="18">',
    '<img src="/icon/medal_8.png" alt="8" width="18" height="18">',
    '<img src="/icon/medal_9.png" alt="9" width="18" height="18">',
    '<img src="/icon/medal_10.png" alt="10" width="18" height="18">',
];
var medal_data_r = [-2, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
var rank_data = [
    'NO PLAY',
    'NO RANK',
    '<img src="/icon/rank_3.png" alt="3" width="18" height="18">',
    '<img src="/icon/rank_4.png" alt="4" width="18" height="18">',
    '<img src="/icon/rank_5.png" alt="5" width="18" height="18">',
    '<img src="/icon/rank_6.png" alt="6" width="18" height="18">',
    '<img src="/icon/rank_7.png" alt="7" width="18" height="18">',
    '<img src="/icon/rank_8.png" alt="8" width="18" height="18">',
    '<img src="/icon/rank_9.png" alt="9" width="18" height="18">',
    '<img src="/icon/rank_10.png" alt="10" width="18" height="18">',
];
var rank_data_r = [-2, -1, 3, 4, 5, 6, 7, 8, 9, 10];
var score_data = [
    'NO PLAY',
    '0',
    '70k',
    '80k',
    '85k',
    '90k',
    '95k',
    '98k',
    '99k',
    '99.4k',
    '100k',
    '=100k',
];

var score_data_display = [
    'NO PLAY',
    '0',
    '70k',
    '80k',
    '85k',
    '90k',
    '95k',
    '98k',
    '99k',
    '99.4k',
    '100k',
    '100k',
];

var score_data_r = [
    -2,
    0,
    70000,
    80000,
    85000,
    90000,
    95000,
    98000,
    99000,
    99400,
    100000,
    200000,
];
/*
var score_data_r_lower = [
    -2,
    0,
    70000,
    80000,
    85000,
    90000,
    95000,
    98000,
    99000,
    99400,
    100000,
];
var score_data_r_upper = [
    0,
    70000,
    80000,
    85000,
    90000,
    95000,
    98000,
    99000,
    99400,
    100000,
    200000,
];
*/
var lv_data = Array.from({ length: 51 }, (v, k) => String(k));
lv_data.shift();

var lv_type_data = [
    'EASY',
    'NORMAL',
    'HYPER',
    'EX',
];