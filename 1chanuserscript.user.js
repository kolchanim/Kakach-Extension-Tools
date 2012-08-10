// ==UserScript==
// @name 1chan Extension Tools
// @author postman, ayakudere
// @version 0.3.5
// @icon http://1chan.ru/ico/favicons/1chan.ru.gif
// @downloadURL https://github.com/postmanlololol/1chan-Extension-Tools/raw/master/1chanuserscript.user.js
// @include http://1chan.ru/news/*
// ==/UserScript==

// Globals
var formTextarea; 

if(navigator.appName == "Opera")
    document.addEventListener('DOMContentLoaded', function() {
        createRepliesMap();
        formTextarea = document.getElementById("comment_form_text");
        createMarkupPanel();
        createSmilePanel();
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
  
// Smile panel
function addTextToForm(text) {
    cursor_pos = formTextarea.selectionStart;
    var formText = formTextarea.value;
    formTextarea.value = formText.slice(0, cursor_pos)
                         + text 
                         + formText.slice(formTextarea.selectionEnd);
    formTextarea.setSelectionRange(cursor_pos + text.length, cursor_pos + text.length);
};

function createSmile(text, imgLink) {
  
    var image = document.createElement("img");
    var link = document.createElement("a");
  
    link.href = "#";
    link.onclick = function(e) {
        e.preventDefault();
        addTextToForm(text);
        formTextarea.focus();
        return false;
    };
    link.title = text;
    image.src = imgLink;
    image.style.padding = "5px 3px 2px 3px";
    link.style.outline  = "none";
    link.appendChild(image);
    return link;
}

function createCustomSmile(e) {
    e.preventDefault();
    var rghostLink = prompt("Ссылка на ргхост(или номер файла):");
    var num = /(\d+)\D*$/.exec(rghostLink)[1];
    if (!num) {
        alert("Не получилось найти номер шмайлика");
        return false;
    }
    var id  = "smile-"+num;
    if (localStorage.getItem(id)) {
        alert("Такой шмайлик уже добавлен");
        return false;
    }
    addCustomSmile(num)
    localStorage.setItem(id, "http://rghost.ru/"+num+"/image.png");
    return false;
}

function removeCustomSmile(id) {
    localStorage.removeItem(id);
    document.getElementById("smile-panel").removeChild(document.getElementById(id));
}

function addCustomSmile(num) {
    var id  = "smile-"+num;
    var newSmile = createSmile('[:'+num+':]', "http://rghost.ru/"+num+"/image.png");
    newSmile.onmousedown = function(e) {
        if (e.which !== 1) {
            removeCustomSmile(this.id);
        }
        return false;
    };
    newSmile.title = "Средняя кнопка мыши для удаления";
    newSmile.id = id;
    document.getElementById("smile-panel").appendChild(newSmile);
}

function createSmilePanel() {
  
    var container = document.createElement("div");
    var gifSmileList = [ "coolface", "desu", "nyan", "sobak", "trollface"];
    var pngSmileList = ["awesome", "ffuu", "okay", "rage"];
    
    for(var i in gifSmileList) {
        var newSmile = createSmile(':'+gifSmileList[i]+':', "http://1chan.ru/img/" + gifSmileList[i] + ".gif"); 
        container.appendChild(newSmile);
    }
    for(var i in pngSmileList) {
        var newSmile = createSmile(':'+pngSmileList[i]+':', "http://1chan.ru/img/" + pngSmileList[i] + ".png"); 
        container.appendChild(newSmile);
    }
    
    var addSmileLink  = document.createElement("a");
    addSmileLink.href = "#";
    addSmileLink.onclick = createCustomSmile;
    addSmileImg = document.createElement("img");
    addSmileImg.src = "http://cdn1.iconfinder.com/data/icons/basicset/plus_32.png"
    addSmileLink.appendChild(addSmileImg);
    addSmileLink.style.cssFloat = "right";
    addSmileLink.style.margin = "11px 5px 5px 5px"
    addSmileLink.title = "Добавить шмайлик";
    
    container.appendChild(addSmileLink);
    
    if(!formTextarea) { // news/add
        container.style.width = '530px'
        container.style.border = "1px solid #999999";
        container.id = "smile-panel";
        document.getElementsByName('text_full')[0].parentNode.insertBefore(container,
                                                    document.getElementsByName('text_full')[0])
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
    
    for(var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if ((/^smile-\d+$/).test(key)) {
            var num = /\d+/.exec(key);
            addCustomSmile(num);
        }
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
        var formText = formTextarea.value;
        addTextToForm(wrapImageLink(link));
    } else {
        formTextarea.value += wrapImageLink(prompt('Ссылка на изображение:'));
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
        var formText = formTextarea.value;
        addTextToForm(lines.join("\n")); 
    } else {
        formTextarea.value += stars;
    }
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
  
    container.appendChild(imgButton);
    container.appendChild(quoteButton);
    container.appendChild(bigBoldButton);
  
    for(var k in markup) {
        var newButton = createButton(k, function() {
            var text = getSelectionText(formTextarea);
            var formText = formTextarea.value;
            addTextToForm(wrapText(text, markup[this.value][0]));
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
    createMarkupPanel();
    createSmilePanel();
}
