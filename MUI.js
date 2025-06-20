// UI Kit (Progessbar, Range, ColorPicker, UserControlAccess, Form, Dropdown, FileSelector)
class Prompt {
    constructor(model) {
        if (!model || typeof model !== 'object') {
            throw new Error('Prompt model must be an object');
        }
        this.promptBox = model;
        this.element = null; // Referencia al DOM creado
    }

    execute() {
        this.#validateModel();
        this.#resolvePrompt();
    }

    #validateModel() {
        const requiredFields = ['type', 'title'];
        for (const field of requiredFields) {
            if (!this.promptBox[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
    }

    #resolvePrompt() {
        const PromptType = this.promptBox['type'];
        this.element = this.#CreateView();

        // Animación inicial
        this.element.style.transform = 'translate(-50%, 100%)';
        this.element.style.opacity = '0';
        document.body.appendChild(this.element);
        void this.element.offsetWidth;
        this.element.classList.add('slide-up');

        switch (PromptType) {
            // Casos existentes...
            case 'UAC':
                this.#buildUAC();
                break;
            case 'File':
                this.#buildFilePicker();
                break;
            case 'Actions':
                this.#buildActions();
                break;
            case 'Form':
                this.#buildForm();
                break;
            case 'Dropdown':
                this.#buildDropdown();
                break;
            case 'Progress':
                this.#buildProgress();
                break;
            case 'Range':
                this.#buildRangeInput();
                break;
            case 'ColorPicker':
                this.#buildColorPicker();
                break;

                // Nuevos tipos de inputs
            case 'Currency':
                this.#buildCurrencyInput();
                break;
            case 'Date':
                this.#buildDateInput();
                break;
            case 'Phone':
                this.#buildPhoneInput();
                break;
            case 'Card':
                this.#buildCardInput();
                break;
            case 'Search':
                this.#buildSearchInput();
                break;
            case 'Checkbox':
                this.#buildCheckboxGroup();
                break;
            case 'Users':
                this.#buildUserSelection();
                break;

            default:
                throw new Error(`Unknown prompt type: ${PromptType}`);
        }

        document.body.appendChild(this.element);
    }

    // ========== NUEVOS MÉTODOS PARA INPUTS ESPECIALIZADOS ==========

    #buildCurrencyInput() {
        const form = document.createElement('form');
        form.className = 'Prompt-form currency-form';

        form.innerHTML = `
      <div class="input-container">
        <span class="currency-symbol">${this.promptBox.currency || '$'}</span>
        <input 
          type="text" 
          inputmode="decimal"
          pattern="[0-9]+(\\.[0-9]{1,2})?"
          placeholder="${this.promptBox.placeholder || '0.00'}"
          class="currency-input"
          ${this.promptBox.required ? 'required' : ''}
        >
      </div>
      <button type="submit">${this.promptBox.submitText || 'Aceptar'}</button>
    `;

        const input = form.querySelector('.currency-input');
        input.addEventListener('input', this.#formatCurrency.bind(this));

        form.onsubmit = (e) => {
            e.preventDefault();
            if (this.promptBox.handler?.submit) {
                this.promptBox.handler.submit(input.value);
            }
            this.#close();
        };

        this.element.appendChild(form);
    }

    #formatCurrency(e) {
        let value = e.target.value.replace(/[^0-9.]/g, '');
        const decimalPos = value.indexOf('.');

        if (decimalPos >= 0) {
            value = value.substring(0, decimalPos + 3);
        }

        e.target.value = value;
    }

    #buildDateInput() {
        const form = document.createElement('form');
        form.className = 'Prompt-form date-form';

        form.innerHTML = `
      <input 
        type="date"
        min="${this.promptBox.minDate || ''}"
        max="${this.promptBox.maxDate || ''}"
        class="date-input"
        ${this.promptBox.required ? 'required' : ''}
      >
      <button type="submit">${this.promptBox.submitText || 'Seleccionar'}</button>
    `;

        form.onsubmit = (e) => {
            e.preventDefault();
            const date = form.querySelector('.date-input').value;
            if (this.promptBox.handler?.submit) {
                this.promptBox.handler.submit(date);
            }
            this.#close();
        };

