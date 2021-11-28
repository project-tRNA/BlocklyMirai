using CefSharp;
using CefSharp.Handler;
using CefSharp.Wpf;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BlocklyMirai
{
    class MenuHandler : ContextMenuHandler
    {
        MainWindow mw;
        public MenuHandler(MainWindow mw)
        {
            this.mw = mw;
        }
        protected override void OnBeforeContextMenu(IWebBrowser chromiumWebBrowser, IBrowser browser, IFrame frame, IContextMenuParams parameters, IMenuModel model)
        {
            model.Clear();
            if (!mw.Config["debug"].ToBool()) return;
            model.AddItem(CefMenuCommand.Reload, "重新加载");
            model.AddItem(CefMenuCommand.ViewSource, "打开 开发者工具");
        }

        protected override bool OnContextMenuCommand(IWebBrowser chromiumWebBrowser, IBrowser browser, IFrame frame, IContextMenuParams parameters, CefMenuCommand commandId, CefEventFlags eventFlags)
        {
            if (!mw.Config["debug"].ToBool()) return false;
            if (commandId == CefMenuCommand.Reload)
            {
                browser.Reload();
                return true;
            }
            if(commandId == CefMenuCommand.ViewSource)
            {
                browser.ShowDevTools();
                return true;
            }

            return false;
        }
    }
}
