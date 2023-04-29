import * as site from './site_m.js';
import * as otoge from './const_m.js';

const PAGE_NAME = 'targetMedal';

let mainGrid;
let medalRateDataRaw;
let fumensDataRaw;
let targetMedalKey;

let updateFilterTimer;

let sortClickCount;
let sortTarget;

let initializing = true;

const fumenFilter = (version, target, medal, rank, lv, lvType) => {
  const res = alasql(`MATRIX OF
SELECT TBL1.[1] AS [0], TBL1.[2] AS [1], -- genre/title
TBL1.[3] AS [2], TBL1.[4] AS [3], -- lv-type/lv
TBL2.[1] AS [4], -- medal
TBL2.[2] AS [5], TBL2.[3] AS [6], -- rank/score
TBL1.[5] AS [7], -- version
TBL2.[4] AS [8], -- count
TBL2.[5] AS [9], (TBL2.[5] - TBL2.[3]) AS [10], -- avg/diff
TBL2.[6] AS [11], TBL2.[7] AS [12], TBL2.[8] AS [13], TBL2.[9] AS [14], TBL2.[10] AS [15], TBL2.[11] AS [16], TBL2.[12] AS [17],
TBL2.[13] AS [18] -- count now
FROM ? AS TBL1 INNER JOIN ? AS TBL2 ON TBL2.[0] = TBL1.[0]`, [fumensDataRaw, medalRateDataRaw]);

  const data = res.map((a) => [a[1], a[0],
    a[2], a[3],
    a[4],
    a[11], a[12], a[13], a[14], a[15], a[16], a[17],
    a[8],
    a[18], a[7], a[5],
  ]);

  let sql = 'MATRIX OF SELECT * FROM ?';
  let arg = [data];
  if (version[0] !== 0) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' [14] = ?';
    arg = arg.concat([otoge.VERSION_DATA_R[version[0]]]);
  }
  if (medal[0] !== 0 || medal[1] !== otoge.MEDAL_DATA.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' ? <= [4] AND [4] <= ?';

    if (target[0] === otoge.TARGET_MEDAL_DATA.length - 1) {
      // next
      arg = arg.concat([otoge.MEDAL_DATA_R[medal[0]], otoge.MEDAL_DATA_R[medal[1]]]);
    } else {
      // fix target/固定ターゲットの場合は終わっているものをフィルタする。
      arg = arg.concat([otoge.MEDAL_DATA_R[medal[0]],
        otoge.MEDAL_DATA_R[medal[1]] < (otoge.TARGET_MEDAL_DATA_R[target[0]] - 1)
          ? otoge.MEDAL_DATA_R[medal[1]] : (otoge.TARGET_MEDAL_DATA_R[target[0]] - 1),
      ]);
    }
  }
  if (rank[0] !== 0 || rank[1] !== otoge.RANK_DATA.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' ? <= [15] AND [15] <= ?';
    arg = arg.concat([otoge.RANK_DATA_R[rank[0]], otoge.RANK_DATA_R[rank[1]]]);
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

  const res2 = alasql(sql, arg);

  let res3;
  if (target[0] === otoge.TARGET_MEDAL_DATA.length - 1) {
    const test = `MATRIX OF
    SELECT TBL1.[0], TBL1.[1], TBL1.[2], TBL1.[3], TBL1.[4],
    CASE WHEN TBL1.[4] < 4 THEN TBL1.[5]
    WHEN TBL1.[4] < 5 THEN TBL1.[6]
    WHEN TBL1.[4] < 6 THEN TBL1.[7]
    WHEN TBL1.[4] < 7 THEN TBL1.[8]
    WHEN TBL1.[4] < 8 THEN TBL1.[9]
    WHEN TBL1.[4] < 9 THEN TBL1.[10]
    WHEN TBL1.[4] < 10 THEN TBL1.[11]
    ELSE 'score' END,
    TBL1.[12], TBL1.[13], TBL1.[15]
    FROM ? AS TBL1`;

    res3 = alasql(test, [res2]);
  } else {
    // ${otoge.TARGET_MEDAL_DATA_R[target[0]] + 1} is column number
    const test = `MATRIX OF
SELECT TBL1.[0], TBL1.[1], TBL1.[2], TBL1.[3], TBL1.[4],
CASE WHEN TBL1.[4] < 10 THEN TBL1.[${otoge.TARGET_MEDAL_DATA_R[target[0]] + 1}]
ELSE 'score' END,
TBL1.[12], TBL1.[13], TBL1.[15]
FROM ? AS TBL1`;
    res3 = alasql(test, [res2]);
  }

  sql = 'MATRIX OF SELECT * FROM ?';
  arg = [res3];

  const result = alasql(sql, arg);

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
          name: 'n→t',
          formatter: (_, row) => {
            let nextMedal = otoge.TARGET_MEDAL_DATA_R[targetMedalKey];
            if (targetMedalKey === String(otoge.TARGET_MEDAL_DATA.length - 1)) {
              if (row.cells[4].data < 4) {
                nextMedal = 4;
              } else {
                nextMedal = row.cells[4].data + 1;
              }
            }

            return gridjs.html(`<img src="/icon/medal_${row.cells[4].data}.png" alt="${row.cells[4].data}" width="18" height="18" />`
                              + `<img src="/icon/rank_${row.cells[8].data}.png" alt="${row.cells[8].data}" width="18" height="18" />`
                              + `→${(nextMedal > 10) ? ('score')
                                : (`<img src="/icon/medal_${nextMedal}.png" alt="${nextMedal}" width="18" height="18" />`)}`);
          },
          attributes: {
            style: 'padding: 0px; text-align: center',
          },
        },
        {
          id: '5',
          // important!
          name: gridjs.html('target<br>%'),
          formatter: (_, row) => (Number.isFinite(row.cells[5].data)
            ? row.cells[5].data.toFixed(2) : row.cells[5].data),
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
          id: '6',
          name: 'c',
          formatter: (_, row) => gridjs.html(`${row.cells[6].data}<br><span style='color:gray'>(${row.cells[7].data})</span>`),
          attributes: (cell) => {
            if (cell === null) {
              return {
                colspan: '3',
              };
            }
            return {
              style: 'padding:  0px 5px 0px 0px; text-align: right; font-family: monospace',
              colspan: '2',
            };
          },
        },
        {
          id: '7',
          name: '',
          sort: 0,
          width: '1px',
          attributes: {
            style: 'display:none',
          },
        },
        {
          id: '8',
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
    [sortTarget, sortClickCount] = site.getFilterSortStatus(PAGE_NAME, '5', 2);

    if (sortClickCount > 0) {
      mainGrid.on('ready', storeSort);
    }
  } else {
    [sortTarget, sortClickCount] = site.getFilterSortStatus(PAGE_NAME, '5', 2);

    mainGrid.updateConfig({
      data,
    }).forceRender();

    if (sortClickCount > 0) {
      mainGrid.on('ready', storeSort);
    }
  }
};

