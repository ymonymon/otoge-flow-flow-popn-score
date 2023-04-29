/* eslint-disable camelcase */
/* eslint-disable no-undef */
import * as site from './site_m.js';
import * as otoge from './const_m.js';

const PAGE_NAME = 'statsScore';

let mainGrid;
let fumens_data_raw;
let percentile_score_data_raw;
let old_top_score_data_raw;
let avg_score_data_raw;
let my_music_data_raw;

let updateFilterTimer;

let sort_click_count;
let sort_target;

let initializing = true;

const fumenFilter = (stats, diff, medal, rank, score, version, lv, lv_type) => {
  let stats_column = 'TBL3.[2]';
  switch (stats[0]) {
    case 1:
      stats_column = 'TBL4.[1]';
      break;
    case 2:
      stats_column = 'TBL4.[2]';
      break;
    case 3:
      stats_column = 'TBL4.[3]';
      break;
    case 4:
      stats_column = 'TBL4.[4]';
      break;
    default:
      break;
  }

  // old_top_score_data_raw

  // AS は必須
  // 高い方のスコアを採用
  // old_top_score_data_rawは全ての譜面行を持つがpercentile_score_data_rawは持たないのでleft join
  const percentile_score_data_raw2 = alasql(
    `MATRIX OF
SELECT TBL1.[0] AS [0],
TBL1.[1] AS [1],
TBL1.[2] AS [2],
TBL1.[3] AS [3],
CASE WHEN TBL2.[1] IS NULL THEN TBL1.[4] ELSE (
CASE WHEN TBL1.[4] < TBL2.[1] THEN TBL2.[1] ELSE TBL1.[4] END) END AS [4]
FROM ? AS TBL1
LEFT JOIN ? AS TBL2 ON TBL2.[0] = TBL1.[0]`,
    [percentile_score_data_raw, old_top_score_data_raw],
  );

  // TODO : LEFT JOIN
  const basesql = `MATRIX OF
SELECT TBL1.[1] AS [0], TBL1.[2] AS [1], -- genre/title
TBL1.[3] AS [2], TBL1.[4] AS [3], -- lv-type/lv
TBL2.[3] AS [4], -- score
TBL1.[5] AS [5], -- version
${stats_column} AS [6], -- stats
((CASE TBL2.[3] WHEN -2 THEN 0 ELSE TBL2.[3] END) - ${stats_column}) AS [7], -- diff
TBL3.[1] AS [8], -- count
TBL3.[3] AS [9], -- count now
TBL2.[1] AS [10], -- medal
TBL2.[2] AS [11] -- rank
FROM ? AS TBL1
INNER JOIN ? AS TBL2 ON TBL2.[0] = TBL1.[0]
INNER JOIN ? AS TBL3 ON TBL3.[0] = TBL1.[0]
INNER JOIN ? AS TBL4 ON TBL4.[0] = TBL1.[0]`;

  const res = alasql(
    basesql,
    [fumens_data_raw, my_music_data_raw, avg_score_data_raw, percentile_score_data_raw2],
  );

  // filter
  let sql = 'MATRIX OF SELECT * FROM ?';
  let arg = [res];

  if (diff[0] !== 0 || diff[1] !== otoge.DIFF_DATA.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' ? <= [7] AND [7] <= ?';
    arg = arg.concat([otoge.DIFF_DATA_R[diff[0]], otoge.DIFF_DATA_R[diff[1]]]);
  }
  if (medal[0] !== 0 || medal[1] !== otoge.MEDAL_DATA.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' ? <= [10] AND [10] <= ?';
    arg = arg.concat([otoge.MEDAL_DATA_R[medal[0]], otoge.MEDAL_DATA_R[medal[1]]]);
  }
  if (rank[0] !== 0 || rank[1] !== otoge.RANK_DATA.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' ? <= [11] AND [11] <= ?';
    arg = arg.concat([otoge.RANK_DATA_R[rank[0]], otoge.RANK_DATA_R[rank[1]]]);
  }
  if (score[0] !== 0 || score[1] !== otoge.SCORE_DATA.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' ? <= [4] AND [4] < ?';
    arg = arg.concat([
      otoge.SCORE_DATA_R[score[0]],
      otoge.SCORE_DATA_R[score[1]]]);
  }

  if (version[0] !== 0) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' [5] = ?';
    arg = arg.concat([otoge.VERSION_DATA_R[version[0]]]);
  }
  if (lv[0] !== 0 || lv[1] !== otoge.LV_DATA.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' ? <= [3] AND [3] <= ?';
    arg = arg.concat([lv[0] + 1, lv[1] + 1]); // +1 == to lv
  }
  if (lv_type[0] !== 0 || lv_type[1] !== otoge.LV_TYPE_DATA.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' ? <= [2] AND [2] <= ?';
    arg = arg.concat([lv_type[0] + 1, lv_type[1] + 1]); // +1 == to lv type
  }

  const res2 = alasql(sql, arg);

  // version除去/列番号変更
  const result = res2.map((a) => [a[0], a[1], a[2], a[3],
    a[10], a[11], a[6], a[7], a[4], a[8], a[9]]);
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
    [...Array(sort_click_count)].map(() => $(`.gridjs-th[data-column-id=${sort_target}]`).trigger('click'));
  }, 0);
};

