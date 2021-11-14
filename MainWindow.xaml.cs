using CefSharp;
using ICSharpCode.SharpZipLib.Zip;
using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using CsharpJson;
using System.Windows.Markup;

namespace BlocklyMirai
{
    /// <summary>
    /// MainWindow.xaml 的交互逻辑
    /// </summary>
    public partial class MainWindow : Window
    {
        public JsonObject Config { get; protected set; }
        public MainWindow()
        {
            if (!File.Exists(Environment.CurrentDirectory + "/config.json"))
                File.WriteAllText(Environment.CurrentDirectory + "/config.json", Properties.Resources.DefaultConfig);
            this.Config = JsonDocument.FromString(File.ReadAllText(Environment.CurrentDirectory + "/config.json")).Object;
            InitializeComponent();
            this.webBrowser1.LoadHtml(Properties.Resources.DefaultHtml);
        }
        
        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            webBrowser1.Language = XmlLanguage.GetLanguage("zh-cn");
            webBrowser1.MenuHandler = new MenuHandler(this);
            webBrowser1.LifeSpanHandler = new LifeSpanHandler();
            webBrowser1.JavascriptObjectRepository.ResolveObject += (s, e1) =>
            {
                var repo = e1.ObjectRepository;
                if (e1.ObjectName == "blocklymirai")
                {
                    repo.Register("blocklymirai", new JavascriptBridge(this), isAsync: true, options: BindingOptions.DefaultBinder);
                }
            };
            webBrowser1.Address = "file:///" + Environment.CurrentDirectory.Replace("\\", "/") + "/blockly/index.html";
        }
        
        public void RunScript(string code)
        {
            //Console.WriteLine("[DEBUG] 执行命令 " + code);
            webBrowser1.GetMainFrame().ExecuteJavaScriptAsync(code);
        }
        
    }
}
