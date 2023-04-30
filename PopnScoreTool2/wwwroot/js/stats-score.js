import * as site from './site_m.js';
import * as otoge from './const_m.js';

const PAGE_NAME = 'statsScore';

let mainGrid;
let fumensDataRaw;
let percentileScoreDataRaw;
let oldTopScoreDataRaw;
let avgScoreDataRaw;
let myMusicDataRaw;

let updateFilterTimer;

let sortClickCount;
let sortTarget;

let initializing = true;

const fumenFilter = (stats, diff, medal, rank, score, version, lv, lvType, order, upper) => {
  const column0 = (upper === '0' || upper === '2') ? 'CONCAT(TBL1.[1], TBL1.[6]) AS [0]' : 'TBL1.[1] AS [0]';
  const column1 = (upper === '1' || upper === '2' || upper === undefined) ? 'CONCAT(TBL1.[2], TBL1.[6]) AS [1]' : 'TBL1.[2] AS [1]';

  const columnOrder = order === '1' ? `${column1}, ${column0}` : `${column0}, ${column1}`;

  // TBL1.[2] AS [0], TBL1.[1] AS [1]
  let statsColumn = 'TBL3.[2]';
  switch (stats[0]) {
    case 1:
      statsColumn = 'TBL4.[1]';
      break;
    case 2:
      statsColumn = 'TBL4.[2]';
      break;
    case 3:
      statsColumn = 'TBL4.[3]';
      break;
    case 4:
      statsColumn = 'TBL4.[4]';
      break;
    default:
      break;
  }

  // oldTopScoreDataRaw

  // AS は必須
  // 高い方のスコアを採用
  // oldTopScoreDataRawは全ての譜面行を持つがpercentileScoreDataRawは持たないのでleft join
  const percentileScoreDataRaw2 = alasql(
    `MATRIX OF
SELECT TBL1.[0] AS [0],
TBL1.[1] AS [1],
TBL1.[2] AS [2],
TBL1.[3] AS [3],
CASE WHEN TBL2.[1] IS NULL THEN TBL1.[4] ELSE (
CASE WHEN TBL1.[4] < TBL2.[1] THEN TBL2.[1] ELSE TBL1.[4] END) END AS [4]
FROM ? AS TBL1
LEFT JOIN ? AS TBL2 ON TBL2.[0] = TBL1.[0]`,
    [percentileScoreDataRaw, oldTopScoreDataRaw],
  );

  // TODO : LEFT JOIN
  const basesql = `MATRIX OF
SELECT ${columnOrder}, -- t/g
TBL1.[3] AS [2], TBL1.[4] AS [3], -- lv-type/lv
TBL2.[3] AS [4], -- score
TBL1.[5] AS [5], -- version
${statsColumn} AS [6], -- stats
((CASE TBL2.[3] WHEN -2 THEN 0 ELSE TBL2.[3] END) - ${statsColumn}) AS [7], -- diff
TBL3.[1] AS [8], -- count
TBL3.[3] AS [9], -- count now
TBL2.[1] AS [10], -- medal
TBL2.[2] AS [11], -- rank
TBL1.[6] AS [12] -- upper
FROM ? AS TBL1
INNER JOIN ? AS TBL2 ON TBL2.[0] = TBL1.[0]
INNER JOIN ? AS TBL3 ON TBL3.[0] = TBL1.[0]
INNER JOIN ? AS TBL4 ON TBL4.[0] = TBL1.[0]`;

  const res = alasql(
    basesql,
    [fumensDataRaw, myMusicDataRaw, avgScoreDataRaw, percentileScoreDataRaw2],
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
  if (lvType[0] !== 0 || lvType[1] !== otoge.LV_TYPE_DATA.length - 1) {
    sql += (arg.length === 1) ? ' WHERE' : ' AND';
    sql += ' ? <= [2] AND [2] <= ?';
    arg = arg.concat([lvType[0] + 1, lvType[1] + 1]); // +1 == to lv type
  }

  const res2 = alasql(sql, arg);

  // version除去/列番号変更
  const result = res2.map((a) => [a[0], a[1], a[2], a[3],
    a[10], a[11], a[6], a[7], a[4], a[8], a[9], a[12]]);
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
    [...Array(sortClickCount)].map(() => $(`.gridjs-th[data-column-id=${sortTarget}]`).trigger('click'));
  }, 0);
};

