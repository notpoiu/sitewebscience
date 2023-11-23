let articleDict = {
    0: {
        "file": "Évolution.md",
    },
    1: {
        "file": "Taxonomie.md",
    },
    2: {
        "file": "ODD.md",
    },
    3: {
        "file": "Schéma de concepte.md",
    },
    4: {
        "file": "À propos de nous.md",
    },
}

function isBlank(str) {
    return (!str || /^\s*$/.test(str));
}

function formatText(str){
    md = window.markdownit({html: true});
    return md.render(str);
}

function fetchAndDisplayArticle(index, article) {
    let articleFile = articleDict[index]["file"];
    fetch("articles/" + articleFile + "?nocache=" + new Date().getTime())
        .then(response => response.text())
        .then(text => {
            let textToDisplay = text;

            if (isBlank(text)) {
                textToDisplay = "# " + articleFile.split(".")[0] + "\nCet article ne contient pas de texte pour le moment, revenez plus tard!";
            }

            article.innerHTML += formatText(textToDisplay);

            
        })
        .catch(err => console.log(err));
}

document.addEventListener("DOMContentLoaded", function() {
    let article = document.querySelector("#mdArticle");
    let listPopulate = document.querySelector("#articlePopulate");

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    if (!urlParams.get('article')){
        fetchAndDisplayArticle(0,article)
    } else {
        let articleIndex = Math.min(Math.max(urlParams.get('article'), 0), Object.keys(articleDict).length - 1);

        fetchAndDisplayArticle(
            articleIndex,article
        )
    }
});

document.addEventListener("DOMContentLoaded", function() {
    let listPopulate = document.querySelector("#articlePopulate");

    for (let i = 0; i < Object.keys(articleDict).length; i++) {
        let listItem = document.createElement("li");
        listItem.classList.add("nav-item");

        let link = document.createElement("a");
        link.classList.add("nav-link");
        link.href = "?article=" + i;
        link.innerHTML = articleDict[i]["file"].split(".")[0];

        listItem.appendChild(link);

        listPopulate.appendChild(listItem);
    }
});