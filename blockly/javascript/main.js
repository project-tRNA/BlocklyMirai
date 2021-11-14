/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview JavaScript for Blockly's Code demo.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

var isInCSharp = navigator.userAgent.indexOf('BlocklyMirai') != -1;

/**
 * Create a namespace for the application.
 */
var Code = {};

/**
 * CefSharp 进行注入
 */
Code.bindCSharpCodes = async function(){
	if(isInCSharp){
	    await CefSharp.BindObjectAsync("blocklymirai");
	}
};

/**
 * Lookup for names of supported languages.  Keys should be in ISO 639 format.
 */
Code.LANGUAGE_NAME = {
  //暂无i18n化的打算
  //'en': 'English',
  'zh-hans': '简体中文',
  //'zh-hant': '正體中文'
};

/**
 * List of RTL languages.
 */
Code.LANGUAGE_RTL = [];

/**
 * Blockly's main workspace.
 * @type {Blockly.WorkspaceSvg}
 */
Code.workspace = null;

/**
 * Extracts a parameter from the URL.
 * If the parameter is absent default_value is returned.
 * @param {string} name The name of the parameter.
 * @param {string} defaultValue Value to return if parameter not found.
 * @return {string} The parameter value or the default value if not found.
 */
Code.getStringParamFromUrl = function(name, defaultValue) {
  var val = location.search.match(new RegExp('[?&]' + name + '=([^&]+)'));
  return val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : defaultValue;
};

/**
 * Get the language of this user from the URL.
 * @return {string} User's language.
 */
Code.getLang = function() {
  var lang = Code.getStringParamFromUrl('lang', '');
  if (Code.LANGUAGE_NAME[lang] === undefined) {
    // Default to English.
    lang = 'zh-hans';
  }
  return lang;
};

/**
 * Is the current language (Code.LANG) an RTL language?
 * @return {boolean} True if RTL, false if LTR.
 */
Code.isRtl = function() {
  return Code.LANGUAGE_RTL.indexOf(Code.LANG) != -1;
};

/**
 * Load blocks saved on local storage.
 * @param {string} defaultXml Text representation of default blocks.
 */
Code.loadBlocks = function(defaultXml) {
  var xml = Blockly.Xml.textToDom(defaultXml);
  Code.workspace.clear();
  Blockly.Xml.domToWorkspace(xml, Code.workspace);
};

Code.loadDefaultWorkspace = function(){
  // 默认项目
  Code.loadBlocks(
  '<xml xmlns="https://developers.google.com/blockly/xml">\n' +
  '  <block type="pluginmain" deletable="false" x="10" y="10"></block>\n' +
  '  <block type="onenable" deleteable="false" x="10" y="180"></block>\n' +
  '</xml>');
}

/**
 * Save the blocks and reload with a different language.
 */
Code.changeLanguage = function() {
  // Store the blocks for the duration of the reload.
  // MSIE 11 does not support sessionStorage on file:// URLs.
  if (window.sessionStorage) {
    var xml = Blockly.Xml.workspaceToDom(Code.workspace);
    var text = Blockly.Xml.domToText(xml);
    window.sessionStorage.loadOnceBlocks = text;
  }

  var languageMenu = document.getElementById('languageMenu');
  var newLang = encodeURIComponent(
      languageMenu.options[languageMenu.selectedIndex].value);
  var search = window.location.search;
  if (search.length <= 1) {
    search = '?lang=' + newLang;
  } else if (search.match(/[?&]lang=[^&]*/)) {
    search = search.replace(/([?&]lang=)[^&]*/, '$1' + newLang);
  } else {
    search = search.replace(/\?/, '?lang=' + newLang + '&');
  }

  window.location = window.location.protocol + '//' +
      window.location.host + window.location.pathname + search;
};

/**
 * Bind a function to a button's click event.
 * On touch enabled browsers, ontouchend is treated as equivalent to onclick.
 * @param {!Element|string} el Button element or ID thereof.
 * @param {!Function} func Event handler to bind.
 */
