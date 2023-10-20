let articleDict = {
    0: {
        "file": "évolution.md",
    },
    1: {
        "file": "taxonomie.md",
    },
}

function formatText(str){
    md = window.markdownit();
    return md.render(str);
}

document.addEventListener("DOMContentLoaded", function() {
    let article = document.querySelector("#mdArticle");

    for (let i = 0; i < Object.keys(articleDict).length; i++) {
        let articleFile = articleDict[i]["file"];
        console.log(articleFile);
        fetch("articles/"+articleFile)
            .then(response => response.text())
            .then(text => {
                let textToDisplay = text;
                if (text == null || text == undefined || text == ''){
                    textToDisplay = "# " + articleFile.split(".")[0] +"\nCet article ne contient pas de texte pour le moment, revenez plus tard!";
                }

                let add = "";
                if (!(article.innerHTML == '' || article.innerHTML == null || article.innerHTML == undefined || i == 0)){
                    add = '<hr>';
                }

                article.innerHTML = article.innerHTML + add+ formatText(textToDisplay);
            })
            .catch(err => console.log(err));
    }
});