        this.element.appendChild(form);
    }

    #buildPhoneInput() {
        const form = document.createElement('form');
        form.className = 'Prompt-form phone-form';

        form.innerHTML = `
      <input 
        type="tel"
        inputmode="tel"
        pattern="[0-9+\\-\\s]+"
        placeholder="${this.promptBox.placeholder || '+1 (___) ___-____'}"
        class="phone-input"
        ${this.promptBox.required ? 'required' : ''}
      >
      <button type="submit">${this.promptBox.submitText || 'Enviar'}</button>
    `;

        const input = form.querySelector('.phone-input');
        input.addEventListener('input', this.#formatPhoneNumber.bind(this));

        form.onsubmit = (e) => {
            e.preventDefault();
            if (this.promptBox.handler?.submit) {
                this.promptBox.handler.submit(input.value);
            }
            this.#close();
        };

        this.element.appendChild(form);
    }

    #formatPhoneNumber(e) {
        const value = e.target.value.replace(/[^0-9+-\s]/g, '');
        e.target.value = value;
    }

    #buildCardInput() {
        const form = document.createElement('form');
        form.className = 'Prompt-form card-form';

        form.innerHTML = `
      <div class="input-container">
        <span class="card-icon">💳</span>
        <input 
          type="text"
          inputmode="numeric"
          pattern="[0-9\\s]{13,19}"
          placeholder="____ ____ ____ ____"
          class="card-input"
          ${this.promptBox.required ? 'required' : ''}
        >
      </div>
      <button type="submit">${this.promptBox.submitText || 'Continuar'}</button>
    `;

        const input = form.querySelector('.card-input');
        input.addEventListener('input', this.#formatCardNumber.bind(this));

        form.onsubmit = (e) => {
            e.preventDefault();
            if (this.promptBox.handler?.submit) {
                const cardNumber = input.value.replace(/\s/g, '');
                this.promptBox.handler.submit(cardNumber);
            }
            this.#close();
        };

        this.element.appendChild(form);
    }

    #formatCardNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 16) value = value.substring(0, 16);

        // Agregar espacios cada 4 dígitos
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        e.target.value = value;
    }

    #buildSearchInput() {
        const form = document.createElement('form');
        form.className = 'Prompt-form search-form';

        form.innerHTML = `
      <div class="search-container">
        <input 
          type="search"
          placeholder="${this.promptBox.placeholder || 'Buscar...'}"
          class="search-input"
        >
        <button type="submit" class="search-btn">🔍</button>
      </div>
    `;

        const input = form.querySelector('.search-input');

        form.onsubmit = (e) => {
            e.preventDefault();
            if (this.promptBox.handler?.submit) {
                this.promptBox.handler.submit(input.value);
            }
            this.#close();
        };

        // Búsqueda en tiempo real si se especifica
        if (this.promptBox.handler?.onInput) {
            input.addEventListener('input', (e) => {
                this.promptBox.handler.onInput(e.target.value);
            });
        }

        this.element.appendChild(form);
    }

    #buildCheckboxGroup() {
        const container = document.createElement('div');
        container.className = 'checkbox-group-container';

        if (this.promptBox.title) {
            const title = document.createElement('h3');
            title.textContent = this.promptBox.title;
            container.appendChild(title);
        }

        const options = this.promptBox.options || [];
        options.forEach(option => {
            const wrapper = document.createElement('div');
            wrapper.className = 'checkbox-wrapper';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `checkbox-${option.value}`;
            checkbox.value = option.value;
            checkbox.checked = option.checked || false;

            const label = document.createElement('label');
            label.htmlFor = `checkbox-${option.value}`;
            label.textContent = option.label || option.value;

            wrapper.appendChild(checkbox);
            wrapper.appendChild(label);
            container.appendChild(wrapper);
        });

        const submitBtn = document.createElement('button');
        submitBtn.textContent = this.promptBox.submitText || 'Confirmar';
        submitBtn.onclick = () => {
            const selected = Array.from(container.querySelectorAll('input:checked'))
                .map(el => el.value);

            if (this.promptBox.handler?.submit) {
                this.promptBox.handler.submit(selected);
            }
            this.#close();
        };

        container.appendChild(submitBtn);
        this.element.appendChild(container);
    }

    #buildUserSelection() {
        const container = document.createElement('div');
        container.className = 'user-selection-container';

        container.innerHTML = `
      <h3>${this.promptBox.title || 'Seleccionar usuarios'}</h3>
      <input 
        type="text" 
        class="user-search" 
        placeholder="Buscar usuarios..."
      >
      <div class="user-list">
        ${(this.promptBox.users || []).map(user => `
          <div class="user-item" data-id="${user.id}">
            <input 
              type="${this.promptBox.multiSelect ? 'checkbox' : 'radio'}" 
              name="user-selection"
              value="${user.id}"
            >
            <img src="${user.avatar}" alt="${user.name}">
            <span>${user.name}</span>
          </div>
        `).join('')}
      </div>
      <button class="confirm-btn">${this.promptBox.submitText || 'Confirmar'}</button>
    `;

        // Búsqueda en tiempo real
        const searchInput = container.querySelector('.user-search');
        searchInput.addEventListener('input', () => {
            const term = searchInput.value.toLowerCase();
            container.querySelectorAll('.user-item').forEach(item => {
                const matches = item.textContent.toLowerCase().includes(term);
                item.style.display = matches ? 'flex' : 'none';
            });
        });

        // Confirmación
        container.querySelector('.confirm-btn').onclick = () => {
            const selected = Array.from(container.querySelectorAll('input:checked'))
                .map(input => {
                    const item = input.closest('.user-item');
                    return {
                        id: item.dataset.id,
                        name: item.querySelector('span').textContent,
                        avatar: item.querySelector('img').src
                    };
                });

            if (this.promptBox.handler?.submit) {
                this.promptBox.handler.submit(
                    this.promptBox.multiSelect ? selected : selected[0]
                );
            }
            this.#close();
        };

        this.element.appendChild(container);
    }

    #CreateView() {
        const card = document.createElement('div');
        card.className = 'Prompt';

        const Container = document.createElement('div');
        Container.className = 'Meta';

        const header = document.createElement('h2');
        header.textContent = this.promptBox.title;

        const message = document.createElement('p');
        message.textContent =
            typeof this.promptBox.msg === 'number' ?
            this.#resolveMsgCode(this.promptBox.msg) :
            this.promptBox.msg;

        Container.appendChild(header);
        Container.appendChild(message);

        card.appendChild(Container);

        return card;
    }

    #resolveMsgCode(code) {
        const messages = {
            0xDFF: 'Do you want to allow this action?',
            0xDFE: 'Select a file to upload',
            // ...otros códigos
        };
        return messages[code] || 'Unknown message code';
    }

    #buildUAC() {
        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'Actions'

        const acceptBtn = document.createElement('button');
        acceptBtn.textContent = 'Accept';
        acceptBtn.onclick = () => {
            this.promptBox.handler?.accept?.();
            this.#close();
        };

        const declineBtn = document.createElement('button');
        declineBtn.textContent = 'Decline';
        declineBtn.onclick = () => {
            this.promptBox.handler?.declined?.();
            this.#close();
        };

        buttonsDiv.appendChild(acceptBtn);
        buttonsDiv.appendChild(declineBtn);
        this.element.appendChild(buttonsDiv);
    }

    #buildDropdown() {
        const {
            Options,
            SubmitButton,
            handler
        } = this.promptBox;

        if (!Options || typeof Options !== 'object') {
            throw new Error('Dropdown requires an Options object');
        }

        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'Prompt-dropdown';

        // Crear select element
        const select = document.createElement('select');
        select.className = 'Prompt-select';

        // Añadir opciones
        for (const [value, text] of Object.entries(Options)) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = text;
            select.appendChild(option);
        }

        // Crear botón de submit
        const submitBtn = document.createElement('button');
        submitBtn.className = 'Prompt-submit';
        submitBtn.textContent = SubmitButton?.Default || 'Submit';

        // Eventos
        if (handler?.resolve) {
            select.addEventListener('change', (e) => {
                handler.resolve(e.target.value);
            });
        }

        submitBtn.onclick = () => {
            if (handler?.submit) {
                handler.submit(select.value);
            }
            this.#close();
        };

        dropdownContainer.appendChild(select);
        dropdownContainer.appendChild(submitBtn);
        this.element.appendChild(dropdownContainer);
    }

    #buildProgress() {
        const {
            Options
        } = this.promptBox;
        const progressContainer = document.createElement('div');
        progressContainer.className = 'Prompt-progress';

        // Determinar tipo de progress
        const barType = Options?.BarType || 'static';
        const isDynamic = Options?.isDynamicBar || false;

        if (barType === 'infinite') {
            this.#buildInfiniteProgress(progressContainer, Options);
        } else if (barType === 'static') {
            this.#buildStaticProgress(progressContainer, Options);
        } else if (barType === 'node') {
            this.#buildNodeProgress(progressContainer, Options);
        } else if (barType === 'circle') {
            this.#buildCircleLoader(progressContainer, Options);
        }

        this.element.appendChild(progressContainer);
    }

    #buildInfiniteProgress(container, options) {
        const infiniteBar = document.createElement('div');
        infiniteBar.className = 'Progress-infinite';
        infiniteBar.style.backgroundColor = options.BarColor || '#4a90e2';
        container.appendChild(infiniteBar);

        // Añadir animación CSS via JavaScript
        infiniteBar.style.animation = 'infiniteProgress 2s linear infinite';
    }

    #buildStaticProgress(container, options) {
        const progressWrapper = document.createElement('div');
        progressWrapper.className = 'Progress-static-wrapper';

        const progressBar = document.createElement('div');
        progressBar.className = 'Progress-static-bar';
        progressBar.style.backgroundColor = options.BarColor || '#4a90e2';
        progressBar.style.width = '0%'; // Inicialmente vacío

        // Si hay handler, exponemos métodos para controlar la barra
        if (this.promptBox.handler) {
            this.promptBox.handler.setProgress = (percentage) => {
                progressBar.style.width = `${percentage}%`;
            };

            this.promptBox.handler.finish = () => {
                progressBar.style.width = '100%';
                setTimeout(() => this.#close(), 500);
            };
        }

        progressWrapper.appendChild(progressBar);
        container.appendChild(progressWrapper);
    }

    #buildCircleLoader(container, options) {
        const circleLoader = document.createElement('div');
        circleLoader.className = 'Progress-circle';
        circleLoader.style.borderColor = options.BarColor || '#4a90e2';

        // Control para progreso determinado (0-100)
        if (this.promptBox.handler) {
            this.promptBox.handler.setProgress = (percentage) => {
                const deg = (percentage / 100) * 360;
                circleLoader.style.background =
                    `conic-gradient(${options.BarColor || '#4a90e2'} ${deg}deg, transparent ${deg}deg)`;
            };
        }

        container.appendChild(circleLoader);
    }

    #buildNodeProgress(container, options) {
        const nodeProgress = document.createElement('div');
        nodeProgress.className = 'Progress-node';

        // Crear la barra base
        const progressBar = document.createElement('div');
        progressBar.className = 'Progress-node-bar';
        progressBar.style.backgroundColor = options.BarColor ? `${options.BarColor}20` : '#4a90e220'; // Color con transparencia

        // Crear los nodos
        const nodesContainer = document.createElement('div');
        nodesContainer.className = 'Progress-node-container';

        // Determinar nodos (si no se especifican, usamos 3 por defecto)
        const nodeCount = options.NodeCount || 3;
        const nodes = [];

        for (let i = 0; i < nodeCount; i++) {
            const node = document.createElement('div');
            node.className = 'Progress-node-point';
            node.dataset.step = i + 1;
            node.style.backgroundColor = options.BarColor || '#4a90e2';

            // Añadir tooltip si hay labels
            if (options.NodeLabels && options.NodeLabels[i]) {
                const tooltip = document.createElement('span');
                tooltip.className = 'Progress-node-tooltip';
                tooltip.textContent = options.NodeLabels[i];
                node.appendChild(tooltip);
            }

            nodes.push(node);
            nodesContainer.appendChild(node);
        }

        // Barra de progreso activa (que se llena)
        const activeProgress = document.createElement('div');
        activeProgress.className = 'Progress-node-active';
        activeProgress.style.backgroundColor = options.BarColor || '#4a90e2';
        activeProgress.style.width = '0%';

        // Configurar handlers para control externo
        if (this.promptBox.handler) {
            this.promptBox.handler = {
                ...this.promptBox.handler,
                setNode: (nodeIndex) => {
                    const percentage = (nodeIndex / (nodeCount - 1)) * 100;
                    activeProgress.style.width = `${percentage}%`;

                    // Actualizar estado de los nodos
                    nodes.forEach((node, idx) => {
                        node.classList.toggle('active', idx <= nodeIndex);
                        node.classList.toggle('completed', idx < nodeIndex);
                    });
                },
                nextNode: () => {
                    const current = parseInt(activeProgress.style.width) || 0;
                    const nextNode = Math.min(
                        Math.ceil((current / 100) * (nodeCount - 1) + 1),
                        nodeCount - 1
                    );
                    this.promptBox.handler.setNode(nextNode);
                },
                getCurrentNode: () => {
                    const current = parseInt(activeProgress.style.width) || 0;
                    return Math.round((current / 100) * (nodeCount - 1));
                }
            };
        }

        progressBar.appendChild(activeProgress);
        nodeProgress.appendChild(progressBar);
        nodeProgress.appendChild(nodesContainer);
        container.appendChild(nodeProgress);
    }

    #buildRangeInput() {
        const {
            min = 0, max = 100, value = 50, step = 1, unit = ''
        } = this.promptBox;

        const rangeContainer = document.createElement('div');
        rangeContainer.className = 'Prompt-range';

        // Input de tipo range
        const rangeInput = document.createElement('input');
        rangeInput.type = 'range';
        rangeInput.min = min;
        rangeInput.max = max;
        rangeInput.value = value;
        rangeInput.step = step;
        rangeInput.className = 'Prompt-range-input';

        // Display del valor
        const valueDisplay = document.createElement('div');
        valueDisplay.className = 'Prompt-range-value';
        valueDisplay.textContent = `${value}${unit}`;

        // Botón de confirmación
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'Prompt-confirm';
        confirmBtn.textContent = this.promptBox.confirmText || 'Confirmar';

        // Eventos
        rangeInput.addEventListener('input', (e) => {
            valueDisplay.textContent = `${e.target.value}${unit}`;
            this.promptBox.handler?.onChange?.(parseFloat(e.target.value));
        });

        confirmBtn.addEventListener('click', () => {
            this.promptBox.handler?.onConfirm?.(parseFloat(rangeInput.value));
            this.#close();
        });

        rangeContainer.appendChild(rangeInput);
        rangeContainer.appendChild(valueDisplay);
        rangeContainer.appendChild(confirmBtn);
        this.element.appendChild(rangeContainer);
    }

    #buildColorPicker() {
        const {
            defaultColor = '#3a7bd5', showPreview = true
        } = this.promptBox;

        const colorContainer = document.createElement('div');
        colorContainer.className = 'Prompt-color';

        // Input de tipo color
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = defaultColor;
        colorInput.className = 'Prompt-color-input';

        // Preview del color
        const colorPreview = document.createElement('div');
        colorPreview.className = 'Prompt-color-preview';
        colorPreview.style.backgroundColor = defaultColor;

        // Display del valor HEX
        const hexDisplay = document.createElement('span');
        hexDisplay.className = 'Prompt-color-hex';
        hexDisplay.textContent = defaultColor;

        // Botón de confirmación
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'Prompt-confirm';
        confirmBtn.textContent = this.promptBox.confirmText || 'Seleccionar';

        // Eventos
        colorInput.addEventListener('input', (e) => {
            const color = e.target.value;
            colorPreview.style.backgroundColor = color;
            hexDisplay.textContent = color;
            this.promptBox.handler?.onChange?.(color);
        });

        confirmBtn.addEventListener('click', () => {
            this.promptBox.handler?.onConfirm?.(colorInput.value);
            this.#close();
        });

        colorContainer.appendChild(colorInput);
        if (showPreview) {
            colorContainer.appendChild(colorPreview);
            colorContainer.appendChild(hexDisplay);
        }
        colorContainer.appendChild(confirmBtn);
        this.element.appendChild(colorContainer);
    }

    #buildFilePicker() {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.promptBox.handler?.resolve?.(file);
            } else {
                this.promptBox.handler?.reject?.();
            }
            this.#close();
        };
        this.element.appendChild(input);
    }

    #buildActions() {
        const {
            Actions,
            handler
        } = this.promptBox;

        if (!Actions || typeof Actions !== 'object') {
            throw new Error('Actions must be an object with { "Button Text": "actionKey" }');
        }

        const buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'Prompt-actions';

        // Crear un botón por cada acción definida
        for (const [buttonText, actionKey] of Object.entries(Actions)) {
            const button = document.createElement('button');
            button.textContent = buttonText;
            button.onclick = () => {
                if (handler && typeof handler[actionKey] === 'function') {
                    handler[actionKey]();
                }
                this.#close();
            };
            buttonsDiv.appendChild(button);
        }

        this.element.appendChild(buttonsDiv);
    }

    #buildForm() {
        const {
            Input,
            handler,
            Options = {}
        } = this.promptBox;

        if (!Input || typeof Input !== 'object') {
            throw new Error('Input must be an object with { label, type }');
        }

        const form = document.createElement('form');
        form.className = 'Prompt-form';

        const input = document.createElement('input');
        input.type = this.#resolveInputType(Input.type);
        input.placeholder = Input.label || '';
        input.required = true;

        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.textContent = Input['btnLabel'] || 'Aceptar';

        form.appendChild(input);
        form.appendChild(submitBtn);

        // Botón Cancelar si está habilitado
        if (Options.cancelable) {
            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.textContent = Options.cancelLabel || 'Cancelar';
            cancelBtn.style.marginLeft = '8px';
            cancelBtn.onclick = () => {
                this.kill();
                if (typeof handler?.cancel === 'function') {
                    handler.cancel();
                }
            };
            form.appendChild(cancelBtn);
        }

        form.onsubmit = (e) => {
            e.preventDefault();
            if (handler?.submit) {
                handler.submit(input.value);
            }
            this.#close();
        };

        if (handler?.resolve) {
            input.addEventListener('input', (e) => {
                handler.resolve(e.target.value);
            });
        }

        this.element.appendChild(form);
    }


    #resolveInputType(typeCode) {
        const types = {
            0xA00: 'text',
            0xA01: 'password',
            // ...otros códigos
        };
        return types[typeCode] || 'text'; // Default a texto
    }

    kill() {
        this.#close();
    }

    #close() {
        return new Promise((resolve) => {
            if (!this.element || !this.element.parentNode) {
                resolve();
                return;
            }

            // Reemplazar clase de slide-up por slide-down
            this.element.classList.remove('slide-up');
            this.element.classList.add('slide-down');

            // Esperar a que termine la animación antes de remover el elemento
            this.element.addEventListener('animationend', () => {
                this.element.parentNode.removeChild(this.element);
                resolve();
            }, {
                once: true
            }); // El evento se autoremueve después de ejecutarse
        });
    }
}

// UI Kit (App View)
class DynamicView {
    constructor(config) {
        this.config = {
            model: 'ListView',
            layout: 'portrait',
            startOrientation: 'top',
            Content: [],
            ...config
        };
        this.element = null;
        this.#validateConfig();
    }

    #validateConfig() {
        const validModels = ['ListView', 'CardView', 'GridView', 'Flexbox'];
        if (!validModels.includes(this.config.model)) {
            throw new Error(`Invalid model: ${this.config.model}. Valid options are ${validModels.join(', ')}`);
        }

        const validLayouts = ['landscape', 'portrait'];
        if (!validLayouts.includes(this.config.layout)) {
            throw new Error(`Invalid layout: ${this.config.layout}. Valid options are ${validLayouts.join(', ')}`);
        }

        const validOrientations = this.config.layout === 'landscape' ?
            ['left', 'right'] :
            ['top', 'bottom'];

