buttonFunctions = {
    "favorite": function(e) {
        window.location.href = "/app/favorites";
    },

    "settings": function(e) {
        window.location.href = "/app/settings";
    },

    "searchURL": () => {return "/app/search";},

    "home": function(e) {
        window.location.href = "/";
    }
}

class Nav {
    constructor() {
        this.toolbar = document.querySelector('.toolbar');

        this.nav = this.toolbar.querySelector('nav');
        this.navOpener = this.nav.querySelector('div.control button.nav-opener');
        this.navCloser = this.nav.querySelector('div.control button.nav-closer');
        this.homeButton = this.nav.querySelector('div.control button.home');

        this.content = this.nav.querySelector('div.content');
        this.contents = this.nav.querySelectorAll('button');

        this.navOpener.addEventListener('click', this.open.bind(this));
        this.navCloser.addEventListener('click', this.close.bind(this));
        this.homeButton.addEventListener('click', buttonFunctions.home);

        this.content.querySelector('button.favorite').addEventListener('click', buttonFunctions.favorite);
        this.content.querySelector('button.settings').addEventListener('click', buttonFunctions.settings);

        this.queryArea = new QueryArea();
    }

    open() {
        this.navOpener.classList.add("disabled");
        this.navCloser.classList.remove("disabled");
        this.contents.forEach((item) => {
            item.classList.add('visible');
        });
    }

    close() {
        this.navOpener.classList.remove("disabled");
        this.navCloser.classList.add("disabled");
        this.contents.forEach((item) => {
            item.classList.remove('visible');
        })
    }
}

class QueryArea {
    constructor() {
        this.toolbar = document.querySelector('.toolbar');
        this.suggestor = this.toolbar.querySelector('div.searchbar-container div.suggests');

        this.toolbar.querySelector("div.searchbar-container").addEventListener("click", e => {
            document.querySelector(".toolbar div.searchbar-input input.main-input").focus();
        })

        this.tag_container = this.toolbar.querySelector('div.searchbar-input div.tags');
        this.queryArea = this.toolbar.querySelector("input");
        this.queryArea.addEventListener('input', this.input.bind(this));

        this.searchButton = this.toolbar.querySelector("div.searchbar button.search");
        this.searchButton.addEventListener('click', this.search.bind(this));
    }

    input() {
        this.suggestor.innerHTML = '';

        let queryMatch = /(([^:]+):)?([a-zA-Z_\s]*)/.exec(this.queryArea.value);
        let type = queryMatch[2];
        let query = queryMatch[3];
        let appendedTags = this.tag_container.children;
        let body = {}
        if (query.length > 0) {
            body['tag'] = query;
            if (type) {
                body['type'] = type;
            }
            if (appendedTags.length > 0) {
                body['ban'] = [];
                for (let i = 0; i < appendedTags.length; i++) {
                    body['ban'].push(appendedTags[i].dataset.id);
                }
            }
            fetch(`/api/get-recommendation-tag`, {
                method: 'POST',
                body: JSON.stringify(body)
            }).then((response) => response.json()).then((data) => {
                for (let tag_id in data) {
                    let tag_full = `${data[tag_id]['type']}:${data[tag_id]['name']}`
                    let item = document.createElement("div");
                    item.classList.add("item");
                    item.style.order = data[tag_id]['order'];
                    item.innerHTML = `<span>${tag_full}</span>`;
                    item.dataset.id = tag_id;
                    item.onclick = (e) => {
                        let ti = document.createElement("div");
                        ti.classList.add("item");
                        ti.dataset.id = tag_id;
                        ti.dataset.tag = tag_full.replace(" ", "_");

                        let signSelector = document.createElement("div");
                        signSelector.classList.add("select")
                        signSelector.innerHTML = `<label><input type="radio" name="${tag_full}" value="+" checked>+</label>
                                                  <label><input type="radio" name="${tag_full}" value="-">-</label>`;

                        let close = document.createElement("button");
                        close.innerText = "x";
                        close.onclick = (e) => {
                            e.target.parentElement.remove();
                        }

                        let innerText = document.createElement("span");
                        innerText.innerText = tag_full;

                        // layout inner tag element
                        ti.appendChild(signSelector);
                        ti.appendChild(innerText);
                        ti.appendChild(close);

                        this.queryArea.value = "";
                        this.tag_container.appendChild(ti);
                        this.suggestor.innerHTML = '';
                    }
                    this.suggestor.appendChild(item);
                }
            })
        }
    }

    search() {
        let query = "";
        let appendedTags = this.tag_container.children;
        if (appendedTags.length > 0) {
            for (let i = 0; i < appendedTags.length; i++) {
                query += appendedTags[i].querySelector("input:checked").value+appendedTags[i].dataset.tag;
            }
            window.location.href = `${buttonFunctions.searchURL()}?tags=${query}`;
        }
    }
}