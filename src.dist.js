function element(name, attr, content) {
    const e = document.createElement(name);
    if (attr) {
        for (let key in attr) {
            e.setAttribute(key, attr[key]);
        }
    }
    if (content !== undefined) {
        e.innerHTML = content;
    }
    return e;
}

class Cell {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.element = element('td', { class: 'cell' });
        this.element.addEventListener('click', function () {
            game.click(x, y);
        });
        this.set_state(0);
    }
    set_state(n) {
        this.state = n;
        this.element.setAttribute('data-state', this.state);
    }
    increment() {
        this.set_state((this.state + 1) % this.game.base);
    }
}

class Game {
    constructor(size, base) {
        const g = this;
        this.size = size;
        this.base = base;

        this.grid = [];
        this.table = element('table');
        if (this.base > 3) {
            this.table.classList.add('gradient');
        }
        for (let y = 0; y < this.size; y++) {
            let tr = element('tr');
            let row = { element: tr, cells: [] };
            this.grid.push(row);
            this.table.appendChild(tr);
            for (let x = 0; x < this.size; x++) {
                let cell = new Cell(g, x, y);
                row.cells.push(cell);
                tr.appendChild(cell.element);
            }
        }
    }
    get_cell(x, y) {
        if (x >= 0 && x < this.size && y >= 0 && y < this.size) {
            return this.grid[y].cells[x];
        }
    }
    click(x, y) {
        for (let [dx, dy] of [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]]) {
            let cell = this.get_cell(x + dx, y + dy);
            if (cell) {
                cell.increment();
            }
        }
        this.update();
    }
    update() {
        if (window.location && window.history) {
            const bits = [['size', this.size], ['base', this.base], ['state', this.grid.map(r => r.cells.map(c => c.state).join('')).join('')]].map(b => b.map(encodeURIComponent).join('='));
            const base_url = [location.protocol, '//', location.host, location.pathname].join('');
            window.history.replaceState({}, '', base_url + '?' + bits.join('&'));
        }
    }
};

function init_game() {
    const size = document.getElementById('input-size').value;
    const base = document.getElementById('input-base').value;
    const game = new Game(size, base);
    const div = document.getElementById('game');
    div.innerHTML = '';
    div.appendChild(game.table);
    game.update();
    return game;
}

function parse_settings() {
    const bits = window.location.search.slice(1).split('&').map(x => x.split('='));
    let state;
    bits.forEach(function (bit) {
        const [key, value] = bit.map(decodeURIComponent);
        switch (key) {
            case 'size':
                if (!isNaN(parseInt(value))) {
                    document.getElementById('input-size').value = value;
                }
                break;
            case 'base':
                if (!isNaN(parseInt(value))) {
                    document.getElementById('input-base').value = value;
                }
                break;
            case 'state':
                state = value;
                break;
        }
    });
    const game = init_game();

    let size = document.getElementById('input-size').value;
    let base = document.getElementById('input-base').value;
    if (state && state.length == size * size) {
        console.log(state);
        state = state.split('').map(x => parseInt(x));
        if (state.some(isNaN)) {
            return;
        }
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                game.get_cell(x, y).set_state(state[y * size + x]);
            }
        }
    }
    game.update();
}

if (window.location && window.location.search) {
    parse_settings();
} else {
    init_game();
}

for (let id of ['input-size', 'input-base']) {
    document.getElementById(id).addEventListener('change', init_game);
}

document.getElementById('button-reset').addEventListener('click', init_game);