        if (!validOrientations.includes(this.config.startOrientation)) {
            throw new Error(`Invalid startOrientation for ${this.config.layout} layout: ${this.config.startOrientation}`);
        }
    }

    render(container = document.body) {
        this.element = document.createElement('div');
        this.element.className = `dynamic-view ${this.config.model.toLowerCase()} ${this.config.layout}`;

        // Aplicar dirección basada en orientación
        const flexDirection = this.#getFlexDirection();
        this.element.style.display = 'flex';
        this.element.style.flexDirection = flexDirection;
        this.element.style.gap = '10px';

        // Configuración específica por modelo
        switch (this.config.model) {
            case 'ListView':
                this.#setupListView();
                break;
            case 'CardView':
                this.#setupCardView();
                break;
            case 'GridView':
                this.#setupGridView();
                break;
            case 'Flexbox':
                this.#setupFlexbox();
                break;
        }

        // Añadir contenido
        this.config.Content.forEach(item => {
            const itemElement = this.#createItemElement(item);
            this.element.appendChild(itemElement);
        });

        container.appendChild(this.element);
        return this.element;
    }

    #getFlexDirection() {
        const orientationMap = {
            landscape: {
                left: 'row',
                right: 'row-reverse'
            },
            portrait: {
                top: 'column',
                bottom: 'column-reverse'
            }
        };
        return orientationMap[this.config.layout][this.config.startOrientation];
    }

    #createItemElement(content) {
        const item = document.createElement('div');
        item.className = 'dynamic-view-item';

        if (typeof content === 'string') {
            item.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            item.appendChild(content);
        } else if (typeof content === 'object') {
            // Asumimos que es un objeto con propiedades para el elemento
            Object.assign(item, content);
        }

        // Manejar eventos
        if (this.config.ContentHandler?.click) {
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
                this.config.ContentHandler.click(content);
            });
        }

        return item;
    }

    #setupListView() {
        this.element.style.overflow = this.config.layout === 'landscape' ? 'auto hidden' : 'hidden auto';
        this.element.style.whiteSpace = this.config.layout === 'landscape' ? 'nowrap' : 'normal';

        const items = this.element.querySelectorAll('.dynamic-view-item');
        items.forEach(item => {
            item.style.display = this.config.layout === 'landscape' ? 'inline-block' : 'block';
            item.style.width = this.config.layout === 'landscape' ? '200px' : '100%';
        });
    }

    #setupCardView() {
        this.element.style.flexWrap = 'wrap';
        this.element.style.justifyContent = 'center';

        const items = this.element.querySelectorAll('.dynamic-view-item');
        items.forEach(item => {
            item.style.width = '250px';
            item.style.height = '300px';
            item.style.border = '1px solid #ddd';
            item.style.borderRadius = '8px';
            item.style.padding = '15px';
            item.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
        });
    }

    #setupGridView() {
        this.element.style.display = 'grid';
        this.element.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
        this.element.style.gap = '15px';
        this.element.style.width = '100%';
    }

    #setupFlexbox() {
        this.element.style.flexWrap = 'wrap';
        this.element.style.justifyContent = 'flex-start';
        this.element.style.alignItems = 'stretch';

        const items = this.element.querySelectorAll('.dynamic-view-item');
        items.forEach(item => {
            item.style.flex = '1 1 200px';
            item.style.minWidth = '200px';
            item.style.maxWidth = '100%';
        });
    }

    updateContent(newContent) {
        this.config.Content = newContent;
        this.element.innerHTML = '';
        this.config.Content.forEach(item => {
            this.element.appendChild(this.#createItemElement(item));
        });
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// UI Kit Webview
class WebView {
    constructor(config = {}) {
        this.config = {
            initialUrl: 'about:blank',
            showControls: true,
            allowNavigation: true,
            userAgent: null,
            ...config
        };

        this.history = [];
        this.historyPosition = -1;
        this.element = null;
        this.iframe = null;
        this.controlsElement = null;
        this.loading = false;
    }

    render(container = document.body) {
        // Crear contenedor principal
        this.element = document.createElement('div');
        this.element.className = 'webview-container';

        // Crear controles de navegación si están habilitados
        if (this.config.showControls) {
            this.#createControls();
        }

        // Crear iframe
        this.iframe = document.createElement('iframe');
        this.iframe.className = 'webview-frame';
        this.iframe.sandbox = 'allow-same-origin allow-scripts allow-forms allow-popups allow-modals';

        if (this.config.showControls === false) {
            this.iframe.style.height = '100%'
        }

        if (this.config.userAgent) {
            this.iframe.setAttribute('useragent', this.config.userAgent);
        }

        // Configurar eventos
        this.iframe.addEventListener('load', () => this.#handleLoad());
        this.iframe.addEventListener('error', () => this.#handleError());

        this.element.appendChild(this.iframe);
        container.appendChild(this.element);

        // Cargar URL inicial
        this.loadUrl(this.config.initialUrl);

        return this.element;
    }

    #createControls() {
        this.controlsElement = document.createElement('div');
        this.controlsElement.className = 'webview-controls';

        const backBtn = document.createElement('button');
        backBtn.innerHTML = '&larr;';
        backBtn.title = 'Atrás';
        backBtn.addEventListener('click', () => this.goBack());

        const forwardBtn = document.createElement('button');
        forwardBtn.innerHTML = '&rarr;';
        forwardBtn.title = 'Adelante';
        forwardBtn.addEventListener('click', () => this.goForward());

        const reloadBtn = document.createElement('button');
        reloadBtn.innerHTML = '&#x21bb;';
        reloadBtn.title = 'Recargar';
        reloadBtn.addEventListener('click', () => this.reload());

        const urlInput = document.createElement('input');
        urlInput.type = 'text';
        urlInput.className = 'webview-url';
        urlInput.placeholder = 'Ingrese URL';
        urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.loadUrl(e.target.value);
            }
        });

        const spinner = document.createElement('div');
        spinner.className = 'webview-spinner';

        this.controlsElement.append(backBtn, forwardBtn, reloadBtn, urlInput, spinner);
        this.element.appendChild(this.controlsElement);
    }

    loadUrl(url) {
        if (!url) return;

        // Asegurar que la URL tenga protocolo
        if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('about:')) {
            url = 'https://' + url;
        }

        this.loading = true;
        this.#updateControls();

        try {
            this.iframe.src = url;
            this.#addToHistory(url);
        } catch (error) {
            console.error('Error loading URL:', error);
            this.loading = false;
            this.#updateControls();
        }
    }

    #handleLoad() {
        this.loading = false;
        this.#updateControls();

        if (this.config.onLoad) {
            this.config.onLoad(this.iframe.contentWindow.location.href);
        }
    }

    #handleError() {
        this.loading = false;
        this.#updateControls();

        if (this.config.onError) {
            this.config.onError();
        }
    }

    #addToHistory(url) {
        // No añadir la misma URL consecutiva
        if (this.history[this.historyPosition] === url) return;

        // Si estamos en medio del historial, cortar el futuro
        this.history = this.history.slice(0, this.historyPosition + 1);

        this.history.push(url);
        this.historyPosition = this.history.length - 1;
    }

    goBack() {
        if (this.historyPosition > 0) {
            this.historyPosition--;
            this.loadUrl(this.history[this.historyPosition], true);
        }
    }

    goForward() {
        if (this.historyPosition < this.history.length - 1) {
            this.historyPosition++;
            this.loadUrl(this.history[this.historyPosition], true);
        }
    }

    reload() {
        if (this.historyPosition >= 0) {
            this.loadUrl(this.history[this.historyPosition]);
        }
    }

    #updateControls() {
        if (!this.controlsElement) return;

        const backBtn = this.controlsElement.querySelector('button:nth-child(1)');
        const forwardBtn = this.controlsElement.querySelector('button:nth-child(2)');
        const reloadBtn = this.controlsElement.querySelector('button:nth-child(3)');
        const urlInput = this.controlsElement.querySelector('input');
        const spinner = this.controlsElement.querySelector('.webview-spinner');

        if (backBtn) backBtn.disabled = this.historyPosition <= 0;
        if (forwardBtn) forwardBtn.disabled = this.historyPosition >= this.history.length - 1;

        if (urlInput && this.historyPosition >= 0) {
            urlInput.value = this.history[this.historyPosition];
        }

        if (spinner) {
            spinner.style.display = this.loading ? 'block' : 'none';
        }

        if (reloadBtn) {
            reloadBtn.innerHTML = this.loading ? '×' : '&#x21bb;';
            reloadBtn.title = this.loading ? 'Detener' : 'Recargar';
        }
    }

    executeScript(code) {
        if (!this.iframe.contentWindow) return null;

        try {
            return this.iframe.contentWindow.eval(code);
        } catch (error) {
            console.error('Error executing script:', error);
            return null;
        }
    }

    injectCSS(css) {
        if (!this.iframe.contentDocument) return;

        const style = document.createElement('style');
        style.textContent = css;
        this.iframe.contentDocument.head.appendChild(style);
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.iframe = null;
        this.element = null;
    }
}

// UI Kit Surface
class MonekoSurface {
    constructor(config = {}) {
        this.config = {
            icon: {
                type: 'emoji',
                value: '✨'
            },
            title: '',
            message: '',
            actions: [],
            duration: 4000,
            mode: 'Notify', // 'Notify', 'Persistent', 'WAIR'
            type: 'system',
            ...config
        };
        this.element = null;
    }

    show() {
        this.#applyTypeDefaults();
        this.#createSurface();
        document.body.appendChild(this.element);
        requestAnimationFrame(() => {
            this.element.classList.add('show');
        });

        if (this.config.mode === 'Notify') {
            setTimeout(() => this.close(), this.config.duration);
        }
    }

    close() {
        if (this.element) {
            this.element.classList.remove('show');
            this.element.classList.add('hide');
            this.element.addEventListener('animationend', () => {
                this.element?.remove();
            }, {
                once: true
            });
        }
    }

    #applyTypeDefaults() {
        const presets = {
            call: {
                icon: {
                    type: 'icon',
                    value: 'call'
                },
                title: 'Llamada entrante',
                message: 'Contacto desconocido'
            },
            stopwatch: {
                icon: {
                    type: 'icon',
                    value: 'timer'
                },
                title: 'Cronómetro',
                message: 'Contando...'
            },
            countdown: {
                icon: {
                    type: 'icon',
                    value: 'hourglass_bottom'
                },
                title: 'Cuenta regresiva',
                message: 'Finaliza pronto'
            },
            alarm: {
                icon: {
                    type: 'icon',
                    value: 'alarm'
                },
                title: 'Alarma activada',
                message: '¡Despierta!'
            },
            reminder: {
                icon: {
                    type: 'emoji',
                    value: '🔔'
                },
                title: 'Recordatorio',
                message: 'Tienes una tarea pendiente'
            },
            MMC: {
                icon: {
                    type: 'emoji',
                    value: '🎶'
                },
                title: 'Multimedia',
                message: 'Control en curso'
            },
            recording: {
                icon: {
                    type: 'emoji',
                    value: '🔴'
                },
                title: 'Grabando',
                message: 'Micrófono activo'
            },
            notification: {
                icon: {
                    type: 'icon',
                    value: 'notifications'
                },
                title: 'Notificación',
                message: 'Tienes un nuevo mensaje'
            },
            error: {
                icon: {
                    type: 'icon',
                    value: 'error'
                },
                title: 'Error',
                message: 'Ocurrió un problema'
            },
            warning: {
                icon: {
                    type: 'icon',
                    value: 'warning'
                },
                title: 'Advertencia',
                message: 'Acción necesaria'
            },
            MAUI: {
                icon: {
                    type: 'emoji',
                    value: '🤖'
                },
                title: 'Moneko Assistant',
                message: '¿En qué puedo ayudarte?'
            }
        };

