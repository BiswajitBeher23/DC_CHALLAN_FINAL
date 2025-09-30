// --- Global Data and Utility Functions ---

// Initialize users from localStorage or use defaults (for Login/Sign Up)
let users = JSON.parse(localStorage.getItem('appUsers')) || {
    'admin': { password: 'password', role: 'admin' },
    'user': { password: 'password', role: 'user' }
};

function saveUsers() {
    localStorage.setItem('appUsers', JSON.stringify(users));
}

// XML Data Simulation (for Customer Code lookup)
const CUSTOMER_XML_DATA = {
    "123": {
        name: "M/s Tuvakar Technologies Pvt. Ltd.",
        addressLine1: "#128/1, 21st Main",
        addressLine2: "2nd Phase, J.P.Nagar",
        city: "Bengaluru",
        pin: "560078"
    },
    "456": {
        name: "Acme Corp Rentals",
        addressLine1: "101, Central Boulevard",
        addressLine2: "Near City Hall",
        city: "Mumbai",
        pin: "400001"
    }
};

// DC Data Persistence
let dcData = JSON.parse(localStorage.getItem('dcData')) || [
    {
        challanNo: 'ALB/DC/001', poNo: '183', deliveryDate: '25.09.2025', customerId: '123',
        customerName: 'M/s Tuvakar Technologies Pvt. Ltd.', city: 'Bengaluru', deliveryPerson: 'Prashanth', status: 'Delivered',
        addressLine1: '#128/1, 21st Main', addressLine2: '2nd Phase, J.P.Nagar', pin: '560078', // Full details saved
        items: [
            { slNo: '1', item: 'Header', particulars: 'Desktop With Following Configuration:', quantity: 19, assetCode: null },
            { slNo: 'A', item: 'Item', particulars: 'Intel Core i5, 8th Gen. Processor, 16GB DDR4 RAM', quantity: 19, assetCode: null },
            { slNo: null, item: 'Asset Code', particulars: 'CPU No: 3340, 3351, 3353...', quantity: null, assetCode: '3340, 3351, 3353' },
            { slNo: '2', item: 'Header', particulars: 'Laptop With Following Configuration:', quantity: 50, assetCode: null },
            { slNo: 'A', item: 'Item', particulars: 'Intel Core i5 10th Gen Processor, 16GB RAM', quantity: 50, assetCode: null },
        ],
        receipt: 'Receipt_ALB_DC_001.pdf'
    }
];

// Ensure initial DC data has full customer details from XML data for viewing consistency
dcData = dcData.map(dc => {
    if (CUSTOMER_XML_DATA[dc.customerId]) {
        return { ...dc, ...CUSTOMER_XML_DATA[dc.customerId] };
    }
    return dc;
});


// Simulated Server Storage for Deleted DCs
let deletedDCArchive = JSON.parse(localStorage.getItem('deletedDCArchive')) || [];

function saveDCData() {
    localStorage.setItem('dcData', JSON.stringify(dcData));
    localStorage.setItem('deletedDCArchive', JSON.stringify(deletedDCArchive));
}


// --- Login and Sign Up Logic (Unchanged) ---
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signUpForm = document.getElementById('signupForm');
    const searchDcBtn = document.querySelector('.search-dc-btn'); 

    // Handle Login
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.toLowerCase();
            const password = document.getElementById('password').value;
            
            if (users[username] && users[username].password === password) {
                localStorage.setItem('userRole', users[username].role);
                localStorage.setItem('currentUser', username);
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid Username or Password.');
            }
        });
    }

    // Handle Sign Up
    if (signUpForm) {
        signUpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newUsername = document.getElementById('signupUsername').value.toLowerCase();
            const newPassword = document.getElementById('signupPassword').value;
            const newRole = document.getElementById('signupRole').value;

            if (users[newUsername]) {
                alert('Username already exists. Please choose a different one.');
                return;
            }

            users[newUsername] = { password: newPassword, role: newRole };
            saveUsers();
            alert(`User ${newUsername} registered successfully as a ${newRole}! Please log in.`);
            if (typeof showLogin === 'function') showLogin(); 
        });
    }

    // Handle Search DC button 
    if (searchDcBtn) {
        searchDcBtn.addEventListener('click', searchDC);
    }
});

