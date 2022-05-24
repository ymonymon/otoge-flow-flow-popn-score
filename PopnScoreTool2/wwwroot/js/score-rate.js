/* eslint-disable no-undef */
let mainGrid;
let fumens_data_raw;
let old_top_score_data_raw;
let score_rate_data_raw;

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


const fumenFilter = (version, lv, lv_type) => {
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
INNER JOIN ? AS TBL3 ON TBL3.[0] = TBL1.[0]`, [fumens_data_raw, score_rate_data_raw, old_top_score_data_raw]);

    // filter
    let sql = 'MATRIX OF SELECT * FROM ?';
    let arg = [res];
    if (version[0] !== 0) {
        sql += (arg.length == 1) ? ' WHERE' : ' AND';
        sql += ' [4] = ?';
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

    const res2 = alasql(sql, arg);

    // version除去
    const result = res2.map(a => [a[0], a[1], a[2], a[3], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12]]);
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
                    name: '85k',
                    formatter: (_, row) => {
                        return row.cells[4].data.toFixed(2);
                    },
                    attributes: (cell) => {
                        if (cell === null) {
                            return undefined;
                        } else {
                            return {
                                'style': 'padding:  0px 5px 0px 5px; text-align: right; font-family: monospace'
                            };
                        }
                    }
                },
                {
                    id: '5',
                    name: '90k',
                    formatter: (_, row) => {
                        return row.cells[5].data.toFixed(2);
                    },
                    attributes: (cell) => {
                        if (cell === null) {
                            return undefined;
                        } else {
                            return {
                                'style': 'padding:  0px 5px 0px 5px; text-align: right; font-family: monospace'
                            };
                        }
                    }
                },
                {
                    id: '6',
                    name: '95k',
                    formatter: (_, row) => {
                        return row.cells[6].data.toFixed(2);
                    },
                    attributes: (cell) => {
                        if (cell === null) {
                            return undefined;
                        } else {
                            return {
                                'style': 'padding:  0px 5px 0px 5px; text-align: right; font-family: monospace'
                            };
                        }
                    }
                },
                {
                    id: '7',
                    name: '98k',
                    formatter: (_, row) => {
                        return row.cells[7].data.toFixed(2);
                    },
                    attributes: (cell) => {
                        if (cell === null) {
                            return undefined;
                        } else {
                            return {
                                'style': 'padding:  0px 5px 0px 5px; text-align: right; font-family: monospace'
                            };
                        }
                    }
                },
                {
                    id: '8',
                    name: '99k',
                    formatter: (_, row) => {
                        return row.cells[8].data.toFixed(2);
                    },
                    attributes: (cell) => {
                        if (cell === null) {
                            return undefined;
                        } else {
                            return {
                                'style': 'padding:  0px 5px 0px 5px; text-align: right; font-family: monospace'
                            };
                        }
                    }
                },
                {
                    id: '9',
                    name: '99.4k',
                    formatter: (_, row) => {
                        return row.cells[9].data.toFixed(2);
                    },
                    attributes: (cell) => {
                        if (cell === null) {
                            return undefined;
                        } else {
                            return {
                                'style': 'padding:  0px 5px 0px 5px; text-align: right; font-family: monospace'
                            };
                        }
                    }
                },
                {
                    id: '10',
                    name: '100k',
                    formatter: (_, row) => {
                        return row.cells[10].data;
                    },
                    attributes: (cell) => {
                        if (cell === null) {
                            return undefined;
                        } else {
                            return {
                                'style': 'padding:  0px 5px 0px 5px; text-align: right; font-family: monospace'
                            };
                        }
                    }
                },
                {
                    id: '11',
                    name: 'c',
                    /*
                    formatter: (_, row) => {
                        return gridjs.html(`${row.cells[11].data}<br><span style='color:gray'>(${row.cells[12].data})</span>`);
                    },*/
                    attributes: (cell) => {
                        if (cell === null) {
                            return {
                                'colspan': '2'
                            };
                        } else {
                            return {
                                'style': 'padding:  0px 5px 0px 5px; text-align: right; font-family: monospace',
                                'colspan': '2'
                            };
                        }
                    },
                },
                {
                    id: '12',
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
                    'table-layout': 'auto',
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

$.getJSON('/api/globalscorerate', score_rate_data => {
    $.getJSON('/api/globaloldtopscore', old_top_score_data => {
        $.getJSON('/api/fumens', fumens_data => {
            fumens_data_raw = fumens_data;
            old_top_score_data_raw = old_top_score_data;
            score_rate_data_raw = score_rate_data;

            updateGrid2();
        });
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
        [key_lv1, key_lv2].map(Number),
        [key_lv_type1, key_lv_type2].map(Number));

    updateGrid(filteredData);
};