        const defaults = presets[this.config.type];
        if (defaults) {
            this.config.icon ??= defaults.icon;
            this.config.title ||= defaults.title;
            this.config.message ||= defaults.message;
        }
    }

    #createSurface() {
        const surface = document.createElement('div');
        surface.className = 'moneko-surface';

        // Icono
        const iconWrap = document.createElement('div');
        iconWrap.className = 'moneko-surface-icon';
        if (this.config.icon.type === 'emoji') {
            iconWrap.textContent = this.config.icon.value;
        } else if (this.config.icon.type === 'image') {
            const img = document.createElement('img');
            img.src = this.config.icon.value;
            img.alt = 'icon';
            iconWrap.appendChild(img);
        } else if (this.config.icon.type === 'icon') {
            const span = document.createElement('span');
            span.className = 'material-icons';
            span.textContent = this.config.icon.value;
            iconWrap.appendChild(span);
        }

        // Contenido
        const content = document.createElement('div');
        content.className = 'moneko-surface-content';
        const title = document.createElement('div');
        title.className = 'moneko-surface-title';
        title.textContent = this.config.title;
        const message = document.createElement('div');
        message.className = 'moneko-surface-message';
        message.textContent = this.config.message;
        content.append(title, message);

        // Acciones
        const actions = document.createElement('div');
        actions.className = 'moneko-surface-actions';
        this.config.actions.forEach(act => {
            const btn = document.createElement('button');
            btn.className = 'surface-action-btn';
            btn.textContent = act.icon;
            btn.onclick = () => act.onClick?.();
            actions.appendChild(btn);
        });

        surface.append(iconWrap, content, actions);
        this.element = surface;
    }

    static show(config) {
        const instance = new MonekoSurface(config);
        instance.show();
        return instance;
    }
}

// UI Kit Toast
class Toast {
    static show(config) {
        const toast = document.createElement('div');
        toast.className = `mui-toast ${config.type || 'info'}`;
        toast.innerHTML = `
      <div class="mui-toast-content">${config.message}</div>
      <button class="mui-toast-close">&times;</button>
    `;

        document.body.appendChild(toast);

        // Animación de entrada
        setTimeout(() => toast.classList.add('show'), 10);

        // Cierre automático
        const duration = config.duration || 3000;
        let timeout = setTimeout(() => this.close(toast), duration);

        // Cierre manual
        toast.querySelector('.mui-toast-close').onclick = () => {
            clearTimeout(timeout);
            this.close(toast);
        };
    }

    static close(toast) {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }
}

// UI Kit InfoBar
class InfoBar {
    constructor(config) {
        this.bar = document.createElement('div');
        this.bar.className = `mui-info-bar ${config.type || 'info'}`;
        this.bar.innerHTML = `
      <div class="mui-info-content">${config.message}</div>
      ${config.dismissible ? '<button class="mui-info-close">&times;</button>' : ''}
    `;

        if (config.dismissible) {
            this.bar.querySelector('.mui-info-close').onclick = () => this.dismiss();
        }

        document.body.insertBefore(this.bar, document.body.firstChild);
    }

    dismiss() {
        this.bar.classList.add('dismissing');
        setTimeout(() => this.bar.remove(), 300);
    }

    update(message) {
        this.bar.querySelector('.mui-info-content').textContent = message;
    }
}

// UI Kit Context Menu
class PopupMenu {
    constructor(options = {}, parent = document.body) {
        this.type = options.type || 'Global';
        this.overwriteGlobal = options.OverwriteGlobal || false;
        this.actions = options.actions || [];
        this.parent = parent;

        this._buildMenu();
        this._attachEvents();
    }

    _buildMenu() {
        // Contenedor general
        this.root = document.createElement('div');
        this.root.classList.add('mui-popupmenu');
        this.root.tabIndex = 0;

        // Botón para abrir menú
        this.button = document.createElement('button');
        this.button.classList.add('mui-popupmenu-button');
        this.button.textContent = '☰';

        // Lista oculta de acciones
        this.list = document.createElement('ul');
        this.list.classList.add('mui-popupmenu-list');
        this.list.hidden = true;

        this.actions.forEach(action => {
            const li = document.createElement('li');
            li.classList.add('mui-popupmenu-item');
            li.textContent = action.label;
            li.dataset.action = action.action;
            this.list.appendChild(li);
        });

        this.root.appendChild(this.button);
        this.root.appendChild(this.list);
        this.parent.appendChild(this.root);
    }

    _attachEvents() {
        this.button.addEventListener('click', () => this._toggleMenu());
        this.list.addEventListener('click', e => {
            if (e.target.classList.contains('mui-popupmenu-item')) {
                this._selectAction(e.target.dataset.action);
            }
        });

        // Cierra menú si clic fuera o pierde foco
        document.addEventListener('click', e => {
            if (!this.root.contains(e.target)) {
                this._closeMenu();
            }
        });

        this.root.addEventListener('keydown', e => {
            if (e.key === 'Escape') this._closeMenu();
        });
    }

    _toggleMenu() {
        this.list.hidden ? this._openMenu() : this._closeMenu();
    }

    _openMenu() {
        this.list.hidden = false;
        this.list.focus();
    }

    _closeMenu() {
        this.list.hidden = true;
    }

    _selectAction(action) {
        this._closeMenu();
        // Evento custom o callback
        const event = new CustomEvent('popupmenu-select', {
            detail: {
                action
            }
        });
        this.root.dispatchEvent(event);
    }

    // Método estático para integrar con MonekoContext
    static show(options) {
        // Por simplicidad, creamos un contenedor global y montamos el PopupMenu ahí
        let container = document.getElementById('moneko-popupmenu-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'moneko-popupmenu-container';
            container.style.position = 'fixed';
            container.style.top = '10px';
            container.style.right = '10px';
            container.style.zIndex = 99999;
            document.body.appendChild(container);
        }

        // Limpia contenido anterior si OverwriteGlobal es true y tipo es Global
        if (options.type === 'Global' && options.OverwriteGlobal) {
            container.innerHTML = '';
        }

        const menu = new PopupMenu(options, container);
        menu.root.addEventListener('popupmenu-select', e => {
            if (typeof options.onSelect === 'function') {
                options.onSelect(e.detail.action);
            } else {
                console.log('Acción seleccionada:', e.detail.action);
            }
        });

        return menu;
    }
}

class MonekoMenu {
    constructor() {
        this.root = document.createElement('ul');
        this.root.classList.add('mui-popupmenu-list');
        this.root.hidden = true;

        document.body.appendChild(this.root);

        this._bindEvents();
    }

    _bindEvents() {
        this.root.addEventListener('click', (e) => {
            const item = e.target.closest('.mui-popupmenu-item');
            if (item) {
                const action = item.dataset.action;
                this.hide();
                if (this._onSelect) this._onSelect(action);
            }
        });

        document.addEventListener('click', (e) => {
            if (!this.root.contains(e.target)) this.hide();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.hide();
        });
    }

    setActions(actions = []) {
        this.root.innerHTML = '';
        for (const {
                label,
                action
            }
            of actions) {
            const li = document.createElement('li');
            li.className = 'mui-popupmenu-item';
            li.dataset.action = action;
            li.textContent = label;
            this.root.appendChild(li);
        }
    }

    showAt(x, y) {
        this.root.style.top = `${y}px`;
        this.root.style.left = `${x}px`;
        this.root.style.position = 'fixed';
        this.root.hidden = false;
    }

    hide() {
        this.root.hidden = true;
    }

    attachTo(element, actions = []) {
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.setActions(actions);
            this.showAt(e.clientX, e.clientY);
        });
    }

    onSelect(callback) {
        this._onSelect = callback;
    }

    destroy() {
        this.root.remove();
    }
}

// UI Kit Music Player
class MusicPlayer {
    constructor(config) {
        this.audio = new Audio();
        this.config = config;
        this.element = this.#createPlayer();
    }

    #createPlayer() {
        const player = document.createElement('div');
        player.className = 'mui-music-player';
        player.innerHTML = `
      <button class="mui-play-btn">▶</button>
      <div class="mui-progress-container">
        <div class="mui-progress-bar"></div>
      </div>
      <div class="mui-track-info">${this.config.trackName || 'Unknown Track'}</div>
      <input type="range" class="mui-volume" min="0" max="1" step="0.01" value="0.7">
    `;

        // Controles
        player.querySelector('.mui-play-btn').onclick = () => this.togglePlay();
        player.querySelector('.mui-volume').oninput = (e) => {
            this.audio.volume = e.target.value;
        };

        // Cargar audio
        this.audio.src = this.config.src;
        this.audio.load();

        // Actualizar progreso
        this.audio.ontimeupdate = () => {
            const percent = (this.audio.currentTime / this.audio.duration) * 100;
            player.querySelector('.mui-progress-bar').style.width = `${percent}%`;
        };

        return player;
    }

    togglePlay() {
        if (this.audio.paused) {
            this.audio.play();
            this.element.querySelector('.mui-play-btn').textContent = '❚❚';
        } else {
            this.audio.pause();
            this.element.querySelector('.mui-play-btn').textContent = '▶';
        }
    }

    render(target = document.body) {
        target.appendChild(this.element);
    }
}

// UI Kit Video Player
class VideoPlayer {
    constructor(config) {
        this.config = config;
        this.element = this.#createPlayer();
    }

    #createPlayer() {
        const player = document.createElement('div');
        player.className = 'mui-video-player';
        player.innerHTML = `
      <video class="mui-video" controls></video>
      <div class="mui-video-controls">
        <button class="mui-play-btn">▶</button>
        <input type="range" class="mui-seek" value="0">
        <span class="mui-time">00:00 / 00:00</span>
      </div>
    `;

        this.video = player.querySelector('.mui-video');
        this.seek = player.querySelector('.mui-seek');
        this.timeDisplay = player.querySelector('.mui-time');

        this.video.src = this.config.src;


        // Eventos
        this.video.onplay = () => player.querySelector('.mui-play-btn').textContent = '❚❚';
        this.video.onpause = () => player.querySelector('.mui-play-btn').textContent = '▶';
        this.video.ontimeupdate = this.#updateSeek.bind(this);

        this.seek.oninput = (e) => {
            this.video.currentTime = (e.target.value / 100) * this.video.duration;
        };

        player.querySelector('.mui-play-btn').onclick = () => {
            this.video.paused ? this.video.play() : this.video.pause();
        };

        return player;
    }

    #updateSeek() {
        const percent = (this.video.currentTime / this.video.duration) * 100;
        this.seek.value = percent;

        const formatTime = (time) => {
            const mins = Math.floor(time / 60);
            const secs = Math.floor(time % 60);
            return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        };

        this.timeDisplay.textContent = `${formatTime(this.video.currentTime)} / ${formatTime(this.video.duration)}`;
    }

    render(target = document.body) {
        target.appendChild(this.element);
    }
}

// UI Kit Image Viewer
class ImageViewer {
    constructor(config) {
        this.images = config.images || [];
        this.currentIndex = 0;
        this.element = this.#createViewer();
    }

    #createViewer() {
        const viewer = document.createElement('div');
        viewer.className = 'mui-image-viewer';
        viewer.innerHTML = `
      <div class="mui-image-container">
        <img src="${this.images[0]?.src || ''}" alt="${this.images[0]?.alt || ''}">
      </div>
      <button class="mui-prev-btn">‹</button>
      <button class="mui-next-btn">›</button>
      <div class="mui-thumbnails"></div>
    `;

        // Navegación
        viewer.querySelector('.mui-prev-btn').onclick = () => this.navigate(-1);
        viewer.querySelector('.mui-next-btn').onclick = () => this.navigate(1);

        // Miniaturas
        const thumbnails = viewer.querySelector('.mui-thumbnails');
        this.images.forEach((img, index) => {
            const thumb = document.createElement('img');
            thumb.src = img.src;
            thumb.onclick = () => this.goTo(index);
            thumbnails.appendChild(thumb);
        });

        return viewer;
    }

    navigate(direction) {
        this.currentIndex = (this.currentIndex + direction + this.images.length) % this.images.length;
        this.updateView();
    }

    goTo(index) {
        this.currentIndex = index;
        this.updateView();
    }

    updateView() {
        const img = this.element.querySelector('.mui-image-container img');
        img.src = this.images[this.currentIndex].src;
        img.alt = this.images[this.currentIndex].alt;
    }

    render(target = document.body) {
        target.appendChild(this.element);
    }
}

// UI Kit Hamburger Menu
class HamburgerMenu {
    constructor(config) {
        this.config = config;
        this.isOpen = false;
        this.element = null;
        this.menu = null;
        this.#init();
    }

