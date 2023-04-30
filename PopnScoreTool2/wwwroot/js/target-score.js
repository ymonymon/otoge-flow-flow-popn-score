import * as site from './site_m.js';
import * as otoge from './const_m.js';

const PAGE_NAME = 'targetScore';

let mainGrid;
let fumensDataRaw;
let scoreRateDataRaw;
let myMusicDataRaw;

let targetScoreKey;

let updateFilterTimer;

let sortClickCount;
let sortTarget;

let initializing = true;

const fumenFilter = (
  target,
  diff,
  medal,
  rank,
  score,
  version,
  lv,
  lvType,
  targetPercent,
  count,
) => {
  const res = alasql(`MATRIX OF
SELECT TBL1.[2] AS [0], TBL1.[1] AS [1], -- title/genre
TBL1.[3] AS [2], TBL1.[4] AS [3], -- lv-type/lv
TBL3.[1] AS [4], -- medal
TBL3.[2] AS [5], -- rank
CASE WHEN TBL3.[3] = -2 THEN 0 ELSE TBL3.[3] END AS [6], -- score
TBL1.[5] AS [7], -- version
TBL2.[1] AS [8], 
TBL2.[2] AS [9], 
TBL2.[3] AS [10], 
TBL2.[4] AS [11], 
TBL2.[5] AS [12], 
TBL2.[6] AS [13], 
TBL2.[7] AS [14],
TBL2.[9] AS [15] -- count
FROM ? AS TBL1
INNER JOIN ? AS TBL2 ON TBL2.[0] = TBL1.[0]
INNER JOIN ? AS TBL3 ON TBL3.[0] = TBL1.[0]`, [fumensDataRaw, scoreRateDataRaw, myMusicDataRaw]);

  let res2;
  if (target[0] === otoge.TARGET_SCORE_DATA.length - 1) {
    // get next target
    res2 = alasql(`MATRIX OF
SELECT 
TBL1.[0] AS [0], 
TBL1.[1] AS [1], 
TBL1.[2] AS [2], 
TBL1.[3] AS [3], 
TBL1.[4] AS [4], 
TBL1.[5] AS [5], 
TBL1.[6] AS [6], 
TBL1.[6] AS [7], -- dummy score
CASE 
WHEN TBL1.[6] < 85000 THEN TBL1.[8]
WHEN TBL1.[6] < 90000 THEN TBL1.[9]
WHEN TBL1.[6] < 95000 THEN TBL1.[10]
WHEN TBL1.[6] < 98000 THEN TBL1.[11]
WHEN TBL1.[6] < 99000 THEN TBL1.[12]
WHEN TBL1.[6] < 99400 THEN TBL1.[13]
WHEN TBL1.[6] < 100000 THEN TBL1.[14]
ELSE TBL1.[14] END AS [8],
CASE 
WHEN TBL1.[6] < 85000 THEN 4
WHEN TBL1.[6] < 90000 THEN 5
WHEN TBL1.[6] < 95000 THEN 6
WHEN TBL1.[6] < 98000 THEN 7
WHEN TBL1.[6] < 99000 THEN 8
WHEN TBL1.[6] < 99400 THEN 9
WHEN TBL1.[6] < 100000 THEN 10
ELSE 11 END AS [9], -- target score class
TBL1.[15] AS [10],
TBL1.[7] AS [11] -- version
FROM ? AS TBL1`, [res]);
  } else {
    // ${otoge.TARGET_SCORE_DATA_R[target[0]] + 4} is column number
    const test = `MATRIX OF
SELECT 
TBL1.[0] AS [0], 
TBL1.[1] AS [1], 
TBL1.[2] AS [2], 
TBL1.[3] AS [3], 
TBL1.[4] AS [4], 
TBL1.[5] AS [5], 
TBL1.[6] AS [6], 
TBL1.[6] AS [7], -- dummy score
CASE WHEN TBL1.[6] < 100000 THEN TBL1.[${otoge.TARGET_SCORE_DATA_R[target[0]] + 4}]
ELSE TBL1.[${otoge.TARGET_SCORE_DATA_R[6] + 4}] END AS [8],
${otoge.TARGET_SCORE_DATA_R[target[0]]} AS [9], -- target score 
TBL1.[15] AS [10],
TBL1.[7] AS [11] -- version
FROM ? AS TBL1`;
    res2 = alasql(test, [res]);
  }

  // add diff column
  const res3 = alasql(`MATRIX OF
SELECT 
TBL1.[0] AS [0], 
TBL1.[1] AS [1], 
TBL1.[2] AS [2], 
TBL1.[3] AS [3], 
TBL1.[4] AS [4], 
TBL1.[5] AS [5], 
TBL1.[6] AS [6], 
TBL1.[7] AS [7],
TBL1.[8] AS [8],
TBL1.[9] AS [9],

TBL1.[6] - CASE TBL1.[9]
WHEN 4 THEN 85000 
WHEN 5 THEN 90000 
WHEN 6 THEN 95000 
WHEN 7 THEN 98000 
WHEN 8 THEN 99000 
WHEN 9 THEN 99400 
ELSE 100000 END AS [10], -- diff
TBL1.[10] AS [11],
TBL1.[11] AS [12] -- version
FROM ? AS TBL1`, [res2]);

  let sql = 'MATRIX OF SELECT * FROM ?';
  let arg = [res3];
  if (diff[0] !== 0 || diff[1] !== otoge.DIFF_DATA.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' ? <= [10] AND [10] <= ?';
    arg = arg.concat([otoge.DIFF_DATA_R[diff[0]], otoge.DIFF_DATA_R[diff[1]]]);
  }
  if (medal[0] !== 0 || medal[1] !== otoge.MEDAL_DATA.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' ? <= [4] AND [4] <= ?';
    arg = arg.concat([otoge.MEDAL_DATA_R[medal[0]], otoge.MEDAL_DATA_R[medal[1]]]);
  }
  if (rank[0] !== 0 || rank[1] !== otoge.RANK_DATA.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' ? <= [5] AND [5] <= ?';
    arg = arg.concat([otoge.RANK_DATA_R[rank[0]], otoge.RANK_DATA_R[rank[1]]]);
  }
  if (score[0] !== 0 || score[1] !== otoge.SCORE_DATA.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' ? <= [6] AND [6] < ?';
    if (target[0] === otoge.TARGET_SCORE_DATA.length - 1) {
      // next
      arg = arg.concat([
        otoge.SCORE_DATA_R[score[0]],
        otoge.SCORE_DATA_R[score[1]]]);
    } else {
      // fix target
      arg = arg.concat([
        otoge.SCORE_DATA_R[score[0]],
        otoge.SCORE_DATA_R[score[1]] < otoge.SCORE_DATA_R[otoge.TARGET_SCORE_DATA_R[target[0]]]
          ? otoge.SCORE_DATA_R[score[1]] : otoge.SCORE_DATA_R[otoge.TARGET_SCORE_DATA_R[target[0]]],
      ]);
    }
  }

  if (version[0] !== 0) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' [12] = ?';
    arg = arg.concat([otoge.VERSION_DATA_R[version[0]]]);
  }
  if (lv[0] !== 0 || lv[1] !== otoge.LV_DATA.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' ? <= [3] AND [3] <= ?';
    arg = arg.concat([lv[0] + 1, lv[1] + 1]); // +1 == to lv
  }
  if (lvType[0] !== 0 || lvType[1] !== otoge.LV_TYPE_DATA.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' ? <= [2] AND [2] <= ?';
    arg = arg.concat([lvType[0] + 1, lvType[1] + 1]); // +1 == to lv type
  }
  if (targetPercent[0] !== 0
    || targetPercent[1] !== otoge.TARGET_PERCENT_DATA.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' ? <= [8] AND [8] <= ?';
    arg = arg.concat([otoge.TARGET_PERCENT_DATA_R[targetPercent[0]],
      otoge.TARGET_PERCENT_DATA_R[targetPercent[1]]]);
  }
  if (count[0] !== 0
    || count[1] !== otoge.COUNT_DATA.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';

    if (count[1] === otoge.COUNT_DATA.length - 1) {
      // ～∞
      sql += ' ? <= [11]';
      arg = arg.concat(otoge.COUNT_DATA_R[[count[0]]]);
    } else {
      sql += ' ? <= [11] AND [11] <= ?';
      arg = arg.concat([otoge.COUNT_DATA_R[count[0]],
        otoge.COUNT_DATA_R[count[1]]]);
    }
  }

  const res4 = alasql(sql, arg);

  // remove score class/version column
  const result = res4.map((a) => [a[0], a[1], a[2], a[3], a[4],
    a[5], a[6], a[7], a[8], a[10], a[11]]);

  return result;
};

