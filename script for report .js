const data = JSON.parse(`[ {
      "Product Name": "Ashland Conveyor 4  Ball Transfer Conveyor Table 30424 - 22INCH BF - 4INCH Ball Centers",
      "Link": "https://www.globalindustrial.ca/p/4-ball-transfer-conveyor-table-btit220404-with-4-center-75-lb-cap?ref=42",
      "Price": 1305,
      "Process": "Ball Transfer Conveyors",
      "Sub Type": "Ball Transfer Conveyors",
      "Image URL": "https://images.globalindustrial.com/images/pdp/LRD_BTIT220404.webp?t=1712559414000",
      "What specific type of conveyor table are you looking for?": "Ball Transfer Table",
      "What total width do you require for the conveyor table? (in.)": "Low: Less than or equal to 24.75 Inch",
      "What weight capacity do you need the conveyor table to support? (Lbs)": "Low: Less than or equal to 240.00 Lbs",
      "What length do you need for the conveyor table? (Ft)": "High: Greater than 3.00 Ft, up to 5.00 Ft",
      "What is the width between the frame that you require for the conveyor table? (In.) ": "Low: Less than or equal to 24.67 In.",
      "What diameter do you prefer for the balls on the conveyor table? (in.)": "1 in",
      "What is the preferred distance between the centers of the balls on the conveyor table? (in.)": 4,
      " Do you prefer a conveyor table that requires assembly?": "No" },]`)
const subTypeHelpMap = { "Davit Cranes": ...};
const steps = ["What specific type of conveyor table are you looking for?" ,...];
let currentProcess = '';
let currentFilters = {};
let selectedProducts = {};
function updateProcessSelection(process) {
    if (currentProcess !== process) {
        currentProcess = process;
        currentFilters = {};
        selectedProducts = {};
        document.getElementById('totalPrice').innerText = 'Total Price: 0';
        document.querySelectorAll('.product-checkbox').forEach(checkbox => {
            checkbox.checked = false; });
        document.querySelectorAll('.selected-product').forEach(container => {
            container.style.display = 'none';
            container.innerHTML = ''; }); }
    createSubtypeQuestionnaires(process);}
function handleHelpButtonClicked(subType) {
  alert(subTypeHelpMap[subType]);}
function createSubtypeQuestionnaires(process) {
    const subTypes = new Set(data.filter(item => item.Process === process).map(item => item["Sub Type"]));
    const questionnaireContainer = document.getElementById('subtypeQuestionnaires');
    questionnaireContainer.innerHTML = '';
    subTypes.forEach(subType => {
        currentFilters[subType] = {};
        console.log({ subTypeHelpMap, subType });
        const helpThingy = subTypeHelpMap[subType] ? `<button class="corner-help" onclick="handleHelpButtonClicked('${subType}')">Help</button>` : '';
        questionnaireContainer.innerHTML += `
            <div class="questionnaire-wrapper" id="wrapper-${subType}">
                ${helpThingy}
                <h2>${subType}</h2>
                <div class="subtype-selection">
                    Are you looking for ${subType}?
                    <button onclick="handleSubtypeSelection('${subType}', true)">Yes</button>
                    <button onclick="handleSubtypeSelection('${subType}', false)">No</button>
                </div>
                <div id="questionnaire-${subType}" class="questionnaire" style="display: none;"></div>
                <div id="selectedProduct-${subType}" class="selected-product" style="display: none;"></div>
            </div>`;});}
