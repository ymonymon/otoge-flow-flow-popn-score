export const getCurrentSortStatus = () => {
    let s_target = null;
    let s_count = 0;
    const sort_button = document.querySelector('[class~=gridjs-sort-asc],[class~=gridjs-sort-desc]');
    if (sort_button !== null) {
      s_target = sort_button.parentNode.attributes['data-column-id'].nodeValue;
      s_count = sort_button.classList.contains('gridjs-sort-desc') ? 2 : 1;
    }
  
    return [s_target, s_count];
  };
  
  export const getFilterSortStatus = (pageName, defaultSort, defaultSortCount) => {
    const selectedFilter = window.localStorage.getItem(`${pageName}.selectedFilter`) ?? '0';
    const prevFilters = JSON.parse(window.localStorage.getItem(`${pageName}.filters`));
    const prevFilter =
      (prevFilters === null || !Object.prototype.hasOwnProperty.call(prevFilters, selectedFilter))
      ? null
      : prevFilters[selectedFilter];

    return (prevFilter && prevFilter.sort) ? prevFilter.sort : [defaultSort, defaultSortCount];
  };