Code.bindClick = function(el, func) {
  if (typeof el == 'string') {
    el = document.getElementById(el);
  }
  el.addEventListener('click', func, true);
  el.addEventListener('touchend', func, true);
};

/**
 * Load the Prettify CSS and JavaScript.
 */
Code.importPrettify = function() {
  var script = document.createElement('script');
  script.setAttribute('src', 'javascript/run_prettify.js');
  document.head.appendChild(script);
};

/**
 * Compute the absolute coordinates and dimensions of an HTML element.
 * @param {!Element} element Element to match.
 * @return {!Object} Contains height, width, x, and y properties.
 * @private
 */
Code.getBBox_ = function(element) {
  var height = element.offsetHeight;
  var width = element.offsetWidth;
  var x = 0;
  var y = 0;
  do {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent;
  } while (element);
  return {
    height: height,
    width: width,
    x: x,
    y: y
  };
};

/**
 * User's language (e.g. "en").
 * @type {string}
 */
Code.LANG = Code.getLang();

/**
 * List of tab names.
 * @private
 */
Code.TABS_ = ['blocks', 'mirai', 'xml'];

/**
 * List of tab names with casing, for display in the UI.
 * @private
 */
Code.TABS_DISPLAY_ = [
  'Blocks', 'mirai', 'XML',
];

Code.selected = 'xml';

/**
 * Switch the visible pane when a tab is clicked.
 * @param {string} clickedName Name of tab clicked.
 */
Code.tabClick = function(clickedName) {
  // If the XML tab was open, save and render the content.
  if (document.getElementById('tab_xml').classList.contains('tabon')) {
    // TODO 修改xml输入框
    var xmlTextarea = document.getElementById('content_xml');
    var xmlText = xmlTextarea.value;
    var xmlDom = null;
    try {
      xmlDom = Blockly.Xml.textToDom(xmlText);
    } catch (e) {
      var q =
          window.confirm(MSG['badXml'].replace('%1', e));
      if (!q) {
        // Leave the user on the XML tab.
        return;
      }
    }
    if (xmlDom) {
      Code.workspace.clear();
      Blockly.Xml.domToWorkspace(xmlDom, Code.workspace);
    }
  }
  
  Code.workspace.setVisible(clickedName == 'blocks');
  
  // Deselect all tabs and hide all panes.
  for (var i = 0; i < Code.TABS_.length; i++) {
    var name = Code.TABS_[i];
    var tab = document.getElementById('tab_' + name);
    tab.classList.add('taboff');
    tab.classList.remove('tabon');
    document.getElementById('area_' + name).style.visibility = 'hidden';
  }

  // Select the active tab.
  Code.selected = clickedName;
  //var selectedTab = document.getElementById('tab_' + clickedName);
  document.getElementById('tab_' + clickedName).classList.remove('taboff');
  document.getElementById('tab_' + clickedName).classList.add('tabon');
  // Show the selected pane.
  document.getElementById('area_' + clickedName).style.visibility = 'visible';
  Code.renderContent();

  Blockly.svgResize(Code.workspace);
};

/**
 * Populate the currently selected pane with content generated from the blocks.
 */
Code.renderContent = function() {
  var content = document.getElementById('content_' + Code.selected);
  // Initialize the pane.
  if(Code.selected != 'blocks'){
    if (content.id == 'content_xml') {
      var xmlTextarea = document.getElementById('content_xml');
      var xmlDom = Blockly.Xml.workspaceToDom(Code.workspace);
      var xmlText = Blockly.Xml.domToPrettyText(xmlDom);
	  xmlTextarea.value = xmlText;
      xmlTextarea.focus();
	} else if (content.id == 'content_mirai') {
	  Code.attemptCodeGeneration(Blockly.Mirai);
	}
  }
  if (typeof PR == 'object') {
    PR.prettyPrint();
  }
};

/**
 * Attempt to generate the code and display it in the UI, pretty printed.
 * @param generator {!Blockly.Generator} The generator to use.
 */
