/**
 * CampusShare - Core Application Logic
 * Equipment Tracking & Lab Management Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    selectedCategory: 'all',
    selectedStatus: 'all',
    searchQuery: '',
    viewMode: 'grid', // 'grid' or 'table'
    activeEquipment: null,
    isScannerRunning: false
  };

  // DOM Elements
  const equipmentGrid = document.getElementById('equipmentGrid');
  const equipmentTableBody = document.getElementById('equipmentTableBody');
  const tableViewContainer = document.getElementById('tableViewContainer');
  const searchInput = document.getElementById('searchInput');
  const overdueAlertBanner = document.getElementById('overdueAlertBanner');
  const overdueCountText = document.getElementById('overdueCountText');
  const historyTableBody = document.getElementById('historyTableBody');
  const toastContainer = document.getElementById('toastContainer');

  // Modals
  const issueModal = document.getElementById('issueModal');
  const returnModal = document.getElementById('returnModal');
  const qrViewModal = document.getElementById('qrViewModal');
  const scannerModal = document.getElementById('scannerModal');
  const ptouchModal = document.getElementById('ptouchModal');
  const addAssetModal = document.getElementById('addAssetModal');
  const overdueReminderModal = document.getElementById('overdueReminderModal');

  // Forms
  const issueForm = document.getElementById('issueForm');
  const returnForm = document.getElementById('returnForm');
  const addAssetForm = document.getElementById('addAssetForm');

  // Initialize
  initApp();

  function initApp() {
    setupEventListeners();
    refreshAllViews();
  }

  function refreshAllViews() {
    window.campusDB.checkOverdueStatus();
    renderMetrics();
    renderEquipmentView();
    renderHistoryTable();
    checkOverdueBanner();
  }

  // Event Listeners
  function setupEventListeners() {
    // Search
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value.toLowerCase().trim();
        renderEquipmentView();
      });
    }

    // Category Filter Chips
    document.querySelectorAll('.filter-chip[data-category]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip[data-category]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.selectedCategory = chip.dataset.category;
        renderEquipmentView();
      });
    });

    // Status Filter Chips
    document.querySelectorAll('.filter-chip[data-status]').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip[data-status]').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.selectedStatus = chip.dataset.status;
        renderEquipmentView();
      });
    });

    // View Toggles (Grid / Table)
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.viewMode = btn.dataset.view;

        if (state.viewMode === 'grid') {
          equipmentGrid.style.display = 'grid';
          tableViewContainer.classList.remove('active');
        } else {
          equipmentGrid.style.display = 'none';
          tableViewContainer.classList.add('active');
        }
      });
    });

    // Metric Cards quick filter clicks
    document.querySelectorAll('.metric-card').forEach(card => {
      card.addEventListener('click', () => {
        const filter = card.dataset.filter;
        if (filter) {
          const chip = document.querySelector(`.filter-chip[data-status="${filter}"]`);
          if (chip) chip.click();
        }
      });
    });

    // Student ID Autocomplete in Issue Form
    const studentIdInput = document.getElementById('issueStudentId');
    if (studentIdInput) {
      studentIdInput.addEventListener('input', (e) => {
        const id = e.target.value.trim().toUpperCase();
        const found = window.campusDB.getStudentById(id);
        if (found) {
          document.getElementById('issueStudentName').value = found.name;
          document.getElementById('issueStudentDept').value = found.dept;
          document.getElementById('issueStudentPhone').value = found.phone;
        }
      });
    }

    // Return Presets
    document.querySelectorAll('.btn-preset[data-days]').forEach(btn => {
      btn.addEventListener('click', () => {
        const days = parseInt(btn.dataset.days);
        const target = new Date();
        target.setDate(target.getDate() + days);
        target.setHours(17, 0, 0, 0); // 5:00 PM default return time
        const localISO = formatLocalDateTime(target);
        document.getElementById('issueReturnDate').value = localISO;
      });
    });

    // Issue Form Submit
    if (issueForm) {
      issueForm.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          const eqId = document.getElementById('issueEquipmentId').value;
          const student = {
            id: document.getElementById('issueStudentId').value.trim().toUpperCase(),
            name: document.getElementById('issueStudentName').value.trim(),
            dept: document.getElementById('issueStudentDept').value.trim(),
            phone: document.getElementById('issueStudentPhone').value.trim()
          };
          const config = {
            issueDate: new Date().toISOString(),
            returnDate: document.getElementById('issueReturnDate').value,
            purpose: document.getElementById('issuePurpose').value.trim(),
            notes: document.getElementById('issueNotes').value.trim(),
            operator: 'Prof. Lab In-Charge'
          };

          if (!student.id || !student.name || !config.returnDate) {
            showToast('Please fill all required student and return date fields.', 'warning');
            return;
          }

          const result = window.campusDB.issueEquipment(eqId, student, config);
          window.qrEngine.playSuccessChime();
          showToast(`Successfully issued ${result.item.id} to ${student.name}!`, 'success');
          closeModal(issueModal);
          refreshAllViews();
        } catch (err) {
          showToast(err.message, 'warning');
        }
      });
    }

    // Return Form Submit
    if (returnForm) {
      returnForm.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          const eqId = document.getElementById('returnEquipmentId').value;
          const condition = document.getElementById('returnCondition').value;
          const notes = document.getElementById('returnNotes').value.trim();
          const operator = document.getElementById('returnOperator').value.trim() || 'Prof. Lab In-Charge';

          const result = window.campusDB.returnEquipment(eqId, {
            condition,
            notes,
            operator
          });

          window.qrEngine.playSuccessChime();
          showToast(`Equipment ${result.item.id} returned successfully! Status: ${result.item.status}`, 'success');
          closeModal(returnModal);
          refreshAllViews();
        } catch (err) {
          showToast(err.message, 'warning');
        }
      });
    }

    // Add Asset Form Submit
    if (addAssetForm) {
      addAssetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          const newAsset = {
            id: document.getElementById('newAssetId').value.trim().toUpperCase(),
            name: document.getElementById('newAssetName').value.trim(),
            category: document.getElementById('newAssetCategory').value,
            icon: document.getElementById('newAssetIcon').value || '📦',
            serial: document.getElementById('newAssetSerial').value.trim(),
            location: document.getElementById('newAssetLocation').value.trim(),
            condition: document.getElementById('newAssetCondition').value,
            notes: document.getElementById('newAssetNotes').value.trim()
          };

          if (!newAsset.id || !newAsset.name) {
            showToast('ID and Asset Name are required', 'warning');
            return;
          }

          const created = window.campusDB.addEquipment(newAsset);
          window.qrEngine.playSuccessChime();
          showToast(`Asset ${created.id} registered into inventory!`, 'success');
          closeModal(addAssetModal);
          addAssetForm.reset();
          refreshAllViews();
        } catch (err) {
          showToast(err.message, 'warning');
        }
      });
    }

    // Global Modal Close triggers
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    });

    document.querySelectorAll('.btn-close, .btn-cancel').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-backdrop');
        if (modal) closeModal(modal);
      });
    });

    // Reset Demo Data
    const btnResetData = document.getElementById('btnResetData');
    if (btnResetData) {
      btnResetData.addEventListener('click', () => {
        if (confirm('Reset equipment inventory to original sample data?')) {
          window.campusDB.resetToDefaults();
          showToast('Database reset to initial demo state.', 'success');
          refreshAllViews();
        }
      });
    }

    // Export Data to JSON
    const btnExportData = document.getElementById('btnExportData');
    if (btnExportData) {
      btnExportData.addEventListener('click', () => {
        const data = {
          equipment: window.campusDB.getEquipmentList(),
          history: window.campusDB.getHistory(),
          exportedAt: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CampusShare_Inventory_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('Exported complete inventory dataset.', 'success');
      });
    }

    // Print P-touch Labels
    const btnPrintLabels = document.getElementById('btnPrintLabels');
    if (btnPrintLabels) {
      btnPrintLabels.addEventListener('click', () => {
        openPTouchModal();
      });
    }

    // Quick Scanner Modal trigger
    const btnOpenScanner = document.getElementById('btnOpenScanner');
    if (btnOpenScanner) {
      btnOpenScanner.addEventListener('click', () => {
        openScannerModal();
      });
    }

    // Add Asset Modal trigger
    const btnAddAsset = document.getElementById('btnAddAsset');
    if (btnAddAsset) {
      btnAddAsset.addEventListener('click', () => {
        openModal(addAssetModal);
        // Suggest next available ID
        const list = window.campusDB.getEquipmentList();
        const nextNum = list.length + 101;
        document.getElementById('newAssetId').value = `EQ${nextNum}`;
      });
    }
  }

  // Render Metrics
  function renderMetrics() {
    const metrics = window.campusDB.getMetrics();
    document.getElementById('metricTotal').innerText = metrics.total;
    document.getElementById('metricAvailable').innerText = metrics.available;
    document.getElementById('metricIssued').innerText = metrics.issued;
    document.getElementById('metricOverdue').innerText = metrics.overdue;
  }

  // Check Overdue Banner
  function checkOverdueBanner() {
    const list = window.campusDB.getEquipmentList();
    const overdueList = list.filter(e => e.status === 'Overdue');
    if (overdueList.length > 0) {
      overdueAlertBanner.classList.add('active');
      overdueCountText.innerHTML = `<strong>${overdueList.length} Equipment Overdue!</strong> Immediate return or student reminder required.`;
    } else {
      overdueAlertBanner.classList.remove('active');
    }
  }

  // Render Equipment Cards & Table
  function renderEquipmentView() {
    const all = window.campusDB.getEquipmentList();
    const filtered = all.filter(item => {
      // Category match
      const catMatch = state.selectedCategory === 'all' || item.category.toLowerCase() === state.selectedCategory.toLowerCase();
      // Status match
      const statusMatch = state.selectedStatus === 'all' || item.status.toLowerCase() === state.selectedStatus.toLowerCase();
      // Search match
      const query = state.searchQuery;
      const searchMatch = !query ||
        item.id.toLowerCase().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.serial.toLowerCase().includes(query) ||
        (item.studentId && item.studentId.toLowerCase().includes(query)) ||
        (item.studentName && item.studentName.toLowerCase().includes(query));

      return catMatch && statusMatch && searchMatch;
    });

    // Render Cards
    equipmentGrid.innerHTML = '';
    if (filtered.length === 0) {
      equipmentGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-muted); background: var(--card-bg); border-radius: var(--radius-lg); border: 1px dashed var(--card-border);">
          <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
          <h3>No equipment matches your filters</h3>
          <p style="font-size: 0.85rem; margin-top: 4px;">Try searching for a different ID, category, or clear filters.</p>
        </div>
      `;
    } else {
      filtered.forEach(item => {
        equipmentGrid.appendChild(createEquipmentCard(item));
      });
    }

    // Render Table Rows
    equipmentTableBody.innerHTML = '';
    filtered.forEach(item => {
      equipmentTableBody.appendChild(createEquipmentTableRow(item));
    });
  }

  // Create Card Element
  function createEquipmentCard(item) {
    const card = document.createElement('div');
    card.className = 'equipment-card';

    const isIssued = item.status === 'Issued';
    const isOverdue = item.status === 'Overdue';
    const isAvailable = item.status === 'Available';

    let statusPillClass = 'available';
    if (isIssued) statusPillClass = 'issued';
    if (isOverdue) statusPillClass = 'overdue';
    if (item.status === 'Maintenance') statusPillClass = 'maintenance';

    let issuedInfoHtml = '';
    if (isIssued || isOverdue) {
      const returnFormatted = item.returnDate ? new Date(item.returnDate).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }) : 'N/A';

      const issueFormatted = item.issueDate ? new Date(item.issueDate).toLocaleString('en-US', {
        month: 'short', day: 'numeric'
      }) : 'N/A';

      issuedInfoHtml = `
        <div class="card-issue-box ${isOverdue ? 'overdue-glow' : ''}">
          <div class="issue-row">
            <span class="issue-label">Holder</span>
            <span class="issue-val">${item.studentName || 'Student'} (${item.studentId || 'N/A'})</span>
          </div>
          <div class="issue-row">
            <span class="issue-label">Issued On</span>
            <span class="issue-val">${issueFormatted}</span>
          </div>
          <div class="issue-row">
            <span class="issue-label">${isOverdue ? '⚠️ Overdue Since' : 'Return Due'}</span>
            <span class="issue-val ${isOverdue ? 'highlight-overdue' : ''}">${returnFormatted}</span>
          </div>
        </div>
      `;
    } else if (item.status === 'Maintenance') {
      issuedInfoHtml = `
        <div class="card-issue-box" style="border-color: rgba(245, 158, 11, 0.4); background: rgba(245, 158, 11, 0.08);">
          <div class="issue-row">
            <span class="issue-label">Condition</span>
            <span class="issue-val" style="color: #fcd34d;">⚠️ Damaged / Service Required</span>
          </div>
          <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 4px;">
            ${item.notes || 'Under maintenance in lab.'}
          </div>
        </div>
      `;
    } else {
      issuedInfoHtml = `
        <div class="card-issue-box" style="background: rgba(16, 185, 129, 0.05); border-color: rgba(16, 185, 129, 0.2);">
          <div class="issue-row">
            <span class="issue-label">Location</span>
            <span class="issue-val" style="color: #6ee7b7;">📍 ${item.location}</span>
          </div>
          <div class="issue-row">
            <span class="issue-label">Ready Status</span>
            <span class="issue-val" style="color: #34d399;">Ready for Immediate Checkout</span>
          </div>
        </div>
      `;
    }

    card.innerHTML = `
      <div>
        <div class="card-top">
          <div class="asset-badge-wrap">
            <div class="asset-icon-pill">${item.icon || '📦'}</div>
            <div>
              <div class="asset-id">${item.id}</div>
              <div class="asset-cat">${item.category}</div>
            </div>
          </div>
          <span class="status-pill ${statusPillClass}">
            <span class="pill-dot"></span>
            ${item.status}
          </span>
        </div>

        <h4 class="card-title">${item.name}</h4>
        <div class="card-meta-line">
          <span>SN: ${item.serial}</span>
          <span>•</span>
          <span>Used: ${item.totalIssues || 0}x</span>
        </div>

        ${issuedInfoHtml}
      </div>

      <div class="card-actions">
        ${isAvailable ? `
          <button class="btn btn-primary btn-sm btn-issue-action" style="flex: 1;" data-id="${item.id}">
            ⚡ Issue Asset
          </button>
        ` : (isIssued || isOverdue) ? `
          <button class="btn btn-outline btn-sm btn-return-action" style="flex: 1; border-color: rgba(56, 189, 248, 0.5);" data-id="${item.id}">
            📥 Return Check-in
          </button>
          ${isOverdue ? `
            <button class="btn btn-danger btn-sm btn-remind-action" title="Send WhatsApp/SMS reminder" data-id="${item.id}">
              🔔 Remind
            </button>
          ` : ''}
        ` : `
          <button class="btn btn-outline btn-sm btn-restore-action" style="flex: 1;" data-id="${item.id}">
            🛠️ Mark Repaired
          </button>
        `}
        <button class="btn btn-outline btn-sm btn-qr-action" title="View & Print QR Sticker" data-id="${item.id}">
          📱 QR Tag
        </button>
      </div>
    `;

    // Attach card event listeners
    card.querySelector('.btn-qr-action').addEventListener('click', () => openQRModal(item));

    const issueBtn = card.querySelector('.btn-issue-action');
    if (issueBtn) issueBtn.addEventListener('click', () => openIssueModal(item));

    const returnBtn = card.querySelector('.btn-return-action');
    if (returnBtn) returnBtn.addEventListener('click', () => openReturnModal(item));

    const remindBtn = card.querySelector('.btn-remind-action');
    if (remindBtn) remindBtn.addEventListener('click', () => openOverdueReminderModal(item));

    const restoreBtn = card.querySelector('.btn-restore-action');
    if (restoreBtn) {
      restoreBtn.addEventListener('click', () => {
        item.status = 'Available';
        item.condition = 'Good';
        window.campusDB.saveEquipmentList(window.campusDB.getEquipmentList());
        showToast(`${item.id} repaired and marked Available!`, 'success');
        refreshAllViews();
      });
    }

    return card;
  }

  // Create Table Row Element
  function createEquipmentTableRow(item) {
    const tr = document.createElement('tr');
    const isIssued = item.status === 'Issued';
    const isOverdue = item.status === 'Overdue';

    let statusPillClass = 'available';
    if (isIssued) statusPillClass = 'issued';
    if (isOverdue) statusPillClass = 'overdue';
    if (item.status === 'Maintenance') statusPillClass = 'maintenance';

    const returnFormatted = item.returnDate ? new Date(item.returnDate).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : '—';

    tr.innerHTML = `
      <td style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-blue);">${item.id}</td>
      <td>
        <div style="font-weight: 600;">${item.name}</div>
        <div style="font-size: 0.72rem; color: var(--text-dim);">${item.serial}</div>
      </td>
      <td>${item.category}</td>
      <td>
        <span class="status-pill ${statusPillClass}">
          <span class="pill-dot"></span>
          ${item.status}
        </span>
      </td>
      <td>
        ${item.studentName ? `
          <div style="font-weight: 600;">${item.studentName}</div>
          <div style="font-size: 0.72rem; color: var(--text-dim);">${item.studentId} • ${item.studentPhone || ''}</div>
        ` : '<span style="color: var(--text-dim);">In Lab Storage</span>'}
      </td>
      <td style="${isOverdue ? 'color: #fda4af; font-weight: bold;' : ''}">
        ${returnFormatted}
      </td>
      <td>
        <div style="display: flex; gap: 6px;">
          <button class="btn btn-outline btn-sm table-btn-qr" data-id="${item.id}" title="QR Code">📱</button>
          ${item.status === 'Available' ? `
            <button class="btn btn-primary btn-sm table-btn-issue" data-id="${item.id}">Issue</button>
          ` : (isIssued || isOverdue) ? `
            <button class="btn btn-outline btn-sm table-btn-return" data-id="${item.id}">Return</button>
          ` : ''}
        </div>
      </td>
    `;

    tr.querySelector('.table-btn-qr').addEventListener('click', () => openQRModal(item));
    const tblIssue = tr.querySelector('.table-btn-issue');
    if (tblIssue) tblIssue.addEventListener('click', () => openIssueModal(item));
    const tblReturn = tr.querySelector('.table-btn-return');
    if (tblReturn) tblReturn.addEventListener('click', () => openReturnModal(item));

    return tr;
  }

  // Render History Table
  function renderHistoryTable() {
    const history = window.campusDB.getHistory();
    historyTableBody.innerHTML = '';

    history.slice(0, 15).forEach(txn => {
      const tr = document.createElement('tr');
      const dateFormatted = new Date(txn.timestamp).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      let actionBadge = `<span class="status-pill issued">${txn.action}</span>`;
      if (txn.action === 'RETURNED') actionBadge = `<span class="status-pill available">RETURNED</span>`;
      if (txn.action === 'RETURNED_DAMAGED') actionBadge = `<span class="status-pill maintenance">DAMAGED</span>`;
      if (txn.action === 'REGISTERED') actionBadge = `<span class="status-pill" style="background: rgba(168, 85, 247, 0.15); color: #c084fc;">NEW ASSET</span>`;

      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-dim);">${txn.id}</td>
        <td>${dateFormatted}</td>
        <td style="font-family: var(--font-mono); font-weight: bold; color: var(--accent-blue);">${txn.equipmentId}</td>
        <td>${txn.equipmentName}</td>
        <td>${txn.studentName || '—'} <span style="color: var(--text-dim); font-size: 0.72rem;">(${txn.studentId || ''})</span></td>
        <td>${actionBadge}</td>
        <td style="font-size: 0.78rem; color: var(--text-muted);">${txn.remarks || '—'}</td>
      `;
      historyTableBody.appendChild(tr);
    });
  }

  // Open Issue Modal
  function openIssueModal(item) {
    state.activeEquipment = item;
    document.getElementById('issueEquipmentId').value = item.id;
    document.getElementById('issueEquipmentSummary').innerText = `${item.name} (${item.serial})`;

    // Default return date: tomorrow at 5:00 PM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(17, 0, 0, 0);
    document.getElementById('issueReturnDate').value = formatLocalDateTime(tomorrow);

    openModal(issueModal);
  }

  // Open Return Modal
  function openReturnModal(item) {
    state.activeEquipment = item;
    document.getElementById('returnEquipmentId').value = item.id;
    document.getElementById('returnEquipmentSummary').innerText = `${item.name} (Held by: ${item.studentName || 'Student'} - ${item.studentId || ''})`;
    document.getElementById('returnCondition').value = item.condition || 'Good';
    document.getElementById('returnNotes').value = '';

    openModal(returnModal);
  }

  // Open QR Tag Modal
  function openQRModal(item) {
    state.activeEquipment = item;
    document.getElementById('qrModalTitle').innerText = `${item.id} • ${item.name}`;
    document.getElementById('qrAssetIdText').innerText = item.id;
    document.getElementById('qrAssetNameText').innerText = item.name;
    document.getElementById('qrAssetSerialText').innerText = `SN: ${item.serial} | Cat: ${item.category}`;

    const qrContainer = document.getElementById('qrCodeContainer');
    // Embedded payload format
    const qrPayload = JSON.stringify({
      id: item.id,
      name: item.name,
      cat: item.category,
      serial: item.serial,
      status: item.status
    });

    window.qrEngine.renderQR(qrContainer, qrPayload, 200);

    const btnPrintSingleLabel = document.getElementById('btnPrintSingleLabel');
    btnPrintSingleLabel.onclick = () => {
      openSinglePTouchSticker(item);
    };

    openModal(qrViewModal);
  }

  // Open Overdue Reminder Modal
  function openOverdueReminderModal(item) {
    state.activeEquipment = item;
    const phone = item.studentPhone || '+91 98765 43210';
    const name = item.studentName || 'Student';
    const dueDate = new Date(item.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const messageTemplate = `Hi ${name}, this is an urgent reminder from CampusShare Tech Labs. Your issued equipment "${item.name}" (Asset ID: ${item.id}) was due on ${dueDate} and is currently OVERDUE. Please return it to the lab in-charge immediately to avoid penalties or account suspension.`;

    document.getElementById('reminderStudentDetails').innerHTML = `
      <strong>${name}</strong> (${item.studentId}) &bull; ${item.studentDept || 'College Student'}
      <br><span style="color: var(--accent-blue);">📞 ${phone}</span>
    `;
    document.getElementById('reminderMessageText').value = messageTemplate;

    const btnSendSms = document.getElementById('btnSendSmsAlert');
    btnSendSms.onclick = () => {
      window.qrEngine.playAlertWarning();
      showToast(`Automated WhatsApp & SMS notice dispatched to ${name} (${phone})!`, 'warning');
      closeModal(overdueReminderModal);
    };

    openModal(overdueReminderModal);
  }

  // Open Brother P-Touch Sticker Print Preview Modal
  function openPTouchModal() {
    const list = window.campusDB.getEquipmentList();
    const container = document.getElementById('ptouchStickersContainer');
    container.innerHTML = '';

    list.forEach(item => {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = window.qrEngine.generatePTouchStickerHTML(item);
      container.appendChild(wrapper.firstElementChild);

      // Render mini QR inside each sticker
      setTimeout(() => {
        const qrBox = document.getElementById(`ptouch-qr-${item.id}`);
        if (qrBox) {
          window.qrEngine.renderQR(qrBox, item.id, 85);
        }
      }, 50);
    });

    document.getElementById('btnPrintAllStickers').onclick = () => {
      window.print();
    };

    openModal(ptouchModal);
  }

  function openSinglePTouchSticker(item) {
    const container = document.getElementById('ptouchStickersContainer');
    container.innerHTML = window.qrEngine.generatePTouchStickerHTML(item);
    setTimeout(() => {
      const qrBox = document.getElementById(`ptouch-qr-${item.id}`);
      if (qrBox) {
        window.qrEngine.renderQR(qrBox, item.id, 85);
      }
    }, 50);

    document.getElementById('btnPrintAllStickers').onclick = () => {
      window.print();
    };

    openModal(ptouchModal);
  }

  // Open Scanner Modal
  function openScannerModal() {
    openModal(scannerModal);

    // Try starting camera
    try {
      window.qrEngine.startScanner(
        'scannerViewport',
        (decodedText) => {
          handleScannedData(decodedText);
        },
        () => {}
      ).catch(() => {
        document.getElementById('scannerCameraError').style.display = 'block';
      });
    } catch (e) {
      document.getElementById('scannerCameraError').style.display = 'block';
    }

    // Quick Simulation Buttons for Hackathon Presentation
    document.querySelectorAll('.btn-sim-scan').forEach(btn => {
      btn.onclick = () => {
        const simId = btn.dataset.id;
        handleScannedData(simId);
      };
    });
  }

  // Handle Scanned QR Data (from live camera or simulation)
  function handleScannedData(rawText) {
    window.qrEngine.playScanBeep();
    closeModal(scannerModal);

    let parsedId = rawText.trim();
    try {
      const json = JSON.parse(rawText);
      if (json && json.id) parsedId = json.id;
    } catch (e) {
      // Raw string ID
    }

    const item = window.campusDB.getEquipmentById(parsedId);
    if (!item) {
      showToast(`Scanned QR code "${rawText}" not found in inventory!`, 'warning');
      return;
    }

    // Interactive Action depending on status
    if (item.status === 'Available') {
      showToast(`QR Code scanned: ${item.id} (${item.name}) is Available. Ready to issue!`, 'success');
      openIssueModal(item);
    } else if (item.status === 'Issued' || item.status === 'Overdue') {
      showToast(`QR Code scanned: ${item.id} is held by ${item.studentName}. Opening Return form.`, 'success');
      openReturnModal(item);
    } else {
      showToast(`QR Code scanned: ${item.id} is currently under Maintenance.`, 'warning');
      openQRModal(item);
    }
  }

  // Modal Helpers
  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';

    // If scanner modal was closed, stop camera
    if (modal === scannerModal) {
      window.qrEngine.stopScanner();
      const errBox = document.getElementById('scannerCameraError');
      if (errBox) errBox.style.display = 'none';
    }
  }

  // Toast Notification System
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✅' : '⚠️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Date Formatter Helper
  function formatLocalDateTime(date) {
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  }
});
