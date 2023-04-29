/* eslint-disable camelcase */
/* eslint-disable no-undef */
import * as site from './site_m.js';
import * as otoge from './const_m.js';

const PAGE_NAME = 'medalRate';

let mainGrid;
let medal_rate_data_raw;
let fumens_data_raw;

let updateFilterTimer;

let sort_click_count;
let sort_target;

let initializing = true;

const fumenFilter = (version, lv, lv_type) => {
  // AS は必須
  const res = alasql(`MATRIX OF
SELECT TBL1.[2] AS [0], TBL1.[1] AS [1], -- genre/title
TBL1.[3] AS [2], TBL1.[4] AS [3], -- lv-type/lv
TBL1.[5] AS [4], -- version
TBL2.[1] AS [5], -- count
TBL2.[2] AS [6], -- avg
TBL2.[3] AS [7], TBL2.[4] AS [8], TBL2.[5] AS [9], TBL2.[6] AS [10], TBL2.[7] AS [11], TBL2.[8] AS [12], TBL2.[9] AS [13],
TBL2.[10] AS [14] -- count now
FROM ? AS TBL1 INNER JOIN ? AS TBL2 ON TBL2.[0] = TBL1.[0]`, [fumens_data_raw, medal_rate_data_raw]);

  // avg 除去,count位置調整
  const data = res.map((a) => [a[0], a[1],
    a[2], a[3], a[4],
    a[7], a[8], a[9], a[10], a[11], a[12], a[13],
    a[5],
    a[14],
  ]);

  // filter
  let sql = 'MATRIX OF SELECT * FROM ?';
  let arg = [data];
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
  if (lv_type[0] !== 0 || lv_type[1] !== otoge.LV_TYPE_DATA.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' ? <= [2] AND [2] <= ?';
    arg = arg.concat([lv_type[0] + 1, lv_type[1] + 1]); // +1 == to lv type
  }

  const res2 = alasql(sql, arg);

  // version除去
  const result = res2.map((a) => [a[0], a[1], a[2], a[3], a[5],
    a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13]]);
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
          name: gridjs.html('<img src="/icon/medal_4.png" alt="4" width="18" height="18" />'),
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
          name: gridjs.html('<img src="/icon/medal_5.png" alt="5" width="18" height="18" />'),
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
          name: gridjs.html('<img src="/icon/medal_6.png" alt="6" width="18" height="18" />'),
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
          name: gridjs.html('<img src="/icon/medal_7.png" alt="7" width="18" height="18" />'),
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
          name: gridjs.html('<img src="/icon/medal_8.png" alt="8" width="18" height="18" />'),
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
          name: gridjs.html('<img src="/icon/medal_9.png" alt="9" width="18" height="18" />'),
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
          name: gridjs.html('<img src="/icon/medal_10.png" alt="10" width="18" height="18" />'),
          formatter: (_, row) => row.cells[10].data.toFixed(2),
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
          formatter: (_, row) => gridjs.html(`${row.cells[11].data}<br><span style='color:gray'>(${row.cells[12].data})</span>`),
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
          id: '0',
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
    [sort_target, sort_click_count] = site.getFilterSortStatus(PAGE_NAME, null, 0);

    if (sort_click_count > 0) {
      mainGrid.on('ready', storeSort);
    }
  } else {
    [sort_target, sort_click_count] = site.getFilterSortStatus(PAGE_NAME, null, 0);

    mainGrid.updateConfig({
      data,
    }).forceRender();

    if (sort_click_count > 0) {
      mainGrid.on('ready', storeSort);
    }
  }
};

function saveFilterAndSort() {
  const key_version = site.getKeyNames('skipstep-version', otoge.VERSION_DATA);
  const [key_lv1, key_lv2] = site.getKeyNames('skipstep-lv', otoge.LV_DATA);
  const [key_lv_type1, key_lv_type2] = site.getKeyNames('skipstep-lv-type', otoge.LV_TYPE_DATA);

  const sortStatus = site.getCurrentSortStatus();

  const selectedFilter = window.localStorage.getItem(`${PAGE_NAME}.selectedFilter`) ?? '0';
  const prevFilters = JSON.parse(window.localStorage.getItem(`${PAGE_NAME}.filters`)) ?? {};
  prevFilters[selectedFilter] = {
    version: key_version,
    lv: [key_lv1, key_lv2],
    lv_type: [key_lv_type1, key_lv_type2],
    sort: sortStatus,
  };

  window.localStorage.setItem(`${PAGE_NAME}.filters`, JSON.stringify(prevFilters));
}

function updateGrid2() {
  const key_version = site.getKeyNames('skipstep-version', otoge.VERSION_DATA);
  const [key_lv1, key_lv2] = site.getKeyNames('skipstep-lv', otoge.LV_DATA);
  const [key_lv_type1, key_lv_type2] = site.getKeyNames('skipstep-lv-type', otoge.LV_TYPE_DATA);

  const filteredData = fumenFilter(
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
  CreateSkipSlider2('lv', otoge.LV_DATA, prevFilter?.lv);
  CreateSkipSlider2('lv-type', otoge.LV_TYPE_DATA, prevFilter?.lv_type);
}

$.getJSON('/api/globalmedalrate', (medal_rate_data) => {
  $.getJSON('/api/fumens', (fumens_data) => {
    medal_rate_data_raw = medal_rate_data;
    fumens_data_raw = fumens_data;

    updateGrid2();
  });
});

initializing = false;
