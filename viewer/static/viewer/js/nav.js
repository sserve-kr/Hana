class Nav {
    constructor (galleryid) {
        this.nav = document.querySelector('nav');
        this.galleryid = galleryid;

        this.getScript().then((data) => {
            this.nav.querySelector("h1").innerText = /"title":"([^"]+)"/.exec(data)[1];
        });

        this.nav.querySelector("img").addEventListener("click", () => {
            window.history.back();
        })
    }

    getScript () {
        return fetch(`/api/get-js?url=https://ltn.hitomi.la/galleries/${this.galleryid}.js`, {
            method: 'GET',
            cache: 'force-cache',
        }).then(response => response.text())
    }
}