function saveFilterAndSort() {
  const keyVersion = site.getKeyNames('skipstep-version', otoge.VERSION_DATA);
  const keyTarget = site.getKeyNames('skipstep-target', otoge.TARGET_MEDAL_DATA);
  const [keyMedal1, keyMedal2] = site.getKeyNames('skipstep-medal', otoge.MEDAL_DATA);
  const [keyRank1, keyRank2] = site.getKeyNames('skipstep-rank', otoge.RANK_DATA);
  const [keyLv1, keyLv2] = site.getKeyNames('skipstep-lv', otoge.LV_DATA);
  const [keyLvType1, keyLvType2] = site.getKeyNames('skipstep-lv-type', otoge.LV_TYPE_DATA);

  // save filter & sort
  const sortStatus = site.getCurrentSortStatus();

  const selectedFilter = window.localStorage.getItem(`${PAGE_NAME}.selectedFilter`) ?? '0';
  const prevFilters = JSON.parse(window.localStorage.getItem(`${PAGE_NAME}.filters`)) ?? {};
  prevFilters[selectedFilter] = {
    version: keyVersion,
    target: keyTarget,
    medal: [keyMedal1, keyMedal2],
    rank: [keyRank1, keyRank2],
    lv: [keyLv1, keyLv2],
    lv_type: [keyLvType1, keyLvType2],
    sort: sortStatus,
  };

  window.localStorage.setItem(`${PAGE_NAME}.filters`, JSON.stringify(prevFilters));
}

function updateGrid2() {
  const keyVersion = site.getKeyNames('skipstep-version', otoge.VERSION_DATA);
  const keyTarget = site.getKeyNames('skipstep-target', otoge.TARGET_MEDAL_DATA);
  const [keyMedal1, keyMedal2] = site.getKeyNames('skipstep-medal', otoge.MEDAL_DATA);
  const [keyRank1, keyRank2] = site.getKeyNames('skipstep-rank', otoge.RANK_DATA);
  const [keyLv1, keyLv2] = site.getKeyNames('skipstep-lv', otoge.LV_DATA);
  const [keyLvType1, keyLvType2] = site.getKeyNames('skipstep-lv-type', otoge.LV_TYPE_DATA);

  // for column
  targetMedalKey = keyTarget;

  const filteredData = fumenFilter(
    [keyVersion].map(Number),
    [keyTarget].map(Number),
    [keyMedal1, keyMedal2].map(Number),
    [keyRank1, keyRank2].map(Number),
    [keyLv1, keyLv2].map(Number),
    [keyLvType1, keyLvType2].map(Number),
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
      if (fumensDataRaw !== undefined && mainGrid !== undefined) {
        site.saveView();
        document.getElementById('wrapper').innerHTML = '';
        mainGrid = undefined;
        updateGrid(fumensDataRaw);
        clearTimeout(updateFilterTimer);
        updateFilterTimer = setTimeout(() => {
          updateGrid2(); // 1st filter
          if (fn) {
            fn();
          }
        }, 1000);
      }
    } else if (fumensDataRaw !== undefined && mainGrid !== undefined) {
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
    if (fumensDataRaw !== undefined && mainGrid !== undefined) {
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

    CreateSkipSlider1('version', otoge.VERSION_DATA, 0, prevFilter?.version, false);
    CreateSkipSlider1('target', otoge.TARGET_MEDAL_DATA, otoge.TARGET_MEDAL_DATA.length - 1, prevFilter?.target, false);
    CreateSkipSlider2('medal', otoge.MEDAL_DATA, prevFilter?.medal, otoge.MEDAL_DATA[otoge.MEDAL_DATA.length - 2]); // default without perfect
    CreateSkipSlider2('rank', otoge.RANK_DATA, prevFilter?.rank);
    CreateSkipSlider2('lv', otoge.LV_DATA, prevFilter?.lv);
    CreateSkipSlider2('lv-type', otoge.LV_TYPE_DATA, prevFilter?.lv_type);
  }

  $.getJSON('/api/medalrate', (medalRateData) => {
    $.getJSON('/api/fumens', (fumensData) => {
      medalRateDataRaw = medalRateData;
      fumensDataRaw = fumensData;

      updateGrid2();
    });
  });

  initializing = false;
}
