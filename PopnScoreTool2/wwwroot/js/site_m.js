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
