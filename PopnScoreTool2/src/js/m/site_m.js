import * as otoge from './const_m.js';

export const getCurrentSortStatus = () => {
  let sTarget = null;
  let sCount = 0;
  const sortButton = document.querySelector('[class~=gridjs-sort-asc],[class~=gridjs-sort-desc]');
  if (sortButton !== null) {
    sTarget = sortButton.parentNode.attributes['data-column-id'].nodeValue;
    sCount = sortButton.classList.contains('gridjs-sort-desc') ? 2 : 1;
  }

  return [sTarget, sCount];
};

export const getFilterSortStatus = (pageName, defaultSort, defaultSortCount) => {
  const selectedFilter = window.localStorage.getItem(`${pageName}.selectedFilter`) ?? '0';
  const prevFilters = JSON.parse(window.localStorage.getItem(`${pageName}.filters`));
  const prevFilter = (prevFilters === null
    || !Object.prototype.hasOwnProperty.call(prevFilters, selectedFilter))
    ? null
    : prevFilters[selectedFilter];

  return (prevFilter && prevFilter.sort) ? prevFilter.sort : [defaultSort, defaultSortCount];
};

export const getKeyNames = (sliderId, dataObject) => {
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
};

export const saveView = () => {
  const keyAlign = getKeyNames('skipstep-align', otoge.ALIGN_DATA);
  const keyWrap = getKeyNames('skipstep-wrap', otoge.WRAP_DATA);
  const keyBreak = getKeyNames('skipstep-break', otoge.BREAK_DATA);
  const keyOrder = getKeyNames('skipstep-order', otoge.ORDER_DATA);
  const keyUpper = getKeyNames('skipstep-upper', otoge.UPPER_DATA);
  const keyName = getKeyNames('skipstep-name', keyOrder === '1' ? otoge.NAME_DATA2 : otoge.NAME_DATA1);

  const prevView = {
    name: keyName,
    align: keyAlign,
    wrap: keyWrap,
    break: keyBreak,
    order: keyOrder,
    upper: keyUpper,
  };

  window.localStorage.setItem('view', JSON.stringify(prevView));
};

export const CreateSkipSlider1 = (
  id,
  dataObject,
  prevKey,
  onStart,
  onSet,
  defaultKey,
) => {
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

  skipSlider.noUiSlider.on('start', onStart);
  skipSlider.noUiSlider.on('set', onSet);
};

export const CreateSkipSlider2 = (
  id,
  dataObject,
  prevKeys,
  onStart,
  onSet,
  margin = 0,
  defaultPosUpper = undefined,
  updateFn = undefined,
) => {
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

  skipSlider.noUiSlider.on('start', onStart);
  skipSlider.noUiSlider.on('set', onSet);
};
