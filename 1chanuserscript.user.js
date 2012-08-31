// ==UserScript==
// @name 1chan Extension Tools
// @author postman, ayakudere
// @version 1.0.0
// @icon http://1chan.ru/ico/favicons/1chan.ru.gif
// @downloadURL https://raw.github.com/postmanlololol/1chan-Extension-Tools/master/1chanuserscript.user.js
// @include http://1chan.ru/*
// ==/UserScript==

// Globals
var formTextarea;
var deletingSmiles;
var locationPrefix;
var hidePatterns;
var features = ['answermap', 'hiding', 'smiles', 'markup', 'spoliers']
var descriptions = ['Построение карты ответов', 'Скрытие постов', 'Панель смайлов',
                    'Панель разметки', 'Раскрытие спойлеров']
var enabledFeatures;
var VERSION = '100';
/* 
 *      Replies map
 */

function createRepliesMap() {
    
    locationPrefix = /\.ru\/([^/]+)/.exec(document.URL)[1]
    var comments = document.getElementsByClassName("b-comment");
    var table = {};
    
    for(var i=0; i<comments.length; i++) {
        current_post = comments[i].id.slice(locationPrefix == 'news' ? 8 : 
            (locationPrefix.length + 9) );
        refs = comments[i].getElementsByClassName("js-cross-link");
        for(var j=0; j<refs.length; j++) {
            ref = refs[j].name.slice(locationPrefix.length + 1);
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
            link.name = locationPrefix + "/" + table[post_num][post_ref];
            link.textContent = ">>"+table[post_num][post_ref];
            link.style.fontSize = '1em';
            container.appendChild(link);
            container.innerHTML += ', ';
        }
        container.innerHTML = container.innerHTML.substring(0, container.innerHTML.length-2);
        comment = document.getElementById("comment" + 
            (locationPrefix == 'news' ? '_' : ('_' + locationPrefix + '_')) + post_num);
        if(comment)
            comment.appendChild(container.parentNode);
  }
}
  
function registerAutoupdateHandler() {
    if(/\.ru\/news\/add/.test(document.URL))
        return;
    document.getElementsByClassName("l-comments-wrap")[0].addEventListener('DOMNodeInserted',
        function(event) {
            if(/comment/.test(event.target.id)) {
                // Hiding
                if(enabledFeatures.indexOf("hiding")!= -1) {
                    var match = false;
                    for(var j=0; j<hidePatterns.length; j++)
                        if(hidePatterns[j].test(event.target.textContent))
                            match = true;
                    if(match)
                        event.target.getElementsByClassName('b-comment_b-body')[0].innerHTML = 
                                                            '<b>Пост скрыт скриптом.</b>';
                }
                // Answer map
                if(enabledFeatures.indexOf("answermap")!= -1){
                refs = event.target.getElementsByClassName("js-cross-link");
                for(var j=0; j<refs.length; j++) {
                    ref = refs[j].name.slice(locationPrefix.length + 1);
                    link = document.createElement("a");
                    link.className = "js-cross-link";
                    var current_post = event.target.id.slice(locationPrefix == 'news' ? 8 : 
                        (locationPrefix.length + 9) );
                    link.href = document.URL + '#' + current_post;
                    link.name = locationPrefix + "/" + current_post;
                    link.textContent = ">>" + current_post;
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
                        comment = document.getElementById("comment" + 
                        (locationPrefix == 'news' ? '_' : ('_' + locationPrefix + '_')) 
                        + ref);
                        if(comment)
                            comment.appendChild(container.parentNode);
                    }
                }
                }
            }
        });
}

/*
 *      Hiding
 */ 

function hidePosts() {
    hidePatterns = [];
    for(var key in localStorage)
        if(/hidephrase/.test(key))
            hidePatterns.push(new RegExp(localStorage[key],"i"));
    var comments = document.getElementsByClassName('b-comment');
    for(var i=0; i<comments.length; i++){
        var match = false;
        for(var j=0; j<hidePatterns.length; j++)
            if(hidePatterns[j].test(comments[i].textContent))
                match = true;
        if(match)
            comments[i].getElementsByClassName('b-comment_b-body')[0].innerHTML = 
                                                                '<b>Пост скрыт скриптом.</b>';
    }
}


/* 
 *      Smiles Panel
 */

