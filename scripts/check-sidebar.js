(() => {
  const w = document.querySelector('[data-slot="sidebar-wrapper"]');
  const s = document.querySelector('[data-sidebar="sidebar"]');
  return JSON.stringify({
    wrapperDataState: w?.getAttribute('data-state'),
    wrapperDataCollapsible: w?.getAttribute('data-collapsible'),
    sidebarDataState: s?.getAttribute('data-state'),
    sidebarDataCollapsible: s?.getAttribute('data-collapsible'),
    sidebarWidth: s?.getBoundingClientRect().width,
    sidebarVisible: s ? s.getBoundingClientRect().width > 0 : null,
  });
})()