    #init() {
        // Configuración predeterminada
        this.config = {
            position: 'right', // 'left' | 'right'
            animationSpeed: 300, // ms
            closeOnOutsideClick: true,
            closeOnItemClick: true,
            ...this.config
        };
    }

    render(target = document.body) {
        // Crear botón hamburguesa
        this.element = document.createElement('button');
        this.element.className = 'mui-hamburger';
        this.element.setAttribute('aria-label', 'Menú');
        this.element.setAttribute('aria-expanded', 'false');
        this.element.innerHTML = `
      <span class="line"></span>
      <span class="line"></span>
      <span class="line"></span>
    `;

        // Crear menú desplegable
        this.menu = document.createElement('div');
        this.menu.className = `mui-hamburger-menu ${this.config.position}`;
        this.menu.setAttribute('aria-hidden', 'true');

        // Añadir items al menú
        this.config.items.forEach(item => {
            const itemEl = this.#createMenuItem(item);
            this.menu.appendChild(itemEl);
        });

        // Eventos
        this.element.addEventListener('click', (e) => {
            e.stopPropagation(); // Evitar que se propague y cierre inmediatamente
            this.toggle();
        });

        if (this.config.closeOnOutsideClick) {
            document.addEventListener('click', (e) => {
                if (this.isOpen && !this.element.contains(e.target) && !this.menu.contains(e.target)) {
                    this.close();
                }
            });
        }

        // Añadir al DOM
        if (target) {
            target.appendChild(this.element);
            target.appendChild(this.menu);
        }

        return {
            button: this.element,
            menu: this.menu
        };
    }

    #createMenuItem(item) {
        const itemEl = document.createElement(item.href ? 'a' : 'button');
        itemEl.className = 'menu-item';

        if (item.href) {
            itemEl.href = item.href;
        } else {
            itemEl.type = 'button';
        }

        itemEl.textContent = item.label;

        if (item.onClick) {
            itemEl.addEventListener('click', (e) => {
                if (item.href) e.preventDefault();
                item.onClick();
                if (this.config.closeOnItemClick) this.close();
            });
        }

        return itemEl;
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        this.element.classList.add('open');
        this.element.setAttribute('aria-expanded', 'true');
        this.menu.classList.add('open');
        this.menu.setAttribute('aria-hidden', 'false');
        this.config.onOpen?.();
    }

    close() {
        this.isOpen = false;
        this.element.classList.remove('open');
        this.element.setAttribute('aria-expanded', 'false');
        this.menu.classList.remove('open');
        this.menu.setAttribute('aria-hidden', 'true');
        this.config.onClose?.();
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        if (this.menu && this.menu.parentNode) {
            this.menu.parentNode.removeChild(this.menu);
        }
        document.removeEventListener('click', this.close);
    }
}

// UI Kit TabBar
class TabBar {
    constructor(config) {
        this.config = {
            tabs: [],
            initialTab: 0,
            position: 'top', // 'top' | 'bottom'
            style: 'default', // 'default' | 'compact' | 'pill'
            onChange: null,
            ...config
        };
        this.activeTab = this.config.initialTab;
        this.element = null;
    }

    render(target = document.body) {
        this.element = document.createElement('div');
        this.element.className = `mui-tabbar ${this.config.position} ${this.config.style}`;

        // Crear pestañas
        this.config.tabs.forEach((tab, index) => {
            const tabElement = document.createElement('button');
            tabElement.className = `tab ${index === this.activeTab ? 'active' : ''}`;
            tabElement.textContent = tab.label;
            tabElement.addEventListener('click', () => this.#switchTab(index));

            if (tab.icon) {
                const icon = document.createElement('span');
                icon.className = `tab-icon ${tab.icon}`;
                tabElement.prepend(icon);
            }

            this.element.appendChild(tabElement);
        });

        if (target) {
            target.appendChild(this.element);
        }

        return this.element;
    }

    #switchTab(index) {
        if (index === this.activeTab) return;

        // Actualizar estado
        const prevTab = this.activeTab;
        this.activeTab = index;

        // Actualizar UI
        this.element.querySelectorAll('.tab').forEach((tab, i) => {
            tab.classList.toggle('active', i === index);
        });

        // Disparar evento
        this.config.onChange?.({
            previous: prevTab,
            current: index,
            tabData: this.config.tabs[index]
        });
    }

    setActiveTab(index) {
        if (index >= 0 && index < this.config.tabs.length) {
            this.#switchTab(index);
        }
    }

    updateTabLabel(index, newLabel) {
        const tab = this.element.querySelector(`.tab:nth-child(${index + 1})`);
        if (tab) {
            tab.textContent = newLabel;
            if (this.config.tabs[index].icon) {
                const icon = document.createElement('span');
                icon.className = `tab-icon ${this.config.tabs[index].icon}`;
                tab.prepend(icon);
            }
        }
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
    }
}

// UI Kit W3BHeader
class WebsiteHeader {
    constructor(config) {
        this.config = {
            logo: '',
            title: '',
            navItems: [],
            fixed: true,
            showHamburger: false,
            hamburgerConfig: {},
            ...config
        };
        this.element = null;
        this.hamburgerMenu = null;
    }

    render(target = document.body) {
        this.element = document.createElement('header');
        this.element.className = `mui-website-header ${this.config.fixed ? 'fixed' : ''}`;

        // Logo y título
        const brand = document.createElement('div');
        brand.className = 'header-brand';

        if (this.config.logo) {
            const logo = document.createElement('img');
            logo.src = this.config.logo;
            logo.alt = this.config.title || 'Logo';
            brand.appendChild(logo);
        }

        if (this.config.title) {
            const title = document.createElement('h1');
            title.textContent = this.config.title;
            brand.appendChild(title);
        }

        this.element.appendChild(brand);

        // Menú de navegación (desktop)
        const nav = document.createElement('nav');
        nav.className = 'header-nav';

        this.config.navItems.forEach(item => {
            const navItem = document.createElement('a');
            navItem.href = item.href || '#';
            navItem.textContent = item.label;
            navItem.className = 'nav-item';

            if (item.onClick) {
                navItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    item.onClick();
                });
            }

            nav.appendChild(navItem);
        });

        this.element.appendChild(nav);

        // Menú hamburguesa (mobile)
        if (this.config.showHamburger) {
            const hamburgerContainer = document.createElement('div');
            hamburgerContainer.className = 'hamburger-container';

            this.hamburgerMenu = new HamburgerMenu({
                items: this.config.navItems,
                position: 'right',
                ...this.config.hamburgerConfig
            });

            this.hamburgerMenu.render(hamburgerContainer);
            this.element.appendChild(hamburgerContainer);
        }

        // Añadir al DOM
        if (target) {
            target.prepend(this.element);
        }

        // Responsive behavior
        this.#setupResponsive();

        return this.element;
    }

    #setupResponsive() {
        const handleResize = () => {
            const nav = this.element.querySelector('.header-nav');
            if (this.config.showHamburger) {
                const isMobile = window.innerWidth < 768;
                nav.style.display = isMobile ? 'none' : 'flex';
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Ejecutar inicialmente
    }

    updateNavItems(newItems) {
        this.config.navItems = newItems;
        const nav = this.element.querySelector('.header-nav');
        nav.innerHTML = '';

        newItems.forEach(item => {
            const navItem = document.createElement('a');
            navItem.href = item.href || '#';
            navItem.textContent = item.label;
            navItem.className = 'nav-item';

            if (item.onClick) {
                navItem.addEventListener('click', (e) => {
                    e.preventDefault();
                    item.onClick();
                });
            }

            nav.appendChild(navItem);
        });

        if (this.hamburgerMenu) {
            this.hamburgerMenu.destroy();
            const hamburgerContainer = document.createElement('div');
            hamburgerContainer.className = 'hamburger-container';
            this.hamburgerMenu = new HamburgerMenu({
                items: newItems,
                position: 'right',
                ...this.config.hamburgerConfig
            });
            this.hamburgerMenu.render(hamburgerContainer);
            this.element.appendChild(hamburgerContainer);
        }
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        if (this.hamburgerMenu) {
            this.hamburgerMenu.destroy();
        }
        window.removeEventListener('resize', this.handleResize);
    }
}

// Tools kit
class Scheduler {
    static sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static delay(fn, ms) {
        return setTimeout(fn, ms);
    }

    static loop(fn, ms) {
        return setInterval(fn, ms);
    }

    static cancel(id) {
        clearTimeout(id);
        clearInterval(id);
    }
}

// Colorize V2
class ColorizeV2 {
    constructor(options = {}) {
        this.colorLimit = options.colorLimit || 5; // Número de colores dominantes
        this.precision = options.precision || 50; // Precisión de agrupación de color
    }

    // Método principal para extraer colores dominantes de una imagen
    extractColors(imageSource, callback, isUrl = false) {
        if (isUrl) {
            this.loadImageFromUrl(imageSource)
                .then((img) => this.processImage(img, callback))
                .catch((error) => {
                    console.error("Error al cargar la imagen desde URL:", error);
                });
        } else {
            this.loadImage(imageSource)
                .then((img) => this.processImage(img, callback))
                .catch((error) => {
                    console.error("Error al cargar la imagen:", error);
                });
        }
    }

    // Cargar imagen desde un archivo
    loadImage(imageFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => resolve(img);
                img.onerror = reject;
            };
            reader.readAsDataURL(imageFile);
        });
    }

    // Cargar imagen desde una URL
    loadImageFromUrl(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(img);
            img.onerror = reject;
        });
    }

    // Procesar la imagen y extraer los colores
    processImage(img, callback) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const pixels = imageData.data;
        const colorCount = {};

        // Recorrer los píxeles y contar los colores
        for (let i = 0; i < pixels.length; i += 4) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];

            // Redondear para agrupar colores similares
            const color = `${Math.round(r / this.precision) * this.precision},${Math.round(g / this.precision) * this.precision},${Math.round(b / this.precision) * this.precision}`;

            colorCount[color] = (colorCount[color] || 0) + 1;
        }

        // Ordenar colores por frecuencia y obtener los más comunes
        const sortedColors = Object.entries(colorCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, this.colorLimit)
            .map(([color]) => color.split(',').map(Number));

        // Ejecutar callback con los colores obtenidos
        if (callback && typeof callback === 'function') {
            const UI = {
                "Colors": sortedColors,
                "TextColor": this.#ColorizeText(sortedColors[0])
            };

            callback(UI);
        }
    }

    // Colorize Text Algorithm
    #ColorizeText = (r, g, b) => {
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        return luma > 128 ? '#000000' : '#FFFFFF';
    }
}

// Colorrize V3
class ColorizeV3 {
    constructor(options = {}) {
        this.colorLimit = options.colorLimit || 5; // Número de colores dominantes
        this.precision = options.precision || 50; // Precisión de agrupación de color
        this.paletteSize = options.paletteSize || 5; // Tamaño de la paleta para cada color
    }

    // Método principal para extraer colores dominantes de una imagen
    extractColors(imageFile, callback) {
        this.loadImage(imageFile)
            .then((img) => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0, img.width, img.height);

                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                const pixels = imageData.data;
                const colorCount = {};

                // Recorrer los píxeles y contar los colores
                for (let i = 0; i < pixels.length; i += 4) {
                    const r = pixels[i];
                    const g = pixels[i + 1];
                    const b = pixels[i + 2];

                    // Redondear para agrupar colores similares
                    const color = `${Math.round(r / this.precision) * this.precision},${Math.round(g / this.precision) * this.precision},${Math.round(b / this.precision) * this.precision}`;

                    colorCount[color] = (colorCount[color] || 0) + 1;
                }

                // Ordenar colores por frecuencia y obtener los más comunes
                const sortedColors = Object.entries(colorCount)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, this.colorLimit)
                    .map(([color]) => color.split(',').map(Number));

                // Generar paletas y determinar el color del texto para cada color
                const results = sortedColors.map((color) => {
                    const palette = this.generatePalette(color, this.paletteSize);
                    const textColor = this.#ColorizeText(...color); // Decidir el color del texto
                    return {
                        color, // Color dominante
                        palette, // Paleta generada
                        textColor // Color del texto basado en el color dominante
                    };
                });