function addTextToForm(text) {
    cursor_pos = formTextarea.selectionStart;
    var formText = formTextarea.value;
    formTextarea.value = formText.slice(0, cursor_pos)
                         + text 
                         + formText.slice(formTextarea.selectionEnd);
    formTextarea.focus();
};

function wrapImageLink(link) {
    if (/rghost/.test(link)) 
        return '[:' + /\d+/.exec(link)[0] + ':]';
    else
        return '[' + link + ']';
}

function createSmile(text, imgLink) {
  
    var image = document.createElement("img");
    var link = document.createElement("a");
  
    link.href = "#";
    link.onclick = function(e) {
        if (deletingSmiles) {
            destroyCustomSmile(this.id);
        } else {
            addTextToForm(text);
            formTextarea.focus();
        }
        e.preventDefault();
        return false;
    };
    link.title = text;
    image.src = imgLink;
    image.style.margin = "6px 3px 1px 3px";
    link.style.outline  = "none";
    link.appendChild(image);
    return link;
}

// Custom Images

function createCustomImage(link) {
    
    var name = prompt("Имя для картинки:");
    if (!name)
        return false;
    var id = "image-" + name;
    
    if (localStorage.getItem(id)) {
        alert("Уже есть картинка с таким именем");
        return false;
    }
    addCustomImage(link, name);
    localStorage.setItem(id, link);
}

function addCustomImage(link, name) {
    
    var id = "image-" + name;
    var newImage = createButton(name, function(e) {
        if (deletingSmiles)
            destroyCustomImage(this.id);
        else {
            addTextToForm(wrapImageLink(link));
            formTextarea.focus();
        }
        e.preventDefault();
        return false;
    });
    
    newImage.onmousedown = function(e) {
        if (e.which === 2) {
            destroyCustomImage(this.id);
        }
        return false;
    };
    
    newImage.id = id;
    newImage.setAttribute("class", "add-image-button");
    
    var imageContainer = document.getElementById("image-container");
    imageContainer.appendChild(newImage);
    imageContainer.style.display = "block";
}

function destroyCustomImage(id) {
    localStorage.removeItem(id);
    document.getElementById("image-container").removeChild(document.getElementById(id));
    if (document.getElementsByClassName("add-image-button").length === 0) 
        document.getElementById("image-container").style.display = "none";
}

// Custom Smiles

function createCustomSmile(link) {

    var id  = "smile-"+link;
    
    if (localStorage.getItem(id)) {
        alert("Такой смайлик уже добавлен");
        return false;
    }
    addCustomSmile(link)
    localStorage.setItem(id, link);
}

function addCustomSmile(link) {
    
    var id  = "smile-"+link;
    var newSmile = createSmile(wrapImageLink(link), link);
    
    newSmile.onmousedown = function(e) {
        if (e.which === 2) {
            destroyCustomSmile(this.id);
        }
        return false;
    };
    newSmile.title = "Средняя кнопка мыши для удаления";
    newSmile.id = id;
    newSmile.setAttribute("class", "add-smile-link");
    document.getElementById("smile-panel").insertBefore(newSmile,
                                                    document.getElementById("image-container"));
}

function destroyCustomSmile(id) {
    localStorage.removeItem(id);
    document.getElementById("smile-panel").removeChild(document.getElementById(id));
}

