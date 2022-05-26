/* eslint-disable no-undef */

// const PAGE_NAME = 'targetMedal';
if (document.querySelector('h1.nologin') !== null) {
    // no login
} else {
    let mainGrid;
    let medal_rate_data_raw;
    let fumens_data_raw;
    let target_medal_key;

    let updateFilterTimer;

    {
        const skipSlider = document.getElementById('skipstep-version');
        noUiSlider.create(skipSlider, {
            range: {
                'min': 0,
                'max': VERSION_DATA.length - 1
            },
            start: VERSION_DATA[0],
            step: 1,
            tooltips: true,
            format: {
                to: key => {
                    return VERSION_DATA[Math.round(key)];
                },
                from: value => {
                    return Object.keys(VERSION_DATA).filter((key) => {
                        return VERSION_DATA[key] === value;
                    })[0];
                }
            }
        });

        const skipValues = [
            document.getElementById('version-text')
        ];

        skipSlider.noUiSlider.on('update', (values, handle) => {
            skipValues[handle].innerHTML = values[handle];
        });

        skipSlider.noUiSlider.on('start', () => {
            clearTimeout(updateFilterTimer);
        });

        skipSlider.noUiSlider.on('set', () => {
            if (fumens_data_raw !== undefined && mainGrid !== undefined) {
                updateFilterTimer = setTimeout(() => {
                    updateGrid2();
                }, 1000);
            }
        });
    }
    {
        const skipSlider = document.getElementById('skipstep-target');
        noUiSlider.create(skipSlider, {
            range: {
                'min': 0,
                'max': target_data.length - 1
            },
            start: target_data[target_data.length - 1],
            step: 1,
            tooltips: true,
            format: {
                to: key => {
                    return target_data[Math.round(key)];
                },
                from: value => {
                    return Object.keys(target_data).filter((key) => {
                        return target_data[key] === value;
                    })[0];
                }
            }
        });

        const skipValues = [
            document.getElementById('target-text')
        ];

        skipSlider.noUiSlider.on('update', (values, handle) => {
            skipValues[handle].innerHTML = values[handle];
        });

        skipSlider.noUiSlider.on('start', () => {
            clearTimeout(updateFilterTimer);
        });

        skipSlider.noUiSlider.on('set', () => {
            if (fumens_data_raw !== undefined && mainGrid !== undefined) {
                updateFilterTimer = setTimeout(() => {
                    updateGrid2();
                }, 1000);
            }
        });
    }
    {
        const skipSlider = document.getElementById('skipstep-medal');

        noUiSlider.create(skipSlider, {
            range: {
                'min': 0,
                'max': medal_data.length - 1
            },
            connect: true,
            start: [medal_data[0], medal_data[medal_data.length - 2]], // default without perfect
            step: 1,
            tooltips: [true, true],
            format: {
                to: key => {
                    return medal_data[Math.round(key)];
                },
                from: value => {
                    return Object.keys(medal_data).filter((key) => {
                        return medal_data[key] === value;
                    })[0];
                }
            }
        });

        const skipValues = [
            document.getElementById('medal-lower'),
            document.getElementById('medal-upper'),
            document.getElementById('medal-hyphen'),
            document.getElementById('medal-same')
        ];

        skipSlider.noUiSlider.on('update', (values, handle) => {
            skipValues[handle].innerHTML = values[handle];

            if (skipValues[0].innerHTML == skipValues[1].innerHTML) {
                skipValues[3].innerHTML = values[handle];
                skipValues[0].style.display = "none";
                skipValues[1].style.display = "none";
                skipValues[2].style.display = "none";
                skipValues[3].style.display = "inline";
            } else if ((skipValues[0].innerText == medal_data[0] ||
                skipValues[0].innerHTML == medal_data[0]) &&
                (skipValues[1].innerText == medal_data[medal_data.length - 1] ||
                    skipValues[1].innerHTML == medal_data[medal_data.length - 1])) {
                skipValues[3].innerHTML = 'ALL';
                skipValues[0].style.display = "none";
                skipValues[1].style.display = "none";
                skipValues[2].style.display = "none";
                skipValues[3].style.display = "inline";
            } else {
                skipValues[0].style.display = "inline";
                skipValues[1].style.display = "inline";
                skipValues[2].style.display = "inline";
                skipValues[3].style.display = "none";
            }
        });

        skipSlider.noUiSlider.on('start', () => {
            clearTimeout(updateFilterTimer);
        });

        skipSlider.noUiSlider.on('set', () => {
            if (fumens_data_raw !== undefined && mainGrid !== undefined) {
                updateFilterTimer = setTimeout(() => {
                    updateGrid2();
                }, 1000);
            }
        });
    }
    {
        const skipSlider = document.getElementById('skipstep-lv');

        noUiSlider.create(skipSlider, {
            range: {
                'min': 0,
                'max': lv_data.length - 1
            },
            connect: true,
            start: [lv_data[0], lv_data[lv_data.length - 1]],
            step: 1,
            tooltips: [true, true],
            format: {
                to: key => {
                    return lv_data[Math.round(key)];
                },
                from: value => {
                    return Object.keys(lv_data).filter((key) => {
                        return lv_data[key] === value;
                    })[0];
                }
            }
        });

        const skipValues = [
            document.getElementById('lv-lower'),
            document.getElementById('lv-upper'),
            document.getElementById('lv-hyphen'),
            document.getElementById('lv-same')
        ];

        skipSlider.noUiSlider.on('update', (values, handle) => {
            skipValues[handle].innerHTML = values[handle];

            if (skipValues[0].innerHTML == skipValues[1].innerHTML) {
                skipValues[3].innerHTML = values[handle];
                skipValues[0].style.display = "none";
                skipValues[1].style.display = "none";
                skipValues[2].style.display = "none";
                skipValues[3].style.display = "inline";
            } else if (skipValues[0].innerText == lv_data[0] &&
                skipValues[1].innerText == lv_data[lv_data.length - 1]) {
                skipValues[3].innerHTML = 'ALL';
                skipValues[0].style.display = "none";
                skipValues[1].style.display = "none";
                skipValues[2].style.display = "none";
                skipValues[3].style.display = "inline";
            } else {
                skipValues[0].style.display = "inline";
                skipValues[1].style.display = "inline";
                skipValues[2].style.display = "inline";
                skipValues[3].style.display = "none";
            }
        });

        skipSlider.noUiSlider.on('start', () => {
            clearTimeout(updateFilterTimer);
        });

        skipSlider.noUiSlider.on('set', () => {
            if (fumens_data_raw !== undefined && mainGrid !== undefined) {
                updateFilterTimer = setTimeout(() => {
                    updateGrid2();
                }, 1000);
            }
        });
    }
    {
        const skipSlider = document.getElementById('skipstep-lv-type');

        noUiSlider.create(skipSlider, {
            range: {
                'min': 0,
                'max': lv_type_data.length - 1
            },
            connect: true,
            start: [lv_type_data[0], lv_type_data[lv_type_data.length - 1]],
            step: 1,
            tooltips: [true, true],
            format: {
                to: key => {
                    return lv_type_data[Math.round(key)];
                },
                from: value => {
                    return Object.keys(lv_type_data).filter((key) => {
                        return lv_type_data[key] === value;
                    })[0];
                }
            }
        });

        const skipValues = [
            document.getElementById('lv-type-lower'),
            document.getElementById('lv-type-upper'),
            document.getElementById('lv-type-hyphen'),
            document.getElementById('lv-type-same')
        ];

        skipSlider.noUiSlider.on('update', (values, handle) => {
            skipValues[handle].innerHTML = values[handle];

            if (skipValues[0].innerHTML == skipValues[1].innerHTML) {
                skipValues[3].innerHTML = values[handle];
                skipValues[0].style.display = "none";
                skipValues[1].style.display = "none";
                skipValues[2].style.display = "none";
                skipValues[3].style.display = "inline";
            } else if (skipValues[0].innerText == lv_type_data[0] &&
                skipValues[1].innerText == lv_type_data[lv_type_data.length - 1]) {
                skipValues[3].innerHTML = 'ALL';
                skipValues[0].style.display = "none";
                skipValues[1].style.display = "none";
                skipValues[2].style.display = "none";
                skipValues[3].style.display = "inline";
            } else {
                skipValues[0].style.display = "inline";
                skipValues[1].style.display = "inline";
                skipValues[2].style.display = "inline";
                skipValues[3].style.display = "none";
            }
        });

        skipSlider.noUiSlider.on('start', () => {
            clearTimeout(updateFilterTimer);
        });

        skipSlider.noUiSlider.on('set', () => {
            if (fumens_data_raw !== undefined && mainGrid !== undefined) {
                updateFilterTimer = setTimeout(() => {
                    updateGrid2();
                }, 1000);
            }
        });
    }


    const fumenFilter = (version, target, medal, lv, lv_type) => {
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
FROM ? AS TBL1 INNER JOIN ? AS TBL2 ON TBL2.[0] = TBL1.[0]`, [fumens_data_raw, medal_rate_data_raw]);

        const data = res.map(a => [a[1], a[0],
            a[2], a[3],
            a[4],
            a[11], a[12], a[13], a[14], a[15], a[16], a[17],
            a[8],
            a[18], a[7]
        ]);

        let sql = 'MATRIX OF SELECT * FROM ?';
        let arg = [data];
        if (version[0] !== 0) {
            sql += (arg.length == 1) ? ' WHERE' : ' AND';
            sql += ' [14] = ?';
            arg = arg.concat([VERSION_DATA_R[version[0]]]);
        }
        if (medal[0] !== 0 || medal[1] !== medal_data.length - 1) {
            sql += (arg.length == 1) ? ' WHERE' : ' AND';
            sql += ' ? <= [4] AND [4] <= ?';

            if (target[0] == target_data.length - 1) {
                // next
                arg = arg.concat([medal_data_r[medal[0]], medal_data_r[medal[1]]]);
            } else {
                // fix target/固定ターゲットの場合は終わっているものをフィルタする。
                arg = arg.concat([medal_data_r[medal[0]],
                    medal_data_r[medal[1]] < (target_data_r[target[0]] - 1) ? medal_data_r[medal[1]] : (target_data_r[target[0]] - 1)
                ]);
            }
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

        const res2 = alasql(sql, arg);

        let result;
        if (target[0] == target_data.length - 1) {
            result = alasql(`MATRIX OF
SELECT TBL1.[0], TBL1.[1], TBL1.[2], TBL1.[3], TBL1.[4],
CASE WHEN TBL1.[4] < 4 THEN TBL1.[5]
WHEN TBL1.[4] < 5 THEN TBL1.[6]
WHEN TBL1.[4] < 6 THEN TBL1.[7]
WHEN TBL1.[4] < 7 THEN TBL1.[8]
WHEN TBL1.[4] < 8 THEN TBL1.[9]
WHEN TBL1.[4] < 9 THEN TBL1.[10]
WHEN TBL1.[4] < 10 THEN TBL1.[11]
ELSE 'score' END,
TBL1.[12], TBL1.[13]
FROM ? AS TBL1`, [res2]);

        } else {
            // ${target_data_r[target[0]] + 1} is column number
            const test = `MATRIX OF
SELECT TBL1.[0], TBL1.[1], TBL1.[2], TBL1.[3], TBL1.[4],
CASE WHEN TBL1.[4] < 10 THEN TBL1.[${target_data_r[target[0]] + 1}]
ELSE 'score' END,
TBL1.[12], TBL1.[13]
FROM ? AS TBL1`;
            result = alasql(test, [res2]);
        }



        return result;
    };

    let sort_click_count;
    let sort_target;

    // const storeSort = (...args) => {
    const storeSort = () => {
        mainGrid.off('ready', storeSort);

        // console.log('row: ' + JSON.stringify(args), args);

        setTimeout(() => {
            [...Array(sort_click_count)].map(() => $('.gridjs-th[data-column-id=' + sort_target + ']').trigger('click'));
        }, 0);
    };

    const updateGrid = data => {

        if (mainGrid === undefined) {

            mainGrid = new gridjs.Grid({
                columns: [
                    {
                        id: '0',
                        name: 'genre',
                        formatter: (_, row) => {
                            return gridjs.html(row.cells[0].data + '<br>' + row.cells[1].data);
                            /*
                            return gridjs.html((row.cells[0].data === row.cells[1].data) ?
                                row.cells[1].data :
                                (row.cells[0].data + ' / ' + row.cells[1].data));
                                */
                        },
                        attributes: (cell) => {
                            if (cell === null) {
                                return undefined;
                            } else {
                                return {
                                    'colspan': '2'
                                };
                            }
                        }
                    },
                    {
                        id: '1',
                        name: 'title',
                        attributes: (cell) => {
                            if (cell === null) {
                                return undefined;
                            } else {
                                return {
                                    'style': 'display:none'
                                };
                            }
                        }
                    },
                    {
                        id: '2',
                        name: '',
                        sort: 0,
                        width: '1px',
                        attributes: {
                            'style': 'display:none'
                        }
                    },
                    {
                        id: '3',
                        name: 'lv',
                        attributes: (cell, row) => {
                            if (cell === null) {
                                return {
                                    'colspan': '2'
                                };
                            } else {
                                return {
                                    'style': 'background-color:' +
                                        (row.cells[2].data == 1 ? '#9ED0FF' :
                                            (row.cells[2].data == 2 ? '#C1FF84' :
                                                (row.cells[2].data == 3 ? '#FFFF99' :
                                                    (row.cells[2].data == 4 ? '#FF99FF' : '#FFFFFF')))) + '; padding:0px; text-align: center',
                                    'colspan': '2'
                                };
                            }
                        }
                    },
                    {
                        id: '4',
                        name: 'n→t',
                        formatter: (_, row) => {
                            let next_medal = target_data_r[target_medal_key];
                            if (target_medal_key == target_data.length - 1) {
                                if (row.cells[4].data < 4) {
                                    next_medal = 4;
                                } else {
                                    next_medal = row.cells[4].data + 1;
                                }
                            }

                            return gridjs.html('<img src="/icon/medal_' + row.cells[4].data + '.png" alt="' + row.cells[4].data + '" width="18" height="18" />' +
                                '→' + ((10 < next_medal) ? ('score') :
                                ('<img src="/icon/medal_' + next_medal + '.png" alt="' + next_medal + '" width="18" height="18" />'))
                            );
                        },
                        attributes: {
                            'style': 'padding: 0px; text-align: center'
                        }
                    },
                    {
                        id: '5',
                        // important!
                        name: gridjs.html('target<br>%'),
                        formatter: (_, row) => {
                            return Number.isFinite(row.cells[5].data) ? row.cells[5].data.toFixed(2) : row.cells[5].data;
                        },
                        sort: {
                            compare: (a, b) => {
                                const a_is_finite = isFinite(a);
                                const b_is_finite = isFinite(b);
                                if (!a_is_finite && !b_is_finite) {
                                    return 0;
                                } else if (!a_is_finite) {
                                    return 1;
                                } else if (!b_is_finite) {
                                    return -1;
                                } else {
                                    if (a > b) {
                                        return 1;
                                    } else if (a < b) {
                                        return -1;
                                    } else {
                                        return 0;
                                    }
                                }
                            }
                        },
                        attributes: (cell) => {
                            if (cell === null) {
                                return undefined;
                            } else {
                                return {
                                    'style': 'padding:  0px 5px 0px 0px; text-align: right; font-family: monospace'
                                };
                            }
                        }
                    },
                    {
                        id: '6',
                        name: 'c',
                        formatter: (_, row) => {
                            return gridjs.html(`${row.cells[6].data}<br><span style='color:gray'>(${row.cells[7].data})</span>`);
                        },
                        attributes: (cell) => {
                            if (cell === null) {
                                return {
                                    'colspan': '2'
                                };
                            } else {
                                return {
                                    'style': 'padding:  0px 5px 0px 0px; text-align: right; font-family: monospace',
                                    'colspan': '2'
                                };
                            }
                        }
                    },
                    {
                        id: '7',
                        name: '',
                        sort: 0,
                        width: '1px',
                        attributes: {
                            'style': 'display:none'
                        },
                    },
                ],
                sort: true,
                search: true,
                pagination: {
                    enabled: true,
                    limit: 10
                },
                style: {
                    table: {
                    },
                    th: {
                        'padding': '0px',
                        'text-align': 'center'
                    },
                    td: {
                        'padding': '0px',
                        'text-align': 'center'
                    }
                },
                language: {
                    'pagination': {
                        'previous': '←',
                        'next': '→'
                    }
                },
                data: data
            }).render(document.getElementById('wrapper'));
        } else {
            let sort_a = $('.gridjs-sort-asc');
            let sort_d = $('.gridjs-sort-desc');
            sort_target = null;
            sort_click_count = 0;
            if (0 < sort_a.length) {
                sort_target = sort_a.parent()[0].attributes['data-column-id'].nodeValue;
                sort_click_count = 1;
            }
            if (0 < sort_d.length) {
                sort_target = sort_d.parent()[0].attributes['data-column-id'].nodeValue;
                sort_click_count = 2;
            }

            mainGrid.updateConfig({
                data: data
            }).forceRender();

            if (0 < sort_click_count) {
                mainGrid.on('ready', storeSort);
            }
        }
    };

    $.getJSON('/api/medalrate', medal_rate_data => {
        $.getJSON('/api/fumens', fumens_data => {
            medal_rate_data_raw = medal_rate_data;
            fumens_data_raw = fumens_data;

            updateGrid2();
        });
    });


    const updateGrid2 = () => {
        // document.getElementById('wrapper').innerHTML = '';
        let skipSlider;
        let val;

        skipSlider = document.getElementById('skipstep-version');
        val = skipSlider.noUiSlider.get();
        const key_version = Object.keys(VERSION_DATA).filter((key) => {
            return VERSION_DATA[key] === val;
        })[0];

        skipSlider = document.getElementById('skipstep-target');
        val = skipSlider.noUiSlider.get();
        const key_target = Object.keys(target_data).filter((key) => {
            return target_data[key] === val;
        })[0];

        // for column
        target_medal_key = key_target;

        skipSlider = document.getElementById('skipstep-medal');
        val = skipSlider.noUiSlider.get();
        const key_medal1 = Object.keys(medal_data).filter((key) => {
            return medal_data[key] === val[0];
        })[0];
        const key_medal2 = Object.keys(medal_data).filter((key) => {
            return medal_data[key] === val[1];
        })[0];

        skipSlider = document.getElementById('skipstep-lv');
        val = skipSlider.noUiSlider.get();
        const key_lv1 = Object.keys(lv_data).filter((key) => {
            return lv_data[key] === val[0];
        })[0];
        const key_lv2 = Object.keys(lv_data).filter((key) => {
            return lv_data[key] === val[1];
        })[0];

        skipSlider = document.getElementById('skipstep-lv-type');
        val = skipSlider.noUiSlider.get();
        const key_lv_type1 = Object.keys(lv_type_data).filter((key) => {
            return lv_type_data[key] === val[0];
        })[0];
        const key_lv_type2 = Object.keys(lv_type_data).filter((key) => {
            return lv_type_data[key] === val[1];
        })[0];


        const filteredData = fumenFilter([key_version].map(Number),
            [key_target].map(Number),
            [key_medal1, key_medal2].map(Number),
            [key_lv1, key_lv2].map(Number),
            [key_lv_type1, key_lv_type2].map(Number));

        updateGrid(filteredData);
    };
}