const updateGrid = (data) => {
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

  const br = (view?.break !== '1') ? '<br />' : ' ';

  // const Upper = (view?.upper === '3' || view?.upper === '4') ? 'UPPER' : '';
  const upperIndex = 11;

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
        const cell0Data = row.cells[0].data;
        const cell1Data = row.cells[1].data;
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
        style: `background-color:${otoge.LV_TYPE_BACK_COLOR[row.cells[2].data]}; padding:0ch 0.5ch; text-align: right`,
        colspan: '2',
      };
    },
  },
  {
    id: '4',
    name: 'm',
    width: '45px',
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
    width: '5ch',
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
    width: '4ch',
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
    width: '5ch',
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
    width: '3ch',
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
  {
    id: '11',
    name: '',
    sort: 0,
    width: '1px',
    attributes: {
      style: 'display:none',
    },
  }];

  const columnsSetting = [...nameColumns, ...otherColumns];

  if (mainGrid === undefined) {
    mainGrid = new gridjs.Grid({
      columns: columnsSetting,
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
    [sortTarget, sortClickCount] = site.getFilterSortStatus(PAGE_NAME, '7', 2);

    if (sortClickCount > 0) {
      mainGrid.on('ready', storeSort);
    }
  } else {
    [sortTarget, sortClickCount] = site.getFilterSortStatus(PAGE_NAME, '7', 2);

    mainGrid.updateConfig({
      columns: columnsSetting,
      data,
    }).forceRender();

    if (sortClickCount > 0) {
      mainGrid.on('ready', storeSort);
    }
  }
};

function saveFilterAndSort() {
  const keyStats = site.getKeyNames('skipstep-stats', otoge.STATS_DATA);
  const [keyDiff1, keyDiff2] = site.getKeyNames('skipstep-diff', otoge.DIFF_DATA);
  const [keyMedal1, keyMedal2] = site.getKeyNames('skipstep-medal', otoge.MEDAL_DATA);
  const [keyRank1, keyRank2] = site.getKeyNames('skipstep-rank', otoge.RANK_DATA);
  const [keyScore1, keyScore2] = site.getKeyNames('skipstep-score', otoge.SCORE_DATA);
  const keyVersion = site.getKeyNames('skipstep-version', otoge.VERSION_DATA);
  const [keyLv1, keyLv2] = site.getKeyNames('skipstep-lv', otoge.LV_DATA);
  const [keyLvType1, keyLvType2] = site.getKeyNames('skipstep-lv-type', otoge.LV_TYPE_DATA);

  // save filter & sort
  const sortStatus = site.getCurrentSortStatus();

  const selectedFilter = window.localStorage.getItem(`${PAGE_NAME}.selectedFilter`) ?? '0';
  const prevFilters = JSON.parse(window.localStorage.getItem(`${PAGE_NAME}.filters`)) ?? {};
  prevFilters[selectedFilter] = {
    stats: keyStats,
    diff: [keyDiff1, keyDiff2],
    medal: [keyMedal1, keyMedal2],
    rank: [keyRank1, keyRank2],
    score: [keyScore1, keyScore2],
    version: keyVersion,
    lv: [keyLv1, keyLv2],
    lv_type: [keyLvType1, keyLvType2],
    sort: sortStatus,
  };

  window.localStorage.setItem(`${PAGE_NAME}.filters`, JSON.stringify(prevFilters));
}

function updateGrid2() {
  const keyStats = site.getKeyNames('skipstep-stats', otoge.STATS_DATA);
  const [keyDiff1, keyDiff2] = site.getKeyNames('skipstep-diff', otoge.DIFF_DATA);
  const [keyMedal1, keyMedal2] = site.getKeyNames('skipstep-medal', otoge.MEDAL_DATA);
  const [keyRank1, keyRank2] = site.getKeyNames('skipstep-rank', otoge.RANK_DATA);
  const [keyScore1, keyScore2] = site.getKeyNames('skipstep-score', otoge.SCORE_DATA);
  const keyVersion = site.getKeyNames('skipstep-version', otoge.VERSION_DATA);
  const [keyLv1, keyLv2] = site.getKeyNames('skipstep-lv', otoge.LV_DATA);
  const [keyLvType1, keyLvType2] = site.getKeyNames('skipstep-lv-type', otoge.LV_TYPE_DATA);

  const order = JSON.parse(window.localStorage.getItem('view'))?.order;
  const upper = JSON.parse(window.localStorage.getItem('view'))?.upper;

  const filteredData = fumenFilter(
    [keyStats].map(Number),
    [keyDiff1, keyDiff2].map(Number),
    [keyMedal1, keyMedal2].map(Number),
    [keyRank1, keyRank2].map(Number),
    [keyScore1, keyScore2].map(Number),
    [keyVersion].map(Number),
    [keyLv1, keyLv2].map(Number),
    [keyLvType1, keyLvType2].map(Number),
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
    site.CreateSkipSlider1('stats', otoge.STATS_DATA, prevFilter?.stats, onSliderStart, onFilterSliderSet, 0);
    site.CreateSkipSlider2('diff', otoge.DIFF_DATA, prevFilter?.diff, onSliderStart, onFilterSliderSet, -1);
    site.CreateSkipSlider2('medal', otoge.MEDAL_DATA, prevFilter?.medal, onSliderStart, onFilterSliderSet);
    site.CreateSkipSlider2('rank', otoge.RANK_DATA, prevFilter?.rank, onSliderStart, onFilterSliderSet);
    site.CreateSkipSlider2('score', otoge.SCORE_DATA, prevFilter?.score, onSliderStart, onFilterSliderSet, 1, '100k', onFilterScoreSliderUpdate);
    site.CreateSkipSlider1('version', otoge.VERSION_DATA, prevFilter?.version, onSliderStart, onFilterSliderSet, 0);
    site.CreateSkipSlider2('lv', otoge.LV_DATA, prevFilter?.lv, onSliderStart, onFilterSliderSet);
    site.CreateSkipSlider2('lv-type', otoge.LV_TYPE_DATA, prevFilter?.lv_type, onSliderStart, onFilterSliderSet);
  }

  $.getJSON('/api/mymusic', (myMusicData) => {
    $.getJSON('/api/globalavgscore', (avgScoreData) => {
      $.getJSON('/api/globalpercentilescore', (percentileScoreData) => {
        $.getJSON('/api/globaloldtopscore', (oldTopScoreData) => {
          $.getJSON('/api/fumens', (fumensData) => {
            fumensDataRaw = fumensData;
            oldTopScoreDataRaw = oldTopScoreData;
            percentileScoreDataRaw = percentileScoreData;
            avgScoreDataRaw = avgScoreData;
            myMusicDataRaw = myMusicData;

            updateGrid2();
          });
        });
      });
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