function addSmileClick(e) {
    
    var link = prompt("Ссылка на картинку или номер файла на ргхосте:");
    var image = new Image();
    
    if (!link)
        return false;
    
    if (/(\d+)\D*$/.test(link))
        var num = /(\d+)\D*$/.exec(link)[1];
    
    image.src = link;
    image.onerror = function() {
        if(num) {
            link = "http://rghost.ru/" + num + "/image.png";
            image.src = link;
        }
        image.onerror = function() {
            alert("Ошибка при загрузке картинки");
        }
    }
    image.onload = function() {
        if (image.width > 45 || image.heigth > 45) {
            createCustomImage(link);
        } else {
            createCustomSmile(link);
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
    addSmileLink.title = "Добавить смайлик или картинку";
    
    var removeSmilesLink  = document.createElement("a");
    var removeSmilesImg = document.createElement("img");
    removeSmilesImg.src = "http://1chan.ru/ico/remove.gif";
    removeSmilesImg.id = "remove-smiles-icon";
    removeSmilesLink.href = "#";
    removeSmilesLink.onclick = removeSmilesClick;
    removeSmilesLink.appendChild(removeSmilesImg);
    removeSmilesLink.title = "Удалить смайлики или картинки";
    
    var controlsContainer = document.createElement("span");
    controlsContainer.style.cssFloat = "right";
    controlsContainer.style.margin = "5px";
    
    controlsContainer.appendChild(addSmileLink);
    controlsContainer.appendChild(document.createElement("br"));
    controlsContainer.appendChild(removeSmilesLink);
    
    container.appendChild(controlsContainer);
    container.style.minHeight = "50px";
    
    if(/\.ru\/news\/add/.test(document.URL)) { // news/add
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
        container.style.borderRadius = "5px";
        container.id = "smile-panel";
        var formBody = formTextarea.parentNode.parentNode;
        formBody.parentNode.insertBefore(container, formBody);
    }
    
    if(/\.ru\/news/.test(document.URL)) {
        var images = [];
        for(var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if ((/^smile-/).test(key)) {
                var link = localStorage.getItem(key);
                addCustomSmile(link);
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
}


/* 
 *      Markup Panel
 */

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
    var cursor = formTextarea.selectionEnd;
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
    
    formTextarea.focus();
    formTextarea.setSelectionRange(cursor, cursor);
}

function bigImgClick() {
  
    var link = getSelectionText(formTextarea);
    
    if (link.length === 0) 
        link = prompt('Ссылка на изображение или номер файла на ргхосте:');
    if (!link) {
        formTextarea.focus();
        return false;
    }
    if (/rghost|^[^\/]*\d+[^\/]*$/.test(link)) {
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
            var start = formTextarea.selectionStart;
            var selection = formTextarea.selectionStart != formTextarea.selectionEnd;
            var m = markup[this.value][0];
            text = wrapText(text, m);
            addTextToForm(text);
            if(selection)
                formTextarea.setSelectionRange(start, start + text.length);
            else
                formTextarea.setSelectionRange(start + m.length, start + m.length);
            });
        container.appendChild(newButton);
    }
    
    if(/\.ru\/news\/add/.test(document.URL)) {
        container.style.paddingTop = "4px";
        document.getElementsByName('text_full')[0].parentNode.insertBefore(container,
                                                    document.getElementsByName('text_full')[0])
        document.addEventListener('click', function(event){
            if(/text/.test(event.target.name))
                formTextarea = event.target // Смена полей в news/add
            })
    } else {
        container.style.display = "inline-block";
        formTextarea.parentNode.insertBefore(container, 
                        document.getElementsByClassName("b-comment-form_b-uplink")[0]);
    }
}


/*
 *      Spoilers
 */
 
function revealSpoilers() {
    var spoilers = document.getElementsByClassName('b-spoiler-text')
    for(var i = 0; i<spoilers.length; i++)
        spoilers[i].setAttribute('style', 'color:#40454B !important')
}

/*
 *      Menu
 */
 
function createMenu() {
    var container = document.getElementsByClassName("b-menu-panel_b-links")[0]
    var general = document.createElement("a")
    general.href = "#"
    general.textContent = "Настройки скрипта"
    general.onclick = displayGeneralOptions;
    container.appendChild(general)
    container.appendChild(document.createElement("br"))
    var hidelist = document.createElement("a")
    hidelist.href = "#"
    hidelist.onclick = displayHideList;
    hidelist.textContent = "Список скрываемых выражений"
    container.appendChild(hidelist)
}

function displayGeneralOptions() {
    var container = document.createElement("div");
    container.id = 'scriptsettings'
    container.setAttribute("style", 'top: 5px; left:5px; position:fixed; \
    z-index: 10000; background: #EAF4FF; padding: 5px');
    for(var i = 0; i < features.length; i++) {
        var desc = document.createElement('p');
        desc.textContent = descriptions[i];
        desc.style.display = 'inline';
        desc.style.fontSize = '0.75em'
        var box = document.createElement('input');
        box.type = 'checkbox';
        box.className = 'opt';
        box.id = features[i];
        container.appendChild(box);
        container.appendChild(desc);
        container.appendChild(document.createElement('br'));
    }
    btn = document.createElement("button");
    btn.textContent = "Сохранить";
    btn.href = "#";
    btn.onclick = saveGeneralOptions;
    container.appendChild(btn);
    document.getElementsByTagName("body")[0].appendChild(container)
    for(var i = 0; i<enabledFeatures.length; i++)
        if(enabledFeatures[i] != '')
                document.getElementById(enabledFeatures[i]).checked = true;
    return false
}

function saveGeneralOptions() {
    enabledFeatures = [];
    var boxes = document.getElementsByClassName('opt');
    for(var i = 0; i<boxes.length; i++)
        if(boxes[i].checked)
            enabledFeatures.push(boxes[i].id);
    var str = '';
    for(var i = 0; i < enabledFeatures.length; i++)
        str += enabledFeatures[i] + ' ';
    localStorage['settings' + VERSION] = str;
    cont = document.getElementById('scriptsettings');
    cont.parentNode.removeChild(cont)
}

function displayHideList() {
    var container = document.createElement("div")
    container.setAttribute("style", "top: 5px; left:5px; position:fixed; \
    z-index: 10000; background: #EAF4FF; border: 1px black")
    var list = document.createElement("textarea")
    list.id = "regexps"
    list.setAttribute("style", "width: 300px; height: 300px; margin:5px")
    for(var key in localStorage)
        if(/hidephrase/.test(key))
            list.value += localStorage[key] + '\n'
    var button = document.createElement("button")
    button.textContent = "Сохранить"
    button.onclick = updateRegexps;
    button.style.margin = "5px"
    container.appendChild(list)
    container.appendChild(document.createElement("br"))
    container.appendChild(button)
    document.getElementsByTagName("body")[0].appendChild(container)
    return false
}

function updateRegexps() {
    for(var key in localStorage)
        if(/hidephrase/.test(key))
            localStorage.removeItem(key);
    regexps = document.getElementById('regexps').value.split('\n');
    for(var i = 0; i < regexps.length; i++) {
        if(regexps[i] != "") {
            localStorage.setItem("hidephrase" + i, regexps[i]);
        }
    }
    menu = document.getElementById('regexps').parentNode;
    menu.parentNode.removeChild(menu);
}
/* 
 *      Main
 */

if(navigator.appName == "Opera")
    document.addEventListener('DOMContentLoaded', function() {
        try {
            enabledFeatures = localStorage['settings' + VERSION].split(' ');
        } catch(keyerror) {
            enabledFeatures = features;
            var str = '';
            for(var i = 0; i < features.length; i++ )
                str += features[i] + ' ';
            localStorage['settings' + VERSION] = str;
        }
        createMenu();
        if(enabledFeatures.indexOf("answermap")!= -1)
            createRepliesMap();
        if(enabledFeatures.indexOf("hiding")!= -1)
            hidePosts();
        registerAutoupdateHandler();
        formTextarea = document.getElementById("comment_form_text");
        if (!formTextarea)
            formTextarea = document.getElementsByName("text")[0];
        deletingSmiles = false;
        if(enabledFeatures.indexOf("markup")!= -1)
            createMarkupPanel();
        if(enabledFeatures.indexOf("smiles")!= -1)
            createSmilePanel();
        if(enabledFeatures.indexOf("spoilers")!= -1)
            revealSpoilers();
    });
else {
    try {
        enabledFeatures = localStorage['settings' + VERSION].split(' ');
    } catch(keyerror) {
        enabledFeatures = features;
        var str = '';
        for(var i = 0; i < features.length; i++ )
            str += features[i] + ' ';
        localStorage['settings' + VERSION] = str;
    }
    createMenu();
    if(enabledFeatures.indexOf("answermap")!= -1)
        createRepliesMap();
    if(enabledFeatures.indexOf("hiding")!= -1)
        hidePosts();
    registerAutoupdateHandler();
    formTextarea = document.getElementById("comment_form_text");
    if (!formTextarea)
        formTextarea = document.getElementsByName("text")[0];
    deletingSmiles = false;
    if(enabledFeatures.indexOf("markup")!= -1)
        createMarkupPanel();
    if(enabledFeatures.indexOf("smiles")!= -1)
        createSmilePanel();
    if(enabledFeatures.indexOf("spoilers")!= -1)
        revealSpoilers();
}