const updateGrid = (data) => {
  const columns_setting = [
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
      name: document.getElementById('skipstep-stats').noUiSlider.get(),
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
      id: '7',
      name: 'diff',
      formatter: (_, row) => (row.cells[7].data <= 0 ? row.cells[7].data : (`+${row.cells[7].data}`)),
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
      id: '8',
      name: 'score',
      formatter: (_, row) => (row.cells[8].data === -2 ? '-' : row.cells[8].data),
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
      name: 'c',
      formatter: (_, row) => {
        if (document.getElementById('skipstep-stats').noUiSlider.get() === otoge.STATS_DATA[0]) {
          return gridjs.html(`${row.cells[9].data}<br><span style='color:gray'>(${row.cells[10].data})</span>`);
        }
        return row.cells[10].data;
      },
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
      id: '10',
      name: '',
      sort: 0,
      width: '1px',
      attributes: {
        style: 'display:none',
      },
    },
  ];

  if (mainGrid === undefined) {
    mainGrid = new gridjs.Grid({
      columns: columns_setting,
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
    [sort_target, sort_click_count] = site.getFilterSortStatus(PAGE_NAME, '7', 2);

    if (sort_click_count > 0) {
      mainGrid.on('ready', storeSort);
    }
  } else {
    [sort_target, sort_click_count] = site.getFilterSortStatus(PAGE_NAME, '7', 2);

    mainGrid.updateConfig({
      columns: columns_setting,
      data,
    }).forceRender();

    if (sort_click_count > 0) {
      mainGrid.on('ready', storeSort);
    }
  }
};

function saveFilterAndSort() {
  const key_stats = site.getKeyNames('skipstep-stats', otoge.STATS_DATA);
  const [key_diff1, key_diff2] = site.getKeyNames('skipstep-diff', otoge.DIFF_DATA);
  const [key_medal1, key_medal2] = site.getKeyNames('skipstep-medal', otoge.MEDAL_DATA);
  const [key_rank1, key_rank2] = site.getKeyNames('skipstep-rank', otoge.RANK_DATA);
  const [key_score1, key_score2] = site.getKeyNames('skipstep-score', otoge.SCORE_DATA);
  const key_version = site.getKeyNames('skipstep-version', otoge.VERSION_DATA);
  const [key_lv1, key_lv2] = site.getKeyNames('skipstep-lv', otoge.LV_DATA);
  const [key_lv_type1, key_lv_type2] = site.getKeyNames('skipstep-lv-type', otoge.LV_TYPE_DATA);

  // save filter & sort
  const sortStatus = site.getCurrentSortStatus();

  const selectedFilter = window.localStorage.getItem(`${PAGE_NAME}.selectedFilter`) ?? '0';
  const prevFilters = JSON.parse(window.localStorage.getItem(`${PAGE_NAME}.filters`)) ?? {};
  prevFilters[selectedFilter] = {
    stats: key_stats,
    diff: [key_diff1, key_diff2],
    medal: [key_medal1, key_medal2],
    rank: [key_rank1, key_rank2],
    score: [key_score1, key_score2],
    version: key_version,
    lv: [key_lv1, key_lv2],
    lv_type: [key_lv_type1, key_lv_type2],
    sort: sortStatus,
  };

  window.localStorage.setItem(`${PAGE_NAME}.filters`, JSON.stringify(prevFilters));
}

function updateGrid2() {
  const key_stats = site.getKeyNames('skipstep-stats', otoge.STATS_DATA);
  const [key_diff1, key_diff2] = site.getKeyNames('skipstep-diff', otoge.DIFF_DATA);
  const [key_medal1, key_medal2] = site.getKeyNames('skipstep-medal', otoge.MEDAL_DATA);
  const [key_rank1, key_rank2] = site.getKeyNames('skipstep-rank', otoge.RANK_DATA);
  const [key_score1, key_score2] = site.getKeyNames('skipstep-score', otoge.SCORE_DATA);
  const key_version = site.getKeyNames('skipstep-version', otoge.VERSION_DATA);
  const [key_lv1, key_lv2] = site.getKeyNames('skipstep-lv', otoge.LV_DATA);
  const [key_lv_type1, key_lv_type2] = site.getKeyNames('skipstep-lv-type', otoge.LV_TYPE_DATA);

  const filteredData = fumenFilter(
    [key_stats].map(Number),
    [key_diff1, key_diff2].map(Number),
    [key_medal1, key_medal2].map(Number),
    [key_rank1, key_rank2].map(Number),
    [key_score1, key_score2].map(Number),
    [key_version].map(Number),
    [key_lv1, key_lv2].map(Number),
    [key_lv_type1, key_lv_type2].map(Number),
  );

  updateGrid(filteredData);
}

function CreateSkipSlider1(
  id,
  dataObject,
  defaultKey,
  prevKey,
  isView,
  fn,
) {
  const skipSlider = document.getElementById(`skipstep-${id}`);
  const defaultPos = dataObject[defaultKey];
  const startPos = (prevKey !== null && prevKey !== undefined)
    ? dataObject[prevKey]
    : defaultPos;

  noUiSlider.create(skipSlider, {
    range: {
      min: 0,
      max: dataObject.length - 1,
    },
    start: startPos,
    default: defaultPos,
    matchingTable: dataObject,
    step: 1,
    tooltips: true,
    format: {
      to: (key) => dataObject[Math.round(key)],
      from: (value) => Object.keys(dataObject).filter(
        (key) => dataObject[key] === value,
      )[0],
    },
  });

  const skipValues = [
    document.getElementById(`${id}-text`),
  ];

  skipSlider.noUiSlider.on('update', (values, handle) => {
    skipValues[handle].innerHTML = values[handle];
  });

  skipSlider.noUiSlider.on('start', () => {
    clearTimeout(updateFilterTimer);
  });

  skipSlider.noUiSlider.on('set', () => {
    if (isView) {
      if (fumens_data_raw !== undefined && mainGrid !== undefined) {
        site.saveView();
        document.getElementById('wrapper').innerHTML = '';
        mainGrid = undefined;
        updateGrid(fumens_data_raw);
        clearTimeout(updateFilterTimer);
        updateFilterTimer = setTimeout(() => {
          updateGrid2(); // 1st filter
          if (fn) {
            fn();
          }
        }, 1000);
      }
    } else if (fumens_data_raw !== undefined && mainGrid !== undefined) {
      saveFilterAndSort();
      clearTimeout(updateFilterTimer);
      updateFilterTimer = setTimeout(() => {
        updateGrid2();
        if (fn) {
          fn();
        }
      }, 1000);
    }
  });
}

function CreateSkipSlider2(
  id,
  dataObject,
  prevKeys,
  defaultPosUpper = undefined,
  margin = 0,
  updateFn = undefined,
) {
  const skipSlider = document.getElementById(`skipstep-${id}`);
  const defaultPos = [dataObject[0],
    defaultPosUpper === undefined ? dataObject[dataObject.length - 1] : defaultPosUpper];
  const startPos = (prevKeys !== null && prevKeys !== undefined
    && prevKeys.length === 2)
    ? [dataObject[prevKeys[0]], dataObject[prevKeys[1]]]
    : defaultPos;

  noUiSlider.create(skipSlider, {
    range: {
      min: 0,
      max: dataObject.length - 1,
    },
    connect: true,
    start: startPos,
    default: defaultPos,
    matchingTable: dataObject,
    step: 1,
    margin,
    tooltips: [true, true],
    format: {
      to: (key) => dataObject[Math.round(key)],
      from: (value) => Object.keys(dataObject).filter(
        (key) => dataObject[key] === value,
      )[0],
    },
  });

  const skipValues = [
    document.getElementById(`${id}-lower`),
    document.getElementById(`${id}-upper`),
    document.getElementById(`${id}-hyphen`),
    document.getElementById(`${id}-same`),
  ];

  skipSlider.noUiSlider.on('update', updateFn !== undefined ? updateFn : (values, handle) => {
    skipValues[handle].innerHTML = values[handle];

    const firstDataValue = dataObject[0];
    const lastDataValue = dataObject[dataObject.length - 1];

    if (skipValues[0].innerHTML === skipValues[1].innerHTML) {
      skipValues[3].innerHTML = values[handle];
      skipValues[0].style.display = 'none';
      skipValues[1].style.display = 'none';
      skipValues[2].style.display = 'none';
      skipValues[3].style.display = 'inline';
    } else if ((skipValues[0].innerText === firstDataValue
                || skipValues[0].innerHTML === firstDataValue)
                && (skipValues[1].innerText === lastDataValue
                    || skipValues[1].innerHTML === lastDataValue)) {
      skipValues[3].innerHTML = 'ALL';
      skipValues[0].style.display = 'none';
      skipValues[1].style.display = 'none';
      skipValues[2].style.display = 'none';
      skipValues[3].style.display = 'inline';
    } else {
      skipValues[0].style.display = 'inline';
      skipValues[1].style.display = 'inline';
      skipValues[2].style.display = 'inline';
      skipValues[3].style.display = 'none';
    }
  });

  skipSlider.noUiSlider.on('start', () => {
    clearTimeout(updateFilterTimer);
  });

  skipSlider.noUiSlider.on('set', () => {
    if (fumens_data_raw !== undefined && mainGrid !== undefined) {
      saveFilterAndSort();
      clearTimeout(updateFilterTimer);
      updateFilterTimer = setTimeout(() => {
        updateGrid2();
      }, 1000);
    }
  });
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

    CreateSkipSlider1('stats', otoge.STATS_DATA, 0, prevFilter?.stats, false);
    CreateSkipSlider2('diff', otoge.DIFF_DATA, prevFilter?.diff, -1);
    CreateSkipSlider2('medal', otoge.MEDAL_DATA, prevFilter?.medal);
    CreateSkipSlider2('rank', otoge.RANK_DATA, prevFilter?.rank);
    CreateSkipSlider2('score', otoge.SCORE_DATA, prevFilter?.score, '100k', 1, (values, handle) => {
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

      const key_score = Object.keys(dataObject).filter(
        (key) => dataObject[key] === values[handle],
      )[0];

      skipValues[handle].innerHTML = dataDisplayObject[key_score];

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
    });
    CreateSkipSlider1('version', otoge.VERSION_DATA, 0, prevFilter?.version, false);
    CreateSkipSlider2('lv', otoge.LV_DATA, prevFilter?.lv);
    CreateSkipSlider2('lv-type', otoge.LV_TYPE_DATA, prevFilter?.lv_type);
  }

  $.getJSON('/api/mymusic', (my_music_data) => {
    $.getJSON('/api/globalavgscore', (avg_score_data) => {
      $.getJSON('/api/globalpercentilescore', (percentile_score_data) => {
        $.getJSON('/api/globaloldtopscore', (old_top_score_data) => {
          $.getJSON('/api/fumens', (fumens_data) => {
            fumens_data_raw = fumens_data;
            old_top_score_data_raw = old_top_score_data;
            percentile_score_data_raw = percentile_score_data;
            avg_score_data_raw = avg_score_data;
            my_music_data_raw = my_music_data;

            updateGrid2();
          });
        });
      });
    });
  });

  initializing = false;
}