function logout() {
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function checkAuthAndRenderDashboard() {
    const role = localStorage.getItem('userRole');
    const username = localStorage.getItem('currentUser') || 'User'; 
    
    if (!role) {
        window.location.href = 'login.html';
        return;
    }
    const displayUsername = username.charAt(0).toUpperCase() + username.slice(1);
    const userDisplayEl = document.getElementById('currentUserDisplay');
    if (userDisplayEl) userDisplayEl.textContent = displayUsername;

    renderDashboard(role, dcData); 
}


// ----------------------------------------------------------------------
// --- Dashboard Logic --------------------------------------------------
// ----------------------------------------------------------------------

// 1. Search DC Functionality
function searchDC() {
    const query = prompt("Enter Challan No., P.O. No., or Customer ID to search:");
    if (!query) {
        renderDashboard(localStorage.getItem('userRole'), dcData); // Reset view
        return;
    }

    const lowerCaseQuery = query.toLowerCase();
    const filteredData = dcData.filter(dc => 
        dc.challanNo.toLowerCase().includes(lowerCaseQuery) ||
        (dc.poNo && dc.poNo.toLowerCase().includes(lowerCaseQuery)) ||
        dc.customerId.toLowerCase().includes(lowerCaseQuery) ||
        dc.customerName.toLowerCase().includes(lowerCaseQuery)
    );

    if (filteredData.length > 0) {
        alert(`Found ${filteredData.length} result(s) for "${query}". Displaying results on dashboard.`);
        renderDashboard(localStorage.getItem('userRole'), filteredData);
    } else {
        alert(`No results found for "${query}".`);
        renderDashboard(localStorage.getItem('userRole'), dcData); 
    }
}


function renderDashboard(role, dataToDisplay) {
    const tableBody = document.getElementById('dcTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = ''; 

    const isAdmin = role === 'admin';
    
    // Hide/Show Admin-only columns
    document.querySelectorAll('.admin-only').forEach(el => {
        if (!isAdmin) {
            el.classList.add('hide');
        } else {
            el.classList.remove('hide');
        }
    });

    dataToDisplay.forEach((dc, index) => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${dc.challanNo}</td>
            <td>${dc.poNo || ''}</td>
            <td>${dc.deliveryDate}</td>
            <td>${dc.customerId}</td>
            <td>${dc.customerName}</td>
            <td>${dc.city}</td>
            <td>${dc.deliveryPerson || 'N/A'}</td>
            <td>${dc.status}</td>
            <td><i class="fas fa-eye action-icon" onclick="viewDC('${dc.challanNo}')"></i></td>
            <td class="admin-only ${!isAdmin ? 'hide' : ''}">
                <i class="fas fa-edit action-icon" onclick="editDC('${dc.challanNo}')"></i>
            </td>
            <td class="admin-only ${!isAdmin ? 'hide' : ''}">
                <i class="fas fa-trash-alt action-icon" onclick="deleteDC('${dc.challanNo}')"></i>
            </td>
            <td>
                ${dc.receipt ? 
                    `<i class="fas fa-file-pdf action-icon" style="color: green;" onclick="viewReceipt('${dc.challanNo}')"></i>` : 
                    '<i class="fas fa-ban" style="color: grey;"></i>'}
            </td>
        `;
    });
}

function goToDcForm() {
    // Clear any existing edit flag before going to the form for a new entry
    localStorage.removeItem('editingChallanNo');
    window.location.href = 'dc_form.html';
}

// 2. View DC Functionality (Simulated - Unchanged)
function viewDC(challanNo) {
    const dc = dcData.find(d => d.challanNo === challanNo);
    if (!dc) return alert(`DC ${challanNo} not found.`);

    let itemDetails = dc.items.map(item => 
        `${item.slNo ? item.slNo + '.' : ''} [${item.item}] ${item.particulars} (Qty: ${item.quantity || '-'})`
    ).join('\n');

    const viewContent = `
        ========================================
           Delivery Challan: ${challanNo}
        ========================================
        Customer: ${dc.customerName}
        Address: ${dc.addressLine1 || 'N/A'}, ${dc.addressLine2 || ''}
        City/Pin: ${dc.city || 'N/A'} - ${dc.pin || 'N/A'}

        P.O. No: ${dc.poNo || 'N/A'}
        Date: ${dc.deliveryDate}
        Status: ${dc.status}
        
        --- PARTICULARS ---
        ${itemDetails}
        
        Total Quantity: ${dc.items.reduce((sum, item) => sum + (item.quantity || 0), 0)}
        ========================================
        (View simulation - full PDF data would open here)
    `;

    alert(viewContent); 
    console.log(`Viewing DC ${challanNo} in detail (simulating PDF rendering).`, dc);
}

// 3. **UPDATED: Edit DC Functionality**
function editDC(challanNo) {
    const isAdmin = localStorage.getItem('userRole') === 'admin';
    if (!isAdmin) {
        alert("Action Restricted: Only Admin can edit Delivery Challans.");
        return;
    }
    
    // 1. Store the challan number being edited in localStorage
    localStorage.setItem('editingChallanNo', challanNo);

    // 2. Redirect to the DC form page
    window.location.href = 'dc_form.html';
}


// 5. Deleted DC Storage (Server Folder Simulation - Unchanged)
function deleteDC(challanNo) {
    const isAdmin = localStorage.getItem('userRole') === 'admin';
    if (!isAdmin) {
        alert("Action Restricted: Only Admin can delete Delivery Challans.");
        return;
    }
    if (confirm(`Are you sure you want to delete DC: ${challanNo}? The DC will be archived in the server folder.`)) {
        
        const dcToDelete = dcData.find(dc => dc.challanNo === challanNo);
        if (dcToDelete) {
            // Archive the deleted DC to simulate server storage
            deletedDCArchive.push({...dcToDelete, deletedBy: localStorage.getItem('currentUser'), deletedDate: new Date().toISOString()});
            
            // Remove from active list
            dcData = dcData.filter(dc => dc.challanNo !== challanNo);
            saveDCData();

            console.log(`DC ${challanNo} ARCHIVED. Current Archive Contents:`, deletedDCArchive);
            renderDashboard(localStorage.getItem('userRole'), dcData);
            alert(`DC ${challanNo} deleted and archived successfully.`);
        }
    }
}

// 4. Add DC Receipt (File Upload Simulation - Unchanged)
function addDcReceipt() {
    const challanNo = prompt("Enter the Challan No. to link the receipt:");
    if (!challanNo) return;

    const dc = dcData.find(d => d.challanNo === challanNo);
    if (!dc) {
        alert("Challan No. not found in active list.");
        return;
    }
    
    // SIMULATING FILE UPLOAD
    const fileType = prompt(`Enter the file type (pdf/jpeg/png):`);
    if (!fileType || !['pdf', 'jpeg', 'png'].includes(fileType.toLowerCase())) {
        alert("Invalid file type. Please enter pdf, jpeg, or png.");
        return;
    }
    
    const fileName = `Receipt_${challanNo.replace(/\//g, '_')}.${fileType}`;

    if (fileName) {
        // Simulate file upload and storage
        dc.receipt = fileName;
        dc.status = 'Receipt Received';
        saveDCData();
        renderDashboard(localStorage.getItem('userRole'), dcData);
        alert(`Receipt "${fileName}" successfully uploaded and linked to DC ${challanNo}.`);
    }
}

// View DC Receipt (Opens the dedicated HTML receipt page - Unchanged)
function viewReceipt(challanNo) {
    // Navigate to the new page, passing the Challan Number as a query parameter
    window.open(`receipt_page.html?challanNo=${encodeURIComponent(challanNo)}`, '_blank');
}


// ----------------------------------------------------------------------
// --- DC Form Logic (For adding/editing new DC) ------------------------
// ----------------------------------------------------------------------

function generateNextChallanNo() {
    if (dcData.length === 0) return 'ALB/DC/001';
    
    const lastChallanNo = dcData.reduce((maxNo, dc) => {
        const num = parseInt(dc.challanNo.split('/').pop());
        return num > maxNo ? num : maxNo;
    }, 0);

    const nextNumber = lastChallanNo + 1;
    return `ALB/DC/${String(nextNumber).padStart(3, '0')}`;
}

// **UPDATED: initializeDcForm**
function initializeDcForm() {
    const challanNoEl = document.getElementById('challanNo');
    const deliveryDateEl = document.getElementById('deliveryDate');
    const customerCodeEl = document.getElementById('customerCode');
    const poNoEl = document.getElementById('poNo');
    const deliveredByEl = document.getElementById('deliveredBy');
    const form = document.getElementById('dcForm');
    const itemsTableBody = document.getElementById('itemsTableBody');

    if (!challanNoEl || !deliveryDateEl || !customerCodeEl || !form || !itemsTableBody) return;

    const editingChallanNo = localStorage.getItem('editingChallanNo');
    let isEditing = false;
    let dcToEdit;

    if (editingChallanNo) {
        // --- EDIT MODE ---
        dcToEdit = dcData.find(d => d.challanNo === editingChallanNo);
        if (dcToEdit) {
            isEditing = true;
            document.querySelector('h1').textContent = `Edit Delivery Challan`;
            document.querySelector('#form-title').textContent = `Edit DC Details: ${dcToEdit.challanNo}`;

            // Load Header Details
            challanNoEl.textContent = dcToEdit.challanNo;
            deliveryDateEl.textContent = dcToEdit.deliveryDate;
            customerCodeEl.value = dcToEdit.customerId;
            poNoEl.value = dcToEdit.poNo || '';
            deliveredByEl.value = dcToEdit.deliveryPerson || '';
            
            // Trigger customer info load
            customerCodeEl.dispatchEvent(new Event('change'));

            // Load Items
            itemsTableBody.innerHTML = '';
            loadItemsForEdit(dcToEdit.items);

        } else {
            // If the DC to edit is not found, clear the flag and proceed as New
            localStorage.removeItem('editingChallanNo');
        }
    }
    
    if (!isEditing) {
        // --- NEW DC MODE ---
        challanNoEl.textContent = generateNextChallanNo();
        deliveryDateEl.textContent = new Date().toLocaleDateString('en-GB');
        
        if (itemsTableBody.children.length === 0) {
            addHeaderRow(true); // Add initial empty rows
        }
    }

    // Customer Code XML lookup listener (re-attached)
    customerCodeEl.addEventListener('change', (e) => {
        const code = e.target.value.trim();
        const addressEl = document.getElementById('customerAddress');
        addressEl.innerHTML = '';
        const customer = CUSTOMER_XML_DATA[code];

        if (customer) {
            addressEl.innerHTML = `
                <p>${customer.name}</p>
                <p>${customer.addressLine1}</p>
                <p>${customer.addressLine2}</p>
                <p>${customer.city} - ${customer.pin}</p>
            `;
        } else {
            addressEl.innerHTML = `<p style="color: red;">Customer Code not found. Please enter details manually.</p>`;
        }
    });

    // Total Quantity Update listener
    itemsTableBody.addEventListener('input', calculateTotalQuantity);

    // Form Submission listener
    form.addEventListener('submit', saveDC);
    
    // Calculate total quantity once data is loaded (important for Edit mode)
    calculateTotalQuantity();
}

function loadItemsForEdit(items) {
    const itemsTableBody = document.getElementById('itemsTableBody');
    let currentGroup = 0;
    
    items.forEach(item => {
        if (item.item === 'Header') {
            currentGroup++;
            // 1. Header Row
            const headerRow = itemsTableBody.insertRow();
            headerRow.className = 'item-group header-row';
            headerRow.dataset.group = currentGroup;
            headerRow.innerHTML = `
                <td class="sl-no-col">${item.slNo}</td>
                <td><input type="text" class="header-item item-type-field" value="${item.item}" style="text-align: center;" readonly></td>
                <td><input type="text" class="header-particulars" value="${item.particulars}"></td>
                <td><input type="number" class="quantity item-quantity-field" value="${item.quantity}" min="0" oninput="calculateTotalQuantity()"></td>
                <td><input type="text" class="remarks"></td>
            `;
        } else if (item.item === 'Item') {
            // 2. Item Row
            const itemRow = itemsTableBody.insertRow();
            itemRow.className = 'item-group item-row';
            itemRow.dataset.group = currentGroup;
            itemRow.innerHTML = `
                <td class="sl-no-col" style="text-align: right;">${item.slNo}</td>
                <td><input type="text" class="item item-type-field" value="${item.item}" style="text-align: center;" readonly></td>
                <td>
                    <textarea rows="4" class="particulars">${item.particulars}</textarea>
                </td>
                <td><input type="number" class="quantity item-quantity-field" value="${item.quantity}" min="0" oninput="calculateTotalQuantity()"></td>
                <td><input type="text" class="remarks"></td>
            `;
        } else if (item.item === 'Asset Code') {
            // 3. Asset Code Row
            const assetRow = itemsTableBody.insertRow();
            assetRow.className = 'item-group asset-code-row';
            assetRow.dataset.group = currentGroup;
            assetRow.innerHTML = `
                <td class="sl-no-col"></td>
                <td><input type="text" class="item item-type-field" value="${item.item}" style="text-align: center;" readonly></td>
                <td><textarea rows="2" class="asset-codes">${item.particulars}</textarea></td>
                <td></td>
                <td></td>
            `;
        }
    });
    
    // Add the "Add Row" button after the last item group loaded
    const addRow = itemsTableBody.insertRow();
    addRow.className = 'add-row';
    addRow.dataset.group = currentGroup;
    addRow.innerHTML = `
        <td></td>
        <td>
            <button type="button" class="add-btn" onclick="addItemRow(${currentGroup})">Add Additional Item</button>
        </td>
        <td>
            <button type="button" class="add-btn" onclick="addAssetCodeRow(this, ${currentGroup})">Add Asset Code</button>
        </td>
        <td colspan="2">
            <button type="button" class="add-btn" onclick="addHeaderRow(false)">Add Additional Header</button>
        </td>
    `;
}


function addHeaderRow(isInitial = false) {
    const itemsTableBody = document.getElementById('itemsTableBody');
    
    // Find the last .add-row element and remove it before adding new content
    const existingAddRow = itemsTableBody.querySelector('.add-row:last-child');
    if (existingAddRow) existingAddRow.remove();

    const allHeaders = itemsTableBody.querySelectorAll('.header-row');
    const headerSlNo = allHeaders.length + 1;
    
    // 1. Header Row
    const headerRow = itemsTableBody.insertRow();
    headerRow.className = 'item-group header-row';
    headerRow.dataset.group = headerSlNo;
    headerRow.innerHTML = `
        <td class="sl-no-col">${headerSlNo}</td>
        <td><input type="text" class="header-item item-type-field" value="Header" style="text-align: center;" ${isInitial ? 'readonly' : ''}></td>
        <td><input type="text" class="header-particulars" placeholder="e.g., Desktop With Following Configuration"></td>
        <td><input type="number" class="quantity item-quantity-field" value="0" min="0" oninput="calculateTotalQuantity()"></td>
        <td><input type="text" class="remarks"></td>
    `;

    // 2. Item Row
    addItemRow(headerSlNo);

    // 3. Add Additional Item/Header Row (Re-add the controls at the bottom)
    const addRow = itemsTableBody.insertRow();
    addRow.className = 'add-row';
    addRow.dataset.group = headerSlNo;
    addRow.innerHTML = `
        <td></td>
        <td>
            <button type="button" class="add-btn" onclick="addItemRow(${headerSlNo})">Add Additional Item</button>
        </td>
        <td>
            <button type="button" class="add-btn" onclick="addAssetCodeRow(this, ${headerSlNo})">Add Asset Code</button>
        </td>
        <td colspan="2">
            <button type="button" class="add-btn" onclick="addHeaderRow(false)">Add Additional Header</button>
        </td>
    `;
    calculateTotalQuantity();
}

function addItemRow(groupSlNo) {
    const itemsTableBody = document.getElementById('itemsTableBody');
    
    let addRow = itemsTableBody.querySelector(`.add-row[data-group="${groupSlNo}"]`);
    let insertIndex = addRow ? addRow.rowIndex : -1;

    const itemRow = itemsTableBody.insertRow(insertIndex);
    itemRow.className = 'item-group item-row';
    itemRow.dataset.group = groupSlNo;
    itemRow.innerHTML = `
        <td class="sl-no-col" style="text-align: right;">A</td>
        <td><input type="text" class="item item-type-field" value="Item" style="text-align: center;" readonly></td>
        <td>
            <textarea rows="4" class="particulars" placeholder="e.g., Intel Core i5, 8th Gen Processor..."></textarea>
        </td>
        <td><input type="number" class="quantity item-quantity-field" value="0" min="0" oninput="calculateTotalQuantity()"></td>
        <td><input type="text" class="remarks"></td>
    `;
    calculateTotalQuantity();
}

function addAssetCodeRow(buttonElement, groupSlNo) {
    let addRow = buttonElement.closest('.add-row');
    if (!addRow) return;

    const itemsTableBody = document.getElementById('itemsTableBody');

    const assetRow = itemsTableBody.insertRow(addRow.rowIndex);
    assetRow.className = 'item-group asset-code-row';
    assetRow.dataset.group = groupSlNo;
    assetRow.innerHTML = `
        <td class="sl-no-col"></td>
        <td><input type="text" class="item item-type-field" value="Asset Code" style="text-align: center;" readonly></td>
        <td><textarea rows="2" class="asset-codes" placeholder="CPU No: 3340, 3351..."></textarea></td>
        <td></td>
        <td></td>
    `;
}

function calculateTotalQuantity() {
    const quantityInputs = document.querySelectorAll('#itemsTableBody .item-group:not(.asset-code-row) .item-quantity-field');
    let total = 0;
    quantityInputs.forEach(input => {
        total += parseInt(input.value) || 0;
    });
    document.getElementById('totalQuantity').textContent = total;
}

function cancelForm() {
    if (confirm("Are you sure you want to cancel? Any unsaved data will be lost.")) {
        // Clear the edit flag if canceling
        localStorage.removeItem('editingChallanNo');
        window.location.href = 'dashboard.html';
    }
}

// **UPDATED: saveDC**
function saveDC(e) {
    e.preventDefault();
    
    const isEditing = !!localStorage.getItem('editingChallanNo');
    const existingChallanNo = localStorage.getItem('editingChallanNo');
    
    const challanNo = isEditing ? existingChallanNo : document.getElementById('challanNo').textContent;
    const deliveryDate = document.getElementById('deliveryDate').textContent;
    const customerCode = document.getElementById('customerCode').value;
    const poNo = document.getElementById('poNo').value;
    const deliveredBy = document.getElementById('deliveredBy').value;
    
    // Get full customer data from XML lookup
    const customer = CUSTOMER_XML_DATA[customerCode] || { 
        name: 'Manual Entry', 
        city: 'N/A', 
        addressLine1: 'N/A', 
        addressLine2: '', 
        pin: 'N/A' 
    };
    
    // Collect all item data
    const items = [];
    document.querySelectorAll('#itemsTableBody .item-group').forEach(row => {
        const itemType = row.querySelector('.item-type-field')?.value;
        
        if (itemType === 'Header') {
            items.push({
                slNo: row.querySelector('.sl-no-col').textContent,
                item: itemType,
                particulars: row.querySelector('.header-particulars').value,
                quantity: parseInt(row.querySelector('.item-quantity-field').value) || 0,
                assetCode: null
            });
        } else if (itemType === 'Item') {
            items.push({
                slNo: row.querySelector('.sl-no-col').textContent,
                item: itemType,
                particulars: row.querySelector('.particulars').value,
                quantity: parseInt(row.querySelector('.item-quantity-field').value) || 0,
                assetCode: null
            });
        } else if (itemType === 'Asset Code') {
            items.push({
                slNo: null,
                item: itemType,
                particulars: row.querySelector('.asset-codes').value,
                quantity: null,
                assetCode: row.querySelector('.asset-codes').value
            });
        }
    });

    const dcObject = {
        challanNo: challanNo,
        poNo: poNo,
        deliveryDate: deliveryDate,
        customerId: customerCode,
        customerName: customer.name,
        city: customer.city,
        deliveryPerson: deliveredBy,
        status: isEditing ? (dcData.find(d => d.challanNo === challanNo)?.status || 'Pending') : 'Pending', // Keep status on edit
        items: items,
        receipt: isEditing ? (dcData.find(d => d.challanNo === challanNo)?.receipt || null) : null, // Keep receipt on edit
        addressLine1: customer.addressLine1, 
        addressLine2: customer.addressLine2, 
        pin: customer.pin 
    };

    if (isEditing) {
        // Update the existing DC object
        const index = dcData.findIndex(d => d.challanNo === challanNo);
        if (index !== -1) {
            dcData[index] = dcObject;
        }
        localStorage.removeItem('editingChallanNo');
    } else {
        // Add as a new DC
        dcData.push(dcObject);
    }
    
    saveDCData();

    simulatePDFSave(dcObject);

    alert(`Delivery Challan ${challanNo} ${isEditing ? 'updated' : 'saved'} successfully!`);
    window.location.href = 'dashboard.html';
}

function simulatePDFSave(dcObject) {
    // Simulates PDF save 
    console.log("--- SIMULATED PDF CONTENT ---");
    console.log(`DC ${dcObject.challanNo} saved/updated to file. Data includes ${dcObject.items.length} line items.`);
}