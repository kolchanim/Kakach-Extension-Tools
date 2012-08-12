// ==UserScript==
// @name 1chan Extension Tools
// @author postman, ayakudere
// @version 0.5.3
// @icon http://1chan.ru/ico/favicons/1chan.ru.gif
// @downloadURL https://github.com/postmanlololol/1chan-Extension-Tools/raw/master/1chanuserscript.user.js
// @include http://1chan.ru/news/*
// ==/UserScript==

// Globals
var formTextarea;
var deletingSmiles;

if(navigator.appName == "Opera")
    document.addEventListener('DOMContentLoaded', function() {
        createRepliesMap();
        formTextarea = document.getElementById("comment_form_text");
        deletingSmiles = false;
        createMarkupPanel();
        createSmilePanel();
        registerAutoupdateHandler();
    });

// Replies map
function createRepliesMap() {
    
    var comments = document.getElementsByClassName("b-comment");
    var table = {};
    
    for(var i=0; i<comments.length; i++) {
        current_post = comments[i].id.slice(8);
        refs = comments[i].getElementsByClassName("js-cross-link");
        for(var j=0; j<refs.length; j++) {
            ref = refs[j].name.slice(5);
            if(typeof(table[ref]) != 'undefined')
                table[ref].push(current_post);
            else
                table[ref] = [current_post];
        }
    }
    for(post_num in table) {
        container = document.createElement("div");
        container.id = "answers_"+post_num;
        container.appendChild(document.createElement('p'));
        container = container.lastChild;
        container.style.margin = '0px';
        container.style.padding = '4px';
        container.style.fontSize = '0.8em';
        container.textContent = "Ответы: ";
        for(post_ref in table[post_num]) {
            link = document.createElement("a");
            link.className = "js-cross-link";
            link.href = document.URL + '#'+table[post_num][post_ref];
            link.name = "news/"+table[post_num][post_ref];
            link.textContent = ">>"+table[post_num][post_ref];
            link.style.fontSize = '1em';
            container.appendChild(link);
            container.innerHTML += ', ';
        }
        container.innerHTML = container.innerHTML.substring(0, container.innerHTML.length-2);
        comment = document.getElementById("comment_"+post_num);
        if(comment)
            comment.appendChild(container.parentNode);
  }
}
  
function registerAutoupdateHandler() {
    document.getElementsByClassName("l-comments-wrap")[0].addEventListener('DOMNodeInserted',
        function(event) {
            if(/comment/.test(event.target.id)) {
                refs = event.target.getElementsByClassName("js-cross-link");
                for(var j=0; j<refs.length; j++) {
                    ref = refs[j].name.slice(5);
                    link = document.createElement("a");
                    link.className = "js-cross-link";
                    link.href = document.URL + '#' + event.target.id.slice(8);
                    link.name = "news/" + event.target.id.slice(8);
                    link.textContent = ">>" + event.target.id.slice(8);
                    link.style.fontSize = '1em';
                    if(container = document.getElementById('answers_'+ref)) { // да, именно =
                        container = container.lastChild
                        container.innerHTML += ', ';
                        container.appendChild(link)
                    } else {
                        container = document.createElement("div");
                        container.id = "answers_" + ref;
                        container.appendChild(document.createElement('p'));
                        container = container.lastChild;
                        container.style.margin = '0px';
                        container.style.padding = '4px';
                        container.style.fontSize = '0.8em';
                        container.textContent = "Ответы: ";
                        container.appendChild(link)
                        comment = document.getElementById("comment_" + ref);
                        if(comment)
                            comment.appendChild(container.parentNode);
                    }
                }
            }
        });
}

// Smile panel
function addTextToForm(text) {
    cursor_pos = formTextarea.selectionStart;
    var formText = formTextarea.value;
    formTextarea.value = formText.slice(0, cursor_pos)
                         + text 
                         + formText.slice(formTextarea.selectionEnd);
    formTextarea.focus();
};