Code.attemptCodeGeneration = function(generator) {
  var content = document.getElementById('content_' + Code.selected);
  content.textContent = '';
  if (Code.checkAllGeneratorFunctionsDefined(generator)) {
    var code = generator.workspaceToCode(Code.workspace);
    content.textContent = code;
    // Remove the 'prettyprinted' class, so that Prettify will recalculate.
    content.className = content.className.replace('prettyprinted', '');
  }
};
/**
 * Check whether all blocks in use have generator functions.
 * @param generator {!Blockly.Generator} The generator to use.
 */
Code.checkAllGeneratorFunctionsDefined = function(generator) {
  var blocks = Code.workspace.getAllBlocks(false);
  var missingBlockGenerators = [];
  for (var i = 0; i < blocks.length; i++) {
    var blockType = blocks[i].type;
    if (!generator[blockType]) {
      if (missingBlockGenerators.indexOf(blockType) == -1) {
        missingBlockGenerators.push(blockType);
      }
    }
  }

  var valid = missingBlockGenerators.length == 0;
  if (!valid) {
    var msg = 'The generator code for the following blocks not specified for ' +
        generator.name_ + ':\n - ' + missingBlockGenerators.join('\n - ');
    Messages.Show(msg);  // Assuming synchronous. No callback.
  }
  return valid;
};

/**
 * Initialize Blockly.  Called on page load.
 */
Code.init = function() {
  Code.initLanguage();

  var rtl = Code.isRtl();
  var container = document.getElementById('content_area');
  var onresize = function(e) {
	var maintable = document.getElementById('maintable');
	maintable.style.top = '48px';
	maintable.style.height = (document.body.clientHeight - 48) + 'px';
    var bBox = Code.getBBox_(container);
    for (var i = 0; i < Code.TABS_.length; i++) {
      var el = document.getElementById('area_' + Code.TABS_[i]);
      el.style.top = bBox.y + 'px';
      el.style.left = bBox.x + 'px';
      // Height and width need to be set, read back, then set again to
      // compensate for scrollbars.
      el.style.height = bBox.height + 'px';
	  var h = (2 * bBox.height - el.offsetHeight);
      el.style.height = h + 'px';
      el.style.width = bBox.width + 'px';
	  var w = (2 * bBox.width - el.offsetWidth);
      el.style.width = w + 'px';
    }
  };
  window.addEventListener('resize', onresize, false);

  // The toolbox XML specifies each category name using Blockly's messaging
  // format (eg. `<category name="%{BKY_CATLOGIC}">`).
  // These message keys need to be defined in `Blockly.Msg` in order to
  // be decoded by the library. Therefore, we'll use the `MSG` dictionary that's
  // been defined for each language to import each category name message
  // into `Blockly.Msg`.
  // TODO: Clean up the message files so this is done explicitly instead of
  // through this for-loop.
  for (var messageKey in MSG) {
    if (messageKey.indexOf('cat') == 0) {
      Blockly.Msg[messageKey.toUpperCase()] = MSG[messageKey];
    }
  }

  // Construct the toolbox XML, replacing translated variable names.
  var toolboxText = document.getElementById('toolbox').outerHTML;
  toolboxText = toolboxText.replace(/(^|[^%]){(\w+)}/g,
      function(m, p1, p2) {return p1 + MSG[p2];});
  var toolboxXml = Blockly.Xml.textToDom(toolboxText);

  Code.workspace = Blockly.inject('area_blocks',
    {
      disabled: false,
      grid:
            {spacing: 25,
            length: 3,
            colour: '#ccc',
            snap: false},
        media: 'media/',
        rtl: rtl,
        toolbox: toolboxXml,
        zoom:
            {controls: true,
            wheel: true}
    });
  Blockly.ContextMenuRegistry.registry.getItem('blockDisable')

  Code.loadDefaultWorkspace();

  Code.tabClick(Code.selected);

  Code.bindClick('trashButton', function() {Code.discard(); Code.renderContent();});
  Code.bindClick('runButton', Code.genGradleProject);
  
  for (var i = 0; i < Code.TABS_.length; i++) {
    var name = Code.TABS_[i];
    Code.bindClick('tab_' + name, function(name_) {return function() {Code.tabClick(name_);};}(name));
  }

  onresize();
  Blockly.svgResize(Code.workspace);
  // Lazy-load the syntax-highlighting.
  window.setTimeout(Code.importPrettify, 1);
};

