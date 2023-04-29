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
  const keyName = getKeyNames('skipstep-name', otoge.NAME_DATA1);
  const keyAlign = getKeyNames('skipstep-align', otoge.ALIGN_DATA);
  const keyWrap = getKeyNames('skipstep-wrap', otoge.WRAP_DATA);
  const keyBreak = getKeyNames('skipstep-break', otoge.BREAK_DATA);
  const keyOrder = getKeyNames('skipstep-order', otoge.ORDER_DATA);
  const keyUpper = getKeyNames('skipstep-upper', otoge.UPPER_DATA);

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
