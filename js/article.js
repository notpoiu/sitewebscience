let articleDict = {
    0: {
        "file": "évolution.md",
    },
    1: {
        "file": "taxonomie.md",
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
    if (index >= Object.keys(articleDict).length) {
        return;
    }

    let articleFile = articleDict[index]["file"];
    fetch("articles/" + articleFile + "?nocache=" + new Date().getTime())
        .then(response => response.text())
        .then(text => {
            let textToDisplay = text;

            if (isBlank(text)) {
                textToDisplay = "# " + articleFile.split(".")[0] + "\nCet article ne contient pas de texte pour le moment, revenez plus tard!";
            }

            if (index > 0) {
                article.innerHTML += "<hr>";
            }

            article.innerHTML += formatText(textToDisplay);
            fetchAndDisplayArticle(index + 1, article);
        })
        .catch(err => console.log(err));
}

document.addEventListener("DOMContentLoaded", function() {
    let article = document.querySelector("#mdArticle");
    fetchAndDisplayArticle(0, article);
});