/**
 * Initialize the page language.
 */
Code.initLanguage = function() {
  // Set the HTML's language and direction.
  var rtl = Code.isRtl();
  document.dir = rtl ? 'rtl' : 'ltr';
  document.head.parentElement.setAttribute('lang', Code.LANG);

  // Sort languages alphabetically.
  var languages = [];
  for (var lang in Code.LANGUAGE_NAME) {
    languages.push([Code.LANGUAGE_NAME[lang], lang]);
  }
  var comp = function(a, b) {
    // Sort based on first argument ('English', 'Русский', '简体字', etc).
    if (a[0] > b[0]) return 1;
    if (a[0] < b[0]) return -1;
    return 0;
  };
  languages.sort(comp);
  // Populate the language selection menu.
  var languageMenu = document.getElementById('languageMenu');
  languageMenu.options.length = 0;
  for (var i = 0; i < languages.length; i++) {
    var tuple = languages[i];
    var lang = tuple[tuple.length - 1];
    var option = new Option(tuple[0], lang);
    if (lang == Code.LANG) {
      option.selected = true;
    }
    languageMenu.options.add(option);
  }
  languageMenu.addEventListener('change', Code.changeLanguage, true);
  
  // Inject language strings.
  document.title = MSG['title'] + ' - BlocklyMirai';
  // document.getElementById('title').textContent = MSG['title'];
  document.getElementById('tab_blocks').textContent = MSG['blocks'];

  //document.getElementById('linkButton').title = MSG['linkTooltip'];
  document.getElementById('runButton').title = MSG['runTooltip'];
  document.getElementById('trashButton').title = MSG['trashTooltip'];
};
Code.openFolder = function(folder){
  blocklymirai.openFolder(folder);
}
Code.loadProjectPanel = async function(){
  $('div#projects-panel').css('visibility', 'visible');
  var list = $('ul.project-list');
  list.html('');
  if(isInCSharp){
    var result = await blocklymirai.getLocalProjects();
	for(var i = 0; i < result.length; i++){
      list.append('<li><a class="project-item" data-project="' + result[i] + '" href="javascript:;">' + result[i] + '</a></li>');
	}
    $('ul.project-list>li>a.project-item').on('click', async function(){
        $('div#projects-panel').css('visibility', 'hidden');
        if(!(await Code.requestLoadProject($(this).attr('data-project')))){
            Code.loadProjectPanel();
        }
    });
  }
};
Code.requestLoadProject = async function(projectName){
  return await blocklymirai.loadProject(projectName);
};
/**
 * 加载项目
 */
Code.loadProject = function(projectName, xmlText){
  $('div#xml-operation>input.project-name').val(projectName);
  Code.loadBlocks(xmlText);
  Code.renderContent();
  Blockly.svgResize(Code.workspace);
  Code.tabClick('blocks');
};
/**
 * 保存项目
 */
Code.saveProject = function() {
  var plugin_constructor = Code.workspace.getBlocksByType('pluginmain', !1)[0];
  // 必须要有“插件主类”积木块
  if (typeof(plugin_constructor) == "undefined") {
    Messages.Show('错误:\n找不到插件主类构造器');
	return false;
  }
  var projectName = $('div#xml-operation>input.project-name').val();
  var xmlDom = Blockly.Xml.workspaceToDom(Code.workspace);
  var xmlText = Blockly.Xml.domToPrettyText(xmlDom);
  blocklymirai.saveProject(projectName, xmlText);
  return true;
};
/**
 * 导出用户代码到 Gradle 项目，先保存后导出
 */
