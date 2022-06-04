/* eslint-disable camelcase */
/* eslint-disable no-undef */
import * as site from './site_m.js';
import * as otoge from './const_m.js';

const PAGE_NAME = 'targetScore';
if (document.querySelector('h1.nologin') !== null) {
  // no login
} else {
  let mainGrid;
  let fumens_data_raw;
  let score_rate_data_raw;
  let my_music_data_raw;

  let target_score_key;

  let updateFilterTimer;

  let sort_click_count;
  let sort_target;

  let initializing = true;

  document.getElementById('filter-selection').addEventListener('click', ({ target }) => {
    if (initializing === false && target.children[0].getAttribute('name') === 'btnradio') {
      // change filter
      const selectedFilter = target.children[0].id.replace('btnradio', '');
      window.localStorage.setItem(`${PAGE_NAME}.selectedFilter`, selectedFilter);
      // load filter
      const prevFilters = JSON.parse(window.localStorage.getItem(`${PAGE_NAME}.filters`));
      const prevFilter = (prevFilters === null || !Object.prototype.hasOwnProperty.call(prevFilters, selectedFilter))
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

  {
    // load filter
    const selectedFilter = window.localStorage.getItem(`${PAGE_NAME}.selectedFilter`) ?? '0';
    document.getElementById(`btnradio${selectedFilter}`).parentNode.click();
    const prevFilters = JSON.parse(window.localStorage.getItem(`${PAGE_NAME}.filters`));
    const prevFilter = (prevFilters === null || !Object.prototype.hasOwnProperty.call(prevFilters, selectedFilter))
      ? null
      : prevFilters[selectedFilter];

    {
      const skipSlider = document.getElementById('skipstep-target');
      const defaultPos = target_score_data[target_score_data.length - 1];
      const startPos = (prevFilter !== null && prevFilter.target !== undefined)
        ? target_score_data[prevFilter.target]
        : defaultPos;

      noUiSlider.create(skipSlider, {
        range: {
          min: 0,
          max: target_score_data.length - 1,
        },
        start: startPos,
        default: defaultPos,
        matchingTable: target_score_data,
        step: 1,
        tooltips: true,
        format: {
          to: (key) => target_score_data[Math.round(key)],
          from: (value) => Object.keys(target_score_data).filter((key) => target_score_data[key] === value)[0],
        },
      });

      const skipValues = [
        document.getElementById('target-text'),
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
      const startPos = (prevFilter !== null && prevFilter.diff !== undefined && prevFilter.diff.length === 2)
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

        if (skipValues[0].innerHTML == skipValues[1].innerHTML) {
          skipValues[3].innerHTML = values[handle];
          skipValues[0].style.display = 'none';
          skipValues[1].style.display = 'none';
          skipValues[2].style.display = 'none';
          skipValues[3].style.display = 'inline';
        } else if ((skipValues[0].innerText == DIFF_DATA[0]
                  || skipValues[0].innerHTML == DIFF_DATA[0])
                  && (skipValues[1].innerText == DIFF_DATA[DIFF_DATA.length - 1]
                      || skipValues[1].innerHTML == DIFF_DATA[DIFF_DATA.length - 1])) {
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
      const startPos = (prevFilter !== null && prevFilter.medal !== undefined && prevFilter.medal.length === 2)
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
      const startPos = (prevFilter !== null && prevFilter.rank !== undefined && prevFilter.rank.length === 2)
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
      const startPos = (prevFilter !== null && prevFilter.score !== undefined && prevFilter.score.length === 2)
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
      const startPos = (prevFilter !== null && prevFilter.lv !== undefined && prevFilter.lv.length === 2)
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
      const startPos = (prevFilter !== null && prevFilter.lv_type !== undefined && prevFilter.lv_type.length === 2)
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

  const fumenFilter = (target, diff, medal, rank, score, version, lv, lv_type) => {
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
INNER JOIN ? AS TBL3 ON TBL3.[0] = TBL1.[0]`, [fumens_data_raw, score_rate_data_raw, my_music_data_raw]);

    let res2;
    if (target[0] == target_score_data.length - 1) {
      // get next
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
      // ${target_score_data_r[target[0]] + 4} is column number
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
CASE WHEN TBL1.[6] < 100000 THEN TBL1.[${target_score_data_r[target[0]] + 4}]
ELSE TBL1.[${target_score_data_r[6] + 4}] END AS [8],
${target_score_data_r[target[0]]} AS [9], -- target score 
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
    if (diff[0] !== 0 || diff[1] !== DIFF_DATA.length - 1) {
      sql += (arg.length == 1) ? ' WHERE' : ' AND';
      sql += ' ? <= [10] AND [10] <= ?';
      arg = arg.concat([DIFF_DATA_R[diff[0]], DIFF_DATA_R[diff[1]]]);
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
      if (target[0] == target_score_data.length - 1) {
        // next
        arg = arg.concat([
          score_data_r[score[0]],
          score_data_r[score[1]]]);
      } else {
        // fix target
        arg = arg.concat([
          score_data_r[score[0]],
          score_data_r[score[1]] < score_data_r[target_score_data_r[target[0]]] ? score_data_r[score[1]] : score_data_r[target_score_data_r[target[0]]],
        ]);
      }
    }

    if (version[0] !== 0) {
      sql += (arg.length == 1) ? ' WHERE' : ' AND';
      sql += ' [12] = ?';
      arg = arg.concat([VERSION_DATA_R[version[0]]]);
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

    const res4 = alasql(sql, arg);

    // remove score class/version column
    const result = res4.map((a) => [a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], a[8], a[10], a[11]]);

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
              let target_score_class = target_score_data_r[target_score_key];
              const now_score_class = scoreToScoreClass(row.cells[6].data);
              if (target_score_key == target_score_data.length - 1) {
                if (now_score_class < 10) {
                  target_score_class = now_score_class + 1;
                } else {
                  target_score_class = 10;
                }
              }

              // const now_score_class_str = target_score_class_data[now_score_class];
              let target_score_class_str = '';
              if (target_score_class <= 10) {
                target_score_class_str = target_score_class_data[target_score_class];
              }
              if (target_score_class < 4) {
                target_score_class_str = target_score_class_data[4]; // 85kから
              }

              // return now_score_class_str + '→' + target_score_class_str;
              return `→${target_score_class_str}`;
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
            formatter: (_, row) => (Number.isFinite(row.cells[8].data) ? row.cells[8].data.toFixed(2) : row.cells[8].data),
            sort: {
              compare: (a, b) => {
                const a_is_finite = isFinite(a);
                const b_is_finite = isFinite(b);
                if (!a_is_finite && !b_is_finite) {
                  return 0;
                } if (!a_is_finite) {
                  return 1;
                } if (!b_is_finite) {
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
      [sort_target, sort_click_count] = site.getFilterSortStatus(PAGE_NAME, '8', 2);

      if (sort_click_count > 0) {
        mainGrid.on('ready', storeSort);
      }
    } else {
      [sort_target, sort_click_count] = site.getFilterSortStatus(PAGE_NAME, '8', 2);

      mainGrid.updateConfig({
        data,
      }).forceRender();

      if (sort_click_count > 0) {
        mainGrid.on('ready', storeSort);
      }
    }
  };

  $.getJSON('/api/mymusic', (my_music_data) => {
    $.getJSON('/api/globalscorerate', (score_rate_data) => {
      $.getJSON('/api/fumens', (fumens_data) => {
        fumens_data_raw = fumens_data;
        score_rate_data_raw = score_rate_data;
        my_music_data_raw = my_music_data;

        updateGrid2();
      });
    });
  });

  const updateGrid2 = (filterSaveOnly) => {
    let skipSlider;
    let val;

    skipSlider = document.getElementById('skipstep-target');
    val = skipSlider.noUiSlider.get();
    const key_target = Object.keys(target_score_data).filter((key) => target_score_data[key] === val)[0];

    // for column
    target_score_key = key_target;

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
        target: key_target,
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
        [key_target].map(Number),
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
  };

  initializing = false;
}