                // Ejecutar callback con los resultados
                if (callback && typeof callback === 'function') {
                    let UI = {
                        Colors: results
                    };

                    callback(UI);
                }
            })
            .catch((error) => {
                console.error("Error al cargar la imagen:", error);
            });
    }

    // Colorize Text Algorithm
    #ColorizeText = (r, g, b) => {
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;

        return luma > 128 ? '#000000' : '#FFFFFF';
    }

    // Método para cargar la imagen desde un archivo
    loadImage(imageFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => resolve(img);
                img.onerror = reject;
            };
            reader.readAsDataURL(imageFile);
        });
    }

    // Generar una paleta de colores basados en el color original
    generatePalette(baseColor, size) {
        const [r, g, b] = baseColor;
        const palette = [];

        for (let i = 1; i <= size; i++) {
            const factor = i / (size + 1); // Fracción para variar los colores
            palette.push([
                Math.min(255, Math.max(0, r + factor * 50)), // Ajuste en el rango 0-255
                Math.min(255, Math.max(0, g + factor * 50)),
                Math.min(255, Math.max(0, b + factor * 50))
            ]);
        }

        return palette;
    }
}

// Audio Metadata ID3v2
class AudioMetadataReader {
    constructor(file) {
        this.file = file;
    }

    async readMetadata() {
        return new Promise((resolve, reject) => {
            if (!this.file) {
                reject("No file provided");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const arrayBuffer = event.target.result;
                const dataView = new DataView(arrayBuffer);

                if (this.isID3v2Tag(dataView)) {
                    resolve({
                        version: "ID3v2",
                        metadata: this.extractID3v2Tags(dataView),
                    });
                } else if (this.isID3v1Tag(dataView)) {
                    resolve({
                        version: "ID3v1",
                        metadata: this.extractID3v1Tags(dataView),
                    });
                } else {
                    reject("No ID3 metadata found");
                }
            };

            reader.onerror = () => reject("Error reading file");
            reader.readAsArrayBuffer(this.file);
        });
    }

    isID3v2Tag(dataView) {
        return (
            dataView.getUint8(0) === 0x49 &&
            dataView.getUint8(1) === 0x44 &&
            dataView.getUint8(2) === 0x33
        );
    }

    isID3v1Tag(dataView) {
        const tagOffset = dataView.byteLength - 128;
        return (
            dataView.getUint8(tagOffset) === 0x54 &&
            dataView.getUint8(tagOffset + 1) === 0x41 &&
            dataView.getUint8(tagOffset + 2) === 0x47
        );
    }

    extractID3v2Tags(dataView) {
        let tags = {
            title: "Unknown",
            artist: "Unknown",
            album: "Unknown",
            year: "Unknown",
            cover: null
        };
        let position = 10;

        while (position < dataView.byteLength) {
            const frameID = this.readString(dataView, position, 4);
            if (!/^[A-Z0-9]{3,4}$/.test(frameID)) break; // Evita leer basura

            let frameSize = dataView.getUint32(position + 4, false);
            if (frameSize & 0x80808080) {
                frameSize = ((frameSize & 0x7F000000) >> 3) |
                    ((frameSize & 0x007F0000) >> 2) |
                    ((frameSize & 0x00007F00) >> 1) |
                    (frameSize & 0x0000007F);
            }

            const frameDataStart = position + 10;
            if (frameSize <= 0 || frameDataStart + frameSize > dataView.byteLength) break;

            switch (frameID) {
                case "TIT2":
                    tags.title = this.readTextFrame(dataView, frameDataStart, frameSize);
                    break;
                case "TPE1":
                    tags.artist = this.readTextFrame(dataView, frameDataStart, frameSize);
                    break;
                case "TALB":
                    tags.album = this.readTextFrame(dataView, frameDataStart, frameSize);
                    break;
                case "TYER":
                    tags.year = this.readTextFrame(dataView, frameDataStart, frameSize);
                    break;
                case "APIC":
                    tags.cover = this.readPictureFrame(dataView, frameDataStart, frameSize);
                    break;
            }
            position += 10 + frameSize;
        }
        return tags;
    }


    isID3v1Tag(dataView) {
        const tagOffset = dataView.byteLength - 128;
        if (tagOffset < 0) return false;

        return (
            dataView.getUint8(tagOffset) === 0x54 && // T
            dataView.getUint8(tagOffset + 1) === 0x41 && // A
            dataView.getUint8(tagOffset + 2) === 0x47 // G
        );
    }


    readTextFrame(dataView, offset, length) {
        const encoding = dataView.getUint8(offset);
        let textBuffer = new Uint8Array(dataView.buffer, offset + 1, length - 1);
        let decoder;

        switch (encoding) {
            case 0: // ISO-8859-1
                decoder = new TextDecoder("iso-8859-1");
                break;
            case 1: // UTF-16 (con posible BOM)
                if (textBuffer[0] === 0xFF && textBuffer[1] === 0xFE) {
                    decoder = new TextDecoder("utf-16le");
                    textBuffer = textBuffer.subarray(2); // Omitir BOM
                } else if (textBuffer[0] === 0xFE && textBuffer[1] === 0xFF) {
                    decoder = new TextDecoder("utf-16be");
                    textBuffer = textBuffer.subarray(2); // Omitir BOM
                } else {
                    decoder = new TextDecoder("utf-16le"); // Asumimos little-endian por defecto
                }
                break;
            case 3: // UTF-8
                decoder = new TextDecoder("utf-8");
                break;
            default:
                decoder = new TextDecoder("utf-8"); // Fallback a UTF-8
        }

        return decoder.decode(textBuffer).replace(/\0/g, "").trim();
    }


    readString(dataView, offset, length) {
        let text = "";
        for (let i = 0; i < length; i++) {
            const char = dataView.getUint8(offset + i);
            if (char === 0) break;
            text += String.fromCharCode(char);
        }
        return text;
    }

    readPictureFrame(dataView, offset, length) {
        let position = offset;

        // Leer el encoding
        const encoding = dataView.getUint8(position++);

        // Leer el MIME type
        let mimeType = "";
        while (dataView.getUint8(position) !== 0) mimeType += String.fromCharCode(dataView.getUint8(position++));
        position++; // Saltar el null terminator

        // Saltar la descripción (ignorarla)
        while (dataView.getUint8(position) !== 0) position++;
        position++; // Saltar el null terminator

        // Calcular tamaño real de la imagen
        let imageSize = length - (position - offset);
        if (imageSize <= 0 || position + imageSize > dataView.byteLength) {
            console.error("❌ Error: Tamaño de imagen inválido o fuera de rango.");
            return null;
        }

        // Leer los bytes de la imagen correctamente
        let imageData = new Uint8Array(dataView.buffer.slice(position, position + imageSize));

        // Detectar tipo real de imagen (por cabecera)
        if (imageData[0] === 0xFF && imageData[1] === 0xD8) {
            mimeType = "image/jpeg"; // JPEG
        } else if (imageData[0] === 0x89 && imageData[1] === 0x50) {
            mimeType = "image/png"; // PNG
        } else if (imageData[0] === 0x47 && imageData[1] === 0x49) {
            mimeType = "image/gif"; // GIF
        } else if (imageData[0] === 0x42 && imageData[1] === 0x4D) {
            mimeType = "image/bmp"; // BMP
        } else {
            console.warn("⚠️ Tipo de imagen desconocido, usando image/jpeg por defecto.");
            mimeType = "image/jpeg";
        }

        //console.log("✅ Extracción Correcta:", { mimeType, position, imageSize, finalPosition: position + imageSize });

        // Crear la URL del Blob
        return URL.createObjectURL(new Blob([imageData], {
            type: mimeType
        }));
    }
}

class AudioMetadataReaderBlob extends AudioMetadataReader {
    constructor(blob) {
        super(blob);
        if (!(blob instanceof Blob)) {
            throw new Error("Input must be a Blob");
        }
        this.blob = blob;
    }

    async readMetadata() {
        return new Promise((resolve, reject) => {
            if (!this.blob) {
                reject("No blob provided");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const arrayBuffer = event.target.result;
                const dataView = new DataView(arrayBuffer);

                if (this.isID3v2Tag(dataView)) {
                    const metadata = this.extractID3v2Tags(dataView);
                    resolve(metadata);
                } else {
                    reject("No ID3v2 metadata found");
                }
            };

            reader.onerror = () => reject("Error reading blob");
            reader.readAsArrayBuffer(this.blob); // Leemos el Blob directamente
        });
    }

    // Método para verificar si es un tag ID3v2
    isID3v2Tag(dataView) {
        return (
            dataView.getUint8(0) === 0x49 &&
            dataView.getUint8(1) === 0x44 &&
            dataView.getUint8(2) === 0x33
        );
    }

    // Método para extraer los metadatos ID3v2
    extractID3v2Tags(dataView) {
        let tags = {
            title: "Unknown Title",
            artist: "Unknown Artist",
            album: "Unknown Album",
            year: "Unknown Year",
            cover: null,
        };

        let position = 10; // Saltamos la cabecera ID3v2
        while (position < dataView.byteLength) {
            const frameID = this.readString(dataView, position, 4);
            const frameSize = dataView.getUint32(position + 4, false);
            const frameDataStart = position + 10;

            if (frameSize <= 0 || frameSize + frameDataStart > dataView.byteLength) break;

            switch (frameID) {
                case "TIT2":
                    tags.title = this.readTextFrame(dataView, frameDataStart, frameSize);
                    break;
                case "TPE1":
                    tags.artist = this.readTextFrame(dataView, frameDataStart, frameSize);
                    break;
                case "TALB":
                    tags.album = this.readTextFrame(dataView, frameDataStart, frameSize);
                    break;
                case "TYER":
                    tags.year = this.readTextFrame(dataView, frameDataStart, frameSize);
                    break;
                case "APIC":
                    tags.cover = this.readPictureFrame(dataView, frameDataStart, frameSize);
                    break;
            }

            position += 10 + frameSize;
        }

        return tags;
    }

    // Método auxiliar para leer frames de texto
    readTextFrame(dataView, offset, length) {
        const encoding = dataView.getUint8(offset);
        let text = "";

        if (encoding === 0) {
            text = this.readString(dataView, offset + 1, length - 1);
        } else {
            text = new TextDecoder("utf-16").decode(
                new Uint8Array(dataView.buffer, offset + 1, length - 1)
            );
        }

        return text.replace(/\0/g, "").trim();
    }

    // Método para leer una cadena de bytes
    readString(dataView, offset, length) {
        let text = "";
        for (let i = 0; i < length; i++) {
            const char = dataView.getUint8(offset + i);
            if (char === 0) break;
            text += String.fromCharCode(char);
        }
        return text;
    }

    // Método para leer el frame de la imagen (portada)
    readPictureFrame(dataView, offset, length) {
        let position = offset;
        const encoding = dataView.getUint8(position++);

        // Leer MIME Type
        let mimeType = "";
        while (dataView.getUint8(position) !== 0) {
            mimeType += String.fromCharCode(dataView.getUint8(position++));
        }
        position++; // Saltar byte nulo

        // Forzar tipo MIME válido si es incorrecto
        const validMimeType = mimeType.startsWith("image/") ? mimeType : "image/jpeg";

        // Saltar descripción (cadena terminada en 0x00)
        while (dataView.getUint8(position) !== 0) position++;
        position++;

        // Calcular tamaño de imagen
        const imageSize = length - (position - offset);

        // Validar si la imagen tiene un tamaño correcto
        if (imageSize <= 0 || position + imageSize > dataView.byteLength) {
            console.warn("Imagen inválida o tamaño incorrecto.");
            return null;
        }



        // Extraer imagen correctamente
        const imageData = new Uint8Array(dataView.buffer.slice(position, position + imageSize));

        // Prueba crear la imagen como un Blob
        const testBlob = new Blob([imageData], {
            type: validMimeType
        });

        // Prueba mostrar la imagen directamente en la página
        const testURL = URL.createObjectURL(testBlob);

        return URL.createObjectURL(new Blob([imageData], {
            type: validMimeType
        }));
    }
}

// Video Metadata
class VideoMetadataReader {
    constructor(videotag) {
        this.videoplayer = document.querySelector(videotag);
    }