Code.genGradleProject = async function() {
  var plugin_constructor = Code.workspace.getBlocksByType('pluginmain', !1)[0];
  // 必须要有“插件主类”积木块
  if (typeof(plugin_constructor) == "undefined") {
      Messages.Show('错误:\n找不到插件主类构造器');
	return false;
  }
  $('#build-project>.logcat-content').html('');
  $('#build-project').css('opacity', '0');
  $('#build-project').css('visibility', 'visible');
  $('#build-project').animate({ opacity: '1' });
  // 获取基础信息
  var projectName = $('div#xml-operation>input.project-name').val();
  var text_mainclass = plugin_constructor.getFieldValue('mainclass');
  var packageName = text_mainclass.substring(0, text_mainclass.lastIndexOf('.'));
  var className = text_mainclass.substring(text_mainclass.lastIndexOf('.') + 1);
  var pluginName = plugin_constructor.getFieldValue('name');
  var pluginVersion = plugin_constructor.getFieldValue('version');
  var pluginAuthor = plugin_constructor.getFieldValue('author');
  var xmlDom = Blockly.Xml.workspaceToDom(Code.workspace);
  var xmlText = Blockly.Xml.domToPrettyText(xmlDom);
  blocklymirai.saveProject(projectName, xmlText);
  
  var code = Blockly.Mirai.workspaceToCode(Code.workspace);
  blocklymirai.buildGradleProject(projectName, packageName,className, pluginName, pluginVersion, pluginAuthor, code);
  
};
function getTime() {
    var d = new Date();
    return '<font color="#888">[' + new Date().format("HH:mm:ss.S") + ']</font> ';
}
Code.receiveBuildOutput = function (log) {
  var time = getTime();
  var logcat = $('#build-project>.logcat-content');
  if(log.indexOf('BUILD SUCCESSFUL') == 0){
    log = $('<p>' + time + '<font color="#00FF00">构建成功!</font> 现在你可以 <a class="light-link" onclick="Code.openFolder(\'./gradle_project/build/libs\');" href="javascript:;">打开文件夹</a> 查看编译好的插件 jar 了</p>')
    logcat.append(log);
    return;
  }
  else if(log.indexOf("BUILD FAILED") == 0){
    log = $('<p>' + time + '<font color="#FF0000">构建失败!</font> 请查阅以上日志以便寻找错误出处</p>')
    logcat.append(log);
    return;
  }
  else {
      logcat.append($('<p>' + time + log + '</p>'));
  }
  logcat.scrollTop(document.getElementsByClassName('logcat-content')[0].scrollHeight);
};
Code.receiveProcessExit = function (exitCode) {
    var time = getTime();
  var logcat = $('#build-project>.logcat-content');
  var msg = $('<p>' + time + '<font color="#FFFF00">构建进程已退出，退出码: ' + exitCode + '</font></p>');
  var btn = $('<button class="btn-close">完成</button>');
  btn.on('click', function(){
    $('#build-project>.logcat-content').html('');
      $('#build-project').animate({ opacity: '0' }, 150, function () {
          $('#build-project').css('visibility', 'hidden');
      });
  });
  msg.append(btn);
  logcat.append(msg);
  logcat.scrollTop(document.getElementsByClassName('logcat-content')[0].scrollHeight);
};
/**
 * Discard all blocks from the workspace.
 */
Code.discard = function() {
  var count = Code.workspace.getAllBlocks(false).length;
  if (count < 2 ||
      window.confirm(Blockly.Msg['DELETE_ALL_BLOCKS'].replace('%1', count))) {
    Code.workspace.clear();
    if (window.location.hash) {
      window.location.hash = '';
    }
  Code.loadDefaultWorkspace();
  }
};
Code.bindCSharpCodes();
// Load the Code demo's language strings.
document.write('<script src="msg/' + Code.LANG + '.js"></script>\n');
// Load Blockly's language strings.
document.write('<script src="msg/js/' + Code.LANG + '.js"></script>\n');

window.addEventListener('load', Code.init);