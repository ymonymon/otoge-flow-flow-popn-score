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

  if (diff[0] !== 0 || diff[1] !== DIFF_DATA.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' ? <= [7] AND [7] <= ?';
    arg = arg.concat([DIFF_DATA_R[diff[0]], DIFF_DATA_R[diff[1]]]);
  }
  if (medal[0] !== 0 || medal[1] !== medal_data.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' ? <= [10] AND [10] <= ?';
    arg = arg.concat([medal_data_r[medal[0]], medal_data_r[medal[1]]]);
  }
  if (rank[0] !== 0 || rank[1] !== rank_data.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' ? <= [11] AND [11] <= ?';
    arg = arg.concat([rank_data_r[rank[0]], rank_data_r[rank[1]]]);
  }
  if (score[0] !== 0 || score[1] !== score_data.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' ? <= [4] AND [4] < ?';
    arg = arg.concat([
      score_data_r[score[0]],
      score_data_r[score[1]]]);
  }

  if (version[0] !== 0) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' [5] = ?';
    arg = arg.concat([VERSION_DATA_R[version[0]]]);
  }
  if (lv[0] !== 0 || lv[1] !== lv_data.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' ? <= [3] AND [3] <= ?';
    arg = arg.concat([lv[0] + 1, lv[1] + 1]); // +1 == to lv
  }
  if (lv_type[0] !== 0 || lv_type[1] !== lv_type_data.length - 1) {
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
    updateGrid2(true);
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
        if (document.getElementById('skipstep-stats').noUiSlider.get() === STATS_DATA[0]) {
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

function updateGrid2(filterSaveOnly) {
  let skipSlider;
  let val;

  skipSlider = document.getElementById('skipstep-stats');
  val = skipSlider.noUiSlider.get();
  const key_stats = Object.keys(STATS_DATA).filter((key) => STATS_DATA[key] === val)[0];

  skipSlider = document.getElementById('skipstep-diff');
  val = skipSlider.noUiSlider.get();
  const key_diff1 = Object.keys(DIFF_DATA).filter((key) => DIFF_DATA[key] === val[0])[0];
  const key_diff2 = Object.keys(DIFF_DATA).filter((key) => DIFF_DATA[key] === val[1])[0];

  skipSlider = document.getElementById('skipstep-medal');
  val = skipSlider.noUiSlider.get();
  const key_medal1 = Object.keys(medal_data).filter((key) => medal_data[key] === val[0])[0];
  const key_medal2 = Object.keys(medal_data).filter((key) => medal_data[key] === val[1])[0];

  skipSlider = document.getElementById('skipstep-rank');
  val = skipSlider.noUiSlider.get();
  const key_rank1 = Object.keys(rank_data).filter((key) => rank_data[key] === val[0])[0];
  const key_rank2 = Object.keys(rank_data).filter((key) => rank_data[key] === val[1])[0];

  skipSlider = document.getElementById('skipstep-score');
  val = skipSlider.noUiSlider.get();
  const key_score1 = Object.keys(score_data).filter((key) => score_data[key] === val[0])[0];
  const key_score2 = Object.keys(score_data).filter((key) => score_data[key] === val[1])[0];

  skipSlider = document.getElementById('skipstep-version');
  val = skipSlider.noUiSlider.get();
  const key_version = Object.keys(VERSION_DATA).filter((key) => VERSION_DATA[key] === val)[0];

  skipSlider = document.getElementById('skipstep-lv');
  val = skipSlider.noUiSlider.get();
  const key_lv1 = Object.keys(lv_data).filter((key) => lv_data[key] === val[0])[0];
  const key_lv2 = Object.keys(lv_data).filter((key) => lv_data[key] === val[1])[0];

  skipSlider = document.getElementById('skipstep-lv-type');
  val = skipSlider.noUiSlider.get();
  const key_lv_type1 = Object.keys(lv_type_data).filter((key) => lv_type_data[key] === val[0])[0];
  const key_lv_type2 = Object.keys(lv_type_data).filter((key) => lv_type_data[key] === val[1])[0];

  if (filterSaveOnly) {
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
  } else {
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
              const filter = prevFilter[skipSlider.id.replace('skipstep-', '').replace('-', '_')];
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

    {
      const skipSlider = document.getElementById('skipstep-stats');
      const defaultPos = STATS_DATA[0];
      const startPos = (prevFilter !== null && prevFilter.stats !== undefined)
        ? STATS_DATA[prevFilter.stats]
        : defaultPos;

      noUiSlider.create(skipSlider, {
        range: {
          min: 0,
          max: STATS_DATA.length - 1,
        },
        start: startPos,
        default: defaultPos,
        matchingTable: STATS_DATA,
        step: 1,
        tooltips: true,
        format: {
          to: (key) => STATS_DATA[Math.round(key)],
          from: (value) => Object.keys(STATS_DATA).filter((key) => STATS_DATA[key] === value)[0],
        },
      });

      const skipValues = [
        document.getElementById('stats-text'),
      ];

      skipSlider.noUiSlider.on('update', (values, handle) => {
        skipValues[handle].innerHTML = values[handle];
      });

      skipSlider.noUiSlider.on('start', () => {
        clearTimeout(updateFilterTimer);
      });

      skipSlider.noUiSlider.on('set', () => {
        if (fumens_data_raw !== undefined && mainGrid !== undefined) {
          updateGrid2(true);
          clearTimeout(updateFilterTimer);
          updateFilterTimer = setTimeout(() => {
            updateGrid2();
          }, 1000);
        }
      });
    }
    {
      const skipSlider = document.getElementById('skipstep-diff');
      const defaultPos = [DIFF_DATA[0], -1];
      const startPos = (prevFilter !== null
        && prevFilter.diff !== undefined && prevFilter.diff.length === 2)
        ? [DIFF_DATA[prevFilter.diff[0]], DIFF_DATA[prevFilter.diff[1]]]
        : defaultPos;

      noUiSlider.create(skipSlider, {
        range: {
          min: 0,
          max: DIFF_DATA.length - 1,
        },
        connect: true,
        start: startPos,
        default: defaultPos,
        matchingTable: DIFF_DATA,
        step: 1,
        tooltips: [true, true],
        format: {
          to: (key) => DIFF_DATA[Math.round(key)],
          from: (value) => Object.keys(DIFF_DATA).filter((key) => DIFF_DATA[key] === value)[0],
        },
      });

      const skipValues = [
        document.getElementById('diff-lower'),
        document.getElementById('diff-upper'),
        document.getElementById('diff-hyphen'),
        document.getElementById('diff-same'),
      ];

      skipSlider.noUiSlider.on('update', (values, handle) => {
        skipValues[handle].innerHTML = values[handle];

        if (skipValues[0].innerHTML === skipValues[1].innerHTML) {
          skipValues[3].innerHTML = values[handle];
          skipValues[0].style.display = 'none';
          skipValues[1].style.display = 'none';
          skipValues[2].style.display = 'none';
          skipValues[3].style.display = 'inline';
        } else if ((skipValues[0].innerText === DIFF_DATA[0]
                  || skipValues[0].innerHTML === DIFF_DATA[0])
                  && (skipValues[1].innerText === DIFF_DATA[DIFF_DATA.length - 1]
                      || skipValues[1].innerHTML === DIFF_DATA[DIFF_DATA.length - 1])) {
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
          updateGrid2(true);
          clearTimeout(updateFilterTimer);
          updateFilterTimer = setTimeout(() => {
            updateGrid2();
          }, 1000);
        }
      });
    }
    {
      const skipSlider = document.getElementById('skipstep-medal');
      const defaultPos = [medal_data[0], medal_data[medal_data.length - 1]];
      const startPos = (prevFilter !== null
        && prevFilter.medal !== undefined && prevFilter.medal.length === 2)
        ? [medal_data[prevFilter.medal[0]], medal_data[prevFilter.medal[1]]]
        : defaultPos;

      noUiSlider.create(skipSlider, {
        range: {
          min: 0,
          max: medal_data.length - 1,
        },
        connect: true,
        start: startPos,
        default: defaultPos,
        matchingTable: medal_data,
        step: 1,
        tooltips: [true, true],
        format: {
          to: (key) => medal_data[Math.round(key)],
          from: (value) => Object.keys(medal_data).filter((key) => medal_data[key] === value)[0],
        },
      });

      const skipValues = [
        document.getElementById('medal-lower'),
        document.getElementById('medal-upper'),
        document.getElementById('medal-hyphen'),
        document.getElementById('medal-same'),
      ];

      skipSlider.noUiSlider.on('update', (values, handle) => {
        skipValues[handle].innerHTML = values[handle];

        if (skipValues[0].innerHTML === skipValues[1].innerHTML) {
          skipValues[3].innerHTML = values[handle];
          skipValues[0].style.display = 'none';
          skipValues[1].style.display = 'none';
          skipValues[2].style.display = 'none';
          skipValues[3].style.display = 'inline';
        } else if ((skipValues[0].innerText === medal_data[0]
                  || skipValues[0].innerHTML === medal_data[0])
                  && (skipValues[1].innerText === medal_data[medal_data.length - 1]
                      || skipValues[1].innerHTML === medal_data[medal_data.length - 1])) {
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
          updateGrid2(true);
          clearTimeout(updateFilterTimer);
          updateFilterTimer = setTimeout(() => {
            updateGrid2();
          }, 1000);
        }
      });
    }
    {
      const skipSlider = document.getElementById('skipstep-rank');
      const defaultPos = [rank_data[0], rank_data[rank_data.length - 1]];
      const startPos = (prevFilter !== null
        && prevFilter.rank !== undefined && prevFilter.rank.length === 2)
        ? [rank_data[prevFilter.rank[0]], rank_data[prevFilter.rank[1]]]
        : defaultPos;

      noUiSlider.create(skipSlider, {
        range: {
          min: 0,
          max: rank_data.length - 1,
        },
        connect: true,
        start: startPos,
        default: defaultPos,
        matchingTable: rank_data,
        step: 1,
        tooltips: [true, true],
        format: {
          to: (key) => rank_data[Math.round(key)],
          from: (value) => Object.keys(rank_data).filter((key) => rank_data[key] === value)[0],
        },
      });

      const skipValues = [
        document.getElementById('rank-lower'),
        document.getElementById('rank-upper'),
        document.getElementById('rank-hyphen'),
        document.getElementById('rank-same'),
      ];

      skipSlider.noUiSlider.on('update', (values, handle) => {
        skipValues[handle].innerHTML = values[handle];

        if (skipValues[0].innerHTML === skipValues[1].innerHTML) {
          skipValues[3].innerHTML = values[handle];
          skipValues[0].style.display = 'none';
          skipValues[1].style.display = 'none';
          skipValues[2].style.display = 'none';
          skipValues[3].style.display = 'inline';
        } else if ((skipValues[0].innerText === rank_data[0]
                  || skipValues[0].innerHTML === rank_data[0])
                  && (skipValues[1].innerText === rank_data[rank_data.length - 1]
                      || skipValues[1].innerHTML === rank_data[rank_data.length - 1])) {
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
          updateGrid2(true);
          clearTimeout(updateFilterTimer);
          updateFilterTimer = setTimeout(() => {
            updateGrid2();
          }, 1000);
        }
      });
    }
    {
      const skipSlider = document.getElementById('skipstep-score');
      const defaultPos = [score_data[0], '100k'];
      const startPos = (prevFilter !== null
        && prevFilter.score !== undefined && prevFilter.score.length === 2)
        ? [score_data[prevFilter.score[0]], score_data[prevFilter.score[1]]]
        : defaultPos;

      noUiSlider.create(skipSlider, {
        range: {
          min: 0,
          max: score_data.length - 1,
        },
        connect: true,
        // start: [score_data[0], score_data[score_data.length - 1]],
        start: startPos,
        default: defaultPos,
        matchingTable: score_data,
        step: 1,
        margin: 1,
        tooltips: [true, true],
        format: {
          to: (key) => score_data[Math.round(key)],
          from: (value) => Object.keys(score_data).filter((key) => score_data[key] === value)[0],
        },
      });

      const skipValues = [
        document.getElementById('score-lower'),
        document.getElementById('score-upper'),
        document.getElementById('score-line'),
        document.getElementById('score-same'),
      ];

      skipSlider.noUiSlider.on('update', (values, handle) => {
        const key_score = Object.keys(score_data).filter(
          (key) => score_data[key] === values[handle],
        )[0];

        skipValues[handle].innerHTML = score_data_display[key_score];

        if (values[0] === score_data[0]
                  && values[1] === score_data[score_data.length - 1]) {
          skipValues[3].innerHTML = 'ALL';
          skipValues[0].style.display = 'none';
          skipValues[1].style.display = 'none';
          skipValues[2].style.display = 'none';
          skipValues[3].style.display = 'inline';
        } else {
          skipValues[0].style.display = 'inline';
          skipValues[1].style.display = 'inline';
          skipValues[2].style.display = 'inline';
          if (values[1] === score_data[score_data.length - 1]) {
            skipValues[2].innerHTML = '<img src="/icon/closed.png" alt="closed"  width="20" height="10"/>';
          } else {
            skipValues[2].innerHTML = '<img src="/icon/leftclosed.png" alt="leftclosed"  width="20" height="10"/>';
          }
          skipValues[3].style.display = 'none';
        }
      });

      skipSlider.noUiSlider.on('start', () => {
        clearTimeout(updateFilterTimer);
      });

      skipSlider.noUiSlider.on('set', () => {
        if (fumens_data_raw !== undefined && mainGrid !== undefined) {
          updateGrid2(true);
          clearTimeout(updateFilterTimer);
          updateFilterTimer = setTimeout(() => {
            updateGrid2();
          }, 1000);
        }
      });
    }
    {
      const skipSlider = document.getElementById('skipstep-version');
      const defaultPos = VERSION_DATA[0];
      const startPos = (prevFilter !== null && prevFilter.version !== undefined)
        ? VERSION_DATA[prevFilter.version]
        : defaultPos;

      noUiSlider.create(skipSlider, {
        range: {
          min: 0,
          max: VERSION_DATA.length - 1,
        },
        start: startPos,
        default: defaultPos,
        matchingTable: VERSION_DATA,
        step: 1,
        tooltips: true,
        format: {
          to: (key) => VERSION_DATA[Math.round(key)],
          from: (value) => Object.keys(VERSION_DATA).filter(
            (key) => VERSION_DATA[key] === value,
          )[0],
        },
      });

      const skipValues = [
        document.getElementById('version-text'),
      ];

      skipSlider.noUiSlider.on('update', (values, handle) => {
        skipValues[handle].innerHTML = values[handle];
      });

      skipSlider.noUiSlider.on('start', () => {
        clearTimeout(updateFilterTimer);
      });

      skipSlider.noUiSlider.on('set', () => {
        if (fumens_data_raw !== undefined && mainGrid !== undefined) {
          updateGrid2(true);
          clearTimeout(updateFilterTimer);
          updateFilterTimer = setTimeout(() => {
            updateGrid2();
          }, 1000);
        }
      });
    }
    {
      const skipSlider = document.getElementById('skipstep-lv');
      const defaultPos = [lv_data[0], lv_data[lv_data.length - 1]];
      const startPos = (prevFilter !== null
        && prevFilter.lv !== undefined && prevFilter.lv.length === 2)
        ? [lv_data[prevFilter.lv[0]], lv_data[prevFilter.lv[1]]]
        : defaultPos;

      noUiSlider.create(skipSlider, {
        range: {
          min: 0,
          max: lv_data.length - 1,
        },
        connect: true,
        start: startPos,
        default: defaultPos,
        matchingTable: lv_data,
        step: 1,
        tooltips: [true, true],
        format: {
          to: (key) => lv_data[Math.round(key)],
          from: (value) => Object.keys(lv_data).filter((key) => lv_data[key] === value)[0],
        },
      });

      const skipValues = [
        document.getElementById('lv-lower'),
        document.getElementById('lv-upper'),
        document.getElementById('lv-hyphen'),
        document.getElementById('lv-same'),
      ];

      skipSlider.noUiSlider.on('update', (values, handle) => {
        skipValues[handle].innerHTML = values[handle];

        if (skipValues[0].innerHTML === skipValues[1].innerHTML) {
          skipValues[3].innerHTML = values[handle];
          skipValues[0].style.display = 'none';
          skipValues[1].style.display = 'none';
          skipValues[2].style.display = 'none';
          skipValues[3].style.display = 'inline';
        } else if (skipValues[0].innerText === lv_data[0]
                  && skipValues[1].innerText === lv_data[lv_data.length - 1]) {
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
          updateGrid2(true);
          clearTimeout(updateFilterTimer);
          updateFilterTimer = setTimeout(() => {
            updateGrid2();
          }, 1000);
        }
      });
    }
    {
      const skipSlider = document.getElementById('skipstep-lv-type');
      const defaultPos = [lv_type_data[0], lv_type_data[lv_type_data.length - 1]];
      const startPos = (prevFilter !== null
        && prevFilter.lv_type !== undefined && prevFilter.lv_type.length === 2)
        ? [lv_type_data[prevFilter.lv_type[0]], lv_type_data[prevFilter.lv_type[1]]]
        : defaultPos;

      noUiSlider.create(skipSlider, {
        range: {
          min: 0,
          max: lv_type_data.length - 1,
        },
        connect: true,
        start: startPos,
        default: defaultPos,
        matchingTable: lv_type_data,
        step: 1,
        tooltips: [true, true],
        format: {
          to: (key) => lv_type_data[Math.round(key)],
          from: (value) => Object.keys(lv_type_data).filter(
            (key) => lv_type_data[key] === value,
          )[0],
        },
      });

      const skipValues = [
        document.getElementById('lv-type-lower'),
        document.getElementById('lv-type-upper'),
        document.getElementById('lv-type-hyphen'),
        document.getElementById('lv-type-same'),
      ];

      skipSlider.noUiSlider.on('update', (values, handle) => {
        skipValues[handle].innerHTML = values[handle];

        if (skipValues[0].innerHTML === skipValues[1].innerHTML) {
          skipValues[3].innerHTML = values[handle];
          skipValues[0].style.display = 'none';
          skipValues[1].style.display = 'none';
          skipValues[2].style.display = 'none';
          skipValues[3].style.display = 'inline';
        } else if (skipValues[0].innerText === lv_type_data[0]
                  && skipValues[1].innerText === lv_type_data[lv_type_data.length - 1]) {
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
          updateGrid2(true);
          clearTimeout(updateFilterTimer);
          updateFilterTimer = setTimeout(() => {
            updateGrid2();
          }, 1000);
        }
      });
    }
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