    async read(file) {
        return new Promise((resolve, reject) => {
            if (!this.videoplayer) return reject("No se encontró el elemento de video.");

            this.videoplayer.onloadedmetadata = () => {
                const metadata = {
                    title: file.name,
                    duration: this.videoplayer.duration.toFixed(2) + " s",
                    resolution: this.videoplayer.videoWidth + "x" + this.videoplayer.videoHeight,
                    fps: this.videoplayer.frameRate || "Desconocido"
                };
                resolve(metadata);
            };

            this.videoplayer.onerror = () => reject("Error al cargar el video.");
        });
    }
}

// Image Metadata
class ImageMetadataReader {
    constructor(file) {
        this.file = file;
    }

    async readMetadata() {
        return new Promise((resolve, reject) => {
            if (!this.file) {
                reject("No file provided");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const arrayBuffer = event.target.result;
                const dataView = new DataView(arrayBuffer);

                const metadata = {
                    format: this.getFormat(),
                    size: this.file.size,
                    width: 0,
                    height: 0,
                    colorDepth: 24, // Estimado
                    EXIF: "Not Found",
                    exifData: {}
                };

                // Extraer dimensiones usando Image
                const img = new Image();
                img.onload = () => {
                    metadata.width = img.width;
                    metadata.height = img.height;

                    // Intentar extraer EXIF si es JPEG
                    if (metadata.format === "JPEG") {
                        const exif = this.extractEXIF(dataView);
                        if (exif) {
                            metadata.EXIF = "Found";
                            metadata.exifData = exif;
                        }
                    }

                    resolve(metadata);
                };
                img.onerror = () => reject("Error loading image.");
                img.src = URL.createObjectURL(this.file);
            };

            reader.onerror = () => reject("Error reading file");
            reader.readAsArrayBuffer(this.file);
        });
    }

    getFormat() {
        const type = this.file.type.toLowerCase();
        if (type.includes("jpeg")) return "JPEG";
        if (type.includes("png")) return "PNG";
        if (type.includes("gif")) return "GIF";
        if (type.includes("bmp")) return "BMP";
        if (type.includes("webp")) return "WebP";
        return "Unknown";
    }

    extractEXIF(dataView) {
        if (dataView.getUint16(0, false) !== 0xFFD8) return null; // No es JPEG

        let offset = 2;
        while (offset < dataView.byteLength) {
            if (dataView.getUint16(offset, false) === 0xFFE1) { // APP1 Marker (EXIF)
                return this.parseEXIF(dataView, offset + 4);
            }
            offset += 2 + dataView.getUint16(offset + 2, false);
        }
        return null;
    }

    parseEXIF(dataView, start) {
        const exifData = {};
        const littleEndian = dataView.getUint16(start) === 0x4949;
        const offset = start + 8;

        for (let i = 0; i < 12; i++) {
            const tag = dataView.getUint16(offset + i * 12, littleEndian);
            const valueOffset = offset + i * 12 + 8;

            switch (tag) {
                case 0x010F:
                    exifData["Camera Brand"] = this.readString(dataView, valueOffset, 20);
                    break;
                case 0x0110:
                    exifData["Camera Model"] = this.readString(dataView, valueOffset, 20);
                    break;
                case 0x9003:
                    exifData["Date Taken"] = this.readString(dataView, valueOffset, 20);
                    break;
                case 0x0112:
                    exifData["Orientation"] = dataView.getUint16(valueOffset, littleEndian);
                    break;
                case 0x8827:
                    exifData["ISO"] = dataView.getUint16(valueOffset, littleEndian);
                    break;
                case 0x829A:
                    exifData["Shutter Speed"] = dataView.getFloat32(valueOffset, littleEndian).toFixed(3);
                    break;
                case 0x829D:
                    exifData["Aperture"] = dataView.getFloat32(valueOffset, littleEndian).toFixed(3);
                    break;
            }
        }

        return exifData;
    }

    readString(dataView, offset, length) {
        let result = "";
        for (let i = 0; i < length; i++) {
            const char = dataView.getUint8(offset + i);
            if (char === 0) break;
            result += String.fromCharCode(char);
        }
        return result.trim();
    }
}

// Check if image is corrupted or not
class ImageValidator {
    static async isValidImage(blobUrl) {
        try {
            const response = await fetch(blobUrl);
            if (!response.ok) throw new Error("No se pudo obtener el Blob");

            const blob = await response.blob();
            const bitmap = await createImageBitmap(blob);

            return bitmap.width > 0 && bitmap.height > 0;
        } catch (error) {
            return false; // Si hay un error, la imagen es inválida o está corrupta
        }
    }
}

class VideoThumbnailGenerator {
    static async generateThumbnail(videoUrl, timeInSeconds = 1) {
        return new Promise((resolve, reject) => {
            const video = document.createElement("video");
            video.src = videoUrl;
            video.crossOrigin = "anonymous"; // Evita problemas con CORS
            video.muted = true; // Evita advertencias en algunos navegadores
            video.playsInline = true;

            video.addEventListener("loadeddata", () => {
                video.currentTime = Math.min(timeInSeconds, video.duration - 0.1);
            });

            video.addEventListener("seeked", () => {
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                video.pause();

                resolve(canvas.toDataURL("image/png"));
            });

            video.onerror = () => reject("Error al cargar el video");
        });
    }
}

// Networking Tools
class NetworkManager {
    constructor(config = {}) {
        this.connections = {};
        this.defaultProtocol = config.defaultProtocol || 'http';
    }

    // ==================== MÉTODOS PRINCIPALES ====================
    async connect(protocol, config) {
        switch (protocol.toLowerCase()) {
            case 'tcp':
                return this.#connectTCP(config);
            case 'websocket':
                return this.#connectWebSocket(config);
            case 'http':
                return this.#setupHTTP(config);
            default:
                throw new Error(`Protocolo no soportado: ${protocol}`);
        }
    }

    send(connectionId, data) {
        const connection = this.connections[connectionId];
        if (!connection) throw new Error('Conexión no encontrada');

        switch (connection.type) {
            case 'tcp':
                return connection.socket.write(data);
            case 'websocket':
                return connection.socket.send(data);
            case 'http':
                return this.#sendHTTP(connection, data);
            default:
                throw new Error('Tipo de conexión no válido');
        }
    }

    close(connectionId) {
        const connection = this.connections[connectionId];
        if (connection) {
            switch (connection.type) {
                case 'tcp':
                    connection.socket.end();
                    break;
                case 'websocket':
                    connection.socket.close();
                    break;
            }
            delete this.connections[connectionId];
        }
    }

    // ==================== IMPLEMENTACIONES ESPECÍFICAS ====================
    async #connectTCP(config) {
        return new Promise((resolve, reject) => {
            const net = require('net'); // Node.js TCP module
            const socket = net.connect(config, () => {
                const connectionId = `tcp_${Date.now()}`;
                this.connections[connectionId] = {
                    type: 'tcp',
                    socket
                };
                resolve(connectionId);
            });

            socket.on('error', reject);
            socket.on('data', data => this.#emitEvent(connectionId, 'data', data));
        });
    }

    async #connectWebSocket(config) {
        return new Promise((resolve, reject) => {
            const socket = new WebSocket(config.url);

            socket.onopen = () => {
                const connectionId = `ws_${Date.now()}`;
                this.connections[connectionId] = {
                    type: 'websocket',
                    socket
                };
                resolve(connectionId);
            };

            socket.onerror = reject;
            socket.onmessage = (event) => {
                this.#emitEvent(connectionId, 'data', event.data);
            };
        });
    }

    #setupHTTP(config) {
        const connectionId = `http_${Date.now()}`;
        this.connections[connectionId] = {
            type: 'http',
            baseUrl: config.baseUrl,
            headers: config.headers || {}
        };
        return connectionId;
    }

    async #sendHTTP(connection, data) {
        const response = await fetch(connection.baseUrl, {
            method: data.method || 'GET',
            headers: connection.headers,
            body: data.body
        });
        return response.json();
    }

    // ==================== MANEJO DE EVENTOS ====================
    #emitEvent(connectionId, eventName, data) {
        const connection = this.connections[connectionId];
        if (connection?.listeners?.[eventName]) {
            connection.listeners[eventName].forEach(cb => cb(data));
        }
    }

    on(connectionId, eventName, callback) {
        if (!this.connections[connectionId]) {
            throw new Error('Conexión no encontrada');
        }

        if (!this.connections[connectionId].listeners) {
            this.connections[connectionId].listeners = {};
        }

        this.connections[connectionId].listeners[eventName] = [
            ...(this.connections[connectionId].listeners[eventName] || []),
            callback
        ];
    }
}

// Moneko UI Legacy
class LWDM {
    constructor(container, maximized) {
        this.container = document.querySelector(container);
        this.isDragging = false;
        this.isResizing = false;
        this.previousSize = {};
        this.isMinimized = false;
        this.dockInstance = null;
        this.WDM_Name = container;
        this.noMaximize = maximized || false;

        this.init();
    }

    init() {
        this.titleBar = this.container.querySelector(".window-titlebar");
        this.minimizeButton = this.container.querySelector(".minimize");
        this.maximizeButton = this.container.querySelector(".maximize");
        this.closeButton = this.container.querySelector(".close");
        this.resizeHandle = document.createElement("div");
        this.resizeHandle.className = "resize-handle";
        this.container.appendChild(this.resizeHandle);

        this.addEventListeners();

        // Forzar la maximización al iniciar
        this.maximizeWindow();
    }

    addEventListeners() {
        this.minimizeButton.addEventListener("click", () => this.minimizeWindow());
        this.closeButton.addEventListener("click", () => this.closeWindow());
        //this.titleBar.addEventListener("mousedown", (e) => this.startDrag(e));
    }

    maximizeWindow() {
        if (this.noMaximize) return;

        if (!this.maximized) {
            this.prevSize = {
                width: `${this.container.offsetWidth}px`,
                height: `${this.container.offsetHeight}px`
            };
            this.prevPos = {
                left: `${this.container.offsetLeft}px`,
                top: `${this.container.offsetTop}px`
            };

            // Maximizar ventana
            this.container.style.width = "100vw";
            this.container.style.height = "100vh";
            this.container.style.left = "0";
            this.container.style.top = "0";

            // Ocultar el dock y la barra de estado
            document.querySelector(".docker").style.display = "none";
            document.querySelector(".ShellUI").style.display = 'none'; // O '#theme' si prefieres ese selector

            this.maximized = true;
        } else {
            this.restoreWindow();
        }
    }

    minimizeWindow() {
        this.container.style.display = "none";
        this.isMinimized = true;
        this.currentAPP();
        if (this.onStateChange) this.onStateChange("minimized");
        document.querySelector('#theme').classList.add('MUI_Desktop_show');
        document.querySelector('.docker').classList.add('MUI_Desktop_show');
        document.querySelector('#theme').classList.remove('MUI_Desktop_hidden');
        document.querySelector('.docker').classList.remove('MUI_Desktop_hidden');
    }

    restoreWindow() {
        if (this.prevSize && this.prevPos) {
            this.container.style.width = this.prevSize.width;
            this.container.style.height = this.prevSize.height;
            this.container.style.left = this.prevPos.left;
            this.container.style.top = this.prevPos.top;
        }

        this.container.style.display = "block";
        this.isMinimized = false;
        this.bringToFront();

        // Restaurar el dock y la barra de estado
        document.querySelector('#theme').classList.remove('MUI_Desktop_show');
        document.querySelector('.docker').classList.remove('MUI_Desktop_show');
        document.querySelector('#theme').classList.add('MUI_Desktop_hidden');
        document.querySelector('.docker').classList.add('MUI_Desktop_hidden');

        this.maximized = true;
    }

    closeWindow() {
        this.container.style.display = "none";
        this.currentAPP();
        if (this.onStateChange) this.onStateChange("closed");

        if (this.dockInstance && this.dockInstance.apps[this.WDM_Name]) {
            this.dockInstance.apps[this.WDM_Name].icon.classList.remove("active", "minimized");
        }
        document.querySelector('#theme').classList.add('MUI_Desktop_show');
        document.querySelector('.docker').classList.add('MUI_Desktop_show');
        document.querySelector('#theme').classList.remove('MUI_Desktop_hidden');
        document.querySelector('.docker').classList.remove('MUI_Desktop_hidden');
    }