// const onReady = (...args) => {
const onReady = () => {
  // page 移動, sort 変更のタイミングでも呼ばれる。
  // console.log('row: ' + JSON.stringify(args), args);
  const test = site.getCurrentSortStatus();
  // console.log(test);
  if (test[0]) {
    saveFilterAndSort();
  }
};

// const storeSort = (...args) => {
const storeSort = () => {
  mainGrid.off('ready', storeSort);

  // console.log('row: ' + JSON.stringify(args), args);

  setTimeout(() => {
    [...Array(sortClickCount)].map(() => $(`.gridjs-th[data-column-id=${sortTarget}]`).trigger('click'));
  }, 0);
};

const scoreToScoreClass = (score) => {
  if (score < 70000) {
    return 1;
  } if (score < 80000) {
    return 2;
  } if (score < 85000) {
    return 3;
  } if (score < 90000) {
    return 4;
  } if (score < 95000) {
    return 5;
  } if (score < 98000) {
    return 6;
  } if (score < 99000) {
    return 7;
  } if (score < 99400) {
    return 8;
  } if (score < 100000) {
    return 9;
  }
  return 10;
};

const updateGrid = (data) => {
  if (mainGrid === undefined) {
    mainGrid = new gridjs.Grid({
      columns: [
        {
          id: '0',
          name: 'genre',
          formatter: (_, row) => gridjs.html(`${row.cells[0].data}<br>${row.cells[1].data}`), /*
                          return gridjs.html((row.cells[0].data === row.cells[1].data) ?
                              row.cells[1].data :
                              (row.cells[0].data + ' / ' + row.cells[1].data));
                              */

          attributes: (cell) => {
            if (cell === null) {
              return undefined;
            }
            return {
              colspan: '2',
            };
          },
        },
        {
          id: '1',
          name: 'title',
          attributes: (cell) => {
            if (cell === null) {
              return undefined;
            }
            return {
              style: 'display:none',
            };
          },
        },
        {
          id: '2',
          name: '',
          sort: 0,
          width: '1px',
          attributes: {
            style: 'display:none',
          },
        },
        {
          id: '3',
          name: 'lv',
          attributes: (cell, row) => {
            if (cell === null) {
              return {
                colspan: '2',
              };
            }
            return {
              style: `background-color:${otoge.LV_TYPE_BACK_COLOR[row.cells[2].data]}; padding:0px; text-align: center`,
              colspan: '2',
            };
          },
        },
        {
          id: '4',
          name: 'm',
          attributes: (cell) => {
            if (cell === null) {
              return undefined;
            }
            return {
              style: 'display:none',
            };
          },
        },
        {
          id: '5',
          name: 'r',
          formatter: (_, row) => gridjs.html(`<img src="/icon/medal_${row.cells[4].data}.png" alt="${row.cells[4].data}" width="18" height="18" />`
                              + `<img src="/icon/rank_${row.cells[5].data}.png" alt="${row.cells[5].data}" width="18" height="18">`),
          attributes: (cell) => {
            if (cell === null) {
              return undefined;
            }
            return {
              colspan: '2',
            };
          },
        },
        {
          id: '6',
          name: 'score',
          formatter: (_, row) => row.cells[6].data,
          attributes: (cell) => {
            if (cell === null) {
              return undefined;
            }
            return {
              style: 'padding: 0px; text-align: center',
            };
          },
        },
        {
          id: '7',
          name: '→t',
          formatter: (_, row) => {
            let targetScoreClass = otoge.TARGET_SCORE_DATA_R[targetScoreKey];
            const nowScoreClass = scoreToScoreClass(row.cells[6].data);
            if (targetScoreKey === String(otoge.TARGET_SCORE_DATA.length - 1)) {
              if (nowScoreClass < 10) {
                targetScoreClass = nowScoreClass + 1;
              } else {
                targetScoreClass = 10;
              }
            }

            // const now_score_class_str = otoge.TARGET_SCORE_CLASS_DATA[now_score_class];
            let targetScoreClassStr = '';
            if (targetScoreClass <= 10) {
              // 85kから
              targetScoreClassStr = otoge.TARGET_SCORE_CLASS_DATA[
                targetScoreClass < 4 ? 4 : targetScoreClass];
            }

            // return now_score_class_str + '→' + target_score_class_str;
            return `→${targetScoreClassStr}`;
          },
          attributes: (cell) => {
            if (cell === null) {
              return undefined;
            }
            return {
              style: 'padding: 0px; text-align: center',
            };
          },
        },
        {
          id: '8',
          // important!
          name: gridjs.html('target<br>%'),
          formatter: (_, row) => (Number.isFinite(row.cells[8].data)
            ? row.cells[8].data.toFixed(2) : row.cells[8].data),
          sort: {
            compare: (a, b) => {
              const aIsFinite = Number.isFinite(a);
              const bIsFinite = Number.isFinite(b);
              if (!aIsFinite && !bIsFinite) {
                return 0;
              } if (!aIsFinite) {
                return 1;
              } if (!bIsFinite) {
                return -1;
              }
              if (a > b) {
                return 1;
              } if (a < b) {
                return -1;
              }
              return 0;
            },
          },
          attributes: (cell) => {
            if (cell === null) {
              return undefined;
            }
            return {
              style: 'padding:  0px 5px 0px 0px; text-align: right; font-family: monospace',
            };
          },
        },
        {
          id: '9',
          name: 'diff',
          formatter: (_, row) => (row.cells[9].data <= 0 ? row.cells[9].data : (`+${row.cells[9].data}`)),
          attributes: (cell) => {
            if (cell === null) {
              return undefined;
            }
            return {
              style: 'padding:  0px 5px 0px 0px; text-align: right; font-family: monospace',
            };
          },
        },
        {
          id: '10',
          name: 'c',
          formatter: (_, row) => row.cells[10].data,
          attributes: (cell) => {
            if (cell === null) {
              return {
                colspan: '2',
              };
            }
            return {
              style: 'padding:  0px 5px 0px 0px; text-align: right; font-family: monospace',
              colspan: '2',
            };
          },
        },
        {
          id: '11',
          name: '',
          sort: 0,
          width: '1px',
          attributes: {
            style: 'display:none',
          },
        },
      ],
      sort: true,
      search: true,
      pagination: {
        enabled: true,
        limit: 10,
      },
      style: {
        table: {
        },
        th: {
          padding: '0px',
          'text-align': 'center',
        },
        td: {
          padding: '0px',
          'text-align': 'center',
        },
      },
      language: {
        pagination: {
          previous: '←',
          next: '→',
        },
      },
      data,
    }).render(document.getElementById('wrapper'));

    mainGrid.on('ready', onReady);

    // 1st sort.
    [sortTarget, sortClickCount] = site.getFilterSortStatus(PAGE_NAME, '8', 2);

    if (sortClickCount > 0) {
      mainGrid.on('ready', storeSort);
    }
  } else {
    [sortTarget, sortClickCount] = site.getFilterSortStatus(PAGE_NAME, '8', 2);

    mainGrid.updateConfig({
      data,
    }).forceRender();

    if (sortClickCount > 0) {
      mainGrid.on('ready', storeSort);
    }
  }
};

