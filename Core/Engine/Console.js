function createStyledLine(text, style, log) {
    const line = document.createElement('span');
    line.style = style;
    line.textContent = text;

    try {
        log.element.insertBefore(line, log.element.firstChild);
    } catch (error) {
        log.element.appendChild(line);
    }

    setTimeout(() => {
        log.element.removeChild(line);
    }, log.messageTime);
}


function createNestedLine(object, style, element, messageTime) {
    const parentContainer = document.createElement('div');
    parentContainer.style = style;

    try {
        element.insertBefore(parentContainer, element.firstChild);
    } catch (error) {
        element.appendChild(parentContainer);
    }

    const parentSpan = document.createElement('div');
    parentSpan.className = 'row'
    parentSpan.style = style;

    const caret = document.createElement('ion-icon');
    caret.style.paddingRight = '5px';
    caret.style.cursor = 'pointer';
    caret.name = 'caret-down';
    caret.style.display = 'none';
    parentSpan.appendChild(caret);

    const textNode = document.createElement('span');
    parentSpan.appendChild(textNode);

    if (Array.isArray(object)) {
        caret.style.display = 'block';
        textNode.textContent = `Array(${object.length})`;
        parentContainer.appendChild(parentSpan);

        const childrenContainer = document.createElement('div');
        childrenContainer.style = 'margin-left: 20px; display: block;'; // Indentation for nested children
        parentContainer.appendChild(childrenContainer);

        object.forEach(child => {
            createNestedLine(child, style, childrenContainer, messageTime);
        });

        caret.addEventListener('click', (e) => {
            e.stopPropagation()
            e.stopImmediatePropagation()
            if (childrenContainer.style.display === 'block') {
                childrenContainer.style.display = 'none';
                caret.name = 'caret-forward';
            } else {
                childrenContainer.style.display = 'block';
                caret.name = 'caret-down';
            }
        });
    } else if (typeof object === 'object' && object !== null) {
        caret.style.display = 'block';
        textNode.textContent = object.name || 'Object';
        parentContainer.appendChild(parentSpan);

        const childrenContainer = document.createElement('div');
        childrenContainer.style = 'margin-left: 20px; display: block;'; // Indentation for nested children
        parentContainer.appendChild(childrenContainer);

        for (const key in object) {
            if (object.hasOwnProperty(key) && typeof object[key] === 'object') {
                createNestedLine(object[key], style, childrenContainer, messageTime);
            } else {
                let value = object[key];

                if (typeof value === 'string') {
                    value = `"${object[key]}"`;
                }
                const childSpan = document.createElement('span');
                childSpan.style = style;
                childSpan.textContent = `${key}: ${value}`;
                childrenContainer.appendChild(childSpan);
                childrenContainer.appendChild(document.createElement('br')); // Newline for better readability
            }
        }

        caret.addEventListener('click', (e) => {
            e.stopPropagation()
            e.stopImmediatePropagation()
            if (childrenContainer.style.display === 'block') {
                childrenContainer.style.display = 'none';
                caret.name = 'caret-forward';
            } else {
                childrenContainer.style.display = 'block';
                caret.name = 'caret-down';
            }
        });
    } else {
        textNode.textContent = object;
        parentContainer.appendChild(parentSpan);
    }

    setTimeout(() => {
        element.removeChild(parentContainer);
    }, messageTime);
}


class Console {
    constructor() {
        this.element = document.createElement('div')
        this.element.style.display = 'flex'
        this.element.style.flexDirection = 'column'
        this.element.style.minHeight = '50px'
        this.element.style.minWidth = '200px'
        this.element.style.backgroundColor = 'transparent'
        this.element.style.position = 'absolute'
        this.element.style.left = '0px'
        this.element.style.top = '0px'
        this.element.style.margin = '10px'
        this.element.style.marginTop = '40px'
        this.element.style.fontSize = '11px'
        this.messageTime = 5000
    }

    addTo(dom) {
        dom.appendChild(this.element)
    }
    error(...messages) {

        let style = 'color: #cc3300;'; // default style

        if (typeof messages[0] === 'string' && messages[0].includes('%c')) {
            let value = messages[0];

            const parts = value.split('%c').filter(item => item !== '');
            for (const index in parts) {
                const i = Number(index)
                value = parts[i]
                style = messages[i + 1] || style;
                createStyledLine(value, 'color: #cc3300;' + style, this);
            }

        } else {
            messages.forEach(text => {
                let value = text;

                switch (typeof text) {
                    case 'object':
                        createNestedLine(value, 'color: #cc3300;' + style, this.element, this.messageTime)
                        break;

                    default:
                        createStyledLine(value, 'color: #cc3300;' + style, this);
                        break;
                }


            });
        }
    }
    warn(...messages) {

        let style = 'color: #ffcc00;'; // default style

        if (typeof messages[0] === 'string' && messages[0].includes('%c')) {
            let value = messages[0];

            const parts = value.split('%c').filter(item => item !== '');
            for (const index in parts) {
                const i = Number(index)
                value = parts[i]
                style = messages[i + 1] || style;
                createStyledLine(value, 'color: #ffcc00;' + style, this);
            }

        } else {
            messages.forEach(text => {
                let value = text;

                switch (typeof text) {
                    case 'object':
                        createNestedLine(value, 'color: #ffcc00;' + style, this.element, this.messageTime)
                        break;

                    default:
                        createStyledLine(value, 'color: #ffcc00;' + style, this);
                        break;
                }


            });
        }
    }

    success(...messages){
        let style = 'color: #339900;'; // default style

        if (typeof messages[0] === 'string' && messages[0].includes('%c')) {
            let value = messages[0];

            const parts = value.split('%c').filter(item => item !== '');
            for (const index in parts) {
                const i = Number(index)
                value = parts[i]
                style = messages[i + 1] || style;
                createStyledLine(value, 'color: #339900;' + style, this);
            }

        } else {
            messages.forEach(text => {
                let value = text;

                switch (typeof text) {
                    case 'object':
                        createNestedLine(value, 'color: #339900;' + style, this.element, this.messageTime)
                        break;

                    default:
                        createStyledLine(value, 'color: #339900;' + style, this);
                        break;
                }


            });
        }
    }

    log(...messages) {

        let style = 'color: white'; // default style

        if (typeof messages[0] === 'string' && messages[0].includes('%c')) {
            let value = messages[0];

            const parts = value.split('%c').filter(item => item !== '');
            for (const index in parts) {
                const i = Number(index)
                value = parts[i]
                style = messages[i + 1] || style;
                createStyledLine(value, style, this);
            }

        } else {
            messages.forEach(text => {
                let value = text;

                switch (typeof text) {
                    case 'object':
                        createNestedLine(value, style, this.element, this.messageTime)
                        break;

                    default:
                        createStyledLine(value, style, this);
                        break;
                }


            });
        }

    }


}

// const cs = window.console


const consol = new Console()