function handleSubtypeSelection(subType, isSelected) {
    const subtypeWrapper = document.getElementById(`wrapper-${subType}`);
    const subtypeSelectionDiv = subtypeWrapper.querySelector('.subtype-selection');
    if (subtypeSelectionDiv) {
        subtypeSelectionDiv.innerHTML = ''; 
    }
    if (isSelected) {
        document.getElementById(`questionnaire-${subType}`).style.display = 'block';
        updateQuestionnaire(subType);
    } else {
        subtypeWrapper.style.display = 'none';
    }
}
function filterData(subType) {
    return data.filter(item => {
        if (item["Sub Type"] !== subType) return false;
        for (const key in currentFilters[subType]) {
            if (currentFilters[subType][key] === 'N/A' && item[key] !== 'N/A') {
                return false;
            }
            if (currentFilters[subType][key] !== 'N/A' && String(item[key]) !== String(currentFilters[subType][key])) {
                return false;
            }
        }
        return true;
    });
}
function getNextQuestion(filteredData, subType) {
    let nextStepIndex = steps.findIndex(step => !(step in currentFilters[subType]));
    while (nextStepIndex !== -1) {
        const nextQuestion = steps[nextStepIndex];
        const options = new Set(filteredData.map(item => item[nextQuestion]).filter(item => item !== 'N/A'));
        if (options.size === 1) {
            currentFilters[subType][nextQuestion] = [...options][0];
            nextStepIndex = steps.findIndex(step => !(step in currentFilters[subType]));
            continue;
        } else if (options.size > 1) { // Return the question if more than one option exists
            return nextQuestion;
        }
        nextStepIndex = steps.findIndex((step, idx) => idx > nextStepIndex && !(step in currentFilters[subType]));
    }

    return null;
}
function areRemainingQuestionsOnlyNA(filteredData, subType) {
    let nextStepIndex = steps.findIndex(step => !(step in currentFilters[subType]));

    while (nextStepIndex !== -1) {
        const nextQuestion = steps[nextStepIndex];
        const options = new Set(filteredData.map(item => item[nextQuestion]));

        if (!(options.size === 1 && [...options][0] === 'N/A')) {
            return false;
        }
        currentFilters[subType][nextQuestion] = 'N/A';
        nextStepIndex = steps.findIndex(step => !(step in currentFilters[subType]));
    }
    return true;
}
function displaySelectedProducts(products, subType) {
  const uniqueProducts = Array.from(new Map(products.map(product => [product["Product Name"], product])).values());
  
  const selectedProductEl = document.getElementById('selectedProduct-' + subType);
  selectedProductEl.innerHTML = '';
  uniqueProducts.forEach((product, index) => {
      let imageHtml = ''; // Initialize imageHtml as an empty string
      
      // Check if the product has a valid image URL before adding img tag
      if (product["Image URL"]) {
          imageHtml = `<div class="product-image" style="float: right;"><img src="${product["Image URL"]}" alt="${product["Product Name"]} Image" style="max-width: 100px; max-height: 100px;"></div>`;
      }
      selectedProductEl.innerHTML += `
          <div class="product-option" style="clear: both; padding: 10px; border-bottom: 1px solid #eee;">
              <div class="product-details">
                  <div class="product-name">${product["Product Name"]}</div>
                  <div class="product-price">Price: $${product["Price"]}</div>
                  <div>Quantity: <input type="number" id="quantity-${subType}-${index}" class="product-quantity" value="1" min="1" onchange="updateTotalPrice()" style="margin-left: 10px;"></div>
                  <div class="product-checkbox"><input type="checkbox" id="product-${subType}-${index}" data-price="${product["Price"]}" onchange="updateTotalPrice()"> Select</div>
                  <div><a href="${product["Link"]}" target="_blank">Product Link</a></div>
              </div>
              ${imageHtml}
          </div>
      `;
  });
  selectedProductEl.style.display = 'block';
  addRestartButton(`selectedProduct-${subType}`, subType);
}
function createDropdown(question, options, subType) {
    const select = document.createElement('select');
    select.id = 'select-' + question + '-' + subType;
    select.onchange = function(event) {
        currentFilters[subType][question] = String(event.target.value);
        updateQuestionnaire(subType);
    };

    select.innerHTML = `<option value="">${question.toLowerCase()}  `;
    options.forEach(option => {
        const optionValue = option !== undefined ? String(option) : option;
        if (optionValue !== undefined) {
            select.innerHTML += `<option value="${optionValue}">${optionValue}</option>`;
        }
    });
    document.getElementById('questionnaire-' + subType).innerHTML = '';
    document.getElementById('questionnaire-' + subType).appendChild(select);
}
// Ensure this function is correctly appending the restart button
function addRestartButton(containerId, subType) {
    const container = document.getElementById(containerId);
    let restartButton = container.querySelector('.restart-button'); // Attempt to find an existing restart button
    if (!restartButton) {
        restartButton = document.createElement('button');
        restartButton.innerText = 'Restart';
        restartButton.onclick = function() { restart(subType); };
        restartButton.className = 'restart-button';
        container.appendChild(restartButton);
    }
}
function restart(subType) {
    // Reset filters for the subtype
    currentFilters[subType] = {};

    // Uncheck checkboxes and update the display for the specific subtype
    const subtypeContainer = document.getElementById(`selectedProduct-${subType}`);
    if (subtypeContainer) {
        const checkboxes = subtypeContainer.querySelectorAll('.product-checkbox');
        checkboxes.forEach(checkbox => checkbox.checked = false);
    }
    updateQuestionnaire(subType);
    document.getElementById(`selectedProduct-${subType}`).style.display = 'none';

    // Recalculate and display the updated total price
    updateTotalPrice();
}
function updateTotalPrice() {
  let totalPrice = 0;
  document.querySelectorAll('.product-checkbox input[type="checkbox"]:checked').forEach(checkbox => {
      const price = parseFloat(checkbox.getAttribute('data-price'));
      const quantityInput = document.getElementById(checkbox.id.replace('product', 'quantity'));
      const quantity = parseInt(quantityInput.value) || 1;
      totalPrice += price * quantity;
  });
  document.getElementById('totalPrice').innerText = `Total Price: $${totalPrice.toFixed(2)}`;
}
function updateQuestionnaire(subType) {
    const filteredData = filterData(subType);
    
    // Hide selectedProduct display initially
    document.getElementById(`selectedProduct-${subType}`).style.display = 'none';

    const nextQuestion = getNextQuestion(filteredData, subType);

    if (!nextQuestion) {
        // Display products if no more questions are left
        displaySelectedProducts(filteredData, subType);
        document.getElementById(`questionnaire-${subType}`).style.display = 'none';
    } else {
        // Create dropdown if the next question has more than one option
        const options = new Set(filteredData.map(item => item[nextQuestion]).filter(item => item !== undefined && item !== 'N/A'));
        if (options.size > 1) {
            createDropdown(nextQuestion, options, subType);
            document.getElementById(`questionnaire-${subType}`).style.display = 'block';
        } else {
            // Skip creating dropdown and re-check for the next question
            updateQuestionnaire(subType);
        }
    }
}
function createProcessSelectionQuestionnaire() {
    const processOptions = new Set(data.map(item => item["Process"]));
    const questionnaireContainer = document.getElementById('initialQuestionnaire');
    questionnaireContainer.innerHTML = `
        <select id="processSelect">
            <option value="">Select Process</option>
            ${Array.from(processOptions).map(process => `<option value="${process}">${process}</option>`).join('')}
        </select>
    `;
    document.getElementById('processSelect').onchange = function(event) {
        updateProcessSelection(event.target.value);
    };
}
createProcessSelectionQuestionnaire();

