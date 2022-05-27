/* eslint-disable no-undef */

/*
import {
    Grid,
    html
} from "https://unpkg.com/gridjs?module";
*/

const PAGE_NAME = 'index';
if (document.querySelector('h1.nologin') !== null) {
  // no login
} else {
  let mainGrid;
  let stats1Grid;
  let stats2Grid;

  let allData;
  let filteredData;

  let updateFilterTimer;

  const updateStats = () => {
    const targetData = filteredData === undefined ? allData : filteredData;
    const res = alasql('MATRIX OF SELECT [4] AS medal, [2] AS levelType, COUNT(*) AS c FROM ? GROUP BY [4], [2]', [targetData]);
    const medalOrder = [10, 9, 8, 7, 6, 5, 4, 0, 3, 2, 1, -2];
    const levelTypeOrder = [1, 2, 3, 4];
    const statsData = [];
    const clearStats = [undefined, 0, 0, 0, 0];
    const totalStats = [undefined, 0, 0, 0, 0];

    for (const element1 of medalOrder) {
      let medalSum = 0;
      const row = [element1];
      for (const element2 of levelTypeOrder) {
        const filterResult = res.filter((a) => a[0] === element1 && a[1] === element2);
        const c = filterResult.length == 0 ? 0 : filterResult[0][2];
        if (element1 == 0 || element1 >= 4) {
          clearStats[element2] += c;
        }
        totalStats[element2] += c;
        row.push(c);
        medalSum += c;
      }
      row.push(medalSum);
      statsData.push(row);
    }

    clearStats.push(clearStats.reduce((a, b) => a + b));
    clearStats[0] = 'clear';
    statsData.push(clearStats);

    totalStats.push(totalStats.reduce((a, b) => a + b));
    totalStats[0] = 'total';
    statsData.push(totalStats);

    if (stats1Grid == undefined) {
      stats1Grid = new gridjs.Grid({
        columns: [
          {
            id: '0',
            name: '',
            formatter: (_, row) => gridjs.html(!Number.isInteger(row.cells[0].data) ? row.cells[0].data
              : `<img src="/icon/medal_${row.cells[0].data}.png" alt="${row.cells[0].data}" width="18" height="18">`),
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
  };

  const updateStats2 = () => {
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

    for (const idx of indexer) {
      const row = [];
      {
        const order = medalOrder[idx];
        row.push(order);
        const filterResult = resMedal.filter((a) => a[0] === order);
        const c = filterResult.length == 0 ? (order === undefined ? undefined : 0) : filterResult[0][1];
        row.push(c);
      }
      {
        const order = rankOrder[idx];
        row.push(order);
        const filterResult = resRank.filter((a) => a[0] === order);
        const c = filterResult.length == 0 ? (order === undefined ? undefined : 0) : filterResult[0][1];
        row.push(c);
      }
      {
        const order = scoreTypeOrder[idx];
        row.push(order);
        const filterResult = resScore.filter((a) => a[0] === order);
        const c = filterResult.length == 0 ? (order === undefined ? undefined : 0) : filterResult[0][1];
        row.push(c);
      }
      statsData.push(row);
    }

    if (stats2Grid == undefined) {
      stats2Grid = new gridjs.Grid({
        columns: [
          {
            id: '0',
            name: 'medal',
            formatter: (_, row) => gridjs.html(!Number.isInteger(row.cells[0].data) ? row.cells[0].data
              : `<img src="/icon/medal_${row.cells[0].data}.png" alt="${row.cells[0].data}" width="18" height="18">`),
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
            formatter: (_, row) => gridjs.html(!Number.isInteger(row.cells[2].data) ? row.cells[2].data
              : `<img src="/icon/rank_${row.cells[2].data}.png" alt="${row.cells[2].data}" width="18" height="18">`),
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
            formatter: (_, row) => (row.cells[4].data === undefined ? undefined : (row.cells[4].data === '-2' ? gridjs.html('<img src="/icon/rank_-2.png" alt="-2" width="18" height="18">') : row.cells[4].data)),
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
  };

  $.getJSON('/api/profile', (data) => {
    const arr = data[0];
    document.getElementById('name').innerHTML = arr[0];
    document.getElementById('chara').innerHTML = arr[2];
    document.getElementById('popnFriendId').innerHTML = arr[1];
    document.getElementById('creditsCount').innerHTML = `${arr[3]} / ${arr[4]} / ${arr[5]}`;
    document.getElementById('comment').innerHTML = arr[6];
    document.getElementById('lastUpdate').innerHTML = arr[7];
    $('div#profile').show();
  }).fail((jqXHR) => {
    if (jqXHR.status == 404) {
      document.getElementById('name').innerHTML = 'アップロード未完了ユーザー';
      $('div#profile').show();
    }
  });

  const fumenFilter = (data, version, medal, rank, score, lv, lv_type) => {
    let sql = 'MATRIX OF SELECT * FROM ?';
    let arg = [data];
    if (version[0] !== 0) {
      sql += (arg.length == 1) ? ' WHERE' : ' AND';
      sql += ' [7] = ?';
      arg = arg.concat([VERSION_DATA_R[version[0]]]);
    }
    if (medal[0] !== 0 || medal[1] !== medal_data.length - 1) {
      sql += (arg.length == 1) ? ' WHERE' : ' AND';
      sql += ' ? <= [4] AND [4] <= ?';
      arg = arg.concat([medal_data_r[medal[0]], medal_data_r[medal[1]]]);
    }
    if (rank[0] !== 0 || rank[1] !== rank_data.length - 1) {
      sql += (arg.length == 1) ? ' WHERE' : ' AND';
      sql += ' ? <= [5] AND [5] <= ?';
      arg = arg.concat([rank_data_r[rank[0]], rank_data_r[rank[1]]]);
    }
    if (score[0] !== 0 || score[1] !== score_data.length - 1) {
      sql += (arg.length == 1) ? ' WHERE' : ' AND';
      sql += ' ? <= [6] AND [6] < ?';
      arg = arg.concat([
        score_data_r[score[0]],
        score_data_r[score[1]]]);
    }
    if (lv[0] !== 0 || lv[1] !== lv_data.length - 1) {
      sql += (arg.length == 1) ? ' WHERE' : ' AND';
      sql += ' ? <= [3] AND [3] <= ?';
      arg = arg.concat([lv[0] + 1, lv[1] + 1]); // +1 == to lv
    }
    if (lv_type[0] !== 0 || lv_type[1] !== lv_type_data.length - 1) {
      sql += (arg.length == 1) ? ' WHERE' : ' AND';
      sql += ' ? <= [2] AND [2] <= ?';
      arg = arg.concat([lv_type[0] + 1, lv_type[1] + 1]); // +1 == to lv type
    }

    const res = alasql(sql, arg);

    return res;
  };

  const updateGrid = (data) => {
    mainGrid = new gridjs.Grid({
      columns: [
        {
          id: '0',
          name: 'title',
          formatter: (_, row) =>
            /*
                        // 見た目が悪くなるので保留
                        if (row.cells[0].data === row.cells[1].data) {
                            return gridjs.html(row.cells[0].data);
                        } else {
                            return gridjs.html(row.cells[0].data + '<br />' + row.cells[1].data);
                        } */
            gridjs.html(`${row.cells[0].data}<br />${row.cells[1].data}`),
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
              style: `background-color:${
                row.cells[2].data == 1 ? '#9ED0FF'
                  : (row.cells[2].data == 2 ? '#C1FF84'
                    : (row.cells[2].data == 3 ? '#FFFF99'
                      : (row.cells[2].data == 4 ? '#FF99FF' : '#FFFFFF')))}; padding:0px; text-align: center`,
              colspan: '2',
            };
          },
        },
        {
          id: '4',
          name: 'm',
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
        }],
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
    }).render(document.getElementById('wrapper'));
  };

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
    if (jqXHR.status == 404) {
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

  // item の 表示非表示処理
  const nodelist = document.querySelectorAll('.item');
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

  let sort_click_count;
  let sort_target;

  // const storeSort = (...args) => {
  const storeSort = () => {
    mainGrid.off('ready', storeSort);

    // console.log('row: ' + JSON.stringify(args), args);

    setTimeout(() => {
      [...Array(sort_click_count)].map(() => $(`.gridjs-th[data-column-id=${sort_target}]`).trigger('click'));
    }, 0);
  };

  const updateGrid2 = () => {
    // document.getElementById('wrapper').innerHTML = '';
    let skipSlider;
    let val;

    skipSlider = document.getElementById('skipstep-version');
    val = skipSlider.noUiSlider.get();
    const key_version = Object.keys(VERSION_DATA).filter((key) => VERSION_DATA[key] === val)[0];

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

    skipSlider = document.getElementById('skipstep-lv');
    val = skipSlider.noUiSlider.get();
    const key_lv1 = Object.keys(lv_data).filter((key) => lv_data[key] === val[0])[0];
    const key_lv2 = Object.keys(lv_data).filter((key) => lv_data[key] === val[1])[0];

    skipSlider = document.getElementById('skipstep-lv-type');
    val = skipSlider.noUiSlider.get();
    const key_lv_type1 = Object.keys(lv_type_data).filter((key) => lv_type_data[key] === val[0])[0];
    const key_lv_type2 = Object.keys(lv_type_data).filter((key) => lv_type_data[key] === val[1])[0];

    // save filter
    localStorage.setItem(`${PAGE_NAME}.filter`, JSON.stringify({
      version: key_version,
      medal: [key_medal1, key_medal2],
      rank: [key_rank1, key_rank2],
      score: [key_score1, key_score2],
      lv: [key_lv1, key_lv2],
      lv_type: [key_lv_type1, key_lv_type2],
    }));

    filteredData = fumenFilter(
      allData,
      [key_version].map(Number),
      [key_medal1, key_medal2].map(Number),
      [key_rank1, key_rank2].map(Number),
      [key_score1, key_score2].map(Number),
      [key_lv1, key_lv2].map(Number),
      [key_lv_type1, key_lv_type2].map(Number),
    );

    const sort_a = $('.gridjs-sort-asc');
    const sort_d = $('.gridjs-sort-desc');
    sort_target = null;
    sort_click_count = 0;
    if (sort_a.length > 0) {
      sort_target = sort_a.parent()[0].attributes['data-column-id'].nodeValue;
      sort_click_count = 1;
    }
    if (sort_d.length > 0) {
      sort_target = sort_d.parent()[0].attributes['data-column-id'].nodeValue;
      sort_click_count = 2;
    }

    mainGrid.updateConfig({
      data: filteredData,
    }).forceRender();

    if (sort_click_count > 0) {
      mainGrid.on('ready', storeSort);
    }
  };
  {
    // load filter
    const prevFilter = JSON.parse(window.localStorage.getItem(`${PAGE_NAME}.filter`));

    {
      const skipSlider = document.getElementById('skipstep-version');
      const startPos = (prevFilter !== null && prevFilter.version !== null)
        ? VERSION_DATA[prevFilter.version]
        : VERSION_DATA[0];

      noUiSlider.create(skipSlider, {
        range: {
          min: 0,
          max: VERSION_DATA.length - 1,
        },
        start: startPos,
        step: 1,
        tooltips: true,
        format: {
          to: (key) => VERSION_DATA[Math.round(key)],
          from: (value) => Object.keys(VERSION_DATA).filter((key) => VERSION_DATA[key] === value)[0],
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
        if (allData !== undefined && mainGrid !== undefined) {
          updateFilterTimer = setTimeout(() => {
            updateGrid2();
            updateStats();
            updateStats2();
          }, 1000);
        }
      });
    }
    {
      const skipSlider = document.getElementById('skipstep-medal');
      const startPos = (prevFilter !== null && prevFilter.medal !== undefined && prevFilter.medal.length === 2)
        ? [medal_data[prevFilter.medal[0]], medal_data[prevFilter.medal[1]]]
        : [medal_data[0], medal_data[medal_data.length - 1]];

      noUiSlider.create(skipSlider, {
        range: {
          min: 0,
          max: medal_data.length - 1,
        },
        connect: true,
        start: startPos,
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

        if (skipValues[0].innerHTML == skipValues[1].innerHTML) {
          skipValues[3].innerHTML = values[handle];
          skipValues[0].style.display = 'none';
          skipValues[1].style.display = 'none';
          skipValues[2].style.display = 'none';
          skipValues[3].style.display = 'inline';
        } else if ((skipValues[0].innerText == medal_data[0]
                    || skipValues[0].innerHTML == medal_data[0])
                    && (skipValues[1].innerText == medal_data[medal_data.length - 1]
                        || skipValues[1].innerHTML == medal_data[medal_data.length - 1])) {
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
      const startPos = (prevFilter !== null && prevFilter.rank !== undefined && prevFilter.rank.length === 2)
        ? [rank_data[prevFilter.rank[0]], rank_data[prevFilter.rank[1]]]
        : [rank_data[0], rank_data[rank_data.length - 1]];

      noUiSlider.create(skipSlider, {
        range: {
          min: 0,
          max: rank_data.length - 1,
        },
        connect: true,
        start: startPos,
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

        if (skipValues[0].innerHTML == skipValues[1].innerHTML) {
          skipValues[3].innerHTML = values[handle];
          skipValues[0].style.display = 'none';
          skipValues[1].style.display = 'none';
          skipValues[2].style.display = 'none';
          skipValues[3].style.display = 'inline';
        } else if ((skipValues[0].innerText == rank_data[0]
                    || skipValues[0].innerHTML == rank_data[0])
                    && (skipValues[1].innerText == rank_data[rank_data.length - 1]
                        || skipValues[1].innerHTML == rank_data[rank_data.length - 1])) {
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
      const startPos = (prevFilter !== null && prevFilter.score !== undefined && prevFilter.score.length === 2)
        ? [score_data[prevFilter.score[0]], score_data[prevFilter.score[1]]]
        : [score_data[0], score_data[score_data.length - 1]];

      noUiSlider.create(skipSlider, {
        range: {
          min: 0,
          max: score_data.length - 1,
        },
        connect: true,
        start: startPos,
        // start: [score_data[0], '100k'],
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
        const key_score = Object.keys(score_data).filter((key) => score_data[key] === values[handle])[0];

        skipValues[handle].innerHTML = score_data_display[key_score];

        if (values[0] == score_data[0]
                    && values[1] == score_data[score_data.length - 1]) {
          skipValues[3].innerHTML = 'ALL';
          skipValues[0].style.display = 'none';
          skipValues[1].style.display = 'none';
          skipValues[2].style.display = 'none';
          skipValues[3].style.display = 'inline';
        } else {
          skipValues[0].style.display = 'inline';
          skipValues[1].style.display = 'inline';
          skipValues[2].style.display = 'inline';
          if (values[1] == score_data[score_data.length - 1]) {
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
      const startPos = (prevFilter !== null && prevFilter.lv !== undefined && prevFilter.lv.length === 2)
        ? [lv_data[prevFilter.lv[0]], lv_data[prevFilter.lv[1]]]
        : [lv_data[0], lv_data[lv_data.length - 1]];

      noUiSlider.create(skipSlider, {
        range: {
          min: 0,
          max: lv_data.length - 1,
        },
        connect: true,
        start: startPos,
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

        if (skipValues[0].innerHTML == skipValues[1].innerHTML) {
          skipValues[3].innerHTML = values[handle];
          skipValues[0].style.display = 'none';
          skipValues[1].style.display = 'none';
          skipValues[2].style.display = 'none';
          skipValues[3].style.display = 'inline';
        } else if (skipValues[0].innerText == lv_data[0]
                    && skipValues[1].innerText == lv_data[lv_data.length - 1]) {
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
      const startPos = (prevFilter !== null && prevFilter.lv_type !== undefined && prevFilter.lv_type.length === 2)
        ? [lv_type_data[prevFilter.lv_type[0]], lv_type_data[prevFilter.lv_type[1]]]
        : [lv_type_data[0], lv_type_data[lv_type_data.length - 1]];

      noUiSlider.create(skipSlider, {
        range: {
          min: 0,
          max: lv_type_data.length - 1,
        },
        connect: true,
        start: startPos,
        step: 1,
        tooltips: [true, true],
        format: {
          to: (key) => lv_type_data[Math.round(key)],
          from: (value) => Object.keys(lv_type_data).filter((key) => lv_type_data[key] === value)[0],
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

        if (skipValues[0].innerHTML == skipValues[1].innerHTML) {
          skipValues[3].innerHTML = values[handle];
          skipValues[0].style.display = 'none';
          skipValues[1].style.display = 'none';
          skipValues[2].style.display = 'none';
          skipValues[3].style.display = 'inline';
        } else if (skipValues[0].innerText == lv_type_data[0]
                    && skipValues[1].innerText == lv_type_data[lv_type_data.length - 1]) {
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
      const nodelist = document.querySelectorAll('.item');

      Array.from(nodelist).map((a) => {
        const { id } = a.parentNode;
        // ls の結果から表示非表示初期対応
        document.querySelector(`#${id} .content`).style.display = (showStatus[id] === '1') ? '' : 'none';
      });
    }
  }
}
