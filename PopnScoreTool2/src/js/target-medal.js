import * as site from './m/site_m.js';
import * as otoge from './m/const_m.js';

const PAGE_NAME = 'targetMedal';

let mainGrid;
let fumensDataRaw;
let medalRateDataRaw;
let targetMedalKey;

let updateFilterTimer;

let sortClickCount;
let sortTarget;

let initializing = true;

const fumenFilter = (
  target,
  medal,
  rank,
  version,
  lv,
  lvType,
  targetPercent,
  count,
  order,
  upper,
) => {
  const column0 = (upper === '0' || upper === '2') ? 'CONCAT(TBL1.[1], TBL1.[6]) AS [0]' : 'TBL1.[1] AS [0]';
  const column1 = (upper === '1' || upper === '2' || upper === undefined) ? 'CONCAT(TBL1.[2], TBL1.[6]) AS [1]' : 'TBL1.[2] AS [1]';

  const columnOrder = order === '1' ? `${column1}, ${column0}` : `${column0}, ${column1}`;

  const res = alasql(`MATRIX OF
SELECT ${columnOrder}, -- g/t
TBL1.[3] AS [2], TBL1.[4] AS [3], -- lv-type/lv
TBL2.[1] AS [4], -- medal
TBL2.[2] AS [5], TBL2.[3] AS [6], -- rank/score
TBL1.[5] AS [7], -- version
TBL2.[4] AS [8], -- count
TBL2.[5] AS [9], (TBL2.[5] - TBL2.[3]) AS [10], -- avg/diff
TBL2.[6] AS [11], TBL2.[7] AS [12], TBL2.[8] AS [13], TBL2.[9] AS [14], TBL2.[10] AS [15], TBL2.[11] AS [16], TBL2.[12] AS [17],
TBL2.[13] AS [18], -- count now
TBL1.[6] AS [19] -- upper 
FROM ? AS TBL1 INNER JOIN ? AS TBL2 ON TBL2.[0] = TBL1.[0]`, [fumensDataRaw, medalRateDataRaw]);

  const data = res.map((a) => [a[0], a[1],
    a[2], a[3],
    a[4],
    a[11], a[12], a[13], a[14], a[15], a[16], a[17],
    a[8],
    a[18], a[7], a[5], a[19],
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
  if (count[0] !== 0
    || count[1] !== otoge.COUNT_DATA.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';

    if (count[1] === otoge.COUNT_DATA.length - 1) {
      // ～∞
      sql += ' ? <= [12]';
      arg = arg.concat(otoge.COUNT_DATA_R[[count[0]]]);
    } else {
      sql += ' ? <= [12] AND [12] <= ?';
      arg = arg.concat([otoge.COUNT_DATA_R[count[0]],
        otoge.COUNT_DATA_R[count[1]]]);
    }
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
    TBL1.[12], TBL1.[13], TBL1.[15], TBL1.[16]
    FROM ? AS TBL1`;

    res3 = alasql(test, [res2]);
  } else {
    // ${otoge.TARGET_MEDAL_DATA_R[target[0]] + 1} is column number
    const test = `MATRIX OF
SELECT TBL1.[0], TBL1.[1], TBL1.[2], TBL1.[3], TBL1.[4],
CASE WHEN TBL1.[4] < 10 THEN TBL1.[${otoge.TARGET_MEDAL_DATA_R[target[0]] + 1}]
ELSE 'score' END,
TBL1.[12], TBL1.[13], TBL1.[15], TBL1.[16]
FROM ? AS TBL1`;

    res3 = alasql(test, [res2]);
  }

  sql = 'MATRIX OF SELECT * FROM ?';
  arg = [res3];

  if (targetPercent[0] !== 0
    || targetPercent[1] !== otoge.TARGET_PERCENT_DATA.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' ? <= [5] AND [5] <= ?';
    arg = arg.concat([otoge.TARGET_PERCENT_DATA_R[targetPercent[0]],
      otoge.TARGET_PERCENT_DATA_R[targetPercent[1]]]);
  }

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

  const tableWrapper = document.querySelector('#wrapper');
  const table = tableWrapper.querySelector('table');

  table.style.tableLayout = 'auto';

  const view = JSON.parse(window.localStorage.getItem('view'));

  if (view?.name === '0' || view?.name === '1') {
    table.querySelector('thead tr th:first-child').style.width = '100%';
    // table.querySelector('thead tr th:nth-child(4)').style.width = '22px';
    // table.querySelector('thead tr th:nth-child(5)').style.width = '22px';
  } else {
    table.querySelector('thead tr th:nth-child(1)').style.width = '50%';
    table.querySelector('thead tr th:nth-child(2)').style.width = '50%';
    // table.querySelector('thead tr th:nth-child(5)').style.width = '22px';
    // table.querySelector('thead tr th:nth-child(6)').style.width = '22px';
  }

  table.style.tableLayout = 'fixed';
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
    const view = JSON.parse(window.localStorage.getItem('view'));

    let containerStyle = `
      display: flex;
      justify-content: space-between;
      padding: 0ch 1ch;
      align-items: center;
    `;

    let middleStyle = `
      flex-grow: 1;
      padding: 0;
    `;

    let nameStyle = 'display: block;';

    if (view?.align === '0') {
      nameStyle += `
        text-align: left;
      `;
    } else if (view?.align === '2') {
      nameStyle += `
        text-align: right;
      `;
    }

    if (view?.wrap === '1') {
      containerStyle += `
        overflow: hidden;
        white-space: nowrap;  
      `;
      middleStyle += `
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;  
      `;
      nameStyle += `
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      `;
    }

    const name1 = view?.order === '1' ? 'genre' : 'title';
    const name2 = view?.order === '1' ? 'title' : 'genre';

    const br = (view?.break !== '1') ? '<br>' : ' ';

    // const Upper = (view?.upper === '3' || view?.upper === '4') ? 'UPPER' : '';
    const upperIndex = 9;

    let nameColumns = [];

    const name = view?.name;
    if (name === '0') {
      nameColumns = [{
        id: '0',
        name: name1,
        formatter: (_, row) => {
          const displayData = row.cells[0].data;
          return gridjs.html(`
<div style="${containerStyle}">
  ${(view?.upper === '3' && row.cells[upperIndex].data) ? `<span style="padding-right: 0.5ch;">${row.cells[upperIndex].data}</span>` : ''}
  <span style="${middleStyle}"><span style="${nameStyle}">${displayData}</span></span>
  ${(view?.upper === '4' && row.cells[upperIndex].data) ? `<span style="padding-left: 0.5ch;">${row.cells[upperIndex].data}</span>` : ''}
</div>
`);
        },
        attributes: (cell) => {
          if (cell === null) {
            return undefined;
          }
          return {
            colspan: '1',
          };
        },
      },
      {
        id: '1',
        name: name2,
        attributes: (cell) => {
          if (cell === null) {
            return undefined;
          }
          return {
            style: 'display:none',
          };
        },
        hidden: true,
      }];
    } else if (name === '1') {
      nameColumns = [{
        id: '0',
        name: name1,
        attributes: (cell) => {
          if (cell === null) {
            return undefined;
          }
          return {
            style: 'display:none',
          };
        },
        hidden: true,
      },
      {
        id: '1',
        name: name2,
        formatter: (_, row) => {
          const displayData = row.cells[1].data;
          return gridjs.html(`
<div style="${containerStyle}">
  ${(view?.upper === '3' && row.cells[upperIndex].data) ? `<span style="padding-right: 0.5ch;">${row.cells[upperIndex].data}</span>` : ''}
  <span style="${middleStyle}"><span style="${nameStyle}">${displayData}</span></span>
  ${(view?.upper === '4' && row.cells[upperIndex].data) ? `<span style="padding-left: 0.5ch;">${row.cells[upperIndex].data}</span>` : ''}
</div>
`);
        },
        attributes: (cell) => {
          if (cell === null) {
            return undefined;
          }
          return {
            colspan: '1',
          };
        },
      }];
    } else if (name === '3') {
      nameColumns = [{
        id: '0',
        name: name1,
        formatter: (_, row) => {
          let cell0Data = row.cells[0].data;
          let cell1Data = row.cells[1].data;
          if (cell0Data.replace(/UPPER$/, '') === cell1Data.replace(/UPPER$/, '') && cell0Data !== cell1Data) {
            if (cell1Data.length < cell0Data.length) {
              cell1Data = cell0Data;
            } else {
              cell0Data = cell1Data;
            }
          }
          const displayData = `${cell0Data}${cell0Data === cell1Data ? '' : br + cell1Data}`;
          return gridjs.html(`
<div style="${containerStyle}">
  ${(view?.upper === '3' && row.cells[upperIndex].data) ? `<span style="padding-right: 0.5ch;">${row.cells[upperIndex].data}</span>` : ''}
  <span style="${middleStyle}"><span style="${nameStyle}">${displayData}</span></span>
  ${(view?.upper === '4' && row.cells[upperIndex].data) ? `<span style="padding-left: 0.5ch;">${row.cells[upperIndex].data}</span>` : ''}
</div>
`);
        },
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
        name: name2,
        attributes: (cell) => {
          if (cell === null) {
            return undefined;
          }
          return {
            style: 'display:none',
          };
        },
      }];
    } else {
      nameColumns = [{
        id: '0',
        name: name1,
        formatter: (_, row) => {
          const displayData = `${row.cells[0].data}${br}${row.cells[1].data}`;
          return gridjs.html(`
<div style="${containerStyle}">
  ${(view?.upper === '3' && row.cells[upperIndex].data) ? `<span style="padding-right: 0.5ch;">${row.cells[upperIndex].data}</span>` : ''}
  <span style="${middleStyle}"><span style="${nameStyle}">${displayData}</span></span>
  ${(view?.upper === '4' && row.cells[upperIndex].data) ? `<span style="padding-left: 0.5ch;">${row.cells[upperIndex].data}</span>` : ''}
</div>
`);
        },
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
        name: name2,
        attributes: (cell) => {
          if (cell === null) {
            return undefined;
          }
          return {
            style: 'display:none',
          };
        },
      }];
    }

    const otherColumns = [{
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
      width: '3ch',
      attributes: (cell, row) => {
        if (cell === null) {
          return {
            colspan: '2',
          };
        }
        return {
          style: `background-color:${otoge.LV_TYPE_BACK_COLOR[row.cells[2].data]}; padding:0ch 0.5ch; text-align: right; font-family: monospace;`,
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

        return gridjs.html(`<img src="/icon/medal_${row.cells[4].data}.png" alt="${row.cells[4].data}" width="18" height="18" class="suppress-long-press">`
                          + `<img src="/icon/rank_${row.cells[8].data}.png" alt="${row.cells[8].data}" width="18" height="18" class="suppress-long-press">`
                          + `→${(nextMedal > 10) ? ('score')
                            : (`<img src="/icon/medal_${nextMedal}.png" alt="${nextMedal}" width="18" height="18" class="suppress-long-press">`)}`);
      },
      attributes: {
        style: 'padding: 0.5ch; text-align: right; width: 6ch;',
      },
    },
    {
      id: '5',
      // important!
      name: gridjs.html('target<br>%'),
      width: '5ch',
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
          style: 'padding: 0px 5px 0px 0px; text-align: right; font-family: monospace;',
        };
      },
    },
    {
      id: '6',
      name: 'c',
      width: '3ch',
      formatter: (_, row) => gridjs.html(`${row.cells[6].data}<br><span style='color:gray'>(${row.cells[7].data})</span>`),
      attributes: (cell) => {
        if (cell === null) {
          return {
            colspan: '4',
          };
        }
        return {
          style: 'padding:  0px 5px 0px 0px; text-align: right; font-family: monospace',
          colspan: '4',
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
    {
      id: '9',
      name: '',
      sort: 0,
      width: '1px',
      attributes: {
        style: 'display:none',
      },
    }];

    mainGrid = new gridjs.Grid({
      columns: [...nameColumns, ...otherColumns],
      sort: true,
      search: {
        ignoreHiddenColumns: false,
      },
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
  const keyTarget = site.getKeyNames('skipstep-target', otoge.TARGET_MEDAL_DATA);
  const [keyMedal1, keyMedal2] = site.getKeyNames('skipstep-medal', otoge.MEDAL_DATA);
  const [keyRank1, keyRank2] = site.getKeyNames('skipstep-rank', otoge.RANK_DATA);
  const keyVersion = site.getKeyNames('skipstep-version', otoge.VERSION_DATA);
  const [keyLv1, keyLv2] = site.getKeyNames('skipstep-lv', otoge.LV_DATA);
  const [keyLvType1, keyLvType2] = site.getKeyNames('skipstep-lv-type', otoge.LV_TYPE_DATA);
  const keyTargetPercent = site.getKeyNames('skipstep-target-percent', otoge.TARGET_PERCENT_DATA);
  const keyCount = site.getKeyNames('skipstep-count', otoge.COUNT_DATA);

  // save filter & sort
  const sortStatus = site.getCurrentSortStatus();

  const selectedFilter = window.localStorage.getItem(`${PAGE_NAME}.selectedFilter`) ?? '0';
  const prevFilters = JSON.parse(window.localStorage.getItem(`${PAGE_NAME}.filters`)) ?? {};
  prevFilters[selectedFilter] = {
    target: keyTarget,
    medal: [keyMedal1, keyMedal2],
    rank: [keyRank1, keyRank2],
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
  const keyVersion = site.getKeyNames('skipstep-version', otoge.VERSION_DATA);
  const keyTarget = site.getKeyNames('skipstep-target', otoge.TARGET_MEDAL_DATA);
  const [keyMedal1, keyMedal2] = site.getKeyNames('skipstep-medal', otoge.MEDAL_DATA);
  const [keyRank1, keyRank2] = site.getKeyNames('skipstep-rank', otoge.RANK_DATA);
  const [keyLv1, keyLv2] = site.getKeyNames('skipstep-lv', otoge.LV_DATA);
  const [keyLvType1, keyLvType2] = site.getKeyNames('skipstep-lv-type', otoge.LV_TYPE_DATA);
  const keyTargetPercent = site.getKeyNames('skipstep-target-percent', otoge.TARGET_PERCENT_DATA);
  const keyCount = site.getKeyNames('skipstep-count', otoge.COUNT_DATA);

  const order = JSON.parse(window.localStorage.getItem('view'))?.order;
  const upper = JSON.parse(window.localStorage.getItem('view'))?.upper;

  // for column
  targetMedalKey = keyTarget;

  const filteredData = fumenFilter(
    [keyTarget].map(Number),
    [keyMedal1, keyMedal2].map(Number),
    [keyRank1, keyRank2].map(Number),
    [keyVersion].map(Number),
    [keyLv1, keyLv2].map(Number),
    [keyLvType1, keyLvType2].map(Number),
    keyTargetPercent.map(Number),
    keyCount.map(Number),
    order,
    upper,
  );

  updateGrid(filteredData);
}

function onSliderStart() {
  clearTimeout(updateFilterTimer);
}

function onViewSliderSet(values, handle, unencoded, tap, positions, slider, callback) {
  if (!fumensDataRaw || !mainGrid) return;

  site.saveView();
  document.getElementById('wrapper').innerHTML = '';
  mainGrid = undefined;
  updateGrid(fumensDataRaw);
  clearTimeout(updateFilterTimer);
  updateFilterTimer = setTimeout(() => {
    if (callback) {
      callback();
    }
    updateGrid2(); // 1st filter
  }, 1000);
}

function onViewOrderSliderSet(values, handle, unencoded, tap, positions, slider) {
  onViewSliderSet(values, handle, unencoded, tap, positions, slider, () => {
    // When the 'order' slider is moved, we need to update the display of the 'name' slider.
    const skipSlider = document.getElementById('skipstep-name');
    const currentView = JSON.parse(window.localStorage.getItem('view'));
    const isNewOrder = currentView?.order === '1';

    const newNameData = isNewOrder ? otoge.NAME_DATA2 : otoge.NAME_DATA1;
    const oldNameData = isNewOrder ? otoge.NAME_DATA1 : otoge.NAME_DATA2;

    const findKeyByValue = (obj, value) => Object.keys(obj).find((key) => obj[key] === value);

    skipSlider.noUiSlider.updateOptions({
      format: {
        to: (key) => newNameData[Math.round(key)],
        from: (value) => findKeyByValue(newNameData, value)
          || findKeyByValue(oldNameData, value),
      },
    });
  });
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
    Array.from(document.querySelectorAll('#filter [id^=skipstep-]')).map(
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

  // accordion-item の 表示非表示処理
  const nodelist = document.querySelectorAll('.accordion-item');
  const btns = Array.prototype.slice.call(nodelist, 0);
  btns.forEach((btn) => {
    btn.addEventListener('click', (element) => {
      const ITEM_ID = element.currentTarget.parentNode.id;
      const elm = element.currentTarget.parentNode.querySelectorAll('.content')[0];
      const showStatus = JSON.parse(window.localStorage.getItem(`${PAGE_NAME}.show`)) ?? {};

      if (elm.style.display !== 'none') {
        elm.style.display = 'none';
        showStatus[ITEM_ID] = '0';
      } else {
        elm.style.display = '';
        showStatus[ITEM_ID] = '1';
      }

      window.localStorage.setItem(`${PAGE_NAME}.show`, JSON.stringify(showStatus));
    });
  });

  {
    // load filter
    const selectedFilter = window.localStorage.getItem(`${PAGE_NAME}.selectedFilter`) ?? '0';
    document.getElementById(`btnradio${selectedFilter}`).parentNode.click();
    const view = JSON.parse(window.localStorage.getItem('view'));
    const prevFilters = JSON.parse(window.localStorage.getItem(`${PAGE_NAME}.filters`));
    const prevFilter = (prevFilters === null
      || !Object.prototype.hasOwnProperty.call(prevFilters, selectedFilter))
      ? null
      : prevFilters[selectedFilter];

    const nameData = view?.order === '1' ? otoge.NAME_DATA2 : otoge.NAME_DATA1;

    // view
    site.CreateSkipSlider1('name', nameData, view?.name, onSliderStart, onViewSliderSet, 2);
    site.CreateSkipSlider1('align', otoge.ALIGN_DATA, view?.align, onSliderStart, onViewSliderSet, 1);
    site.CreateSkipSlider1('wrap', otoge.WRAP_DATA, view?.wrap, onSliderStart, onViewSliderSet, 0);
    site.CreateSkipSlider1('break', otoge.BREAK_DATA, view?.break, onSliderStart, onViewSliderSet, 0);
    site.CreateSkipSlider1('order', otoge.ORDER_DATA, view?.order, onSliderStart, onViewOrderSliderSet, 0);
    site.CreateSkipSlider1('upper', otoge.UPPER_DATA, view?.upper, onSliderStart, onViewSliderSet, 1);

    // filter
    site.CreateSkipSlider1('target', otoge.TARGET_MEDAL_DATA, prevFilter?.target, onSliderStart, onFilterSliderSet, otoge.TARGET_MEDAL_DATA.length - 1);
    site.CreateSkipSlider2('medal', otoge.MEDAL_DATA, prevFilter?.medal, onSliderStart, onFilterSliderSet, 0, otoge.MEDAL_DATA[otoge.MEDAL_DATA.length - 2]); // default without perfect
    site.CreateSkipSlider2('rank', otoge.RANK_DATA, prevFilter?.rank, onSliderStart, onFilterSliderSet);
    site.CreateSkipSlider1('version', otoge.VERSION_DATA, prevFilter?.version, onSliderStart, onFilterSliderSet, 0);
    site.CreateSkipSlider2('lv', otoge.LV_DATA, prevFilter?.lv, onSliderStart, onFilterSliderSet);
    site.CreateSkipSlider2('lv-type', otoge.LV_TYPE_DATA, prevFilter?.lv_type, onSliderStart, onFilterSliderSet);
    site.CreateSkipSlider2('target-percent', otoge.TARGET_PERCENT_DATA, prevFilter?.target_percent, onSliderStart, onFilterSliderSet, 1);
    site.CreateSkipSlider2('count', otoge.COUNT_DATA, prevFilter?.count, onSliderStart, onFilterSliderSet, 1);
  }

  $.getJSON('/api/medalrate', (medalRateData) => {
    $.getJSON('/api/fumens', (fumensData) => {
      medalRateDataRaw = medalRateData;
      fumensDataRaw = fumensData;

      updateGrid2();
    });
  });

  // local storage からの読み込み処理
  {
    const showStatus = JSON.parse(window.localStorage.getItem(`${PAGE_NAME}.show`));
    if (showStatus !== null) {
      const nodelist2 = document.querySelectorAll('.accordion-item');

      Array.from(nodelist2).map((a) => {
        const { id } = a.parentNode;
        // ls の結果から表示非表示初期対応
        if (showStatus[id]) {
          document.querySelector(`#${id} .content`).style.display = (showStatus[id] === '1') ? '' : 'none';
        }
        return undefined;
      });
    }
  }

  initializing = false;
}