function createSmile(text, imgLink) {
  
    var image = document.createElement("img");
    var link = document.createElement("a");
  
    link.href = "#";
    link.onclick = function(e) {
        if (deletingSmiles) {
            removeCustomSmile(this.id);
        } else {
            addTextToForm(text);
            formTextarea.focus();
        }
        e.preventDefault();
        return false;
    };
    link.title = text;
    image.src = imgLink;
    image.style.padding = "5px 3px 2px 3px";
    link.style.outline  = "none";
    link.appendChild(image);
    return link;
}

function createCustomSmile(num) {

    var id  = "smile-"+num;
    
    if (localStorage.getItem(id)) {
        alert("Такой шмайлик уже добавлен");
        return false;
    }
    addCustomSmile(num)
    localStorage.setItem(id, "http://rghost.ru/"+num+"/image.png");
}

function createCustomImage(link) {
    
    var name = prompt("Имя для картинки:");
    var id = "image-" + name;
    
    if (localStorage.getItem(id)) {
        alert("Уже есть картинка с таким именем");
        return false;
    }
    addCustomImage(link, name);
    localStorage.setItem(id, link);
}

function addCustomSmile(num) {
    
    var id  = "smile-"+num;
    var newSmile = createSmile('[:'+num+':]', "http://rghost.ru/"+num+"/image.png");
    
    newSmile.onmousedown = function(e) {
        if (e.which === 2) {
            removeCustomSmile(this.id);
        }
        return false;
    };
    newSmile.title = "Средняя кнопка мыши для удаления";
    newSmile.id = id;
    newSmile.setAttribute("class", "add-smile-link");
    document.getElementById("smile-panel").insertBefore(newSmile,
                                                    document.getElementById("image-container"));
}

function addCustomImage(link, name) {
    
    var id = "image-" + name;
    var newImage = createButton(name, function(e) {
        if (deletingSmiles) {
            removeCustomImage(this.id);
        } else {
            if (/rghost/.test(link)) 
                addTextToForm('[:' + /\d+/.exec(link)[0] + ':]');
            else 
                addTextToForm('[' + link + ']');
            formTextarea.focus();
        }
        e.preventDefault();
        return false;
    });
    
    newImage.onmousedown = function(e) {
        if (e.which === 2) {
            removeCustomSmile(this.id);
        }
        return false;
    };
    
    newImage.id = id;
    newImage.setAttribute("class", "add-image-button");
    document.getElementById("image-container").appendChild(newImage);
    document.getElementById("image-container").style.display = "block";
}

function removeCustomSmile(id) {
    localStorage.removeItem(id);
    document.getElementById("smile-panel").removeChild(document.getElementById(id));
}

function removeCustomImage(id) {
    localStorage.removeItem(id);
    document.getElementById("image-container").removeChild(document.getElementById(id));
    if (document.getElementsByClassName("add-image-button").length === 0) 
        document.getElementById("image-container").style.display = "none";
}

function addSmileClick(e) {
    
    var link = prompt("Ссылка на картинку или номер файла на ргхосте:");
    var image = new Image();
    
    if (!link)
        return false;
    
    image.src = link;
    image.onerror = function() {
        var num = /(\d+)\D*$/.exec(link)[1];
        link = "http://rghost.ru/" + num + "/image.png";
        image.src = link;
        image.onerror = function() {
            alert("Ошибка при загрузке картинки");
        }
    }
    image.onload = function() {
        if (image.width > 45 || image.heigth > 45) {
            createCustomImage(link);
        } else {
            createCustomSmile(num);
        }
    }
    
    e.preventDefault();
    return false;
}

function removeSmilesClick(e) {
    const redCross = "http://1chan.ru/ico/remove.gif";
    const whiteCross = "http://1chan.ru/ico/delete.gif";
    
    if (!deletingSmiles) {
        document.getElementById("remove-smiles-icon").src = whiteCross;
        deletingSmiles = true;
    } else {
        document.getElementById("remove-smiles-icon").src = redCross;
        deletingSmiles = false;
    }
    e.preventDefault();
    return false;
}