    bringToFront() {
        const allWindows = document.querySelectorAll(".window");
        let maxZ = 0;

        allWindows.forEach(win => {
            const z = parseInt(win.style.zIndex) || 0;
            maxZ = Math.max(maxZ, z);
        });

        this.container.style.zIndex = maxZ + 1;
    }

    currentAPP() {
        const Activity = document.getElementById("app-1");
        Activity.innerHTML = this.container.style.display === 'none' ? "Desktop" : this.WDM_Name.replace('#', '');
    }

    attachToDock(dockInstance) {
        this.dockInstance = dockInstance;
    }
}

// Notifications 
class LumaNotifications {
    constructor() {
        this.createNotificationPanel();
    }

    createNotificationPanel() {
        this.panel = document.querySelector(".notification-panel");
        if (!this.panel) {
            this.panel = document.createElement("div");
            this.panel.className = "notification-panel";
            document.body.appendChild(this.panel);
        }
    }


    showNotification(title, message, iconPath = "System/Icons/notification.png", duration = 5000) {
        const notification = document.createElement("div");
        notification.className = "notification fade-in";

        const BuildNotification = `
            <div class="notification-icon">
                <img src="${iconPath}" alt="icon">
            </div>
            <div class="notification-content">
                <strong>${title}</strong>
                <p>${message}</p>
            </div>
            <button class="notification-close">×</button>
        `;

        notification.innerHTML = BuildNotification;

        // Botón para cerrar la notificación manualmente
        notification.querySelector(".notification-close").addEventListener("click", () => {
            this.closeNotification(notification);
        });


        this.panel.appendChild(notification);
        this.#SaveToPanel(BuildNotification);

        // Auto-cierre después del tiempo configurado
        setTimeout(() => this.closeNotification(notification), duration);
    }

    #SaveToPanel(notification) {
        const Newnotification = document.createElement('div');
        Newnotification.className = 'notification fade-in glass_dark';

        Newnotification.innerHTML = notification;

        this.Notificationpanel = document.querySelector('.notification-box');
        //notification.classList.toggle('fade-in');
        Newnotification.querySelector(".notification-close").addEventListener("click", () => {
            this.closeNotificationCenter(Newnotification);
        });
        this.Notificationpanel.appendChild(Newnotification);
        UpdateNofificationCenter();
    }

    closeNotification(notification) {
        notification.classList.add("fade-out");
        setTimeout(() => {
            notification.remove();
        }, 300);
    }

    closeNotificationCenter(notification) {
        notification.classList.add("fade-out");
        NotificationDrower();
        setTimeout(() => {
            notification.remove();
            UpdateNofificationCenter();
        }, 300);
    }
}

// === MONEKO THEME MANAGER ===
class MonekoTheme {
    static applyFromColorize(colorizeData) {
        if (!colorizeData || !colorizeData.Colors || !colorizeData.Colors.length) return;

        const mainColor = colorizeData.Colors[0].color;
        const textColor = colorizeData.Colors[0].textColor;

        // Aplicar a variables CSS
        document.documentElement.style.setProperty('--color-primary', `rgb(${mainColor.join(',')})`);
        document.documentElement.style.setProperty('--color-text', textColor);

        // Paleta secundaria (si existe)
        if (colorizeData.Colors[1]) {
            const secondaryColor = colorizeData.Colors[1].color;
            document.documentElement.style.setProperty('--color-secondary', `rgb(${secondaryColor.join(',')})`);
        }

        console.log('[MonekoTheme] Paleta aplicada desde Colorize');
    }
}

// === MONEKO COMPONENT FACTORY ===
class MonekoComponents {
    static createButton(label = "Click", onClick = null, options = {}) {
        const button = document.createElement("button");
        button.className = "moneko-button";
        button.textContent = label;
        if (onClick) button.addEventListener("click", onClick);
        if (options.id) button.id = options.id;
        if (options.className) button.classList.add(options.className);
        return button;
    }

    static createCard(content = "", options = {}) {
        const card = document.createElement("div");
        card.className = "moneko-card moneko-glass";
        card.innerHTML = content;
        if (options.id) card.id = options.id;
        return card;
    }

    static createGlassContainer(children = []) {
        const container = document.createElement("div");
        container.className = "moneko-glass";
        children.forEach(child => container.appendChild(child));
        return container;
    }

    static createIconButton(iconText = "⚙", tooltip = "", onClick = null, options = {}) {
        const button = document.createElement("button");
        button.className = "moneko-button material-icons";
        button.textContent = iconText;
        if (tooltip) button.title = tooltip;
        if (onClick) button.addEventListener("click", onClick);
        if (options.id) button.id = options.id;
        return button;
    }

    static createModal(title = "Moneko Modal", content = "", actions = []) {
        const overlay = document.createElement("div");
        overlay.className = "moneko-modal-overlay fade-in";

        const modal = document.createElement("div");
        modal.className = "moneko-modal moneko-glass slide-up";

        const heading = document.createElement("h2");
        heading.textContent = title;

        const body = document.createElement("div");
        body.className = "moneko-modal-content";
        body.innerHTML = content;

        const footer = document.createElement("div");
        footer.className = "moneko-modal-actions";

        actions.forEach(btn => footer.appendChild(btn));

        modal.appendChild(heading);
        modal.appendChild(body);
        modal.appendChild(footer);
        overlay.appendChild(modal);

        document.body.appendChild(overlay);
        return overlay;
    }

    static createNotification(title = "Moneko", message = "Notificación enviada") {
        const container = document.createElement("div");
        container.className = "moneko-card moneko-glass fade-in";
        container.style.position = "fixed";
        container.style.bottom = "20px";
        container.style.right = "20px";
        container.style.zIndex = "9999";

        container.innerHTML = `
            <strong>${title}</strong>
            <p>${message}</p>
        `;

        document.body.appendChild(container);

        setTimeout(() => {
            container.classList.add("fade-out");
            setTimeout(() => container.remove(), 300);
        }, 4000);

        return container;
    }

    static createInputField(placeholder = "Escribe algo...", options = {}) {
        const input = document.createElement("input");
        input.className = "moneko-input moneko-glass";
        input.placeholder = placeholder;
        if (options.type) input.type = options.type;
        if (options.id) input.id = options.id;
        return input;
    }

    static createSwitch(checked = false, onChange = null) {
        const label = document.createElement("label");
        label.className = "moneko-switch";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.checked = checked;

        const slider = document.createElement("span");
        slider.className = "slider";

        label.appendChild(input);
        label.appendChild(slider);

        if (onChange) {
            input.addEventListener("change", () => onChange(input.checked));
        }

        return label;
    }

    static createAppBar(title, actions = []) {
        const appBar = document.createElement('header');
        appBar.className = 'moneko-app-bar moneko-glass';

        const titleElement = document.createElement('h1');
        titleElement.textContent = title;

        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'moneko-app-bar-actions';
        actions.forEach(action => actionsContainer.appendChild(action));

        appBar.appendChild(titleElement);
        appBar.appendChild(actionsContainer);

        return appBar;
    }

    static createBottomNav(items = []) {
        const nav = document.createElement('nav');
        nav.className = 'moneko-bottom-nav moneko-glass';

        items.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'moneko-bottom-nav-item';
            btn.innerHTML = `<span class="material-icons">${item.icon}</span>`;
            nav.appendChild(btn);
        });

        return nav;
    }

    static createProgress(type = 'linear', value = 0) {
        const progress = document.createElement('div');
        progress.className = `moneko-progress ${type}`;

        if (type === 'linear') {
            progress.innerHTML = `<div class="moneko-progress-bar" style="width: ${value}%"></div>`;
        } else {
            progress.innerHTML = `
                <svg class="moneko-progress-circular" viewBox="0 0 36 36">
                    <path class="moneko-progress-track" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    <path class="moneko-progress-fill" stroke-dasharray="${value}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                </svg>
            `;
        }

        return progress;
    }

    static createFAB(icon = 'add', onClick = null) {
        const fab = document.createElement('button');
        fab.className = 'moneko-fab';
        fab.innerHTML = `<span class="material-icons">${icon}</span>`;

        if (onClick) fab.addEventListener('click', onClick);

        // Efecto ripple
        fab.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.className = 'moneko-ripple';

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            Object.assign(ripple.style, {
                width: `${size}px`,
                height: `${size}px`,
                left: `${x}px`,
                top: `${y}px`
            });

            this.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });

        return fab;
    }
}

// === MONEKO WINDOW MANAGER ===
class MonekoWindowManager {
    constructor(container, config = {}) {
        this.container = container;
        this.config = {
            fullScreen: true,
            acrylic: true,
            elevation: 3,
            ...config
        };

        this.states = {
            ACTIVE: 'active',
            BACKGROUND: 'background',
            HIDDEN: 'hidden'
        };

        this.init();
    }

    init() {
        this.container.classList.add('moneko-window');
        this.setupWindow();
        this.setupGestures();
    }

    setupWindow() {
        Object.assign(this.container.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100vw',
            height: '100vh',
            borderRadius: '12px',
            overflow: 'hidden',
            zIndex: '100',
            transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)'
        });

        if (this.config.acrylic) {
            this.container.classList.add('moneko-glass');
        }
    }

    setupGestures() {
        // Mejorar gestos para pantallas táctiles
        let startY = 0;
        let startTime = 0;

        this.container.addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
            startTime = Date.now();
        }, {
            passive: true
        });

        this.container.addEventListener('touchmove', (e) => {
            const currentY = e.touches[0].clientY;
            const velocity = (currentY - startY) / (Date.now() - startTime);

            // Swipe rápido hacia abajo para cerrar
            if (velocity > 0.3 && currentY - startY > 50) {
                this.minimize();
            }
        }, {
            passive: true
        });
    }

    // ... (otros métodos mejorados)
}

// Experimental MonekoAssistantUI (MAUI)
class MonekoAssistant {
    constructor({
        placeholder = '¿En qué puedo ayudarte?',
        suggestions = []
    } = {}) {
        this._createUI(placeholder, suggestions);
        this._bindEvents();
    }

    _createUI(placeholder, suggestions) {
        this.root = document.createElement('div');
        this.root.className = 'maui';

        this.root.innerHTML = `
      <div class="maui-container">
        <div class="maui-responses"></div>
        <div class="maui-input-wrapper">
          <button class="maui-voice" title="Hablar">🎤</button>
          <input type="text" class="maui-input" placeholder="${placeholder}">
          <button class="maui-send">➤</button>
        </div>
        <div class="maui-suggestions">
          ${suggestions.map(text => `<button>${text}</button>`).join('')}
        </div>
      </div>
    `;

        document.body.appendChild(this.root);

        this.input = this.root.querySelector('.maui-input');
        this.voiceBtn = this.root.querySelector('.maui-voice');
        this.sendBtn = this.root.querySelector('.maui-send');
        this.suggestionsContainer = this.root.querySelector('.maui-suggestions');
        this.responsesContainer = this.root.querySelector('.maui-responses');
    }

    _bindEvents() {
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this._submit(this.input.value);
        });

        this.sendBtn.addEventListener('click', () => {
            this._submit(this.input.value);
        });

        this.voiceBtn.addEventListener('click', () => {
            this._startVoiceInput();
        });

        this.suggestionsContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON') {
                this._submit(e.target.textContent);
            }
        });
    }

    _submit(text) {
        const prompt = text.trim();
        if (prompt && this._onSubmit) {
            this._onSubmit(prompt);
            this.input.value = '';
        }
    }

    _startVoiceInput() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('Reconocimiento de voz no soportado.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'es-MX';
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this._submit(transcript);
        };
        recognition.start();
    }

    onSubmit(callback) {
        this._onSubmit = callback;
    }

    setSuggestions(suggestions = []) {
        this.suggestionsContainer.innerHTML = suggestions.map(t => `<button>${t}</button>`).join('');
    }

    addCardResponse(html) {
        const card = document.createElement('div');
        card.className = 'maui-card-response';
        card.innerHTML = html;
        this.responsesContainer.appendChild(card);
    }

    clearResponses() {
        this.responsesContainer.innerHTML = '';
    }

    show() {
        this.root.style.display = 'block';
    }

    hide() {
        this.root.style.display = 'none';
    }

    destroy() {
        this.root.remove();
    }
}