function saveFilterAndSort() {
  const keyTarget = site.getKeyNames('skipstep-target', otoge.TARGET_SCORE_DATA);
  const [keyDiff1, keyDiff2] = site.getKeyNames('skipstep-diff', otoge.DIFF_DATA);
  const [keyMedal1, keyMedal2] = site.getKeyNames('skipstep-medal', otoge.MEDAL_DATA);
  const [keyRank1, keyRank2] = site.getKeyNames('skipstep-rank', otoge.RANK_DATA);
  const [keyScore1, keyScore2] = site.getKeyNames('skipstep-score', otoge.SCORE_DATA);
  const keyVersion = site.getKeyNames('skipstep-version', otoge.VERSION_DATA);
  const [keyLv1, keyLv2] = site.getKeyNames('skipstep-lv', otoge.LV_DATA);
  const [keyLvType1, keyLvType2] = site.getKeyNames('skipstep-lv-type', otoge.LV_TYPE_DATA);
  const keyTargetPercent = site.getKeyNames('skipstep-target-percent', otoge.TARGET_PERCENT_DATA);
  const keyCount = site.getKeyNames('skipstep-count', otoge.COUNT_DATA);

  const sortStatus = site.getCurrentSortStatus();

  const selectedFilter = window.localStorage.getItem(`${PAGE_NAME}.selectedFilter`) ?? '0';
  const prevFilters = JSON.parse(window.localStorage.getItem(`${PAGE_NAME}.filters`)) ?? {};
  prevFilters[selectedFilter] = {
    target: keyTarget,
    diff: [keyDiff1, keyDiff2],
    medal: [keyMedal1, keyMedal2],
    rank: [keyRank1, keyRank2],
    score: [keyScore1, keyScore2],
    version: keyVersion,
    lv: [keyLv1, keyLv2],
    lv_type: [keyLvType1, keyLvType2],
    target_percent: keyTargetPercent,
    count: keyCount,
    sort: sortStatus,
  };

  window.localStorage.setItem(`${PAGE_NAME}.filters`, JSON.stringify(prevFilters));
}

