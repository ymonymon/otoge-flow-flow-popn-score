/* eslint-disable camelcase */
/* eslint-disable no-undef */
import * as site from './site_m.js';
import * as otoge from './const_m.js';

const PAGE_NAME = 'index';

let mainGrid;
let stats1Grid;
let stats2Grid;

let allData;
let filteredData;

let updateFilterTimer;

let sort_click_count;
let sort_target;

let initializing = true;

const fumenFilter = (data, version, medal, rank, score, lv, lv_type) => {
  let sql = 'MATRIX OF SELECT * FROM ?';
  let arg = [data];
  if (version[0] !== 0) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' [7] = ?';
    arg = arg.concat([otoge.VERSION_DATA_R[version[0]]]);
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
    arg = arg.concat([
      otoge.SCORE_DATA_R[score[0]],
      otoge.SCORE_DATA_R[score[1]]]);
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

  const res = alasql(sql, arg);

  return res;
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
    table.querySelector('thead tr th:nth-child(4)').style.width = '22px';
    table.querySelector('thead tr th:nth-child(5)').style.width = '22px';
  } else {
    table.querySelector('thead tr th:nth-child(1)').style.width = '50%';
    table.querySelector('thead tr th:nth-child(2)').style.width = '50%';
    table.querySelector('thead tr th:nth-child(5)').style.width = '22px';
    table.querySelector('thead tr th:nth-child(6)').style.width = '22px';
  }

  table.style.tableLayout = 'fixed';
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
    const view = JSON.parse(window.localStorage.getItem('view'));

    let nameStyle = 'padding: 0ch 1ch;';

    if (view?.align === '1') {
      nameStyle += `
        text-align: left;
      `;
    } else if (view?.align === '2') {
      nameStyle += `
        text-align: right;
      `;
    }

    if (view?.wrap === '1') {
      nameStyle += `
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
      `;
    }

    const br = (view?.break !== '1') ? '<br />' : ' ';

    let nameColumns = [];

    if (view.name === '0') {
      nameColumns = [{
        id: '0',
        name: 'title',
        formatter: (_, row) => gridjs.html(`<span style="${nameStyle}">${row.cells[0].data}</span>`),
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
        name: 'genre',
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
    } else if (view.name === '1') {
      nameColumns = [{
        id: '0',
        name: 'title',
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
        name: 'genre',
        formatter: (_, row) => gridjs.html(`<span style="${nameStyle}">${row.cells[1].data}</span>`),
        attributes: (cell) => {
          if (cell === null) {
            return undefined;
          }
          return {
            colspan: '1',
          };
        },
      }];
    } else if (view.name === '3') {
      nameColumns = [{
        id: '0',
        name: 'title',
        formatter: (_, row) => {
          const cell0Data = row.cells[0].data;
          const cell1Data = row.cells[1].data;
          const displayData = cell0Data === cell1Data ? cell0Data : `<span style="${nameStyle}">${cell0Data}${br}${cell1Data}</span>`;
          return gridjs.html(displayData);
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
        name: 'genre',
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
        name: 'title',
        formatter: (_, row) => gridjs.html(`<span style="${nameStyle}">${row.cells[0].data}${br}${row.cells[1].data}</span>`),
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
        name: 'genre',
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
          style: `background-color:${otoge.LV_TYPE_BACK_COLOR[row.cells[2].data]}; padding:0ch 0.5ch; text-align: right`,
          colspan: '2',
        };
      },
    },
    {
      id: '4',
      name: 'm',
      width: '45px',
      formatter: (cell, row) => {
        if (cell === null) {
          return undefined;
        }
        return gridjs.html(`<img src="/icon/medal_${row.cells[4].data}.png" alt="${row.cells[4].data}" width="18" height="18" />`
                            + `<img src="/icon/rank_${row.cells[5].data}.png" alt="${row.cells[5].data}" width="18" height="18">`);
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
      id: '5',
      name: 'r',
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
      id: '6',
      name: 'score',
      width: '6ch',
      formatter: (_, row) => (row.cells[6].data === -2 ? '-' : row.cells[6].data),
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
      id: '7',
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
      search: true,
      pagination: {
        enabled: true,
        limit: 20,
      },
      fixedHeader: true,
      height: '400px',
      style: {
        table: {
          width: '100%',
        },
        th: {
          padding: '0px',
          'text-align': 'center',
          'min-width': 'auto',
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
    });

    mainGrid.on('ready', onReady);
    mainGrid.render(document.getElementById('wrapper'));

    // 1st sort.
    [sort_target, sort_click_count] = site.getFilterSortStatus(PAGE_NAME, null, 0);

    if (sort_click_count > 0) {
      mainGrid.on('ready', storeSort);
    }
  } else {
    [sort_target, sort_click_count] = site.getFilterSortStatus(PAGE_NAME, null, 0);

    mainGrid.updateConfig({
      data: filteredData,
    }).forceRender();

    if (sort_click_count > 0) {
      mainGrid.on('ready', storeSort);
    }
  }
};

function getKeyNames(sliderId, dataObject) {
  const skipStepSlider = document.getElementById(sliderId);

  const sliderValues = skipStepSlider.noUiSlider.get();
  const isArray = Array.isArray(sliderValues);

  // スライダーの値が1つの場合
  if (!isArray) {
    const keyName = Object.keys(dataObject).find(
      (key) => dataObject[key] === sliderValues,
    );
    return keyName;
  }

  // スライダーの値が2つの場合
  const keyName1 = Object.keys(dataObject).find(
    (key) => dataObject[key] === sliderValues[0],
  );
  const keyName2 = Object.keys(dataObject).find(
    (key) => dataObject[key] === sliderValues[1],
  );

  return [keyName1, keyName2];
}

function saveView() {
  const key_name = getKeyNames('skipstep-name', otoge.NAME_DATA);
  const key_align = getKeyNames('skipstep-align', otoge.ALIGN_DATA);
  const key_wrap = getKeyNames('skipstep-wrap', otoge.WRAP_DATA);
  const key_break = getKeyNames('skipstep-break', otoge.BREAK_DATA);

  const prevView = {
    name: key_name,
    align: key_align,
    wrap: key_wrap,
    break: key_break,
  };

  window.localStorage.setItem('view', JSON.stringify(prevView));
}

function saveFilterAndSort() {
  const key_version = getKeyNames('skipstep-version', otoge.VERSION_DATA);
  const [key_medal1, key_medal2] = getKeyNames('skipstep-medal', otoge.MEDAL_DATA);
  const [key_rank1, key_rank2] = getKeyNames('skipstep-rank', otoge.RANK_DATA);
  const [key_score1, key_score2] = getKeyNames('skipstep-score', otoge.SCORE_DATA);
  const [key_lv1, key_lv2] = getKeyNames('skipstep-lv', otoge.LV_DATA);
  const [key_lv_type1, key_lv_type2] = getKeyNames('skipstep-lv-type', otoge.LV_TYPE_DATA);

  const sortStatus = site.getCurrentSortStatus();

  const selectedFilter = window.localStorage.getItem(`${PAGE_NAME}.selectedFilter`) ?? '0';
  const prevFilters = JSON.parse(window.localStorage.getItem(`${PAGE_NAME}.filters`)) ?? {};
  prevFilters[selectedFilter] = {
    version: key_version,
    medal: [key_medal1, key_medal2],
    rank: [key_rank1, key_rank2],
    score: [key_score1, key_score2],
    lv: [key_lv1, key_lv2],
    lv_type: [key_lv_type1, key_lv_type2],
    sort: sortStatus,
  };

  window.localStorage.setItem(`${PAGE_NAME}.filters`, JSON.stringify(prevFilters));
}

function updateGrid2() {
  const key_version = getKeyNames('skipstep-version', otoge.VERSION_DATA);
  const [key_medal1, key_medal2] = getKeyNames('skipstep-medal', otoge.MEDAL_DATA);
  const [key_rank1, key_rank2] = getKeyNames('skipstep-rank', otoge.RANK_DATA);
  const [key_score1, key_score2] = getKeyNames('skipstep-score', otoge.SCORE_DATA);
  const [key_lv1, key_lv2] = getKeyNames('skipstep-lv', otoge.LV_DATA);
  const [key_lv_type1, key_lv_type2] = getKeyNames('skipstep-lv-type', otoge.LV_TYPE_DATA);

  filteredData = fumenFilter(
    allData,
    [key_version].map(Number),
    [key_medal1, key_medal2].map(Number),
    [key_rank1, key_rank2].map(Number),
    [key_score1, key_score2].map(Number),
    [key_lv1, key_lv2].map(Number),
    [key_lv_type1, key_lv_type2].map(Number),
  );

  updateGrid(filteredData);
}

function updateStats() {
  const targetData = filteredData === undefined ? allData : filteredData;
  const res = alasql('MATRIX OF SELECT [4] AS medal, [2] AS levelType, COUNT(*) AS c FROM ? GROUP BY [4], [2]', [targetData]);
  const medalOrder = [10, 9, 8, 7, 6, 5, 4, 0, 3, 2, 1, -2];
  const levelTypeOrder = [1, 2, 3, 4];
  const statsData = [];
  const clearStats = [undefined, 0, 0, 0, 0];
  const totalStats = [undefined, 0, 0, 0, 0];

  // for (const element1 of medalOrder) {
  medalOrder.map((element1) => {
    let medalSum = 0;
    const row = [element1];

    // for (const element2 of levelTypeOrder) {
    levelTypeOrder.map((element2) => {
      const filterResult = res.filter((a) => a[0] === element1 && a[1] === element2);
      const c = filterResult.length === 0 ? 0 : filterResult[0][2];
      if (element1 === 0 || element1 >= 4) {
        clearStats[element2] += c;
      }
      totalStats[element2] += c;
      row.push(c);
      medalSum += c;

      return undefined;
    });

    row.push(medalSum);
    statsData.push(row);
    return undefined;
  });

  clearStats.push(clearStats.reduce((a, b) => (a ?? 0) + (b ?? 0)));
  clearStats[0] = 'clear';
  statsData.push(clearStats);

  totalStats.push(totalStats.reduce((a, b) => (a ?? 0) + (b ?? 0)));
  totalStats[0] = 'total';
  statsData.push(totalStats);

  if (stats1Grid === undefined) {
    stats1Grid = new gridjs.Grid({
      columns: [
        {
          id: '0',
          name: '',
          formatter: (_, row) => gridjs.html(!Number.isInteger(row.cells[0].data) ? row.cells[0].data : `<img src="/icon/medal_${row.cells[0].data}.png" alt="${row.cells[0].data}" width="18" height="18">`),
          attributes: {
            style: 'padding: 0px; text-align: center',
          },
        },
        {
          id: '1',
          name: gridjs.h('div', {
            style: {
              'background-color': '#9ED0FF',
            },
          }, 'easy'),
        },
        {
          id: '2',
          name: gridjs.h('div', {
            style: {
              'background-color': '#C1FF84',
            },
          }, 'normal'),
        },
        {
          id: '3',
          name: gridjs.h('div', {
            style: {
              'background-color': '#FFFF99',
            },
          }, 'hyper'),
        },
        {
          id: '4',
          name: gridjs.h('div', {
            style: {
              'background-color': '#FF99FF',
            },
          }, 'ex'),
        },
        {
          id: '5',
          name: 'sum',
        }],
      fixedHeader: true,
      style: {
        table: {
          width: '100%',
          'font-family': 'monospace',
        },
        th: {
          padding: '0px',
          'text-align': 'center',
        },
        td: {
          padding: '0px 5px 0px 0px',
          'text-align': 'right',
        },
      },
      data: statsData,
    }).render(document.getElementById('stats1_wrapper'));
  } else {
    stats1Grid.updateConfig({
      data: statsData,
    }).forceRender();
  }
}

function updateStats2() {
  const targetData = filteredData === undefined ? allData : filteredData;

  const resMedal = alasql('MATRIX OF SELECT [4] AS medal, COUNT(*) AS c FROM ? GROUP BY [4]', [targetData]);
  const resRank = alasql('MATRIX OF SELECT [5] AS rank, COUNT(*) AS c FROM ? GROUP BY [5]', [targetData]);
  const resScore = alasql(`MATRIX OF SELECT
CASE
WHEN 100000 <= [6] THEN '100k'
WHEN 99400 <= [6] THEN '99.4k'
WHEN 99000 <= [6] THEN '99k'
WHEN 98000 <= [6] THEN '98k'
WHEN 95000 <= [6] THEN '95k'
WHEN 90000 <= [6] THEN '90k'
WHEN 85000 <= [6] THEN '85k'
WHEN 80000 <= [6] THEN '80k'
WHEN 70000 <= [6] THEN '70k'
WHEN 0 <= [6] THEN '0'
ELSE '-2' END AS scoreHierarchy, COUNT(*) AS c FROM ?
GROUP BY
CASE
WHEN 100000 <= [6] THEN '100k'
WHEN 99400 <= [6] THEN '99.4k'
WHEN 99000 <= [6] THEN '99k'
WHEN 98000 <= [6] THEN '98k'
WHEN 95000 <= [6] THEN '95k'
WHEN 90000 <= [6] THEN '90k'
WHEN 85000 <= [6] THEN '85k'
WHEN 80000 <= [6] THEN '80k'
WHEN 70000 <= [6] THEN '70k'
WHEN 0 <= [6] THEN '0'
ELSE '-2' END`, [targetData]);
  const indexer = [...Array(12).keys()];
  const medalOrder = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -2];
  const rankOrder = [10, 9, 8, 7, 6, 5, 4, 3, -1, undefined, undefined, -2];
  const scoreTypeOrder = ['100k', '99.4k', '99k', '98k', '95k', '90k', '85k', '80k', '70k', '0', undefined, '-2'];
  const statsData = [];

  indexer.map((idx) => {
    const row = [];
    {
      const order = medalOrder[idx];
      row.push(order);
      const filterResult = resMedal.filter((a) => a[0] === order);

      if (filterResult.length === 0) {
        row.push(order === undefined ? undefined : 0);
      } else {
        row.push(filterResult[0][1]);
      }
    }
    {
      const order = rankOrder[idx];
      row.push(order);
      const filterResult = resRank.filter((a) => a[0] === order);
      if (filterResult.length === 0) {
        row.push(order === undefined ? undefined : 0);
      } else {
        row.push(filterResult[0][1]);
      }
    }
    {
      const order = scoreTypeOrder[idx];
      row.push(order);
      const filterResult = resScore.filter((a) => a[0] === order);
      if (filterResult.length === 0) {
        row.push(order === undefined ? undefined : 0);
      } else {
        row.push(filterResult[0][1]);
      }
    }
    statsData.push(row);

    return undefined;
  });

  if (stats2Grid === undefined) {
    stats2Grid = new gridjs.Grid({
      columns: [
        {
          id: '0',
          name: 'medal',
          formatter: (_, row) => gridjs.html(
            !Number.isInteger(row.cells[0].data) ? row.cells[0].data
              : `<img src="/icon/medal_${row.cells[0].data}.png" alt="${row.cells[0].data}" width="18" height="18">`,
          ),
          attributes: {
            style: 'padding: 0px; text-align: center',
          },
        },
        {
          id: '1',
          name: '',
        },
        {
          id: '2',
          name: 'rank',
          formatter: (_, row) => gridjs.html(
            !Number.isInteger(row.cells[2].data) ? row.cells[2].data
              : `<img src="/icon/rank_${row.cells[2].data}.png" alt="${row.cells[2].data}" width="18" height="18">`,
          ),
          attributes: {
            style: 'padding: 0px; text-align: center',
          },
        },
        {
          id: '3',
          name: '',
        },
        {
          id: '4',
          name: 'score',
          formatter: (_, row) => {
            if (row.cells[4].data === undefined) {
              return undefined;
            }

            return (row.cells[4].data === '-2'
              ? gridjs.html('<img src="/icon/rank_-2.png" alt="-2" width="18" height="18">') : row.cells[4].data);
          },
          attributes: {
            style: 'padding: 0px; text-align: center',
          },
        },
        {
          id: '5',
          name: '',
        },
      ],
      fixedHeader: true,
      style: {
        table: {
          width: '100%',
          'font-family': 'monospace',
        },
        th: {
          padding: '0px',
          'text-align': 'center',
        },
        td: {
          padding: '0px 5px 0px 0px',
          'text-align': 'right',
        },
      },
      data: statsData,
    }).render(document.getElementById('stats2_wrapper'));
  } else {
    stats2Grid.updateConfig({
      data: statsData,
    }).forceRender();
  }
}

function CreateSkipSlider(
  id,
  dataObject,
  defaultKey,
  prevKey,
  isView,
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
      if (allData !== undefined && mainGrid !== undefined) {
        saveView();
        document.getElementById('wrapper').innerHTML = '';
        mainGrid = undefined;
        updateGrid(allData);
        clearTimeout(updateFilterTimer);
        updateFilterTimer = setTimeout(() => {
          updateGrid2(); // 1st filter
          updateStats();
          updateStats2();
        }, 1000);
      }
    } else if (allData !== undefined && mainGrid !== undefined) {
      saveFilterAndSort();
      clearTimeout(updateFilterTimer);
      updateFilterTimer = setTimeout(() => {
        updateGrid2();
        updateStats();
        updateStats2();
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

  $.getJSON('/api/profile', (data) => {
    const arr = data[0];
    const [name, popnFriendId, chara, c1, c2, c3, comment, lastUpdate] = arr;

    document.getElementById('name').innerHTML = name;
    document.getElementById('chara').innerHTML = chara;
    document.getElementById('popnFriendId').innerHTML = popnFriendId;
    document.getElementById('creditsCount').innerHTML = `${c1} / ${c2} / ${c3}`;
    document.getElementById('comment').innerHTML = comment;
    document.getElementById('lastUpdate').innerHTML = lastUpdate;
    $('div#profile').show();
  }).fail((jqXHR) => {
    if (jqXHR.status === 404) {
      document.getElementById('name').innerHTML = 'アップロード未完了ユーザー';
      $('div#profile').show();
    }
  });

  $.getJSON('/api/values', (data) => {
    allData = data;
    updateGrid(allData); // init
    updateGrid2(); // 1st filter

    $('div#score').show();
    $('div#stats').show();
    $('div#stats2').show();
    updateStats();
    updateStats2();
  }).fail((jqXHR) => {
    if (jqXHR.status === 404) {
      allData = [];
      updateGrid(allData);
      updateGrid2();

      $('div#score').show();
      $('div#stats').show();
      $('div#stats2').show();
      updateStats();
      updateStats2();
    }
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

    // TODO : function encapsulation.
    CreateSkipSlider('name', otoge.NAME_DATA, 2, view?.name, true);
    CreateSkipSlider('align', otoge.ALIGN_DATA, 0, view?.align, true);
    CreateSkipSlider('wrap', otoge.WRAP_DATA, 0, view?.wrap, true);
    CreateSkipSlider('break', otoge.BREAK_DATA, 0, view?.break, true);
    CreateSkipSlider('version', otoge.VERSION_DATA, 0, prevFilter?.version, false);
    {
      const skipSlider = document.getElementById('skipstep-medal');
      const defaultPos = [otoge.MEDAL_DATA[0], otoge.MEDAL_DATA[otoge.MEDAL_DATA.length - 1]];
      const startPos = (prevFilter !== null
        && prevFilter.medal !== undefined
        && prevFilter.medal.length === 2)
        ? [otoge.MEDAL_DATA[prevFilter.medal[0]], otoge.MEDAL_DATA[prevFilter.medal[1]]]
        : defaultPos;

      noUiSlider.create(skipSlider, {
        range: {
          min: 0,
          max: otoge.MEDAL_DATA.length - 1,
        },
        connect: true,
        start: startPos,
        default: defaultPos,
        matchingTable: otoge.MEDAL_DATA,
        step: 1,
        tooltips: [true, true],
        format: {
          to: (key) => otoge.MEDAL_DATA[Math.round(key)],
          from: (value) => Object.keys(otoge.MEDAL_DATA).filter(
            (key) => otoge.MEDAL_DATA[key] === value,
          )[0],
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
        } else if ((skipValues[0].innerText === otoge.MEDAL_DATA[0]
                    || skipValues[0].innerHTML === otoge.MEDAL_DATA[0])
                    && (skipValues[1].innerText === otoge.MEDAL_DATA[otoge.MEDAL_DATA.length - 1]
                        || skipValues[1].innerHTML === otoge.MEDAL_DATA[
                          otoge.MEDAL_DATA.length - 1])) {
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
        if (allData !== undefined && mainGrid !== undefined) {
          saveFilterAndSort();
          clearTimeout(updateFilterTimer);
          updateFilterTimer = setTimeout(() => {
            updateGrid2();
            updateStats();
            updateStats2();
          }, 1000);
        }
      });
    }
    {
      const skipSlider = document.getElementById('skipstep-rank');
      const defaultPos = [otoge.RANK_DATA[0], otoge.RANK_DATA[otoge.RANK_DATA.length - 1]];
      const startPos = (prevFilter !== null
        && prevFilter.rank !== undefined
        && prevFilter.rank.length === 2)
        ? [otoge.RANK_DATA[prevFilter.rank[0]], otoge.RANK_DATA[prevFilter.rank[1]]]
        : defaultPos;

      noUiSlider.create(skipSlider, {
        range: {
          min: 0,
          max: otoge.RANK_DATA.length - 1,
        },
        connect: true,
        start: startPos,
        default: defaultPos,
        matchingTable: otoge.RANK_DATA,
        step: 1,
        tooltips: [true, true],
        format: {
          to: (key) => otoge.RANK_DATA[Math.round(key)],
          from: (value) => Object.keys(otoge.RANK_DATA).filter(
            (key) => otoge.RANK_DATA[key] === value,
          )[0],
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
        } else if ((skipValues[0].innerText === otoge.RANK_DATA[0]
                    || skipValues[0].innerHTML === otoge.RANK_DATA[0])
                    && (skipValues[1].innerText === otoge.RANK_DATA[otoge.RANK_DATA.length - 1]
                        || skipValues[1].innerHTML === otoge.RANK_DATA[
                          otoge.RANK_DATA.length - 1])) {
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
        if (allData !== undefined && mainGrid !== undefined) {
          saveFilterAndSort();
          clearTimeout(updateFilterTimer);
          updateFilterTimer = setTimeout(() => {
            updateGrid2();
            updateStats();
            updateStats2();
          }, 1000);
        }
      });
    }
    {
      const skipSlider = document.getElementById('skipstep-score');
      const defaultPos = [otoge.SCORE_DATA[0], otoge.SCORE_DATA[otoge.SCORE_DATA.length - 1]];
      const startPos = (prevFilter !== null
        && prevFilter.score !== undefined
        && prevFilter.score.length === 2)
        ? [otoge.SCORE_DATA[prevFilter.score[0]], otoge.SCORE_DATA[prevFilter.score[1]]]
        : defaultPos;

      noUiSlider.create(skipSlider, {
        range: {
          min: 0,
          max: otoge.SCORE_DATA.length - 1,
        },
        connect: true,
        // start: [otoge.SCORE_DATA[0], '100k'],
        start: startPos,
        default: defaultPos,
        matchingTable: otoge.SCORE_DATA,
        step: 1,
        margin: 1,
        tooltips: [true, true],
        format: {
          to: (key) => otoge.SCORE_DATA[Math.round(key)],
          from: (value) => Object.keys(otoge.SCORE_DATA).filter(
            (key) => otoge.SCORE_DATA[key] === value,
          )[0],
        },
      });

      const skipValues = [
        document.getElementById('score-lower'),
        document.getElementById('score-upper'),
        document.getElementById('score-line'),
        document.getElementById('score-same'),
      ];

      skipSlider.noUiSlider.on('update', (values, handle) => {
        const key_score = Object.keys(otoge.SCORE_DATA).filter(
          (key) => otoge.SCORE_DATA[key] === values[handle],
        )[0];

        skipValues[handle].innerHTML = otoge.SCORE_DATA_DISPLAY[key_score];

        if (values[0] === otoge.SCORE_DATA[0]
                    && values[1] === otoge.SCORE_DATA[otoge.SCORE_DATA.length - 1]) {
          skipValues[3].innerHTML = 'ALL';
          skipValues[0].style.display = 'none';
          skipValues[1].style.display = 'none';
          skipValues[2].style.display = 'none';
          skipValues[3].style.display = 'inline';
        } else {
          skipValues[0].style.display = 'inline';
          skipValues[1].style.display = 'inline';
          skipValues[2].style.display = 'inline';
          if (values[1] === otoge.SCORE_DATA[otoge.SCORE_DATA.length - 1]) {
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
        if (allData !== undefined && mainGrid !== undefined) {
          saveFilterAndSort();
          clearTimeout(updateFilterTimer);
          updateFilterTimer = setTimeout(() => {
            updateGrid2();
            updateStats();
            updateStats2();
          }, 1000);
        }
      });
    }
    {
      const skipSlider = document.getElementById('skipstep-lv');
      const defaultPos = [otoge.LV_DATA[0], otoge.LV_DATA[otoge.LV_DATA.length - 1]];
      const startPos = (prevFilter !== null
        && prevFilter.lv !== undefined
        && prevFilter.lv.length === 2)
        ? [otoge.LV_DATA[prevFilter.lv[0]], otoge.LV_DATA[prevFilter.lv[1]]]
        : defaultPos;

      noUiSlider.create(skipSlider, {
        range: {
          min: 0,
          max: otoge.LV_DATA.length - 1,
        },
        connect: true,
        start: startPos,
        default: defaultPos,
        matchingTable: otoge.LV_DATA,
        step: 1,
        tooltips: [true, true],
        format: {
          to: (key) => otoge.LV_DATA[Math.round(key)],
          from: (value) => Object.keys(otoge.LV_DATA).filter(
            (key) => otoge.LV_DATA[key] === value,
          )[0],
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
        } else if (skipValues[0].innerText === otoge.LV_DATA[0]
                    && skipValues[1].innerText === otoge.LV_DATA[otoge.LV_DATA.length - 1]) {
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
        if (allData !== undefined && mainGrid !== undefined) {
          saveFilterAndSort();
          clearTimeout(updateFilterTimer);
          updateFilterTimer = setTimeout(() => {
            updateGrid2();
            updateStats();
            updateStats2();
          }, 1000);
        }
      });
    }
    {
      const skipSlider = document.getElementById('skipstep-lv-type');
      const defaultPos = [otoge.LV_TYPE_DATA[0], otoge.LV_TYPE_DATA[otoge.LV_TYPE_DATA.length - 1]];
      const startPos = (prevFilter !== null
        && prevFilter.lv_type !== undefined
        && prevFilter.lv_type.length === 2)
        ? [otoge.LV_TYPE_DATA[prevFilter.lv_type[0]], otoge.LV_TYPE_DATA[prevFilter.lv_type[1]]]
        : defaultPos;

      noUiSlider.create(skipSlider, {
        range: {
          min: 0,
          max: otoge.LV_TYPE_DATA.length - 1,
        },
        connect: true,
        start: startPos,
        default: defaultPos,
        matchingTable: otoge.LV_TYPE_DATA,
        step: 1,
        tooltips: [true, true],
        format: {
          to: (key) => otoge.LV_TYPE_DATA[Math.round(key)],
          from: (value) => Object.keys(otoge.LV_TYPE_DATA).filter(
            (key) => otoge.LV_TYPE_DATA[key] === value,
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
        } else if (skipValues[0].innerText === otoge.LV_TYPE_DATA[0]
                    && skipValues[1].innerText === otoge.LV_TYPE_DATA[
                      otoge.LV_TYPE_DATA.length - 1]) {
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
        if (allData !== undefined && mainGrid !== undefined) {
          saveFilterAndSort();
          clearTimeout(updateFilterTimer);
          updateFilterTimer = setTimeout(() => {
            updateGrid2();
            updateStats();
            updateStats2();
          }, 1000);
        }
      });
    }
  }

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
