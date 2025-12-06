// src/ui/layout/tabs-bar.js

export function createTabsBar({
  tabs,
  activeTabId,
  onTabClick,
  onAddTabClick,
  onCloseTab,
}) {
  const wrapper = document.createElement('div');
  wrapper.className = 'tabs-bar';

  const totalTabs = tabs.length;

  tabs.forEach((tab) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tab';
    if (tab.id === activeTabId) {
      button.classList.add('tab--active');
    }
    if (tab.isDirty) {
      button.classList.add('tab--dirty');
    }

    // Label
    const labelSpan = document.createElement('span');
    labelSpan.className = 'tab-label';
    labelSpan.textContent = tab.label;
    button.appendChild(labelSpan);

    // Dirty dot
    if (tab.isDirty) {
      const dirtyDot = document.createElement('span');
      dirtyDot.className = 'tab-dirty-dot';
      dirtyDot.title = 'Unsynced changes – click "Update summary" to commit.';
      button.appendChild(dirtyDot);
    }

    // Close icon (only if more than one tab exists)
    if (totalTabs > 1) {
      const closeSpan = document.createElement('span');
      closeSpan.className = 'tab-close';
      closeSpan.textContent = '×';
      closeSpan.title = 'Close this quote tab';

      // Prevent the tab click from firing when closing
      closeSpan.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof onCloseTab === 'function') {
          onCloseTab(tab.id);
        }
      });

      button.appendChild(closeSpan);
    }

    button.addEventListener('click', () => {
      if (typeof onTabClick === 'function') onTabClick(tab.id);
    });

    wrapper.appendChild(button);
  });

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'tab-add-btn';
  addBtn.textContent = '+';
  addBtn.addEventListener('click', () => {
    if (typeof onAddTabClick === 'function') onAddTabClick();
  });

  wrapper.appendChild(addBtn);

  return wrapper;
}