function updateGrid2() {
  const keyTarget = site.getKeyNames('skipstep-target', otoge.TARGET_SCORE_DATA);
  const [keyDiff1, keyDiff2] = site.getKeyNames('skipstep-diff', otoge.DIFF_DATA);
  const [keyMedal1, keyMedal2] = site.getKeyNames('skipstep-medal', otoge.MEDAL_DATA);
  const [keyRank1, keyRank2] = site.getKeyNames('skipstep-rank', otoge.RANK_DATA);
  const [keyScore1, keyScore2] = site.getKeyNames('skipstep-score', otoge.SCORE_DATA);
  const keyVersion = site.getKeyNames('skipstep-version', otoge.VERSION_DATA);
  const [keyLv1, keyLv2] = site.getKeyNames('skipstep-lv', otoge.LV_DATA);
  const [keyLvType1, keyLvType2] = site.getKeyNames('skipstep-lv-type', otoge.LV_TYPE_DATA);
  const keyTargetPercent = site.getKeyNames('skipstep-target-percent', otoge.TARGET_PERCENT_DATA);
  const keyCount = site.getKeyNames('skipstep-count', otoge.COUNT_DATA);

  // for column
  targetScoreKey = keyTarget;

  const filteredData = fumenFilter(
    [keyTarget].map(Number),
    [keyDiff1, keyDiff2].map(Number),
    [keyMedal1, keyMedal2].map(Number),
    [keyRank1, keyRank2].map(Number),
    [keyScore1, keyScore2].map(Number),
    [keyVersion].map(Number),
    [keyLv1, keyLv2].map(Number),
    [keyLvType1, keyLvType2].map(Number),
    keyTargetPercent.map(Number),
    keyCount.map(Number),
  );

  updateGrid(filteredData);
}

