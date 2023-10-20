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
                let add = "<hr>";
                if (i == 0){
                    add = "";
                }

                article.innerHTML = article.innerHTML + add+ formatText(text);
            })
            .catch(err => console.log(err));
    }
});