function createSmilePanel() {
  
    var container = document.createElement("div");
    var gifSmileList = [ "coolface", "desu", "nyan", "sobak", "trollface"];
    var pngSmileList = ["awesome", "ffuu", "okay", "rage"];
    var imageContainer = document.createElement("div");
    
    for(var i in gifSmileList) {
        var newSmile = createSmile(':'+gifSmileList[i]+':', "http://1chan.ru/img/" + gifSmileList[i] + ".gif"); 
        container.appendChild(newSmile);
    }
    for(var i in pngSmileList) {
        var newSmile = createSmile(':'+pngSmileList[i]+':', "http://1chan.ru/img/" + pngSmileList[i] + ".png"); 
        container.appendChild(newSmile);
    }
    
    var addSmileLink  = document.createElement("a");
    var addSmileImg = document.createElement("img");
    addSmileImg.src = "http://cdn1.iconfinder.com/data/icons/basicset/plus_16.png";
    addSmileLink.href = "#";
    addSmileLink.onclick = addSmileClick;
    addSmileLink.appendChild(addSmileImg);
    addSmileLink.style.cssFloat = "right";
    addSmileLink.style.margin = "5px 5px 5px 5px"
    addSmileLink.title = "Добавить шмайлик или картинку";
    
    var removeSmilesLink  = document.createElement("a");
    var removeSmilesImg = document.createElement("img");
    removeSmilesImg.src = "http://1chan.ru/ico/remove.gif";
    removeSmilesImg.id = "remove-smiles-icon";
    removeSmilesLink.href = "#";
    removeSmilesLink.onclick = removeSmilesClick;
    removeSmilesLink.appendChild(removeSmilesImg);
    removeSmilesLink.style.cssFloat = "right";
    removeSmilesLink.style.margin = "30px -20px 5px 5px"
    removeSmilesLink.title = "Удалить шмайлики или картинки";
    
    container.appendChild(addSmileLink);
    container.appendChild(removeSmilesLink);
    
    if(!formTextarea) { // news/add
        container.style.width = '530px'
        container.style.border = "1px solid #999999";
        container.id = "smile-panel";
        document.getElementsByName('text_full')[0].parentNode.insertBefore(container,
                                                    document.getElementsByName('text_full')[0]);
    }
    else {
        container.style.margin = "10px";
        container.style.paddingLeft = "8px";
        container.style.border = "1px solid #CCCCCC";
        container.style.borderRadius = "5px 5px 5px 5px"
        container.id = "smile-panel";
        document.getElementById("comment_form").insertBefore(container, 
                                                    document.getElementsByClassName("b-comment-form")[0]);
    }
    
    var images = [];
    for(var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if ((/^smile-\d+$/).test(key)) {
            var num = /\d+/.exec(key);
            addCustomSmile(num);
        } else if ((/^image-.+$/).test(key)) 
            images.push(key);
    }
    
    imageContainer.id = "image-container";
    imageContainer.style.margin = "5px 6px 7px 0px";
    imageContainer.style.paddingTop = "2px";
    imageContainer.style.borderTop = "1px dashed #CCCCCC";
        
    container.appendChild(imageContainer);
        
    for(var i in images) {
        var name = /^image-(.+)$/.exec(images[i])[1];
        addCustomImage(localStorage.getItem(images[i]), name);
    }
    
    if (images.length === 0) {
        imageContainer.style.display = "none";
    }
}

// Markup panel
function getSelectionText(node) {
    var start = node.selectionStart;
    var end = node.selectionEnd;
    return node.value.substring(start, end);
}

function wrapText(text, wrapper) {
    return wrapper + text + wrapper;
}

