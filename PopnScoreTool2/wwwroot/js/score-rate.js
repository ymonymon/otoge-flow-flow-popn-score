import * as site from './site_m.js';
import * as otoge from './const_m.js';

const PAGE_NAME = 'scoreRate';

let mainGrid;
let fumensDataRaw;
let oldTopScoreDataRaw;
let scoreRateDataRaw;

let updateFilterTimer;

let sortClickCount;
let sortTarget;

let initializing = true;

const fumenFilter = (version, lv, lvType) => {
  // AS は必須
  const res = alasql(`MATRIX OF
SELECT TBL1.[2] AS [0], TBL1.[1] AS [1], -- genre/title
TBL1.[3] AS [2], TBL1.[4] AS [3], -- lv-type/lv
TBL1.[5] AS [4], -- version
TBL2.[1] AS [5],
TBL2.[2] AS [6],
TBL2.[3] AS [7],
TBL2.[4] AS [8],
TBL2.[5] AS [9],
TBL2.[6] AS [10],
CASE WHEN TBL2.[8] = 0 THEN (CASE WHEN 100000 <= TBL3.[1] THEN 1 ELSE 0 END) ELSE TBL2.[8] END  AS [11],
TBL2.[9] AS [12] -- count
FROM ? AS TBL1
INNER JOIN ? AS TBL2 ON TBL2.[0] = TBL1.[0]
INNER JOIN ? AS TBL3 ON TBL3.[0] = TBL1.[0]`, [fumensDataRaw, scoreRateDataRaw, oldTopScoreDataRaw]);

  // filter
  let sql = 'MATRIX OF SELECT * FROM ?';
  let arg = [res];
  if (version[0] !== 0) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' [4] = ?';
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

  const res2 = alasql(sql, arg);

  // version除去
  const result = res2.map((a) => [a[0], a[1], a[2], a[3], a[5],
    a[6], a[7], a[8], a[9], a[10], a[11], a[12]]);
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
          name: '85k',
          formatter: (_, row) => row.cells[4].data.toFixed(2),
          attributes: (cell) => {
            if (cell === null) {
              return undefined;
            }
            return {
              style: 'padding:  0px 5px 0px 5px; text-align: right; font-family: monospace',
            };
          },
        },
        {
          id: '5',
          name: '90k',
          formatter: (_, row) => row.cells[5].data.toFixed(2),
          attributes: (cell) => {
            if (cell === null) {
              return undefined;
            }
            return {
              style: 'padding:  0px 5px 0px 5px; text-align: right; font-family: monospace',
            };
          },
        },
        {
          id: '6',
          name: '95k',
          formatter: (_, row) => row.cells[6].data.toFixed(2),
          attributes: (cell) => {
            if (cell === null) {
              return undefined;
            }
            return {
              style: 'padding:  0px 5px 0px 5px; text-align: right; font-family: monospace',
            };
          },
        },
        {
          id: '7',
          name: '98k',
          formatter: (_, row) => row.cells[7].data.toFixed(2),
          attributes: (cell) => {
            if (cell === null) {
              return undefined;
            }
            return {
              style: 'padding:  0px 5px 0px 5px; text-align: right; font-family: monospace',
            };
          },
        },
        {
          id: '8',
          name: '99k',
          formatter: (_, row) => row.cells[8].data.toFixed(2),
          attributes: (cell) => {
            if (cell === null) {
              return undefined;
            }
            return {
              style: 'padding:  0px 5px 0px 5px; text-align: right; font-family: monospace',
            };
          },
        },
        {
          id: '9',
          name: '99.4k',
          formatter: (_, row) => row.cells[9].data.toFixed(2),
          attributes: (cell) => {
            if (cell === null) {
              return undefined;
            }
            return {
              style: 'padding:  0px 5px 0px 5px; text-align: right; font-family: monospace',
            };
          },
        },
        {
          id: '10',
          name: '100k',
          formatter: (_, row) => row.cells[10].data,
          attributes: (cell) => {
            if (cell === null) {
              return undefined;
            }
            return {
              style: 'padding:  0px 5px 0px 5px; text-align: right; font-family: monospace',
            };
          },
        },
        {
          id: '11',
          name: 'c',
          /*
          formatter: (_, row) => {
              return gridjs.html(`${row.cells[11].data}<br>
                  <span style='color:gray'>(${row.cells[12].data})</span>`);
          }, */
          attributes: (cell) => {
            if (cell === null) {
              return {
                colspan: '2',
              };
            }
            return {
              style: 'padding:  0px 5px 0px 5px; text-align: right; font-family: monospace',
              colspan: '2',
            };
          },
        },
        {
          id: '12',
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
          'table-layout': 'auto',
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
    [sortTarget, sortClickCount] = site.getFilterSortStatus(PAGE_NAME, null, 0);

    if (sortClickCount > 0) {
      mainGrid.on('ready', storeSort);
    }
  } else {
    [sortTarget, sortClickCount] = site.getFilterSortStatus(PAGE_NAME, null, 0);

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
  const [keyLv1, keyLv2] = site.getKeyNames('skipstep-lv', otoge.LV_DATA);
  const [keyLvType1, keyLvType2] = site.getKeyNames('skipstep-lv-type', otoge.LV_TYPE_DATA);

  const sortStatus = site.getCurrentSortStatus();

  const selectedFilter = window.localStorage.getItem(`${PAGE_NAME}.selectedFilter`) ?? '0';
  const prevFilters = JSON.parse(window.localStorage.getItem(`${PAGE_NAME}.filters`)) ?? {};
  prevFilters[selectedFilter] = {
    version: keyVersion,
    lv: [keyLv1, keyLv2],
    lv_type: [keyLvType1, keyLvType2],
    sort: sortStatus,
  };

  window.localStorage.setItem(`${PAGE_NAME}.filters`, JSON.stringify(prevFilters));
}

function updateGrid2() {
  const keyVersion = site.getKeyNames('skipstep-version', otoge.VERSION_DATA);
  const [keyLv1, keyLv2] = site.getKeyNames('skipstep-lv', otoge.LV_DATA);
  const [keyLvType1, keyLvType2] = site.getKeyNames('skipstep-lv-type', otoge.LV_TYPE_DATA);

  const filteredData = fumenFilter(
    [keyVersion].map(Number),
    [keyLv1, keyLv2].map(Number),
    [keyLvType1, keyLvType2].map(Number),
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

  site.CreateSkipSlider1('version', otoge.VERSION_DATA, 0, prevFilter?.version, onSliderStart, onFilterSliderSet);
  site.CreateSkipSlider2('lv', otoge.LV_DATA, prevFilter?.lv, onSliderStart, onFilterSliderSet);
  site.CreateSkipSlider2('lv-type', otoge.LV_TYPE_DATA, prevFilter?.lv_type, onSliderStart, onFilterSliderSet);
}

$.getJSON('/api/globalscorerate', (scoreRateData) => {
  $.getJSON('/api/globaloldtopscore', (oldTopScoreData) => {
    $.getJSON('/api/fumens', (fumensData) => {
      fumensDataRaw = fumensData;
      oldTopScoreDataRaw = oldTopScoreData;
      scoreRateDataRaw = scoreRateData;

      updateGrid2();
    });
  });
});

initializing = false;