function onSliderStart() {
  clearTimeout(updateFilterTimer);
}

function onFilterSliderSet(values, handle, unencoded, tap, positions, slider, callback) {
  if (!fumensDataRaw || !mainGrid) return;

  saveFilterAndSort();
  clearTimeout(updateFilterTimer);
  updateFilterTimer = setTimeout(() => {
    updateGrid2();
    if (callback) {
      callback();
    }
  }, 1000);
}

function onFilterScoreSliderUpdate(values, handle) {
  const skipValues = [
    document.getElementById('score-lower'),
    document.getElementById('score-upper'),
    document.getElementById('score-hyphen'),
    document.getElementById('score-same'),
  ];

  const dataObject = otoge.SCORE_DATA;
  const dataDisplayObject = otoge.SCORE_DATA_DISPLAY;
  const firstDataValue = dataObject[0];
  const lastDataValue = dataObject[dataObject.length - 1];

  const keyScore = Object.keys(dataObject).filter(
    (key) => dataObject[key] === values[handle],
  )[0];

  skipValues[handle].innerHTML = dataDisplayObject[keyScore];

  if (values[0] === firstDataValue
              && values[1] === lastDataValue) {
    skipValues[3].innerHTML = 'ALL';
    skipValues[0].style.display = 'none';
    skipValues[1].style.display = 'none';
    skipValues[2].style.display = 'none';
    skipValues[3].style.display = 'inline';
  } else {
    skipValues[0].style.display = 'inline';
    skipValues[1].style.display = 'inline';
    skipValues[2].style.display = 'inline';
    if (values[1] === lastDataValue) {
      skipValues[2].innerHTML = '<img src="/icon/closed.png" alt="closed"  width="20" height="10"/>';
    } else {
      skipValues[2].innerHTML = '<img src="/icon/leftclosed.png" alt="leftclosed"  width="20" height="10"/>';
    }
    skipValues[3].style.display = 'none';
  }
}

