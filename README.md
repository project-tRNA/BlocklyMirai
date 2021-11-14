# BlocklyMirai

**[WORK IN PROGRESS]**

使用 [Google/Blockly](https://github.com/Google/Blockly) 来更简单地编写 [mamoe/mirai-console](https://github.com/mamoe/mirai-consle) 的插件

# Blockly 是什么?

Blockly 是由 Google 开发的一个库，主要功能是作为一个代码编辑器，特色是用形象的积木块来让用户使用极其简单的形式进行编程。本项目使用它作为基础来开发，将编写 mirai 机器人中常用的代码翻译成积木块，使更多用户能参与到编写 mirai 机器人插件的工作中，降低上手 mirai 的门槛。

## 声明

同 mirai 一样，**一切开发旨在学习，请勿用于非法用途**

- BlocklyMirai 是完全免费且开放源代码的软件，仅供学习和娱乐用途使用
- BlocklyMirai 不会通过任何方式强制收取费用，或对使用者提出物质条件
- BlocklyMirai 由整个开源社区维护，并不是属于某个个体的作品，所有贡献者都享有其作品的著作权。

## 许可证

本项目使用 [GNU Affero General Public License v3.0](https://github.com/DoomsdaySociety/RPGProject/blob/main/LICENSE) (AGLP v3) 许可证开源。

```
Permissions of this strongest copyleft license are conditioned on making 
available complete source code of licensed works and modifications, which 
include larger works using a licensed work, under the same license. 
Copyright and license notices must be preserved. Contributors provide an 
express grant of patent rights. When a modified version is used to provide 
a service over a network, the complete source code of the modified version 
must be made available.
```

## 大致构造

使用 C# 和 CefSharp 作为窗口和浏览器框架支持，以承载静态 html+css+js 的 blockly ，通过编写积木块来实现生成代码的功能，以 CefSharp 为桥梁，C# 和 javascript 间互相调用，做到在“网页”上读取项目列表、加载项目、导出 gradle 项目并构建等功能。为了便利，UI 基本上都使用 html+css+js 来实现。~~前端好快乐啊（开始掉发）~~

## 我适合使用 BlocklyMirai 吗?

如果你能通过 [Java 测验 | 菜鸟教程 (runoob.com)](https://www.runoob.com/quiz/java-quiz.html)，那你应该阅读官方给出的文档或者我的 [mirai-doc](https://mirai-doc.doomteam.fun) 去研究如何编写 mirai 插件。如果你完全不会编程，请记住，BlocklyMirai 虽然可以帮你编写插件，但这**并不是最优解**，想要做到更高端、更自由的操作需要你去学习编程。

**目前 BlocklyMirai 处于 Alpha 测试阶段，积木块还很少，在完善之前不推荐使用**

[kotlin 教程](https://www.runoob.com/kotlin/kotlin-tutorial.html) | [java 教程](https://www.runoob.com/java/java-tutorial.html)

## 如何安装

(如果网页无法打开，可以尝试使用[开发者边车](https://gitee.com/docmirror/dev-sidecar)来解决)
到 [Releases](https://github.com/MrXiaoM/BlocklyMirai/releases) 上下载 BlocklyMirai.zip 并找个地方解压，打开 BlocklyMirai.exe 即可打开通往新世界的大门！
如果你完全不会编程，你可以通过阅读 [mirai-doc](https://mirai-doc.doomteam.fun) 中有关 BlocklyMirai 各种积木块的介绍来熟悉这个环境。
如果你会编程，且想要给这个项目助力、编写积木块，[PRs welcome](https://github.com/MrXiaoM/BlocklyMirai/pulls)

注：由于本项目受众大多为 Windows 用户，故目前没有适配除 Windows 以外其他系统的计划。但是不用担心，使用 BlocklyMirai 制作的插件除非你写下了只有在 Windows 系统用的等功能/代码以外，插件依旧是全平台可用的。

## 发布

非定性要求，如果你要在论坛发布你使用 BlocklyMirai 编写的插件，请在帖子标题最前面加上 `[BM]` 并加上话题 `BlocklyMirai` 表示使用 BlocklyMirai 编写，**不仅可以让用户们更容易分辨，也是对本项目的支持**。
如果你要开源你的 BlocklyMirai 作品，你可以通过`保存当前项目`按钮保存文件并放到仓库上，或者将`项目文件原文`存到文件内放到仓库上，两者都是一样的。协议自定，推荐使用  [GNU Affero General Public License v3.0](https://github.com/DoomsdaySociety/RPGProject/blob/main/LICENSE)。实质性地修改使用 BlocklyMirai 生成的 java 代码(指添加了实际功能，而不是加了无用代码)可不声明使用 BlocklyMirai 生成。~~不会吧不会吧不会真的有人会用 BlocklyMirai 生成出来的那么烂的代码吧我手写都比它好~~

## 我也要编写积木块

积木块列表： `blockly/javascript/blocks.js`

根据积木块生成代码：`blockly/javascript/mirai.js`

积木块格式示例：

```javascript
	Blockly.Blocks['onenable'] = {
		init: function() {
			this.appendDummyInput()
				.appendField("插件启用时执行");
			this.appendStatementInput("content")
				.setCheck(null);
			this.setColour(230);
			this.setTooltip("");
			this.setHelpUrl("");
 this.setDeletable(false);
 this.contextMenu = false;
 this.imports = ['net.mamoe.mirai.event.GlobalEventChannel'];
		}
	};
```

其中 `onenable` 是这个而积木块的 ID，数组 `imports` 的内容会在导出代码的时候添加到代码文件开头的 import 中。避免之后维护困难，请务必在 `// BlocklyMirai START` 和 `// BlocklyMirai END` 之间写。添加积木块之后要把积木块添加的工具箱才能给用户使用，这时需要编辑 `index.html`，mirai 的工具箱分类在最后面，以 `<block type="积木块ID"></block>` 的格式来填。

生成代码格式示例：

```javascript
  Blockly.Mirai['onenable'] = function(block) {
    var statements_content = Blockly.Mirai.statementToCode(block, 'content');

    return '@Override\n' +
        Blockly.Mirai.INDENT + 'public void onEnable() {\n' +
        statements_content + '\n' +
        Blockly.Mirai.INDENT + Blockly.Mirai.INDENT + 'GlobalEventChannel.INSTANCE.registerListenerHost(this);\n' +
        Blockly.Mirai.INDENT + '}';
  };
```

没什么好说的，说起来太复杂了，去看帮助文档吧

[blockly 创建自定义积木块的帮助文档](https://developers.google.cn/blockly/guides/create-custom-blocks/overview) 

[在线积木块编辑器(静态网页，可以在 blockly 的仓库里找到)](https://google.github.io/blockly/demos/blockfactory)

## 引用项目

* [google/blockly](https://github.com/google/blockly)
* [jquery](https://github.com/jquery/jquery)
* [googlearchive/code-prettify](https://github.com/googlearchive/code-prettify)
* [icsharpcode/SharpZipLib](https://github.com/icsharpcode/SharpZipLib)
* [CefSharp](https://github.com/cefsharp/CefSharp)
* [NingShenTian/CsharpJson](https://github.com/NingShenTian/CsharpJson)

* [mamoe/mirai](https://github.com/mamoe/mirai)
* [mamoe/mirai-console](https://github.com/mamoe/mirai-console)
* [Gradle Build Tool](https://gradle.org/)
