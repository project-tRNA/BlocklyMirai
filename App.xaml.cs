using CefSharp;
using CefSharp.Wpf;
using ICSharpCode.SharpZipLib.Zip;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Windows;

namespace BlocklyMirai
{
    /// <summary>
    /// App.xaml 的交互逻辑
    /// </summary>
    public partial class App : Application
    {
        public App()
        {
            var settings = new CefSettings()
            {
                CachePath = Path.Combine(Environment.CurrentDirectory, "cache")
            };
            //settings.CefCommandLineArgs.Add("disable-gpu", "1");
            settings.Locale = "zh-CN";
            settings.UserAgent = "BlocklyMirai/" + Assembly.GetExecutingAssembly().GetName().Version.ToString();
            
            if (!Cef.IsInitialized)
            {
                Cef.Initialize(settings);
            }
        }
        public static string UrlEncode(string str)
        {
            string result = "";
            foreach (byte b in Encoding.UTF8.GetBytes(str))
            {
                result = result + "%" + Convert.ToString(b, 16);
            }
            return result;
        }

        public static void CheckDir(string path)
        {
            if (!Directory.Exists(Environment.CurrentDirectory + "\\" + path.Replace("/", "\\"))) Directory.CreateDirectory(Environment.CurrentDirectory + "\\" + path.Replace("/", "\\"));
        }
        public static string UnZip(Stream zip, string fileDir)
        {
            string rootFile = "";
            try
            {
                if (!Directory.Exists(fileDir))
                {
                    Directory.CreateDirectory(fileDir);
                }
                ZipInputStream inputstream = new ZipInputStream(zip);
                ZipEntry entry;
                string path = fileDir;
                string rootDir = "";
                while ((entry = inputstream.GetNextEntry()) != null)
                {
                    rootDir = Path.GetDirectoryName(entry.Name);
                    if (rootDir.IndexOf("\\") >= 0)
                    {
                        rootDir = rootDir.Substring(0, rootDir.IndexOf("\\") + 1);
                    }
                    string dir = Path.GetDirectoryName(entry.Name);
                    string fileName = Path.GetFileName(entry.Name);
                    if (dir != "")
                    {
                        if (!Directory.Exists(fileDir + "\\" + dir))
                        {
                            path = fileDir + "\\" + dir;
                            Directory.CreateDirectory(path);
                        }
                    }
                    else if (dir == "" && fileName != "")
                    {
                        path = fileDir;
                        rootFile = fileName;
                    }
                    else if (dir != "" && fileName != "")
                    {
                        if (dir.IndexOf("\\") > 0)
                        {
                            path = fileDir + "\\" + dir;
                        }
                    }
                    if (dir == rootDir)
                    {
                        path = fileDir + "\\" + rootDir;
                    }
                    if (fileName != String.Empty)
                    {
                        FileStream fs = File.Create(path + "\\" + fileName);
                        int size = 2048;
                        byte[] data = new byte[2048];
                        while (true)
                        {
                            size = inputstream.Read(data, 0, data.Length);
                            if (size > 0)
                            {
                                fs.Write(data, 0, size);
                            }
                            else
                            {
                                break;
                            }
                        }
                        fs.Close();
                    }
                }
                inputstream.Close();
                return rootFile;
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }
    }
}