if (document.querySelector('h1.nologin') !== null) {
  // no login
} else {
  document.getElementById('filter-selection').addEventListener('click', ({ target }) => {
    if (initializing === false && target.children[0].getAttribute('name') === 'btnradio') {
      // change filter
      const selectedFilter = target.children[0].id.replace('btnradio', '');
      window.localStorage.setItem(`${PAGE_NAME}.selectedFilter`, selectedFilter);
      // load filter
      const prevFilters = JSON.parse(window.localStorage.getItem(`${PAGE_NAME}.filters`));
      const prevFilter = (prevFilters === null
        || !Object.prototype.hasOwnProperty.call(prevFilters, selectedFilter))
        ? null
        : prevFilters[selectedFilter];

      Array.from(document.querySelectorAll('[id^=skipstep-]')).map(
        (skipSlider) => {
          if (skipSlider.noUiSlider !== undefined) {
            if (prevFilter === null) {
              skipSlider.noUiSlider.set(skipSlider.noUiSlider.options.default);
            } else {
              const filter = prevFilter[skipSlider.id.replace('skipstep-', '').replaceAll('-', '_')];
              const table = skipSlider.noUiSlider.options.matchingTable;
              if (Array.isArray(filter)) {
                skipSlider.noUiSlider.set([table[filter[0]], table[filter[1]]]);
              } else {
                skipSlider.noUiSlider.set(table[filter]);
              }
            }
          }

          return undefined;
        },
      );

      // change filter で local storage は更新しない。
      if (prevFilters === null) {
        window.localStorage.removeItem(`${PAGE_NAME}.filters`);
      } else {
        window.localStorage.setItem(`${PAGE_NAME}.filters`, JSON.stringify(prevFilters));
      }

      updateGrid2();
    }
  });

  document.getElementById('reset-button').addEventListener('click', () => {
    Array.from(document.querySelectorAll('[id^=skipstep-]')).map(
      (skipSlider) => skipSlider.noUiSlider.set(skipSlider.noUiSlider.options.default),
    );

    // remove filter
    const selectedFilter = window.localStorage.getItem(`${PAGE_NAME}.selectedFilter`) ?? '0';
    const prevFilters = JSON.parse(window.localStorage.getItem(`${PAGE_NAME}.filters`));
    if (prevFilters !== null) {
      if (Object.prototype.hasOwnProperty.call(prevFilters, selectedFilter)) {
        delete prevFilters[selectedFilter];
        if (Object.keys(prevFilters).length === 0) {
          window.localStorage.removeItem(`${PAGE_NAME}.filters`);
        } else {
          window.localStorage.setItem(`${PAGE_NAME}.filters`, JSON.stringify(prevFilters));
        }
      }
    }
    updateGrid2();
  });

  {
    // load filter
    const selectedFilter = window.localStorage.getItem(`${PAGE_NAME}.selectedFilter`) ?? '0';
    document.getElementById(`btnradio${selectedFilter}`).parentNode.click();
    const prevFilters = JSON.parse(window.localStorage.getItem(`${PAGE_NAME}.filters`));
    const prevFilter = (prevFilters === null
      || !Object.prototype.hasOwnProperty.call(prevFilters, selectedFilter))
      ? null
      : prevFilters[selectedFilter];

    site.CreateSkipSlider1('target', otoge.TARGET_SCORE_DATA, otoge.TARGET_SCORE_DATA.length - 1, 0, prevFilter?.target, onSliderStart, onFilterSliderSet);
    site.CreateSkipSlider2('diff', otoge.DIFF_DATA, prevFilter?.diff, onSliderStart, onFilterSliderSet, 0, -1);
    site.CreateSkipSlider2('medal', otoge.MEDAL_DATA, prevFilter?.medal, onSliderStart, onFilterSliderSet);
    site.CreateSkipSlider2('rank', otoge.RANK_DATA, prevFilter?.rank, onSliderStart, onFilterSliderSet);
    site.CreateSkipSlider2('score', otoge.SCORE_DATA, prevFilter?.score, onSliderStart, onFilterSliderSet, 1, '100k', onFilterScoreSliderUpdate);
    site.CreateSkipSlider1('version', otoge.VERSION_DATA, 0, prevFilter?.version, onSliderStart, onFilterSliderSet);
    site.CreateSkipSlider2('lv', otoge.LV_DATA, prevFilter?.lv, onSliderStart, onFilterSliderSet);
    site.CreateSkipSlider2('lv-type', otoge.LV_TYPE_DATA, prevFilter?.lv_type, onSliderStart, onFilterSliderSet);
    site.CreateSkipSlider2('target-percent', otoge.TARGET_PERCENT_DATA, prevFilter?.target_percent, onSliderStart, onFilterSliderSet, 1);
    site.CreateSkipSlider2('count', otoge.COUNT_DATA, prevFilter?.count, onSliderStart, onFilterSliderSet, 1);
  }

  $.getJSON('/api/mymusic', (myMusicData) => {
    $.getJSON('/api/globalscorerate', (scoreRateData) => {
      $.getJSON('/api/fumens', (fumensData) => {
        fumensDataRaw = fumensData;
        scoreRateDataRaw = scoreRateData;
        myMusicDataRaw = myMusicData;

        updateGrid2();
      });
    });
  });

  initializing = false;
}