function createButton(value, onclick) {
    var button   = document.createElement("input");
    button.type  = "button";
    button.value = value;
    button.onclick = onclick;
    return button;
}

function wrapImageLink(link) {
    if (!link) {
        return "";
    } else if (/rghost/.test(link)) {
        return "[:" + /(\d+)\D*$/.exec(link)[1] + ":]";
    } else {
        return "[" + link + "]";
    }
}

function imgClick() {
  
    var link = getSelectionText(formTextarea);
  
    if (link.length > 0) {
        addTextToForm(wrapImageLink(link));
    } else {
        addTextToForm(wrapImageLink(prompt('Ссылка на изображение:')));
    }
}

function quoteClick() {
  
    var text = getSelectionText(formTextarea);
  
    if (text.length > 0) {
        var formText = formTextarea.value;
        var lines = text.split("\n");
        for(var i in lines) {
            lines[i] = ">>" + lines[i].trim() + "<<";
        }
        addTextToForm(lines.join("\n"));
    } else {
        text = document.getSelection().toString();
        var lines = text.split("\n");
        for(var i in lines) {
          lines[i] = ">" + lines[i].trim();
        }
        addTextToForm(lines.join("\n"));
    }
}

function bigBoldClick() {
  
    var text = getSelectionText(formTextarea);
    var lines = text.split("\n");
    const stars = "\n********************************************";
  
    if (text.length > 0) {
        for(var i in lines) {
            if (lines[i] !== "") 
                lines[i] += stars;
        }
        addTextToForm(lines.join("\n")); 
    } else {
        formTextarea.value += stars;
    }
}

function bigImgClick() {
  
    var link = getSelectionText(formTextarea);
    
    if (link.length === 0) 
        link = prompt('Ссылка на изображение:');
    
    if (!link) 
        return false;
    
    if (/rghost/.test(link)) {
        var num = /(\d+)\D*$/.exec(link)[1];
        link = "http://rghost.ru/" + num + "/image.png";
    }
  
    addTextToForm('"' + wrapImageLink(link) + '":' + link + '');
}


function createMarkupPanel() {
  
    var container = document.createElement("div");
    var markup = {
        "B": ["**", "Жирный"],
        "I": ["*", "Наклонный"],
        "C": ["`", "Моноширный"],
        "S": ["%%", "Спойлер"]
    };
    var imgButton = createButton("img", imgClick);
    var quoteButton = createButton(">", quoteClick);
    var bigBoldButton = createButton("BB", bigBoldClick);
    var bigImgButton = createButton("bimg", bigImgClick);
  
    container.appendChild(imgButton);
    container.appendChild(bigImgButton);
    container.appendChild(quoteButton);
    container.appendChild(bigBoldButton);
  
    for(var k in markup) {
        var newButton = createButton(k, function() {
            var text = getSelectionText(formTextarea);
            var start = formTextarea.selectionStart + markup[this.value][0].length;
            addTextToForm(wrapText(text, markup[this.value][0]));
            formTextarea.setSelectionRange(start, start + text.length);
        });
        container.appendChild(newButton);
    }
    
    if(!formTextarea) {
        container.style.paddingTop = "4px";
        document.getElementsByName('text_full')[0].parentNode.insertBefore(container,
                                                    document.getElementsByName('text_full')[0])
        document.addEventListener('click', function(event){
            if(/text/.test(event.target.name))
                formTextarea = event.target // Смена полей в news/add
            })
    } else {
        container.style.display = "inline-block";
        document.getElementById("comment_form_text").parentNode.insertBefore(container, 
                        document.getElementsByClassName("b-comment-form_b-uplink")[0]);
    }
}

// Main 
if(navigator.appName != "Opera") {   
    createRepliesMap();
    formTextarea = document.getElementById("comment_form_text");
    deletingSmiles = false;
    createMarkupPanel();
    createSmilePanel();
    registerAutoupdateHandler();
}
